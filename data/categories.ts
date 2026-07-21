import { products } from "./products";

export interface Category {
  slug: string;
  name: string;
  image: string;
  description: string;
}

export const categories: Category[] = [
  {
    slug: "electronics",
    name: "Electronics",
    image: "/products/headphone.jpeg",
    description: "Headphones, wearables, gaming gear and more.",
  },
  {
    slug: "fashion",
    name: "Fashion",
    image: "/products/shoes.jpeg",
    description: "Shoes, jackets and everyday wear.",
  },
  {
    slug: "furniture",
    name: "Furniture",
    image: "/products/chair.jpeg",
    description: "Comfortable, durable pieces for home and office.",
  },
];

export function getCategoryProductCount(categoryName: string) {
  return products.filter((product) => product.category === categoryName).length;
}
