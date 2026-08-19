export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const body = (await res.json()) as ApiResponse<T>;

  if (!res.ok) {
    throw new Error(body.message || "Something went wrong");
  }

  return body;
}

export function registerRequest(input: { name: string; email: string; password: string }) {
  return apiRequest<{ user: { id: string; name: string; email: string } }>(
    "/api/auth/register",
    { method: "POST", body: JSON.stringify(input) }
  );
}

export function loginRequest(input: { email: string; password: string }) {
  return apiRequest<{
    token: string;
    user: { id: string; name: string; email: string; role: string };
  }>("/api/auth/login", { method: "POST", body: JSON.stringify(input) });
}

export function verifyOtpRequest(input: { email: string; otp: string }) {
  return apiRequest<{ email: string }>("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function resendOtpRequest(input: { email: string }) {
  return apiRequest<{ email: string }>("/api/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function forgotPasswordRequest(input: { email: string }) {
  return apiRequest<{ email: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function resetPasswordRequest(input: {
  email: string;
  otp: string;
  newPassword: string;
}) {
  return apiRequest<{ email: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// NOTE: localStorage is used here because it's simple and fine for a
// student/portfolio project. For real production, prefer an HTTP-only
// cookie set by the server on login — localStorage is readable by any
// JS on the page, which makes it vulnerable to XSS.
const TOKEN_KEY = "nexmart_token";

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function googleAuthRequest(credential: string, allowCreate: boolean = true) {
  return apiRequest<{ token: string; user: { id: string; name: string; email: string; role: string; avatar?: string } }>(
    "/api/auth/google",
    { method: "POST", body: JSON.stringify({ credential, allowCreate }) }
  );
}