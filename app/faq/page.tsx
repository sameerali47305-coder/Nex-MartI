"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

import Container from "@/components/ui/Container";

const faqs = [
  {
    question: "How do I track my order?",
    answer:
      "Once order tracking is live, you'll be able to see real-time status from your account. For now, please reach out via the Contact Us page for order updates.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "At checkout you can choose to pay by card or Cash on Delivery. Full card payment processing is coming soon.",
  },
  {
    question: "Can I return or exchange an item?",
    answer:
      "Yes — most items can be returned within 10 days of delivery. Full details are on our Shipping & Returns page.",
  },
  {
    question: "How do I create an account?",
    answer:
      "Click Login in the top navigation, then Sign Up. You'll verify your email with a one-time code before you can log in.",
  },
  {
    question: "Is my payment information secure?",
    answer:
      "Yes. We never store your full card details on our servers, and all checkout traffic is encrypted.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function toggle(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <main className="bg-gray-50 py-16">
      <Container>

        <div className="mx-auto max-w-2xl">

          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <HelpCircle size={28} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Frequently Asked Questions
            </h1>
            <p className="mt-2 text-gray-500">
              Quick answers to the questions we hear most.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                >
                  <button
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-blue-600 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 px-5 py-4 text-sm leading-6 text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </Container>
    </main>
  );
}