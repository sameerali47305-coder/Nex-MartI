import Link from "next/link";
import {
  Globe,
  Send,
  MessageCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
} from "lucide-react";

import Container from "@/components/ui/Container";
import NewsletterForm from "./NewsletterForm";
const shopLinks = [
  { href: "/products", label: "All Products" },
  { href: "/categories", label: "Categories" },
  { href: "/deals", label: "Deals" },
  { href: "/products?new=true", label: "New Arrivals" },
];

const helpLinks = [
  { href: "/contact", label: "Contact Us" },
  { href: "/faq", label: "FAQs" },
  { href: "/shipping", label: "Shipping & Returns" },
  { href: "/track-order", label: "Track Order" },
];

const companyLinks = [
  { href: "/about", label: "About Us" },
  { href: "/careers", label: "Careers" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

const trustBadges = [
  { icon: Truck, label: "Free delivery over $50" },
  { icon: ShieldCheck, label: "Secure payments" },
  { icon: RotateCcw, label: "10-day easy returns" },
  { icon: Headphones, label: "24/7 customer support" },
];

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-blue-900 to-blue-950 text-blue-200">

      {/* Brand accent line — visually bridges the white page content into the footer */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />

      {/* Trust strip — echoes the same icons/colors used in the Hero, for recognition */}
      <div className="border-b border-white/10 bg-blue-950/40">
        <Container>
          <div className="grid grid-cols-2 gap-6 py-6 sm:grid-cols-4">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-orange-300">
                  <Icon size={20} />
                </span>
                <span className="text-sm text-blue-100">{label}</span>
              </div>
            ))}
          </div>
        </Container>
      </div>

      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">

          {/* Brand + Newsletter */}
          <div className="lg:col-span-2">

            <Link href="/" className="text-2xl font-bold text-white">
              NexMart
            </Link>

            <p className="mt-4 max-w-sm text-sm text-blue-200">
              Premium products at amazing prices. Fast delivery, secure
              payments, and quality you can trust.
            </p>

           <NewsletterForm />

            <div className="mt-6 flex gap-4">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-blue-100 transition hover:bg-orange-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
              >
                <Globe size={18} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-blue-100 transition hover:bg-orange-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
              >
                <MessageCircle size={18} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-blue-100 transition hover:bg-orange-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
              >
                <Send size={18} />
              </a>
            </div>

          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
              Shop
            </h3>
            <ul className="space-y-3 text-sm">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-orange-300 focus-visible:outline-none focus-visible:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
              Help
            </h3>
            <ul className="space-y-3 text-sm">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-orange-300 focus-visible:outline-none focus-visible:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
              Company
            </h3>
            <ul className="space-y-3 text-sm">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-orange-300 focus-visible:outline-none focus-visible:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-sm text-blue-300 sm:flex-row">
          <p>© 2026 NexMart. All rights reserved.</p>
          <p className="text-blue-400">Built with Next.js & Tailwind CSS</p>
        </div>

      </Container>

    </footer>
  );
}
