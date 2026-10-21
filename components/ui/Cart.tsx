"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ease, store } from "@/lib/store";
import { PillButton } from "./Interactions";

export type CartLine = { id: string; name: string; subtitle: string; price: number; color: string; qty: number };
type Flyer = { key: number; x: number; y: number; color: string };

type CartCtx = {
  lines: CartLine[];
  count: number;
  total: number;
  open: boolean;
  bump: number;
  /** A product is animating toward the bag button. */
  flying: boolean;
  setOpen: (v: boolean) => void;
  add: (line: Omit<CartLine, "qty">, qty?: number, from?: HTMLElement | null) => void;
  setQty: (id: string, qty: number) => void;
};

const Ctx = createContext<CartCtx | null>(null);

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const [flyers, setFlyers] = useState<Flyer[]>([]);

  const add = useCallback<CartCtx["add"]>((line, qty = 1, from) => {
    setLines((ls) => {
      const hit = ls.find((l) => l.id === line.id);
      return hit
        ? ls.map((l) => (l.id === line.id ? { ...l, qty: l.qty + qty } : l))
        : [...ls, { ...line, qty }];
    });
    if (from) {
      const r = from.getBoundingClientRect();
      setFlyers((f) => [...f, { key: Date.now() + Math.random(), x: r.left + r.width / 2, y: r.top + r.height / 2, color: line.color }]);
    } else {
      setBump((b) => b + 1);
    }
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((ls) => (qty <= 0 ? ls.filter((l) => l.id !== id) : ls.map((l) => (l.id === id ? { ...l, qty } : l))));
  }, []);

  const value = useMemo(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const total = lines.reduce((n, l) => n + l.qty * l.price, 0);
    return { lines, count, total, open, bump, flying: flyers.length > 0, setOpen, add, setQty };
  }, [lines, open, bump, flyers.length, add, setQty]);

  useEffect(() => {
    if (open) store.lenis?.stop();
    else if (store.loaded) store.lenis?.start();
  }, [open]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <CartDrawer />
      {/* Product "flies" into the bag */}
      <div className="pointer-events-none fixed inset-0 z-[85]">
        {flyers.map((f) => (
          <FlyDot
            key={f.key}
            flyer={f}
            onDone={() => {
              setFlyers((all) => all.filter((x) => x.key !== f.key));
              setBump((b) => b + 1);
            }}
          />
        ))}
      </div>
    </Ctx.Provider>
  );
}

function FlyDot({ flyer, onDone }: { flyer: Flyer; onDone: () => void }) {
  // The nav may be sliding back in, so aim for its resting position.
  const target = document.getElementById("cart-button")?.getBoundingClientRect();
  const tx = target ? target.left + target.width / 2 : window.innerWidth - 60;
  const ty = target ? Math.max(target.top, 20) + target.height / 2 : 40;
  return (
    <motion.div
      className="absolute -ml-4 -mt-4 h-8 w-8 rounded-full border-2 border-white shadow-xl"
      style={{ background: flyer.color }}
      initial={{ x: flyer.x, y: flyer.y, scale: 1 }}
      animate={{ x: [flyer.x, (flyer.x + tx) / 2, tx], y: [flyer.y, Math.min(flyer.y, ty) - 160, ty], scale: [1, 1.3, 0.3] }}
      transition={{ duration: 0.85, ease: [0.5, 0, 0.75, 0] }}
      onAnimationComplete={onDone}
    />
  );
}

function CartDrawer() {
  const { lines, open, setOpen, total, setQty, count } = useCart();
  const [checkedOut, setCheckedOut] = useState(false);

  useEffect(() => {
    if (!open) setCheckedOut(false);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[88] bg-ink/75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[89] flex h-full w-full max-w-md flex-col bg-cream text-navy"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease }}
            data-lenis-prevent
          >
            <div className="flex items-center justify-between border-b border-navy/10 p-6">
              <h3 className="font-display text-4xl uppercase">Your bag ({count})</h3>
              <button
                onClick={() => setOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-navy/20 transition hover:rotate-90 hover:bg-navy hover:text-cream"
                aria-label="Close bag"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {lines.length === 0 && (
                <p className="mt-10 text-center text-navy/60">Your bag is empty. Time to refuel.</p>
              )}
              <AnimatePresence initial={false}>
                {lines.map((l) => (
                  <motion.div
                    key={l.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 60 }}
                    className="mb-4 flex items-center gap-4 rounded-2xl bg-white p-4"
                  >
                    <div className="h-16 w-16 shrink-0 rounded-xl" style={{ background: l.color }} />
                    <div className="flex-1">
                      <p className="font-semibold">{l.name}</p>
                      <p className="text-sm text-navy/50">{l.subtitle}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <button className="h-7 w-7 rounded-full border border-navy/20" onClick={() => setQty(l.id, l.qty - 1)} aria-label="Decrease">−</button>
                        <span className="w-4 text-center tabular-nums">{l.qty}</span>
                        <button className="h-7 w-7 rounded-full border border-navy/20" onClick={() => setQty(l.id, l.qty + 1)} aria-label="Increase">+</button>
                      </div>
                    </div>
                    <p className="font-semibold tabular-nums">${(l.price * l.qty).toFixed(2)}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="border-t border-navy/10 p-6">
              <div className="mb-5 flex items-end justify-between">
                <span className="eyebrow text-navy/60">Subtotal</span>
                <span className="font-display text-4xl tabular-nums">${total.toFixed(2)}</span>
              </div>
              {checkedOut ? (
                <p className="rounded-full bg-navy px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.14em] text-cream">
                  Demo store — no order placed
                </p>
              ) : (
                <PillButton full onClick={() => lines.length && setCheckedOut(true)}>
                  Checkout
                </PillButton>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
