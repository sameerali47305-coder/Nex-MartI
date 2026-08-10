import Link from "next/link";
import { PackageX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <PackageX size={48} className="text-gray-300" />
      <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="text-gray-500">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="mt-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
        Back to Home
      </Link>
    </main>
  );
}