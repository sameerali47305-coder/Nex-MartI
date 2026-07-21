import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import Container from "@/components/ui/Container";
import VerifyOtpClient from "./VerifyOtpClient";

export default function VerifyOtpPage() {
  return (
    <section className="flex min-h-[calc(100vh-5rem)] items-center bg-gray-50 py-12">
      <Container>
        <Suspense
          fallback={
            <div className="mx-auto flex w-full max-w-md items-center justify-center rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <Loader2 size={28} className="animate-spin text-blue-600" />
            </div>
          }
        >
          <VerifyOtpClient />
        </Suspense>
      </Container>
    </section>
  );
}
