export interface Product {
  id: string;
  name: string;
  category: string;
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

export const products: Product[] = [
  {
    id: "p1",
    name: "Sony WH-1000XM5 Headphones",
    category: "Electronics",
    price: 349,
    oldPrice: 399,
    image: "/products/headphone.jpeg",
    rating: 5,
    reviews: 124,
    description:
      "Premium noise cancelling wireless headphones with crystal clear sound quality and all day battery life.",
    stock: 18,
    isSale: true,
  },
  {
    id: "p2",
    name: "Apple Watch Series 9",
    category: "Electronics",
    price: 499,
    image: "/products/watch.jpeg",
    rating: 5,
    reviews: 89,
    description:
      "Advanced smartwatch with fitness tracking, heart rate monitoring and a beautiful Retina display.",
    stock: 12,
    isNew: true,
  },
  {
    id: "p3",
    name: "Nike Running Shoes",
    category: "Fashion",
    price: 129,
    oldPrice: 149,
    image: "/products/shoes.jpeg",
    rating: 4,
    reviews: 210,
    description:
      "Comfortable running shoes designed for everyday workouts and long distance performance.",
    stock: 35,
  },
  {
    id: "p4",
    name: "Logitech Gaming Mouse",
    category: "Electronics",
    price: 69,
    image: "/products/mouse.jpeg",
    rating: 5,
    reviews: 65,
    description:
      "High precision gaming mouse featuring customizable buttons and RGB lighting.",
    stock: 22,
  },
  {
    id: "p5",
    name: "Leather Jacket",
    category: "Fashion",
    price: 189,
    image: "/products/jacket.jpeg",
    rating: 4,
    reviews: 37,
    description:
      "Premium leather jacket with a modern design, perfect for casual and winter wear.",
    stock: 9,
  },
  {
    id: "p6",
    name: "Office Chair",
    category: "Furniture",
    price: 229,
    image: "/products/chair.jpeg",
    rating: 5,
    reviews: 54,
    description:
      "Ergonomic office chair built for comfort during long working hours.",
    stock: 14,
  },
  {
    id: "p7",
    name: "Mechanical Keyboard",
    category: "Electronics",
    price: 119,
    image: "/products/keyboard.jpeg",
    rating: 5,
    reviews: 102,
    description:
      "Mechanical keyboard with tactile switches, RGB backlighting and durable aluminum frame.",
    stock: 20,
  },
  {
    id: "p8",
    name: "Bluetooth Speaker",
    category: "Electronics",
    price: 99,
    image: "/products/headphone.jpeg",
    rating: 4,
    reviews: 76,
    description:
      "Portable Bluetooth speaker delivering powerful sound and long lasting battery performance.",
    stock: 28,
  },
];