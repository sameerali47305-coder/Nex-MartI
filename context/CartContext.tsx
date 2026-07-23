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

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Whenever login state changes, sync with the server: logged in -> fetch
  // the user's saved cart; logged out -> clear it locally (nothing to show
  // for a guest, and we don't want the previous user's cart lingering).
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);

    cartFetch("")
      .then((body) => {
        if (!isCancelled && body.data) {
          setItems(body.data.cart.items);
        }
      })
      .catch((error) => {
        console.error("Failed to load cart:", error);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  const addToCart = async (product: UIProduct, quantity: number = 1): Promise<boolean> => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to your cart");
      return false;
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

    // Optimistic update — remove locally right away, sync with the server
    // in the background so the UI feels instant.
    setItems((prev) => prev.filter((i) => i.id !== productId));
    if (item) {
      toast.success(`${item.name} removed from cart`);
    }

    cartFetch(`/${productId}`, { method: "DELETE" }).catch((error) => {
      console.error("Failed to remove item from cart:", error);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    // Optimistic update, then confirm/correct against the server response
    // (e.g. if it had to cap the quantity at available stock).
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.stock ? Math.min(quantity, item.stock) : quantity }
          : item
      )
    );

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
  };

  const clearCart = () => {
    // NOTE: this only clears local state for now — there's no "clear whole
    // cart" endpoint yet. Once Order APIs are added, placing an order
    // should also clear the server-side cart (either a dedicated
    // DELETE /api/cart route, or the order service clearing it after the
    // order is created), otherwise items will reappear on next login.
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
      }}
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