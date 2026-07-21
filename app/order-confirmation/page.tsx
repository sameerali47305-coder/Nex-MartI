import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import Container from "@/components/ui/Container";

export default function OrderConfirmationPage() {
  return (
    <main className="bg-gray-50 py-20">
      <Container>

        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
            <CheckCircle2 size={40} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Order Placed Successfully!
          </h1>

          <p className="text-gray-500">
            Thank you for shopping with NexMart. We&apos;ve received your order and will begin processing it shortly.
          </p>

          <Link
            href="/products"
            className="mt-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Continue Shopping
          </Link>

        </div>

      </Container>
    </main>
  );
}