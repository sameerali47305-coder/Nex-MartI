"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { getToken, saveToken, clearToken } from "@/helpers/authApi";
import { useFcmRegister } from "@/hooks/useFcmRegister";
import { onForegroundMessage } from "@/lib/firebase-client";
import toast from "react-hot-toast";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  notificationsEnabled?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, if a token is already saved (from a previous
  // session), verify it against /api/auth/me and restore the user.
  useEffect(() => {
    const storedToken = getToken();

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then(async (res) => {
        const body = await res.json();

        if (isCancelled) return;

        if (res.ok && body?.data?.user) {
          setUser(body.data.user);
        } else {
          // Token expired/invalid — clear it so we don't keep retrying
          clearToken();
        }
      })
      .catch(() => {
        if (!isCancelled) {
          clearToken();
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const login = (newUser: AuthUser, token: string) => {
    saveToken(token);
    setUser(newUser);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  // Called after a profile update so the navbar/dropdown reflect the new
  // name/email immediately, without needing a full /api/auth/me refetch.
  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
  };

  useFcmRegister(Boolean(user), getToken());

  // While the tab is open and focused, background pushes don't show a
  // native OS popup - so show a toast instead.
  useEffect(() => {
    if (!user) return;

    onForegroundMessage((payload) => {
      const notification = (payload as { notification?: { title?: string; body?: string } })
        ?.notification;
      if (!notification) return;
      toast(`${notification.title ?? "Notification"}${notification.body ? `: ${notification.body}` : ""}`);
    });
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}