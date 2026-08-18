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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(p: any) {
  const flags = [];
  if (p.isSale) flags.push("ON SALE");
  if (p.isNewArrival) flags.push("NEW");
  
  return {
    name: p.name,
    price: p.price,
    oldPrice: p.oldPrice || null,
    stock: p.stock,
    rating: p.rating || 0,
    reviews: p.reviews || 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category: (p.category as any)?.name ?? "Uncategorized",
    description: p.description,
    isSale: p.isSale || false,
    isNewArrival: p.isNewArrival || false,
    flags: flags.length > 0 ? flags.join(" | ") : null,
  };
}

function detectQueryType(message: string) {
  const lowerMsg = message.toLowerCase();
  return {
    isSaleQuery: /\b(sale|deal|deals|discount|bargain|promo|off)\b/.test(lowerMsg) && !/find.*gift/.test(lowerMsg),
    isNewArrivalQuery: /\b(new|arrival|arrivals|latest|just|recent|fresh)\b/.test(lowerMsg),
    isGiftQuery: /\b(gift|present|gifting|for.*someone)\b/.test(lowerMsg),
    isBudgetQuery: /(?:under|below|less than|max|budget|up to|within)\s*\$?(\d+)/i.test(lowerMsg),
    isRecommendationQuery: /\b(recommend|suggest|best|top|favorite|popular|trending)\b/.test(lowerMsg),
    isListAllQuery: /\b(all|every|list|show|full|complete|everything|catalog)\b/.test(lowerMsg),
  };
}

function extractPrice(message: string): number | undefined {
  const priceMatch = message.match(/(?:under|below|less than|max|budget|up to|within)\s*\$?(\d+)/i);
  return priceMatch ? Number(priceMatch[1]) : undefined;
}

function extractKeywords(message: string): string[] {
  const STOPWORDS = new Set([
    "help", "find", "show", "some", "give", "want", "need", "looking", "for", "the", "and", "with",
    "please", "under", "over", "below", "above", "get", "buy", "any", "have", "suggest", "sale",
    "deals", "deal", "discount", "off", "new", "arrival", "arrivals", "products", "product", "items",
    "item", "all", "every", "list", "full", "is", "are", "am", "be", "a", "an", "or", "that", "this",
  ]);

  return message
    .toLowerCase()
    .replace(/[^\w\s$]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w) && !/^\d+$/.test(w))
    .slice(0, 6);
}

async function findRelevantProducts(message: string) {
  try {
    await connectDB();
  } catch (err) {
    console.error("[findRelevantProducts] DB connection failed:", err);
    return [];
  }

  const queryType = detectQueryType(message);
  const maxPrice = extractPrice(message);
  const keywords = extractKeywords(message);

  let filter: Record<string, unknown> = {};
  let sortBy: Record<string, 1 | -1> = { rating: -1, reviews: -1 };

  try {
    // SALE QUERY
    if (queryType.isSaleQuery) {
      filter.isSale = true;
      let products = await Product.find(filter).limit(20).populate("category", "name").sort({ price: 1 });
      
      if (products.length === 0) {
        products = await Product.find({ oldPrice: { $exists: true, $gt: 0 } })
          .limit(20).populate("category", "name").sort({ price: 1 });
      }
      console.log("[findRelevantProducts] Sale query returned:", products.length);
      return products.map(mapProduct);
    }

    // NEW ARRIVAL QUERY
    if (queryType.isNewArrivalQuery && !queryType.isGiftQuery) {
      filter.isNewArrival = true;
      let products = await Product.find(filter).limit(20).populate("category", "name").sort({ createdAt: -1 });
      
      if (products.length === 0) {
        products = await Product.find().limit(20).populate("category", "name").sort({ createdAt: -1 });
      }
      console.log("[findRelevantProducts] New arrival query returned:", products.length);
      return products.map(mapProduct);
    }

    // GIFT QUERY
    if (queryType.isGiftQuery && keywords.length > 0) {
      const giftKeywords = keywords.filter((k) => k !== "gift" && k !== "present");
      if (giftKeywords.length > 0) {
        const regex = new RegExp(giftKeywords.join("|"), "i");
        filter.$or = [{ name: regex }, { description: regex }];
      }

      filter.price = maxPrice !== undefined ? { $lte: maxPrice } : { $lte: 100 };
      let products = await Product.find(filter).limit(15).populate("category", "name").sort(sortBy);

      if (products.length === 0) {
        products = await Product.find({ price: { $lte: maxPrice ?? 100 }, rating: { $gte: 3 } })
          .limit(15).populate("category", "name").sort(sortBy);
      }

      if (products.length === 0) {
        products = await Product.find().limit(10).populate("category", "name").sort(sortBy);
      }

      console.log("[findRelevantProducts] Gift query returned:", products.length);
      return products.map(mapProduct);
    }

    // GENERAL KEYWORD SEARCH
    if (keywords.length > 0) {
      const regex = new RegExp(keywords.join("|"), "i");
      filter.$or = [{ name: regex }, { description: regex }];
    }

    if (maxPrice !== undefined) {
      filter.price = { $lte: maxPrice };
    }

    let products = await Product.find(filter).limit(15).populate("category", "name").sort(sortBy);

    if (products.length === 0 && maxPrice !== undefined) {
      products = await Product.find({ price: { $lte: maxPrice } })
        .limit(15).populate("category", "name").sort(sortBy);
    }

    if (products.length === 0) {
      products = await Product.find().limit(10).populate("category", "name").sort(sortBy);
    }

    console.log("[findRelevantProducts] General query returned:", products.length);
    return products.map(mapProduct);
  } catch (err) {
    console.error("[findRelevantProducts] Query error:", err);
    return [];
  }
}

async function listCategoryNames() {
  await connectDB();
  const categories = await Category.find().select("name").sort({ name: 1 });
  return categories.map((c) => c.name);
}

async function getCatalogContext() {
  await connectDB();

  const [categories, saleItems, newItems, settings, sampleProducts, highRated] = await Promise.all([
    Category.aggregate([
      { $lookup: { from: "products", localField: "_id", foreignField: "category", as: "products" } },
      { $project: { name: 1, count: { $size: "$products" } } },
      { $sort: { name: 1 } },
    ]),
    Product.find({ isSale: true }).limit(15).select("name price oldPrice stock rating").populate("category", "name"),
    Product.find({ isNewArrival: true }).limit(15).select("name price stock rating").populate("category", "name"),
    SiteSettings.findOne(),
    Product.find().limit(50).select("name price rating reviews category").populate("category", "name"),
    Product.find({ rating: { $gte: 4 } }).limit(10).select("name price rating reviews category").populate("category", "name"),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fmt = (p: any) => ({
    name: p.name,
    price: p.price,
    rating: p.rating || "N/A",
    reviews: p.reviews || 0,
    category: (p.category as any)?.name,
  });

  return {
    categories: categories.map((c) => `${c.name} (${c.count})`).join(", "),
    onSale: saleItems.map(fmt),
    newArrivals: newItems.map(fmt),
    topRated: highRated.map(fmt),
    allProducts: sampleProducts.map(fmt),
    activePromo: settings?.promoBannerEnabled ? settings.promoBannerMessage : null,
    dealsEndTime: settings?.dealsEndTime ? new Date(settings.dealsEndTime).toLocaleString() : null,
  };
}

export async function getAssistantReply(
  userId: string | null,
  input: AssistantMessageInput
): Promise<string> {
  try {
    console.log("[Assistant] Processing message:", input.message);

    if (isRateLimited(userId ?? "anonymous")) {
      return "Too many requests. Please wait a moment!";
    }

    // Timeout wrapper for database queries (10 seconds max)
    const withTimeout = <T,>(promise: Promise<T>, label: string): Promise<T> =>
      Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error(`${label} timeout`)), 10000)
        ),
      ]);

    console.log("[Assistant] Fetching products...");
    const products = await withTimeout(
      findRelevantProducts(input.message),
      "findRelevantProducts"
    ).catch((err) => {
      console.error("[Assistant] Products fetch error:", err);
      return [];
    });

    console.log("[Assistant] Found products:", products.length);

    const [categories, orders, catalog] = await Promise.all([
      withTimeout(listCategoryNames(), "listCategoryNames").catch((err) => {
        console.error("[Assistant] Categories error:", err);
        return [];
      }),
      userId
        ? withTimeout(
            listOrders(userId).catch(() => []),
            "listOrders"
          ).catch((err) => {
            console.error("[Assistant] Orders error:", err);
            return [];
          })
        : Promise.resolve([]),
      withTimeout(getCatalogContext(), "getCatalogContext").catch((err) => {
        console.error("[Assistant] Catalog error:", err);
        return {
          categories: "",
          onSale: [],
          newArrivals: [],
          topRated: [],
          allProducts: [],
          activePromo: null,
          dealsEndTime: null,
        };
      }),
    ]);

    const recentOrders = orders.slice(0, 5).map((o) => ({
      id: o.id.slice(-8).toUpperCase(),
      status: o.status,
      total: o.total,
      items: o.items
        .map((i: { name: string; quantity: number }) => `${i.name} x${i.quantity}`)
        .join(", "),
    }));

    const systemContext = `You are NexMart shopping assistant. Be professional, helpful, and concise.

RULES:
- For product lists: show COMPLETE descriptions, NO truncation.
- For text replies: keep short (2-4 sentences max)
- NO markdown: no tables, bold (**), headers (#), pipes (|)
- Mention ratings (4+): "rated 4.5/5"
- Format: "- Product is $XX (Category), rated X/5 — complete reason"
- For "all/every/list/full": show ALL matching products
- NEVER truncate mid-word
- Only use products from Matched Products list

PRODUCT DATA:
Matched Products: ${JSON.stringify(products)}
Categories: ${categories.join(", ")}
On Sale: ${JSON.stringify(catalog.onSale)}
New Arrivals: ${JSON.stringify(catalog.newArrivals)}
Top Rated: ${JSON.stringify(catalog.topRated)}
All Products: ${JSON.stringify(catalog.allProducts)}
${catalog.activePromo ? `Active Promo: ${catalog.activePromo}` : ""}
${userId ? `Customer Orders: ${JSON.stringify(recentOrders)}` : "User not logged in."}`;

    const formattedHistory = input.history.map((h) => ({
      role: (h.role === "model" ? "assistant" : h.role) as "user" | "assistant",
      content: h.text,
    }));

    console.log("[Assistant] Calling Groq API...");

    const completion = await Promise.race([
      groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemContext },
          ...formattedHistory,
          { role: "user", content: input.message },
        ],
        max_tokens: 500,
        temperature: 0.6,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Groq API timeout")), 15000)
      ),
    ]) as any;

    const reply = completion.choices[0]?.message?.content ?? null;

    if (!reply) {
      console.warn("[Assistant] Empty reply from Groq");
      return "I received your message but couldn't formulate a response. Please try again.";
    }

    console.log("[Assistant] Success, reply length:", reply.length);
    return reply.trim();
  } catch (error: any) {
    console.error("[Assistant] Fatal error:", error.message, error);

    // Specific error responses
    if (error.message?.includes("timeout")) {
      return "The service is taking too long to respond. Please try a simpler query or wait a moment.";
    }
    if (error?.status === 429) {
      return "API rate limit hit. Please wait a moment before trying again.";
    }
    if (error?.status === 401 || error?.status === 403) {
      return "Authentication error. Please contact support.";
    }
    if (error?.status === 500 || error?.status === 502 || error?.status === 503) {
      return "Our AI service is temporarily unavailable. Please try again in a few seconds.";
    }
    if (!navigator.onLine || error.message?.includes("network")) {
      return "Network error. Please check your connection and try again.";
    }

    return "Something went wrong. Please try again shortly.";
  }
}