"use client";

import { X } from "lucide-react";
import { PRODUCTS } from "@/data/site";
import { cartCount, useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CartDrawer() {
  const { lines, open, setOpen, setQty, remove, clear } = useCart();
  const [sent, setSent] = useState(false);
  const count = cartCount(lines);
  const items = lines
    .map((line) => {
      const product = PRODUCTS.find((p) => p.id === line.id);
      return product ? { ...line, product } : null;
    })
    .filter((x) => x !== null);
  const total = items.reduce((n, i) => n + i.product.price * i.qty, 0);

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close gift shop bag"
          className="fixed inset-0 z-40 bg-bg/70"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-surface text-fg shadow-border transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-fg/10 px-5 py-4">
          <div>
            <p className="hud-label">Gift shop bag</p>
            <h2 className="font-display text-3xl tracking-[0.08em]">
              {count} ITEM{count === 1 ? "" : "S"}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="tap-44 flex items-center justify-center text-muted hover:text-fg"
            aria-label="Close"
          >
            <X className="size-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-muted">The ice machine is empty. Steal something from the shop.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map(({ product, qty, id }) => (
                <li key={id} className="flex gap-3">
                  <img
                    src={product.image}
                    alt=""
                    className="size-20 shrink-0 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-xl tracking-[0.08em]">
                      {product.name}
                    </p>
                    <p className="text-muted">${product.price}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="tap-44 flex items-center justify-center shadow-border px-3 text-fg"
                        onClick={() => setQty(id, qty - 1)}
                      >
                        −
                      </button>
                      <span className="tabular-nums w-6 text-center">{qty}</span>
                      <button
                        type="button"
                        className="tap-44 flex items-center justify-center shadow-border px-3 text-fg"
                        onClick={() => setQty(id, qty + 1)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="ml-auto text-sm tracking-[0.14em] uppercase text-muted hover:text-primary"
                        onClick={() => remove(id)}
                      >
                        Dump
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-fg/10 px-5 py-4">
          <div className="mb-3 flex justify-between font-display text-2xl tracking-[0.08em]">
            <span>TAB</span>
            <span className="tabular-nums">${total}</span>
          </div>
          {sent ? (
            <p className="text-primary">
              Card declined by the ice machine. This gift shop is a demo — DM
              @melondropmotel if you actually want the stuff.
            </p>
          ) : (
            <Button
              className="w-full"
              disabled={items.length === 0}
              onClick={() => {
                setSent(true);
                clear();
              }}
            >
              Check out
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}
