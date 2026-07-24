import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

import Container from "@/components/ui/Container";

interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function ComingSoon({
  icon: Icon,
  title,
  description,
  ctaLabel = "Browse Products",
  ctaHref = "/products",
}: ComingSoonProps) {
  return (
    <main className="bg-gray-50 py-20">
      <Container>

        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Icon size={36} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            {title}
          </h1>

          <p className="text-gray-500">
            {description}
          </p>

          <Link
            href={ctaHref}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            {ctaLabel}
            <ArrowRight size={18} />
          </Link>

        </div>

      </Container>
    </main>
  );
}