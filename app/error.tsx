"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <AlertTriangle size={48} className="text-red-400" />
      <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
      <p className="text-gray-500">An unexpected error occurred. Please try again.</p>
      <button
        onClick={reset}
        className="mt-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        Try again
      </button>
    </main>
  );
}