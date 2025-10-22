// contexts/cart-context.tsx
"use client";

import type React from "react";
import { createContext, useContext, useReducer, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  discount?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  total: number;
}

type CartAction =
  // ADD_ITEM payload now accepts optional quantity
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> & { quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  console.log("🔄 Cart reducer - Action type:", action.type);

  switch (action.type) {
    case "ADD_ITEM": {
      console.log("➕ ADD_ITEM - Payload:", action.payload);
      console.log("📊 Current cart items:", state.items);

      const qtyToAdd = action.payload.quantity ?? 1;

      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );

      let newItems: CartItem[];

      if (existingItem) {
        console.log("📈 Item exists, incrementing quantity. Current qty:", existingItem.quantity, "Adding:", qtyToAdd);
        newItems = state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + qtyToAdd }
            : item
        );
      } else {
        console.log("🆕 New item, adding to cart with quantity:", qtyToAdd);
        newItems = [
          ...state.items,
          { ...action.payload, quantity: qtyToAdd } as CartItem,
        ];
      }

      const total = newItems.reduce(
        (sum: number, item) => sum + item.price * item.quantity,
        0
      );

      console.log("✅ New cart state:", {
        itemCount: newItems.length,
        total,
        items: newItems.map(i => `${i.name}(${i.quantity})`)
      });

      return { ...state, items: newItems, total, isOpen: true };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      const total = newItems.reduce(
        (sum: number, item) => sum + item.price * item.quantity,
        0
      );
      console.log("🗑️ Item removed. New item count:", newItems.length);
      return { ...state, items: newItems, total };
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items
        .map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        )
        .filter((item) => item.quantity > 0);

      const total = newItems.reduce(
        (sum: number, item) => sum + item.price * item.quantity,
        0
      );
      console.log("🔢 Quantity updated. New total:", total);
      return { ...state, items: newItems, total };
    }

    case "CLEAR_CART":
      console.log("🧹 Cart cleared");
      return { ...state, items: [], total: 0 };

    case "TOGGLE_CART":
      console.log("🔄 Cart toggled. New state:", !state.isOpen);
      return { ...state, isOpen: !state.isOpen };

    case "OPEN_CART":
      console.log("📂 Cart opened");
      return { ...state, isOpen: true };

    case "CLOSE_CART":
      console.log("📁 Cart closed");
      return { ...state, isOpen: false };

    case "LOAD_CART": {
      const total = action.payload.reduce(
        (sum: number, item) => sum + item.price * item.quantity,
        0
      );
      console.log("💾 Cart loaded from localStorage. Item count:", action.payload.length);
      return { ...state, items: action.payload, total };
    }

    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
    total: 0,
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("restaurant-cart");
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: "LOAD_CART", payload: cartItems });
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("restaurant-cart", JSON.stringify(state.items));
  }, [state.items]);

  // addItem now accepts a quantity param
  const addItem = (item: Omit<CartItem, "quantity">, quantity?: number) => {
    console.log("🛒 CartContext.addItem called with:", item, "quantity:", quantity);
    dispatch({ type: "ADD_ITEM", payload: { ...item, quantity } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" });
  };

  const openCart = () => {
    dispatch({ type: "OPEN_CART" });
  };

  const closeCart = () => {
    dispatch({ type: "CLOSE_CART" });
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
