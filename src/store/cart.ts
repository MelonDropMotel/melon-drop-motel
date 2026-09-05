import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = { id: string; qty: number };

type CartState = {
  lines: CartLine[];
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      open: false,
      setOpen: (open) => set({ open }),
      add: (id) => {
        const lines = get().lines;
        const existing = lines.find((l) => l.id === id);
        if (existing) {
          set({
            lines: lines.map((l) =>
              l.id === id ? { ...l, qty: l.qty + 1 } : l,
            ),
            open: true,
          });
        } else {
          set({ lines: [...lines, { id, qty: 1 }], open: true });
        }
      },
      setQty: (id, qty) => {
        if (qty <= 0) {
          set({ lines: get().lines.filter((l) => l.id !== id) });
          return;
        }
        set({
          lines: get().lines.map((l) => (l.id === id ? { ...l, qty } : l)),
        });
      },
      remove: (id) => set({ lines: get().lines.filter((l) => l.id !== id) }),
      clear: () => set({ lines: [] }),
    }),
    { name: "mdm-cart" },
  ),
);

export function cartCount(lines: CartLine[]) {
  return lines.reduce((n, l) => n + l.qty, 0);
}
