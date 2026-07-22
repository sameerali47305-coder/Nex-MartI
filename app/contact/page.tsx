import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";

import Container from "@/components/ui/Container";

export default function ContactPage() {
  return (
    <main className="bg-gray-50 py-20">
      <Container>

        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <MessageCircle size={36} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Contact Page Coming Soon
          </h1>

          <p className="text-gray-500">
            We&apos;re building out a proper contact form and support
            options. In the meantime, feel free to explore the store.
          </p>

          <Link
            href="/products"
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Browse Products
            <ArrowRight size={18} />
          </Link>

        </div>

      </Container>
    </main>
  );
}