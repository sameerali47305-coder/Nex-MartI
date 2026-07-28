import Link from "next/link";
import { XCircle } from "lucide-react";

import Container from "@/components/ui/Container";

export default function CheckoutCancelPage() {
  return (
    <main className="bg-gray-50 py-20">
      <Container>
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600">
            <XCircle size={40} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Payment Cancelled</h1>

          <p className="text-gray-500">
            Your payment wasn&apos;t completed and you haven&apos;t been charged.
            Your cart is still saved, so you can try again anytime.
          </p>

          <div className="mt-2 flex gap-3">
            <Link
              href="/checkout"
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              Try Again
            </Link>
            <Link
              href="/cart"
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
            >
              View Cart
            </Link>
          </div>

        </div>
      </Container>
    </main>
  );
}
