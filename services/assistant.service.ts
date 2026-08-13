import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SiteSettings from "@/models/SiteSettings";
import { listOrders } from "@/services/order.service";
import { groq, GROQ_MODEL } from "@/lib/groq";
import type { AssistantMessageInput } from "@/validations/assistant";

const RATE_LIMIT = 20;
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

  const STOPWORDS = new Set([
    "help", "find", "show", "some", "give", "want", "need", "looking",
    "for", "the", "and", "with", "gift", "please", "under", "over",
    "below", "above", "get", "buy", "any", "have", "recommend",
  ]);

  // Pull out a price ceiling like "under $50" / "below 50"
  const priceMatch = message.match(/(?:under|below|less than)\s*\$?(\d+)/i);
  const maxPrice = priceMatch ? Number(priceMatch[1]) : undefined;

  const keywords = message
    .toLowerCase()
    .replace(/[^\w\s$]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w) && !/\d/.test(w))
    .slice(0, 5);

  const filter: Record<string, unknown> = {};
  if (keywords.length > 0) {
    const regex = new RegExp(keywords.join("|"), "i");
    filter.$or = [{ name: regex }, { description: regex }];
  }
  if (maxPrice !== undefined) {
    filter.price = { $lte: maxPrice };
  }

  let products = await Product.find(filter).limit(5).populate("category", "name");

  // Fallback if no direct keyword/price match is found
  if (products.length === 0) {
    products = await Product.find().sort({ rating: -1 }).limit(5).populate("category", "name");
  }

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

async function getCatalogContext() {
  await connectDB();

  const [categories, saleItems, newItems, settings, sampleProducts] = await Promise.all([
    Category.aggregate([
      { $lookup: { from: "products", localField: "_id", foreignField: "category", as: "products" } },
      { $project: { name: 1, count: { $size: "$products" } } },
    ]),
    Product.find({ isSale: true }).limit(10).select("name price oldPrice stock").populate("category", "name"),
    Product.find({ isNewArrival: true }).limit(10).select("name price stock").populate("category", "name"),
    SiteSettings.findOne(),
    Product.find().limit(30).select("name price stock").populate("category", "name"),
  ]);

  return {
    categories: categories.map((c) => `${c.name} (${c.count} products)`),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSale: saleItems.map((p) => ({ name: p.name, price: p.price, oldPrice: p.oldPrice, category: (p.category as any)?.name })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newArrivals: newItems.map((p) => ({ name: p.name, price: p.price, category: (p.category as any)?.name })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allProducts: sampleProducts.map((p) => ({ name: p.name, price: p.price, category: (p.category as any)?.name })),
    activePromo: settings?.promoBannerEnabled ? settings.promoBannerMessage : null,
    dealsEndTime: settings?.dealsEndTime ?? null,
  };
}

export async function getAssistantReply(
  userId: string | null,
  input: AssistantMessageInput
): Promise<string> {
  const [products, categories, orders, catalog] = await Promise.all([
    findRelevantProducts(input.message),
    listCategoryNames(),
    userId ? listOrders(userId).catch(() => []) : Promise.resolve([]),
    getCatalogContext(),
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
Products currently ON SALE: ${JSON.stringify(catalog.onSale)}
New arrivals: ${JSON.stringify(catalog.newArrivals)}
Category breakdown: ${catalog.categories.join(", ")}
Full product catalog (name/price/category — use this for general questions like "list your products" or "what's in X category"): ${JSON.stringify(catalog.allProducts)}
${catalog.activePromo ? `Active site-wide promo: "${catalog.activePromo}"` : "No active site-wide promo right now."}
${catalog.dealsEndTime ? `Deals countdown ends: ${new Date(catalog.dealsEndTime).toLocaleString()}` : ""}

${
  userId
    ? `This customer's recent orders (only reference these if they ask about their own orders):\n${JSON.stringify(recentOrders)}`
    : "This visitor is not logged in, so you have no order history for them — if they ask about an order, tell them to log in first."
}

If asked about something outside these products/orders/categories, say you don't have that information rather than guessing.`;

  // Map Gemini's "model" role to OpenAI/Groq's "assistant" role
  const formattedHistory = input.history.map((h) => ({
    role: (h.role === "model" ? "assistant" : h.role) as "user" | "assistant",
    content: h.text,
  }));

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemContext },
        ...formattedHistory,
        { role: "user", content: input.message },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content ?? "I'm not sure how to answer that.";
  } catch (error: any) {
    if (error?.status === 429) {
      return "The AI assistant is receiving too many requests right now. Please try again in a moment!";
    }
    console.error("Groq API Error:", error);
    return "I'm having trouble responding right now. Please try again shortly.";
  }
}