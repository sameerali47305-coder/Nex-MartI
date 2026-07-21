"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

interface ProductSearchProps {
  defaultValue?: string;
}

export default function ProductSearch({ defaultValue = "" }: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }
    params.delete("page"); // reset to page 1 whenever the search changes

    router.push(`/products?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">

      <Search
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products..."
        className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-12 pr-4 text-sm outline-none transition-all duration-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />

    </form>
  );
}
