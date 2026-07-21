import Link from "next/link";
import { Globe, Send, MessageCircle, Mail } from "lucide-react";

import Container from "@/components/ui/Container";

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

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">

      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">

          {/* Brand + Newsletter */}
          <div className="lg:col-span-2">

            <Link href="/" className="text-2xl font-bold text-white">
              NexMart
            </Link>

            <p className="mt-4 max-w-sm text-sm text-gray-400">
              Premium products at amazing prices. Fast delivery, secure
              payments, and quality you can trust.
            </p>

            <form className="mt-5 flex max-w-sm gap-2">
              <div className="relative flex-1">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Subscribe
              </button>
            </form>

            <div className="mt-6 flex gap-4">
              <a href="#" aria-label="Facebook" className="transition hover:text-blue-500">
                <Globe size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="transition hover:text-pink-500">
                <MessageCircle size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="transition hover:text-sky-400">
                <Send size={20} />
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
                  <Link href={link.href} className="transition hover:text-white">
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
                  <Link href={link.href} className="transition hover:text-white">
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
                  <Link href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-800 py-6 text-sm sm:flex-row">
          <p>© 2026 NexMart. All rights reserved.</p>
          <p className="text-gray-500">Built with Next.js & Tailwind CSS</p>
        </div>

      </Container>

    </footer>
  );
}
