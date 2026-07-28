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

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  quantity: number;
  stock: number;
}

interface CartContextValue {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (product: UIProduct, quantity?: number) => Promise<boolean>;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const GUEST_CART_KEY = "nexmart_guest_cart";

interface CartApiResponse {
  success: boolean;
  message: string;
  data?: { cart: { items: CartItem[]; subtotal: number; itemCount: number } };
}

async function cartFetch(path: string, options: RequestInit = {}): Promise<CartApiResponse> {
  const token = getToken();
  const res = await fetch(`/api/cart${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = (await res.json()) as CartApiResponse;

  if (!res.ok) {
    throw new Error(body.message || "Something went wrong");
  }

  return body;
}

function readGuestCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartItem[]) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors (e.g. private browsing)
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    let isCancelled = false;

    async function sync() {
      if (!isAuthenticated) {
        // Guest / logged-out: just load whatever's saved locally.
        setItems(readGuestCart());
        wasAuthenticated.current = false;
        return;
      }

      // Just logged in: if there's a guest cart sitting in localStorage,
      // merge each item into the account's server cart, then clear it —
      // the add-to-cart API already handles summing quantities and
      // capping at available stock.
      const justLoggedIn = !wasAuthenticated.current;
      wasAuthenticated.current = true;

      setIsLoading(true);
      try {
        if (justLoggedIn) {
          const guestItems = readGuestCart();
          for (const item of guestItems) {
            try {
              await cartFetch("", {
                method: "POST",
                body: JSON.stringify({ productId: item.id, quantity: item.quantity }),
              });
            } catch {
              // Skip items that fail to merge (e.g. now out of stock) —
              // don't let one bad item block the rest.
            }
          }
          writeGuestCart([]);
        }

        const body = await cartFetch("");
        if (!isCancelled && body.data) {
          setItems(body.data.cart.items);
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    sync();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  // Persist guest cart changes to localStorage as they happen.
  useEffect(() => {
    if (!isAuthenticated) {
      writeGuestCart(items);
    }
  }, [items, isAuthenticated]);

  const addToCart = async (product: UIProduct, quantity: number = 1): Promise<boolean> => {
    if (!isAuthenticated) {
      setItems((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        if (existing) {
          const capped = product.stock
            ? Math.min(existing.quantity + quantity, product.stock)
            : existing.quantity + quantity;
          return prev.map((item) =>
            item.id === product.id ? { ...item, quantity: capped } : item
          );
        }
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            image: product.image,
            price: product.price,
            oldPrice: product.oldPrice,
            quantity: product.stock ? Math.min(quantity, product.stock) : quantity,
            stock: product.stock,
          },
        ];
      });
      toast.success(`${product.name} added to cart`);
      return true;
    }

    try {
      const body = await cartFetch("", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, quantity }),
      });

      if (body.data) {
        setItems(body.data.cart.items);
      }

      toast.success(`${product.name} added to cart`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add to cart");
      return false;
    }
  };

  const removeFromCart = (productId: string) => {
    const item = items.find((i) => i.id === productId);

    setItems((prev) => prev.filter((i) => i.id !== productId));
    if (item) {
      toast.success(`${item.name} removed from cart`);
    }

    if (isAuthenticated) {
      cartFetch(`/${productId}`, { method: "DELETE" }).catch((error) => {
        console.error("Failed to remove item from cart:", error);
      });
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.stock ? Math.min(quantity, item.stock) : quantity }
          : item
      )
    );

    if (isAuthenticated) {
      cartFetch(`/${productId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      })
        .then((body) => {
          if (body.data) {
            setItems(body.data.cart.items);
          }
        })
        .catch((error) => {
          console.error("Failed to update cart quantity:", error);
        });
    }
  };

  const clearCart = () => {
    setItems([]);
    if (!isAuthenticated) {
      writeGuestCart([]);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, isLoading, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}