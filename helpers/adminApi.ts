import { getToken } from "./authApi";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

async function adminRequest<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const token = getToken();

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  const body = (await res.json()) as ApiResponse<T>;

  if (!res.ok) {
    throw new Error(body.message || "Something went wrong");
  }

  return body;
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  revenueByDay: { date: string; total: number }[];
  ordersByStatus: { status: string; count: number }[];
  recentOrders: {
    id: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  isVerified: boolean;
  createdAt: string;
  orderCount: number;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  itemCount: number;
  createdAt: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: "customer" | "admin";
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  productCount: number;
}

export function fetchDashboardStats() {
  return adminRequest<DashboardStats>("/api/admin/dashboard");
}

export function fetchUsers() {
  return adminRequest<{ users: AdminUser[] }>("/api/admin/users");
}

export function updateUser(id: string, input: UpdateUserInput) {
  return adminRequest<{ user: AdminUser }>(`/api/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteAdminUser(id: string) {
  return adminRequest<null>(`/api/admin/users/${id}`, { method: "DELETE" });
}

export function fetchAllOrders(status?: string) {
  const query = status ? `?status=${status}` : "";
  return adminRequest<{ orders: AdminOrder[] }>(`/api/admin/orders${query}`);
}

export function updateAdminOrderStatus(id: string, status: string) {
  return adminRequest<{ order: { id: string; status: string } }>(`/api/admin/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export function fetchAdminCategories() {
  return adminRequest<{ categories: AdminCategory[] }>("/api/categories");
}

export function createAdminCategory(input: {
  name: string;
  slug: string;
  image?: string;
  description?: string;
}) {
  return adminRequest<{ category: AdminCategory }>("/api/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateAdminCategory(
  id: string,
  input: Partial<{ name: string; slug: string; image: string; description: string }>
) {
  return adminRequest<{ category: AdminCategory }>(`/api/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteAdminCategory(id: string) {
  return adminRequest<null>(`/api/categories/${id}`, { method: "DELETE" });
}

export interface AdminProduct {
  _id: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  category?: { name: string; slug: string } | null;
}

export function fetchAdminProducts(params: { search?: string; page?: number; limit?: number; status?: string; category?: string } = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.status && params.status !== "all") query.set("status", params.status);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 10));
  return adminRequest<{ products: AdminProduct[]; total: number; page: number; totalPages: number }>(
    `/api/products?${query.toString()}`
  );
}

export function updateProductStock(id: string, stock: number) {
  return adminRequest<{ product: AdminProduct }>(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify({ stock }),
  });
}

export function createAdminProduct(input: {
  name: string; categoryId: string; price: number; oldPrice?: number;
  image: string; description: string; stock: number;
  isNewArrival?: boolean; isSale?: boolean;
}) {
  return adminRequest<{ product: AdminProduct }>("/api/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateAdminProduct(id: string, input: Partial<{
  name: string; categoryId: string; price: number; oldPrice: number;
  image: string; description: string; stock: number; isNewArrival: boolean; isSale: boolean;
}>) {
  return adminRequest<{ product: AdminProduct }>(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(input) });
}
export function deleteAdminProduct(id: string) {
  return adminRequest<null>(`/api/products/${id}`, { method: "DELETE" });
}

export interface AdminProductDetail {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  stock: number;
  isNewArrival: boolean;
  isSale: boolean;
  category: { _id: string; name: string; slug: string };
}

export function fetchAdminProductById(id: string) {
  return adminRequest<{ product: AdminProductDetail }>(`/api/products/${id}`);
}

export function uploadProductImage(file: File) {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  return fetch("/api/upload", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  }).then(async (res) => {
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || "Upload failed");
    return body as { success: boolean; message: string; data: { url: string } };
  });
}

export function sendPromotionalBroadcast(input: { title: string; body: string }) {
  return adminRequest<{ recipients: number }>("/api/admin/promotions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface SiteSettings {
  dealsEndTime: string | null;
  promoBannerEnabled: boolean;
  promoBannerMessage: string;
}

export function updateSiteSettings(input: Partial<SiteSettings>) {
  return adminRequest<{ settings: SiteSettings }>("/api/admin/settings", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function fetchAllReviews() {
  return adminRequest<{ reviews: { id: string; userName: string; userEmail: string; productName: string; rating: number; comment: string; createdAt: string }[] }>("/api/admin/reviews");
}

export function adminDeleteReview(reviewId: string) {
  return adminRequest<null>(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
}