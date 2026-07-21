import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";

// One-time database seeding endpoint, guarded by a secret header so it
// can't be triggered by anyone browsing your live site. Refuses to run if
// categories already exist, to avoid creating duplicates by accident.
//
// Call it with:
//   curl -X POST http://localhost:3000/api/seed -H "x-seed-secret: YOUR_SEED_SECRET"
export async function POST(req: NextRequest) {
  const providedSecret = req.headers.get("x-seed-secret");

  if (!process.env.SEED_SECRET || providedSecret !== process.env.SEED_SECRET) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const existingCount = await Category.countDocuments();
  if (existingCount > 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Database already has categories — seed skipped to avoid duplicates.",
      },
      { status: 409 }
    );
  }

  const createdCategories = await Category.insertMany([
    {
      name: "Electronics",
      slug: "electronics",
      image: "/products/headphone.jpeg",
      description: "Headphones, wearables, gaming gear and more.",
    },
    {
      name: "Fashion",
      slug: "fashion",
      image: "/products/shoes.jpeg",
      description: "Shoes, jackets and everyday wear.",
    },
    {
      name: "Furniture",
      slug: "furniture",
      image: "/products/chair.jpeg",
      description: "Comfortable, durable pieces for home and office.",
    },
  ]);

  const categoryId = (name: string) =>
    createdCategories.find((c) => c.name === name)?._id;

  const createdProducts = await Product.insertMany([
    {
      name: "Sony WH-1000XM5 Headphones",
      slug: "sony-wh-1000xm5-headphones",
      category: categoryId("Electronics"),
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
      name: "Apple Watch Series 9",
      slug: "apple-watch-series-9",
      category: categoryId("Electronics"),
      price: 499,
      image: "/products/watch.jpeg",
      rating: 5,
      reviews: 89,
      description:
        "Advanced smartwatch with fitness tracking, heart rate monitoring and a beautiful Retina display.",
      stock: 12,
      isNewArrival: true,
    },
    {
      name: "Nike Running Shoes",
      slug: "nike-running-shoes",
      category: categoryId("Fashion"),
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
      name: "Logitech Gaming Mouse",
      slug: "logitech-gaming-mouse",
      category: categoryId("Electronics"),
      price: 69,
      image: "/products/mouse.jpeg",
      rating: 5,
      reviews: 65,
      description:
        "High precision gaming mouse featuring customizable buttons and RGB lighting.",
      stock: 22,
    },
    {
      name: "Leather Jacket",
      slug: "leather-jacket",
      category: categoryId("Fashion"),
      price: 189,
      image: "/products/jacket.jpeg",
      rating: 4,
      reviews: 37,
      description:
        "Premium leather jacket with a modern design, perfect for casual and winter wear.",
      stock: 9,
    },
    {
      name: "Office Chair",
      slug: "office-chair",
      category: categoryId("Furniture"),
      price: 229,
      image: "/products/chair.jpeg",
      rating: 5,
      reviews: 54,
      description: "Ergonomic office chair built for comfort during long working hours.",
      stock: 14,
    },
    {
      name: "Mechanical Keyboard",
      slug: "mechanical-keyboard",
      category: categoryId("Electronics"),
      price: 119,
      image: "/products/keyboard.jpeg",
      rating: 5,
      reviews: 102,
      description:
        "Mechanical keyboard with tactile switches, RGB backlighting and durable aluminum frame.",
      stock: 20,
    },
    {
      name: "Bluetooth Speaker",
      slug: "bluetooth-speaker",
      category: categoryId("Electronics"),
      price: 99,
      image: "/products/headphone.jpeg",
      rating: 4,
      reviews: 76,
      description:
        "Portable Bluetooth speaker delivering powerful sound and long lasting battery performance.",
      stock: 28,
    },
  ]);

  return NextResponse.json({
    success: true,
    message: `Seeded ${createdCategories.length} categories and ${createdProducts.length} products`,
  });
}
