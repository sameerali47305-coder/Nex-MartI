import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import ContactForm from "@/components/contact/ContactForm";

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 size={28} className="animate-spin text-blue-600" />
        </div>
      }
    >
      <ContactForm />
    </Suspense>
  );
}