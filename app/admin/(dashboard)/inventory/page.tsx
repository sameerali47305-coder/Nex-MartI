"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Search, Boxes, ChevronLeft, ChevronRight } from "lucide-react";

import { fetchAdminProducts, updateProductStock, type AdminProduct } from "@/helpers/adminApi";

function statusFor(stock: number) {
  if (stock <= 0) return { label: "Out of Stock", className: "bg-red-100 text-red-700" };
  if (stock <= 10) return { label: "Low Stock", className: "bg-amber-100 text-amber-700" };
  return { label: "In Stock", className: "bg-green-100 text-green-700" };
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 6;

  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  function load() {
    setIsLoading(true);
    fetchAdminProducts({ search, page, limit })
      .then((res) => {
        if (res.data) {
          setProducts(res.data.products);
          setTotal(res.data.total);
        }
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to load inventory"))
      .finally(() => setIsLoading(false));
  }

  function handleStockChange(id: string, value: string) {
    const stock = Number(value);
    if (Number.isNaN(stock) || stock < 0) return;
    setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, stock } : p)));
  }

  async function handleStockSave(id: string, stock: number) {
    try {
      await updateProductStock(id, stock);
      toast.success("Stock updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update stock");
    }
  }

  const filtered = products.filter((p) => {
    if (statusFilter === "all") return true;
    return statusFor(p.stock).label === statusFilter;
  });

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Boxes className="text-gray-700" size={22} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500">Manage product stock levels and track low inventory</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Search products by name..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-600"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-600"
            >
              <option value="all">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
          <span className="text-sm text-gray-500">
            Showing {from}-{to} of {total} items
          </span>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 size={26} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="px-3 py-3">Product</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Price</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Stock Adjustment</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const status = statusFor(product.stock);
                  return (
                    <tr key={product._id} className="border-b border-gray-50">
                      <td className="flex items-center gap-3 px-3 py-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </td>
                      <td className="px-3 py-3 text-gray-500">{product.category?.name ?? "—"}</td>
                      <td className="px-3 py-3 text-gray-700">${product.price.toFixed(2)}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min={0}
                          value={product.stock}
                          onChange={(e) => handleStockChange(product._id, e.target.value)}
                          onBlur={(e) => handleStockSave(product._id, Number(e.target.value))}
                          className="w-20 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-blue-600"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && <p className="p-5 text-sm text-gray-500">No products found.</p>}

            {total > limit && (
              <div className="mt-4 flex items-center justify-center gap-4 border-t border-gray-100 pt-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={16} />
                  Prev
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {Math.max(1, Math.ceil(total / limit))}
                </span>
                <button
                  disabled={page >= Math.ceil(total / limit)}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}