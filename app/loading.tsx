import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-gray-50">
      <Loader2 size={32} className="animate-spin text-blue-600" />
    </div>
  );
}