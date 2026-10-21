"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ease, store, useLoaded } from "@/lib/store";
import { useCart } from "./Cart";

const links = [
  { label: "Story", href: "#story" },
  { label: "Inside", href: "#inside" },
  { label: "Editions", href: "#editions" },
  { label: "Shop", href: "#shop" },
];

export function Nav() {
  const loaded = useLoaded();
  const { count, setOpen, bump, flying } = useCart();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  // Reveal the bag whenever something is on its way in.
  useEffect(() => {
    if (flying) setHidden(false);
  }, [flying]);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (!flying) setHidden(y > prev && y > 200);
  });

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    store.lenis?.scrollTo(href, { duration: 1.6 });
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={loaded ? { y: hidden ? -100 : 0, opacity: 1 } : undefined}
      transition={{ duration: 0.8, ease }}
      className="fixed inset-x-0 top-0 z-[60] flex items-center justify-between px-5 py-5 md:px-10"
    >
      <div className="flex items-center gap-10 mix-blend-difference">
        <a href="#top" onClick={go("#top")} className="font-display text-2xl tracking-wide text-white">
          RED BULL
        </a>
        <nav className="hidden gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={go(l.href)}
              className="group relative overflow-hidden text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              <span className="block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">
                {l.label}
              </span>
              <span className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-y-0">
                {l.label}
              </span>
            </a>
          ))}
        </nav>
      </div>

      <motion.button
        id="cart-button"
        key={bump}
        data-cursor="Bag"
        aria-label={`Open bag, ${count} items`}
        onClick={() => setOpen(true)}
        animate={bump ? { scale: [1, 1.18, 0.95, 1] } : undefined}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 rounded-full bg-navy/95 py-2 pl-5 pr-2 text-xs font-semibold uppercase tracking-[0.2em] text-white ring-1 ring-white/15"
      >
        Bag
        <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-sun px-2 text-sm text-navy tabular-nums">
          {count}
        </span>
      </motion.button>
    </motion.header>
  );
}
