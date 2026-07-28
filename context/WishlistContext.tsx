"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
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

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);
const GUEST_WISHLIST_KEY = "nexmart_guest_wishlist";

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

function readGuestWishlist(): UIProduct[] {
  try {
    const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function writeGuestWishlist(items: UIProduct[]) {
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors (e.g. private browsing)
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<UIProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    let isCancelled = false;

    async function sync() {
      if (!isAuthenticated) {
        setItems(readGuestWishlist());
        wasAuthenticated.current = false;
        return;
      }

      // Just logged in: merge any guest-wishlisted products into the
      // account's server wishlist, then clear the local copy.
      const justLoggedIn = !wasAuthenticated.current;
      wasAuthenticated.current = true;

      setIsLoading(true);
      try {
        if (justLoggedIn) {
          const guestItems = readGuestWishlist();
          for (const product of guestItems) {
            try {
              await wishlistFetch("", {
                method: "POST",
                body: JSON.stringify({ productId: product.id }),
              });
            } catch {
              // Skip items that fail to merge — don't block the rest.
            }
          }
          writeGuestWishlist([]);
        }

        const body = await wishlistFetch("");
        if (!isCancelled && body.data) {
          setItems(body.data.wishlist);
        }
      } catch (error) {
        console.error("Failed to load wishlist:", error);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    sync();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      writeGuestWishlist(items);
    }
  }, [items, isAuthenticated]);

  const isWishlisted = (productId: string) => {
    return items.some((item) => item.id === productId);
  };

  const toggleWishlist = (product: UIProduct) => {
    const alreadyWishlisted = isWishlisted(product.id);

    if (alreadyWishlisted) {
      setItems((prev) => prev.filter((item) => item.id !== product.id));
      toast.success(`${product.name} removed from wishlist`);

      if (isAuthenticated) {
        wishlistFetch(`/${product.id}`, { method: "DELETE" }).catch((error) => {
          console.error("Failed to remove from wishlist:", error);
        });
      }
    } else {
      setItems((prev) => [...prev, product]);
      toast.success(`${product.name} added to wishlist`);

      if (isAuthenticated) {
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
    }
  };

  const removeFromWishlist = (productId: string) => {
    const item = items.find((i) => i.id === productId);

    setItems((prev) => prev.filter((i) => i.id !== productId));
    if (item) {
      toast.success(`${item.name} removed from wishlist`);
    }

    if (isAuthenticated) {
      wishlistFetch(`/${productId}`, { method: "DELETE" }).catch((error) => {
        console.error("Failed to remove from wishlist:", error);
      });
    }
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