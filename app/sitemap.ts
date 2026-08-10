import type { MetadataRoute } from "next";
import { listProducts } from "@/services/product.service";
import { listCategories } from "@/services/category.service";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nex-mart-i.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ products }, categories] = await Promise.all([
    listProducts({ page: 1, limit: 50 }),
    listCategories(),
  ]);

  const staticPages = ["", "/products", "/categories", "/deals", "/contact"].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));

  const productPages = products.map((p) => ({
    url: `${BASE_URL}/products/${p._id}`,
    lastModified: p.updatedAt ?? new Date(),
  }));

  const categoryPages = categories.map((c) => ({
    url: `${BASE_URL}/products?category=${c.slug}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}