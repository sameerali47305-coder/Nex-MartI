"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Plus, Search, Boxes, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchAdminProducts, fetchAdminCategories, deleteAdminProduct, type AdminProduct, type AdminCategory } from "@/helpers/adminApi";

function tagOf(p: AdminProduct & { isNewArrival?: boolean; isSale?: boolean }) {
  if (p.isSale) return { label: "SALE", cls: "bg-red-100 text-red-600" };
  if (p.isNewArrival) return { label: "NEW", cls: "bg-blue-100 text-blue-600" };
  return null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 6;

  useEffect(() => { fetchAdminCategories().then((r) => r.data && setCategories(r.data.categories)); }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchAdminProducts({ search, page, limit, category, status: stock !== "all" ? stock : undefined })
      .then((res) => { if (res.data) { setProducts(res.data.products); setTotal(res.data.total); } })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load products"))
      .finally(() => setIsLoading(false));
  }, [search, page, category, stock]);

  async function handleDelete(p: AdminProduct) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await deleteAdminProduct(p._id);
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((x) => x._id !== p._id));
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to delete"); }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2"><Boxes size={22} /><h1 className="text-2xl font-bold text-gray-900">Products</h1></div>
        <Link href="/admin/products/new" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"><Plus size={16} /> Add Product</Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} placeholder="Search by product name..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-600" />
        </div>
        <select value={category} onChange={(e) => { setPage(1); setCategory(e.target.value); }}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={stock} onChange={(e) => { setPage(1); setStock(e.target.value); }}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600">
          <option value="all">All Stock</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 size={26} className="animate-spin text-blue-600" /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                <th className="px-4 py-3">Product</th><th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th><th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Tag</th><th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const tag = tagOf(p as any);
                return (
                  <tr key={p._id} className="border-b border-gray-50">
                    <td className="flex items-center gap-3 px-4 py-3"><img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" /><span className="font-medium text-gray-900">{p.name}</span></td>
                    <td className="px-4 py-3 text-gray-500">{p.category?.name ?? "—"}</td>
                    <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">{tag ? <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tag.cls}`}>{tag.label}</span> : "-"}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-3">
                      <Link href={`/admin/products/${p._id}/edit`} className="text-gray-500 hover:text-blue-600"><Pencil size={16} /></Link>
                      <button onClick={() => handleDelete(p)} className="text-gray-500 hover:text-red-600"><Trash2 size={16} /></button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {products.length === 0 && <p className="p-5 text-sm text-gray-500">No products found.</p>}
          {total > limit && (
            <div className="flex items-center justify-center gap-4 border-t border-gray-100 p-4">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 disabled:opacity-40"><ChevronLeft size={16} /> Prev</button>
              <span className="text-sm text-gray-600">Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
              <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage((p) => p + 1)} className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 disabled:opacity-40">Next <ChevronRight size={16} /></button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}