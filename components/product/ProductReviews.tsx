"use client";

import { useEffect, useState } from "react";
import { Star, Pencil, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import { fetchProductReviews, updateReviewRequest, deleteReviewRequest } from "@/helpers/userApi";

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function load() {
    fetchProductReviews(productId)
      .then((body) => setReviews(body?.data?.reviews ?? []))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, [productId]);

  function startEdit(r: Review) {
    setEditingId(r.id);
    setEditRating(r.rating);
    setEditComment(r.comment);
  }

  async function saveEdit() {
    if (!editingId) return;
    setIsSaving(true);
    try {
      await updateReviewRequest(editingId, { rating: editRating, comment: editComment.trim() || undefined });
      toast.success("Review updated");
      setEditingId(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update review");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteReviewRequest(id);
      toast.success("Review deleted");
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete review");
    }
  }

  if (isLoading) return <Loader2 size={20} className="animate-spin text-blue-600" />;

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Customer Reviews {reviews.length > 0 && `(${reviews.length})`}
      </h2>

      {reviews.length === 0 && <p className="text-sm text-gray-500">No reviews yet.</p>}

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            {editingId === r.id ? (
              <div className="space-y-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setEditRating(n)} className="cursor-pointer">
                      <Star size={22} className={editRating >= n ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  maxLength={500}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                />
                <div className="flex gap-2">
                  <button onClick={saveEdit} disabled={isSaving} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer">
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setEditingId(null)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 cursor-pointer">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.userName}</p>
                    <div className="mt-0.5 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={14} className={r.rating >= n ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                      ))}
                      <span className="ml-1 text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {user?.id === r.userId && (
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(r)} className="text-gray-400 hover:text-blue-600 cursor-pointer">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="text-gray-400 hover:text-red-600 cursor-pointer">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
                {r.comment && <p className="mt-2 text-sm text-gray-600">{r.comment}</p>}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}