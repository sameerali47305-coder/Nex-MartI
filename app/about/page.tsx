import Link from "next/link";
import { ShieldCheck, Truck, Heart, Sparkles } from "lucide-react";

import Container from "@/components/ui/Container";

const values = [
  {
    icon: ShieldCheck,
    title: "Trust First",
    text: "Secure payments, honest listings, and clear policies — no surprises at checkout.",
  },
  {
    icon: Truck,
    title: "Reliable Delivery",
    text: "We partner with carriers who actually show up on time, not just on paper.",
  },
  {
    icon: Heart,
    title: "Customer Obsessed",
    text: "Every feature we ship starts with a real question a customer asked us.",
  },
  {
    icon: Sparkles,
    title: "Always Improving",
    text: "NexMart ships small improvements constantly rather than one big redesign a year.",
  },
];

const stats = [
  { value: "10K+", label: "Products Shipped" },
  { value: "98%", label: "On-Time Delivery" },
  { value: "24/7", label: "Support Availability" },
  { value: "4.7★", label: "Average Rating" },
];

export default function AboutPage() {
  return (
    <main className="bg-gray-50 py-10">
      <Container>

        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <span className="font-medium text-gray-900">About Us</span>
        </div>

        <div className="mb-14 max-w-2xl">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Shopping that respects your time
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            NexMart started with a simple frustration: online shopping shouldn&apos;t
            feel like a gamble. So we built a store around three things —
            real product info, fair prices, and delivery you can actually
            count on.
          </p>
        </div>

        <div className="mb-14 grid grid-cols-2 gap-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-14">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">What We Stand For</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <value.icon size={22} />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{value.title}</h3>
                <p className="text-sm text-gray-500">{value.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-2xl bg-gray-900 p-10 text-center text-white">
          <h2 className="text-2xl font-bold">Have a question we didn&apos;t answer?</h2>
          <p className="max-w-md text-gray-300">
            We&apos;d genuinely like to hear from you — good, bad, or just curious.
          </p>
          <Link
            href="/contact"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Get in Touch
          </Link>
        </div>

      </Container>
    </main>
  );
}