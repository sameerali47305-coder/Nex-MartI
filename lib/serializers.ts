// Converts Mongoose documents (which can't be passed directly from Server
// Components to Client Components) into plain, JSON-safe objects the UI uses.

export interface UIProduct {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  stock: number;
  isNew?: boolean;
  isSale?: boolean;
}

export interface UICategory {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  productCount: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeProduct(p: any): UIProduct {
  const cat = p.category;
  const isPopulated = cat && typeof cat === "object";

  return {
    id: p._id.toString(),
    name: p.name,
    category: isPopulated ? cat.name : "",
    categorySlug: isPopulated ? cat.slug : "",
    price: p.price,
    oldPrice: p.oldPrice,
    image: p.image,
    rating: p.rating ?? 0,
    reviews: p.reviews ?? 0,
    description: p.description,
    stock: p.stock ?? 0,
    isNew: p.isNewArrival,
    isSale: p.isSale,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeCategory(c: any): UICategory {
  return {
    id: c.id ?? c._id?.toString(),
    name: c.name,
    slug: c.slug,
    image: c.image,
    description: c.description,
    productCount: c.productCount ?? 0,
  };
}
