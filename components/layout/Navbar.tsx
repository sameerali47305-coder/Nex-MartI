"use client";

import { useState, useRef, useEffect } from "react";
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
  Package,
  ChevronDown,
} from "lucide-react";

import Container from "@/components/ui/Container";
import NotificationBell from "@/components/common/NotificationBell";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">

      {/* Top Header */}
      <Container>
        <div className="flex h-20 items-center justify-between gap-6">

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
                className="w-full rounded-full border border-gray-300 py-2.5 pl-11 pr-5 text-sm outline-none transition focus:border-blue-600"
              />

            </form>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-0.5 md:gap-1">

            {/* Notification Bell */}
            <NotificationBell />

            {/* Wishlist */}
            <Link
              id="wishlist-icon"
              href="/wishlist"
              className="relative inline-flex items-center justify-center rounded-lg p-2 text-gray-700 transition hover:text-blue-600"
            >
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              id="cart-icon"
              href="/cart"
              className="relative inline-flex items-center justify-center rounded-lg p-2 text-gray-700 transition hover:text-blue-600"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Profile / Auth */}
            {isAuthenticated ? (
              <div
                className="relative hidden md:block"
                ref={dropdownRef}
              >
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 rounded-lg p-2 transition hover:bg-gray-100 cursor-pointer"
                >
                  {/* Restored blue icon color */}
                  <User size={20} className="text-blue-600" />

                  <span className="text-sm font-medium text-gray-800">
                    {user?.name}
                  </span>

                  <ChevronDown
                    size={15}
                    className={`text-gray-500 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">

                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-600"
                    >
                      <User size={18} />
                      Profile
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Package size={18} />
                      My Orders
                    </Link>

                    <Link
                      href="/wishlist"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Heart size={18} />
                      Wishlist
                    </Link>

                    <Link
                      href="/cart"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-600"
                    >
                      <ShoppingCart size={18} />
                      Cart
                    </Link>

                    <hr className="border-gray-100" />

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-red-50 hover:text-red-600 cursor-pointer"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>

                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 md:inline-block"
              >
                Login
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              className="p-2 text-gray-700 transition hover:text-blue-600 md:hidden"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>

        </div>
      </Container>

      {/* Bottom Navigation (desktop) */}
      <div className="hidden border-t border-gray-100 md:block">

        <Container>

          <nav className="flex h-12 items-center gap-8 text-sm font-medium text-gray-700">

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-blue-600"
              >
                {link.label}
              </Link>
            ))}

          </nav>

        </Container>

      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-gray-100 md:hidden">

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
                  className="w-full rounded-full border border-gray-300 py-2.5 pl-11 pr-5 text-sm outline-none transition focus:border-blue-600"
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

              <div className="mt-2 flex items-center gap-4 border-t border-gray-100 px-3 pt-4">
                <Link
                  href="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="relative text-gray-700 transition hover:text-blue-600"
                >
                  <Heart size={20} />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="relative text-gray-700 transition hover:text-blue-600"
                >
                  <ShoppingCart size={20} />
                  {itemCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Auth area (mobile) */}
              {isAuthenticated ? (
                <div className="mt-3 space-y-2 border-t border-gray-100 px-3 pt-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <User size={18} className="text-blue-600" />
                    {user?.name}
                  </p>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-600 hover:text-blue-600"
                  >
                    <User size={16} />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 transition hover:border-red-500 hover:text-red-500 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-3 rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-700"
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