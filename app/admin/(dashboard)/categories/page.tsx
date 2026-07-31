"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Plus, Pencil, Trash2, X } from "lucide-react";

import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  type AdminCategory,
} from "@/helpers/adminApi";

interface FormState {
  name: string;
  slug: string;
  image: string;
  description: string;
}

const emptyForm: FormState = { name: "", slug: "", image: "", description: "" };

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  function loadCategories() {
    setIsLoading(true);
    fetchAdminCategories()
      .then((res) => {
        if (res.data) setCategories(res.data.categories);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to load categories"))
      .finally(() => setIsLoading(false));
  }

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(category: AdminCategory) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      image: category.image,
      description: category.description,
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      name: form.name,
      slug: form.slug.trim() ? slugify(form.slug) : slugify(form.name),
      image: form.image,
      description: form.description,
    };

    try {
      if (editingId) {
        const res = await updateAdminCategory(editingId, payload);
        if (res.data) {
          toast.success("Category updated");
          setCategories((prev) =>
            prev.map((c) => (c.id === editingId ? { ...c, ...res.data!.category } : c))
          );
        }
      } else {
        const res = await createAdminCategory(payload);
        if (res.data) {
          toast.success("Category created");
          setCategories((prev) => [...prev, { ...res.data!.category, productCount: 0 }]);
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(category: AdminCategory) {
    if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) return;

    try {
      await deleteAdminCategory(category.id);
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete category");
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Slug</th>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3">Products</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{category.name}</td>
                <td className="px-5 py-3 font-mono text-xs text-gray-500">{category.slug}</td>
                <td className="max-w-xs truncate px-5 py-3 text-gray-600">{category.description}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {category.productCount} Products
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => openEditModal(category)} className="text-gray-500 hover:text-blue-600">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(category)} className="text-gray-500 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && <p className="p-5 text-sm text-gray-500">No categories yet.</p>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Edit Category" : "Add Category"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Kitchen"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Slug (optional)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. kitchen (auto-generated if left blank)"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Image path</label>
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="/products/example.jpeg"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Category description..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : editingId ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}