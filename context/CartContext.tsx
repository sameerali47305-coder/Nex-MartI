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
  addToCart: (product: UIProduct, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CART_STORAGE_KEY = "nexmart_cart";

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load cart from storage:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist to localStorage whenever items change (after initial hydration)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save cart to storage:", error);
    }
  }, [items, isHydrated]);

  const addToCart = (product: UIProduct, quantity: number = 1): boolean => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to your cart");
      return false;
    }

    // Compute the new state first, then call setItems + toast as
    // separate steps. Calling toast() from inside the setState updater
    // is a side effect during render and triggers React's "Cannot
    // update a component while rendering a different component" warning.
    const existing = items.find((item) => item.id === product.id);

    if (existing) {
      const desired = existing.quantity + quantity;
      const capped = product.stock ? Math.min(desired, product.stock) : desired;

      setItems((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, quantity: capped } : item
        )
      );
    } else {
      const initialQuantity = product.stock
        ? Math.min(quantity, product.stock)
        : quantity;

      setItems((prev) => [
        ...prev,
        {
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          oldPrice: product.oldPrice,
          quantity: initialQuantity,
          stock: product.stock,
        },
      ]);
    }

    toast.success(`${product.name} added to cart`);
    return true;
  };

  const removeFromCart = (productId: string) => {
    const item = items.find((i) => i.id === productId);
    setItems((prev) => prev.filter((i) => i.id !== productId));
    if (item) {
      toast.success(`${item.name} removed from cart`);
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
          ? {
              ...item,
              quantity: item.stock ? Math.min(quantity, item.stock) : quantity,
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
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