export type CartSex = "Jantan" | "Betina";
export type CartEntry = { id: string; quantity: number; sex?: CartSex };

const CART_KEY = "hop-cart-v2";

export function readCart(): CartEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const current = JSON.parse(localStorage.getItem(CART_KEY) || "[]") as unknown;
    if (Array.isArray(current) && current.every((item) => typeof item === "object" && item !== null && "id" in item)) {
      return current.map((item) => {
        const value = item as CartEntry;
        const sex = value.sex === "Jantan" || value.sex === "Betina" ? value.sex : undefined;
        return { id: String(value.id), quantity: Math.max(1, Math.floor(Number(value.quantity) || 1)), sex };
      });
    }
    const legacy = JSON.parse(localStorage.getItem("hop-cart") || "[]") as unknown;
    if (Array.isArray(legacy)) return legacy.map((id) => ({ id: String(id), quantity: 1 }));
  } catch {
    return [];
  }
  return [];
}

export function writeCart(entries: CartEntry[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(entries.filter((entry) => entry.quantity > 0)));
  localStorage.removeItem("hop-cart");
  window.dispatchEvent(new Event("hop-cart"));
}

export function addCartItem(id: string, sex?: CartSex) {
  const entries = readCart();
  const existing = entries.find((entry) => entry.id === id && entry.sex === sex);
  if (existing) existing.quantity += 1;
  else entries.push({ id, quantity: 1, sex });
  writeCart(entries);
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem("hop-cart");
  window.dispatchEvent(new Event("hop-cart"));
}
