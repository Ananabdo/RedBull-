"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { flavorById, products, type Product } from "@/lib/flavors";
import { ease } from "@/lib/store";
import { useCart } from "../ui/Cart";
import { MiniCan } from "../ui/MiniCan";
import { RevealLine } from "../ui/Interactions";

function ProductCard({ p, index }: { p: Product; index: number }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const shown = Math.min(p.cans, 4);
  const cans = Array.from({ length: shown }, (_, i) => flavorById(p.flavorIds[i % p.flavorIds.length]));

  return (
    <motion.article
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 1, ease, delay: (index % 2) * 0.1 }}
      whileHover="hover"
      className="group flex flex-col overflow-hidden rounded-[28px] bg-white text-navy shadow-[0_30px_80px_-40px_rgba(11,26,70,0.5)]"
    >
      <div
        data-cursor="View"
        className="relative flex h-80 items-end justify-center overflow-hidden"
        style={{ background: `radial-gradient(120% 90% at 50% 100%, ${p.swatch}, ${p.swatch}cc 40%, #0b1a46)` }}
      >
        <div className="lattice absolute inset-0 opacity-60" />
        {p.tag && (
          <span className="absolute left-5 top-5 rounded-full bg-sun px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-navy">
            {p.tag}
          </span>
        )}
        <span className="absolute right-5 top-5 font-display text-6xl leading-none text-white/20">×{p.cans}</span>
        <div className="relative mb-6 flex items-end">
          {cans.map((f, i) => {
            const mid = (shown - 1) / 2;
            const off = i - mid;
            return (
              <motion.div
                key={i}
                className="-mx-2"
                style={{ zIndex: 10 - Math.abs(Math.round(off)) }}
                variants={{
                  hover: { x: off * 22, y: -Math.abs(off) * -4 - 14, rotate: off * 7 },
                }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              >
                <MiniCan f={f} h={190 - Math.abs(off) * 14} />
              </motion.div>
            );
          })}
        </div>
        <div className="absolute bottom-3 h-6 w-2/3 rounded-full bg-black/40 blur-xl" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-3xl uppercase leading-none">{p.name}</h3>
            <p className="mt-2 text-sm text-navy/50">{p.subtitle}</p>
          </div>
          <p className="font-display text-3xl tabular-nums">${p.price.toFixed(2)}</p>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center rounded-full border border-navy/15">
            <button
              aria-label="Decrease quantity"
              className="h-11 w-11 rounded-full transition hover:bg-navy/5"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={qty}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                className="w-6 text-center font-semibold tabular-nums"
              >
                {qty}
              </motion.span>
            </AnimatePresence>
            <button
              aria-label="Increase quantity"
              className="h-11 w-11 rounded-full transition hover:bg-navy/5"
              onClick={() => setQty((q) => q + 1)}
            >
              +
            </button>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            data-cursor="Add"
            onClick={(e) => {
              add({ id: p.id, name: p.name, subtitle: p.subtitle, price: p.price, color: p.swatch }, qty, e.currentTarget);
              setAdded(true);
              setTimeout(() => setAdded(false), 1600);
            }}
            className={`relative h-11 flex-1 overflow-hidden rounded-full text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 ${
              added ? "bg-emerald-600" : "bg-navy hover:bg-bull"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={added ? "a" : "b"}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="block"
              >
                {added ? "Added ✓" : "Add to bag"}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

export function Shop() {
  return (
    <section
      id="shop"
      data-can="0.05 1.1 0.55 0 0.4"
      data-bg="#F4F1EA"
      className="relative z-10 px-5 py-32 text-navy md:px-10 md:py-40"
    >
      <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <p className="eyebrow mb-6 text-bull">(05) — Shop</p>
          <h2 className="font-display text-[16vw] uppercase leading-[0.85] md:text-[9vw]">
            <RevealLine>Stock the</RevealLine>
            <RevealLine delay={0.1}>
              <span className="text-bull">fridge.</span>
            </RevealLine>
          </h2>
        </div>
        <p className="max-w-sm text-navy/60">
          Packs, cases and limited drops — chilled, shipped and on your doorstep. Free delivery on orders over $40.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} p={p} index={i} />
        ))}
      </div>
      <div className="mt-10 grid gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-navy/60 md:grid-cols-3">
        {["Free delivery over $40", "Shipped chilled in 48h", "Infinitely recyclable cans"].map((t) => (
          <div key={t} className="flex items-center gap-3 border-t border-navy/15 pt-4">
            <span className="h-2 w-2 rounded-full bg-bull" />
            {t}
          </div>
        ))}
      </div>
    </section>
  );
}
