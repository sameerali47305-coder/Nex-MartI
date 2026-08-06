"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatWidget from "@/components/common/ChatWidget";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
}