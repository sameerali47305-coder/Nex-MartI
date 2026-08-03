"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronLeft } from "lucide-react";

import { fetchAdminCategories, createAdminProduct, type AdminCategory } from "@/helpers/adminApi";
import ImageUploadField from "@/components/admin/ImageUploadField";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", price: "", oldPrice: "",
    categoryId: "", tag: "none", stock: "0", image: "",
  });

  useEffect(() => {
    fetchAdminCategories().then((res) => res.data && setCategories(res.data.categories));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.categoryId) return toast.error("Please select a category");
    setIsSaving(true);
    try {
      await createAdminProduct({
        name: form.name,
        categoryId: form.categoryId,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
        image: form.image,
        description: form.description,
        stock: Number(form.stock),
        isNewArrival: form.tag === "new",
        isSale: form.tag === "sale",
      });
      toast.success("Product created");
      router.push("/admin/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create product");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft size={16} /> Add New Product
      </button>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Product Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Ceramic Olive Oil Dispenser"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Slug (Auto-generated if empty)</label>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
            <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Price ($)</label>
              <input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Compare At Price (Optional)</label>
              <input type="number" step="0.01" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600" />
            </div>
          </div>
          <ImageUploadField
            value={form.image}
            onChange={(url) => setForm({ ...form, image: url })}
          />
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Organization</h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
            <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600">
              <option value="">Select a category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tag</label>
            <select value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600">
              <option value="none">None</option>
              <option value="new">New Arrival</option>
              <option value="sale">Sale</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Stock Quantity</label>
            <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600" />
          </div>
        </div>

        <div className="flex justify-end gap-3 lg:col-span-3">
          <button type="button" onClick={() => router.back()} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={isSaving} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
            {isSaving ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}