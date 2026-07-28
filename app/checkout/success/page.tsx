import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import Container from "@/components/ui/Container";
import CheckoutSuccessClient from "./CheckoutSuccessClient";

export default function CheckoutSuccessPage() {
  return (
    <main className="bg-gray-50 py-20">
      <Container>
        <Suspense
          fallback={
            <div className="mx-auto flex w-full max-w-lg items-center justify-center rounded-xl border border-gray-100 bg-white p-10 shadow-sm">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
          }
        >
          <CheckoutSuccessClient />
        </Suspense>
      </Container>
    </main>
  );
}
