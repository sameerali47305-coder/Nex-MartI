import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { listOrders } from "@/services/order.service";
import { geminiModel } from "@/lib/gemini";
import type { AssistantMessageInput } from "@/validations/assistant";

const RATE_LIMIT = 15;
const WINDOW_MS = 5 * 60 * 1000;
const hits = new Map<string, number[]>();

export function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(userId) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(userId, timestamps);
  return timestamps.length > RATE_LIMIT;
}

async function findRelevantProducts(message: string) {
  await connectDB();
  const keywords = message.toLowerCase().split(/\s+/).filter((w) => w.length > 2).slice(0, 5);
  if (keywords.length === 0) return [];

  const regex = new RegExp(keywords.join("|"), "i");
  const products = await Product.find({ $or: [{ name: regex }, { description: regex }] })
    .limit(5)
    .populate("category", "name");

  return products.map((p) => ({
    name: p.name,
    price: p.price,
    stock: p.stock,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category: (p.category as any)?.name ?? "Uncategorized",
    description: p.description,
  }));
}

async function listCategoryNames() {
  await connectDB();
  const categories = await Category.find().select("name");
  return categories.map((c) => c.name);
}

export async function getAssistantReply(
  userId: string | null,
  input: AssistantMessageInput
): Promise<string> {
  const [products, categories, orders] = await Promise.all([
    findRelevantProducts(input.message),
    listCategoryNames(),
    userId ? listOrders(userId).catch(() => []) : Promise.resolve([]),
  ]);

  const recentOrders = orders.slice(0, 5).map((o) => ({
    id: o.id.slice(-8).toUpperCase(),
    status: o.status,
    total: o.total,
    items: o.items.map((i: { name: string; quantity: number }) => `${i.name} x${i.quantity}`),
  }));

  const systemContext = `You are the NexMart shopping assistant. Be concise and friendly.
Only recommend products from this list — never invent products, prices, or stock that aren't here:
${JSON.stringify(products)}

Available categories: ${categories.join(", ") || "none"}

${
  userId
    ? `This customer's recent orders (only reference these if they ask about their own orders):\n${JSON.stringify(recentOrders)}`
    : "This visitor is not logged in, so you have no order history for them — if they ask about an order, tell them to log in first."
}

If asked about something outside these products/orders/categories, say you don't have that information rather than guessing.`;

  const history = input.history.map((h) => ({ role: h.role, parts: [{ text: h.text }] }));

  const chat = geminiModel.startChat({
    history: [
      { role: "user", parts: [{ text: systemContext }] },
      { role: "model", parts: [{ text: "Understood, I'll help with that." }] },
      ...history,
    ],
  });

  const result = await chat.sendMessage(input.message);
  return result.response.text();
}