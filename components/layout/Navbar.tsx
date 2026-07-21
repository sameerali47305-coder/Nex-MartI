"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
} from "lucide-react";

import Container from "@/components/ui/Container";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/deals", label: "Deals" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">

      {/* Top Header */}
      <Container>
        <div className="flex h-20 items-center justify-between gap-8">

          {/* Logo */}
          <Link
            href="/"
            className="text-3xl font-bold text-blue-600"
          >
            NexMart
          </Link>

          {/* Search */}
          <div className="hidden flex-1 md:block">
            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search for products..."
                className="w-full rounded-full border border-gray-300 py-3 pl-11 pr-5 outline-none transition focus:border-blue-600"
              />

            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-5">

            <button className="hidden transition hover:text-blue-600 md:inline-flex">
              <Heart size={22} />
            </button>

            <button className="hidden transition hover:text-blue-600 md:inline-flex">
              <ShoppingCart size={22} />
            </button>

            <button className="hidden transition hover:text-blue-600 md:inline-flex">
              <User size={22} />
            </button>

            <Link
              href="/login"
              className="hidden rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700 md:inline-block"
            >
              Login
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              className="text-gray-700 transition hover:text-blue-600 md:hidden"
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>

          </div>

        </div>
      </Container>

      {/* Bottom Navigation (desktop) */}
      <div className="hidden border-t md:block">

        <Container>

          <nav className="flex h-14 items-center gap-8 text-sm font-medium">

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-blue-600"
              >
                {link.label}
              </Link>
            ))}

          </nav>

        </Container>

      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t md:hidden">

          <Container>

            <div className="flex flex-col gap-1 py-4">

              <div className="relative mb-3">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full rounded-full border border-gray-300 py-3 pl-11 pr-5 outline-none transition focus:border-blue-600"
                />
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-gray-100 hover:text-blue-600"
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-2 flex items-center gap-5 border-t px-3 pt-4">
                <button className="transition hover:text-blue-600">
                  <Heart size={22} />
                </button>
                <button className="transition hover:text-blue-600">
                  <ShoppingCart size={22} />
                </button>
                <button className="transition hover:text-blue-600">
                  <User size={22} />
                </button>
              </div>

              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="mt-3 rounded-lg bg-blue-600 px-5 py-3 text-center text-white transition hover:bg-blue-700"
              >
                Login
              </Link>

            </div>

          </Container>

        </div>
      )}

    </header>
  );
}
