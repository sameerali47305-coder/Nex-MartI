"use client";

import { useEffect, useState } from "react";

export default function PromoBanner() {
  const [banner, setBanner] = useState<{ enabled: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((body) => {
        const settings = body?.data?.settings;
        if (settings) setBanner({ enabled: settings.promoBannerEnabled, message: settings.promoBannerMessage });
      })
      .catch(() => {});
  }, []);

  if (!banner?.enabled || !banner.message) return null;

  return (
  <div className="sticky top-0 z-40 flex justify-center bg-transparent px-4 pt-2">
    <div className="rounded-full bg-blue-600 px-5 py-2 text-center text-xs font-medium text-white shadow-lg sm:text-sm">
      {banner.message}
    </div>
  </div>
);
}