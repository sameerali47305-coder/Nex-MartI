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

interface WishlistContextValue {
  items: UIProduct[];
  toggleWishlist: (product: UIProduct) => void;
  isWishlisted: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
}

const WISHLIST_STORAGE_KEY = "nexmart_wishlist";

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<UIProduct[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load wishlist from storage:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save wishlist to storage:", error);
    }
  }, [items, isHydrated]);

  const isWishlisted = (productId: string) => {
    return items.some((item) => item.id === productId);
  };

  const toggleWishlist = (product: UIProduct) => {
    // Compute membership from current state first, then update + toast
    // as separate steps — calling toast() from inside the setState
    // updater is a side effect during render and triggers React's
    // "Cannot update a component while rendering a different component"
    // warning.
    const alreadyWishlisted = items.some((item) => item.id === product.id);

    if (alreadyWishlisted) {
      setItems((prev) => prev.filter((item) => item.id !== product.id));
      toast.success(`${product.name} removed from wishlist`);
    } else {
      setItems((prev) => [...prev, product]);
      toast.success(`${product.name} added to wishlist`);
    }
  };

  const removeFromWishlist = (productId: string) => {
    const item = items.find((i) => i.id === productId);
    setItems((prev) => prev.filter((i) => i.id !== productId));
    if (item) {
      toast.success(`${item.name} removed from wishlist`);
    }
  };

  return (
    <WishlistContext.Provider
      value={{ items, toggleWishlist, isWishlisted, removeFromWishlist }}
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