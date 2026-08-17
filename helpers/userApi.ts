import { getToken } from "./authApi";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

async function userRequest<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
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

export function updateProfileRequest(input: { name: string; email: string }) {
  return userRequest<{
    user: { id: string; name: string; email: string; role: string; isVerified: boolean };
  }>("/api/users/me", { method: "PATCH", body: JSON.stringify(input) });
}

export function changePasswordRequest(input: { currentPassword: string; newPassword: string }) {
  return userRequest<null>("/api/users/change-password", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function updateNotificationPreferenceRequest(enabled: boolean) {
  return userRequest<{ notificationsEnabled: boolean }>("/api/users/notifications", {
    method: "PATCH",
    body: JSON.stringify({ enabled }),
  });
}

export function submitReview(input: { orderId: string; productId: string; rating: number; comment?: string }) {
  return userRequest<null>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchProductReviews(productId: string) {
  return fetch(`/api/reviews?productId=${productId}`).then((r) => r.json());
}

export function updateReviewRequest(reviewId: string, input: { rating: number; comment?: string }) {
  return userRequest<null>(`/api/reviews/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteReviewRequest(reviewId: string) {
  return userRequest<null>(`/api/reviews/${reviewId}`, { method: "DELETE" });
}