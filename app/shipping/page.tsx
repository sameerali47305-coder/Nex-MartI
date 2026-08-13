import Link from "next/link";
import {
  Truck,
  Zap,
  Globe,
  PackageCheck,
  RotateCcw,
  Clock,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";

import Container from "@/components/ui/Container";

const shippingOptions = [
  { icon: Truck, name: "Standard Shipping", time: "3–5 business days", price: "$5.00 (Free over $50)" },
  { icon: Zap, name: "Express Shipping", time: "1–2 business days", price: "$14.99" },
  { icon: Globe, name: "International", time: "7–14 business days", price: "Calculated at checkout" },
];

const returnSteps = [
  { title: "Request a return", body: "Go to Order History and select \"Request Return\" within 30 days of delivery." },
  { title: "Pack it up", body: "Use the original packaging where possible, with all tags and accessories included." },
  { title: "Ship it back", body: "We'll email a prepaid return label — just drop the package at any courier location." },
  { title: "Get refunded", body: "Once we receive and inspect the item, your refund is issued within 3–5 business days." },
];

export default function ShippingPage() {
  return (
    <main className="bg-gray-50 py-14">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
            <PackageCheck size={14} /> Shipping & Returns
          </span>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Fast delivery, easy returns</h1>
          <p className="mt-3 text-gray-500">
            Everything you need to know about getting your order — and sending it back if it's not right.
          </p>
        </div>

        <section className="mb-16">
          <h2 className="mb-6 text-center text-xl font-semibold text-gray-900">Shipping Options</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {shippingOptions.map((opt) => (
              <div key={opt.name} className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <opt.icon size={22} />
                </div>
                <h3 className="font-semibold text-gray-900">{opt.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{opt.time}</p>
                <p className="mt-3 text-sm font-semibold text-orange-500">{opt.price}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 text-center text-xl font-semibold text-gray-900">How Returns Work</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {returnSteps.map((step, i) => (
              <div key={step.title} className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16 grid gap-6 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <Clock size={20} className="mt-0.5 shrink-0 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">30-Day Window</p>
              <p className="text-sm text-gray-500">Return any unused item within 30 days of delivery.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Free Return Shipping</p>
              <p className="text-sm text-gray-500">We cover the label cost on all standard returns.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <RotateCcw size={20} className="mt-0.5 shrink-0 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Easy Exchanges</p>
              <p className="text-sm text-gray-500">Prefer a different size or color? Just say so on your request.</p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-lg rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-center text-white shadow-lg">
          <MessageCircle size={26} className="mx-auto mb-3 text-blue-100" />
          <h3 className="text-lg font-semibold">Still have questions?</h3>
          <p className="mt-1 text-sm text-blue-100">Our support team is happy to help with any order.</p>
          <Link href="/contact" className="mt-4 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
            Contact Us
          </Link>
        </div>
      </Container>
    </main>
  );
}