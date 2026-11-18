import { useEffect, useState } from "react";
import type { CartItem } from "./catalog";

export const CART_STORAGE_KEY = "scoot-eyewear-cart";
const CART_EVENT = "scoot-cart-updated";

export function readCart(): CartItem[] {
  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function addCartItem(item: CartItem) {
  const current = readCart();
  const existingIndex = current.findIndex(
    (existing) =>
      existing.productId === item.productId &&
      existing.color === item.color &&
      existing.customPrint === item.customPrint &&
      existing.customText === item.customText &&
      existing.note === item.note,
  );
  if (existingIndex >= 0) {
    current[existingIndex] = { ...current[existingIndex], quantity: current[existingIndex].quantity + item.quantity };
  } else {
    current.push(item);
  }
  writeCart(current);
}

export function updateCartItem(id: string, quantity: number) {
  const next = readCart().map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item));
  writeCart(next);
}

export function removeCartItem(id: string) {
  writeCart(readCart().filter((item) => item.id !== id));
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function useCartCount() {
  const [count, setCount] = useState(() => readCart().reduce((total, item) => total + item.quantity, 0));
  useEffect(() => {
    const sync = () => setCount(readCart().reduce((total, item) => total + item.quantity, 0));
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return count;
}