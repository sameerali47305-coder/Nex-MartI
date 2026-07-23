"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import toast from "react-hot-toast";

import { UIProduct } from "@/lib/serializers";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/helpers/authApi";

interface WishlistContextValue {
  items: UIProduct[];
  isLoading: boolean;
  toggleWishlist: (product: UIProduct) => void;
  isWishlisted: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined
);

interface WishlistApiResponse {
  success: boolean;
  message: string;
  data?: { wishlist: UIProduct[] };
}

async function wishlistFetch(
  path: string,
  options: RequestInit = {}
): Promise<WishlistApiResponse> {
  const token = getToken();
  const res = await fetch(`/api/wishlist${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = (await res.json()) as WishlistApiResponse;

  if (!res.ok) {
    throw new Error(body.message || "Something went wrong");
  }

  return body;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<UIProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);

    wishlistFetch("")
      .then((body) => {
        if (!isCancelled && body.data) {
          setItems(body.data.wishlist);
        }
      })
      .catch((error) => {
        console.error("Failed to load wishlist:", error);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  const isWishlisted = (productId: string) => {
    return items.some((item) => item.id === productId);
  };

  const toggleWishlist = (product: UIProduct) => {
    if (!isAuthenticated) {
      toast.error("Please login to use your wishlist");
      return;
    }

    const alreadyWishlisted = isWishlisted(product.id);

    if (alreadyWishlisted) {
      setItems((prev) => prev.filter((item) => item.id !== product.id));
      toast.success(`${product.name} removed from wishlist`);

      wishlistFetch(`/${product.id}`, { method: "DELETE" }).catch((error) => {
        console.error("Failed to remove from wishlist:", error);
      });
    } else {
      setItems((prev) => [...prev, product]);
      toast.success(`${product.name} added to wishlist`);

      wishlistFetch("", {
        method: "POST",
        body: JSON.stringify({ productId: product.id }),
      })
        .then((body) => {
          if (body.data) {
            setItems(body.data.wishlist);
          }
        })
        .catch((error) => {
          console.error("Failed to add to wishlist:", error);
        });
    }
  };

  const removeFromWishlist = (productId: string) => {
    const item = items.find((i) => i.id === productId);

    setItems((prev) => prev.filter((i) => i.id !== productId));
    if (item) {
      toast.success(`${item.name} removed from wishlist`);
    }

    wishlistFetch(`/${productId}`, { method: "DELETE" }).catch((error) => {
      console.error("Failed to remove from wishlist:", error);
    });
  };

  return (
    <WishlistContext.Provider
      value={{ items, isLoading, toggleWishlist, isWishlisted, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}