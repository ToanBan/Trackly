import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Dish } from "@/api/dishes";

export interface CartItem {
  dish: Dish;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (dish: Dish, quantity?: number) => void;
  removeItem: (dishId: number) => void;
  updateQuantity: (dishId: number, quantity: number) => void;
  clear: () => void;
}

const STORAGE_KEY = "trackly_cart";

const CartContext = createContext<CartContextValue | null>(null);

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => item && item.dish && typeof item.dish.id === "number",
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadFromStorage());

  // Lưu localStorage mỗi khi giỏ hàng thay đổi (state là nguồn dữ liệu thật,
  // localStorage chỉ là bản sao để không mất giỏ khi refresh).
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Bỏ qua nếu localStorage đầy/bị chặn — giỏ vẫn hoạt động trong phiên.
    }
  }, [items]);

  function addItem(dish: Dish, quantity = 1) {
    const qty = Math.max(1, Number.isFinite(quantity) ? Math.floor(quantity) : 1);
    setItems((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + qty }
            : item,
        );
      }
      return [...prev, { dish, quantity: qty }];
    });
  }

  function removeItem(dishId: number) {
    setItems((prev) => prev.filter((item) => item.dish.id !== dishId));
  }

  function updateQuantity(dishId: number, quantity: number) {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.dish.id !== dishId)
        : prev.map((item) =>
            item.dish.id === dishId ? { ...item, quantity } : item,
          ),
    );
  }

  function clear() {
    setItems([]);
  }

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0),
    [items],
  );

  const value: CartContextValue = {
    items,
    totalItems,
    totalAmount,
    addItem,
    removeItem,
    updateQuantity,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}