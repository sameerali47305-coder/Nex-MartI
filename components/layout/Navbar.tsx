"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import Container from "@/components/ui/Container";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/deals", label: "Deals" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = searchValue.trim();
    router.push(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
    setIsMenuOpen(false);
  }
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    setIsMenuOpen(false);
    router.push("/");
  };

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
            <form onSubmit={handleSearchSubmit} className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search for products..."
                className="w-full rounded-full border border-gray-300 py-3 pl-11 pr-5 outline-none transition focus:border-blue-600"
              />

            </form>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-5">

            <Link
              href="/wishlist"
              className="relative hidden transition hover:text-blue-600 md:inline-flex"
            >
              <Heart size={22} />
              {wishlistItems.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative hidden transition hover:text-blue-600 md:inline-flex"
            >
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth area (desktop) */}
            {isAuthenticated ? (
              <div className="hidden items-center gap-3 md:flex">
                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                  <User size={18} className="text-blue-600" />
                  {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  aria-label="Logout"
                  className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-red-500 hover:text-red-500"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700 md:inline-block"
              >
                Login
              </Link>
            )}

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

              <form onSubmit={handleSearchSubmit} className="relative mb-3">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full rounded-full border border-gray-300 py-3 pl-11 pr-5 outline-none transition focus:border-blue-600"
                />
              </form>

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
                <Link
                  href="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="relative transition hover:text-blue-600"
                >
                  <Heart size={22} />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="relative transition hover:text-blue-600"
                >
                  <ShoppingCart size={22} />
                  {itemCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Auth area (mobile) */}
              {isAuthenticated ? (
                <div className="mt-3 space-y-2 border-t px-3 pt-4">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                    <User size={18} className="text-blue-600" />
                    {user?.name}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-700 transition hover:border-red-500 hover:text-red-500"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-3 rounded-lg bg-blue-600 px-5 py-3 text-center text-white transition hover:bg-blue-700"
                >
                  Login
                </Link>
              )}

            </div>

          </Container>

        </div>
      )}

    </header>
  );
}