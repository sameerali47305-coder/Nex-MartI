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

export function fetchDashboardStats() {
  return adminRequest<DashboardStats>("/api/admin/dashboard");
}

export function fetchUsers() {
  return adminRequest<{ users: AdminUser[] }>("/api/admin/users");
}

export function updateUserRole(id: string, role: "customer" | "admin") {
  return adminRequest<{ user: AdminUser }>(`/api/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify({ role }),
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