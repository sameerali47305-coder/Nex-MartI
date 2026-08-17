"use client";

import { useEffect, useState } from "react";
import { Star, Trash2, Loader2, MessageSquareText, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

import { fetchAllReviews, adminDeleteReview } from "@/helpers/adminApi";

interface AdminReview {
  id: string;
  userName: string;
  userEmail: string;
  productName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  useEffect(() => {
    fetchAllReviews()
      .then((res) => setReviews(res.data?.reviews ?? []))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this review?")) return;
    try {
      await adminDeleteReview(id);
      toast.success("Review deleted");
      setReviews((prev) => {
        const next = prev.filter((r) => r.id !== id);
        const maxPage = Math.ceil(next.length / PER_PAGE) || 1;
        if (page > maxPage) setPage(maxPage);
        return next;
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete review");
    }
  }

  const totalPages = Math.ceil(reviews.length / PER_PAGE);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <MessageSquareText size={26} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500">Moderate customer product reviews</p>
        </div>
      </div>

      {isLoading ? (
        <Loader2 size={26} className="animate-spin text-blue-600" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((r) => (
                <tr key={r.id} className="border-b border-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{r.userName}</p>
                    <p className="text-xs text-gray-400">{r.userEmail}</p>
                  </td>
                  <td className="px-4 py-3">{r.productName}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={13} className={r.rating >= n ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                      ))}
                    </div>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-500">{r.comment || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(r.id)} className="cursor-pointer rounded-full border border-red-200 p-1.5 text-red-500 hover:bg-red-50">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reviews.length === 0 && <p className="p-5 text-sm text-gray-500">No reviews yet.</p>}

          {reviews.length > PER_PAGE && (
            <div className="flex items-center justify-center gap-4 border-t border-gray-100 p-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}