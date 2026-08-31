"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatWidget from "@/components/common/ChatWidget";
import AiAssistantWidget from "@/components/common/AiAssistantWidget";
import PromoBanner from "@/components/common/PromoBanner";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-otp"];

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname?.startsWith(route));

  // 1. Admin routes: Pure un-wrapped content
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // 2. Auth routes: Minimal branding header with CSS-styled text logo
  if (isAuthRoute) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="py-4 px-6 border-b flex items-center justify-between bg-white">
         <Link href="/" className="text-3xl font-bold text-blue-600 transition hover:opacity-90">
  NexMart
</Link>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // 3. Main storefront layout
  return (
    <>
      <PromoBanner />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
      <AiAssistantWidget />
    </>
  );
}