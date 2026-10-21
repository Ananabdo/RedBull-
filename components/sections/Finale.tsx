"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "@/lib/gsap";
import { ease, store } from "@/lib/store";
import { Arrow, PillButton } from "../ui/Interactions";

export function Finale() {
  const root = useRef<HTMLElement>(null);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".finale-line",
        { xPercent: (i) => (i % 2 ? 25 : -25) },
        {
          xPercent: (i) => (i % 2 ? -8 : 8),
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      data-can="0 0.02 0.95 0.1 -0.18"
      data-bg="#E4002B"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-5 pb-10 pt-32 md:px-10"
    >
      <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-center font-display uppercase leading-[0.82] text-navy">
        <span className="finale-line block whitespace-nowrap text-[22vw]">Fuel your</span>
        <span className="finale-line text-outline block whitespace-nowrap text-[22vw] text-cream">next move</span>
      </div>

      <p className="eyebrow relative z-10 text-cream/80">(06) — Join the crew</p>

      <div className="relative z-10 grid items-end gap-8 md:grid-cols-2">
        <p className="max-w-sm text-cream/90">
          Early access to limited editions, event tickets and drops you won’t find anywhere else.
        </p>
        <form
          className="flex w-full max-w-md flex-col gap-3 justify-self-end sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.includes("@")) setJoined(true);
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {joined ? (
              <motion.p
                key="ok"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease }}
                className="w-full rounded-full bg-navy px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.14em]"
              >
                You’re in. Watch your inbox.
              </motion.p>
            ) : (
              <motion.div key="form" exit={{ opacity: 0, y: -10 }} className="flex w-full flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  aria-label="Email address"
                  className="flex-1 rounded-full border border-cream/40 bg-transparent px-6 py-4 text-cream placeholder:text-cream/60 focus:border-cream focus:outline-none"
                  style={{ cursor: "text" }}
                />
                <PillButton type="submit" variant="sun" cursor="Join">
                  Join <Arrow />
                </PillButton>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </section>
  );
}

export function Footer() {
  const cols = [
    { h: "Shop", l: ["Packs", "Cases", "Editions", "Gift cards"] },
    { h: "Brand", l: ["Story", "Ingredients", "Sustainability", "Careers"] },
    { h: "Help", l: ["Shipping", "Returns", "FAQ", "Contact"] },
  ];
  return (
    <footer className="relative z-10 overflow-hidden bg-ink px-5 pb-8 pt-24 text-cream md:px-10">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-display text-4xl uppercase leading-none">
            Energy, <span className="text-sun">engineered.</span>
          </p>
          <button
            onClick={() => store.lenis?.scrollTo(0, { duration: 2.2 })}
            className="mt-8 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:text-sun"
          >
            Back to top <Arrow className="-rotate-90" />
          </button>
        </div>
        {cols.map((c) => (
          <div key={c.h} className="md:col-span-2">
            <p className="eyebrow mb-5 text-white/40">{c.h}</p>
            <ul className="space-y-3">
              {c.l.map((l) => (
                <li key={l}>
                  <a href="#" onClick={(e) => e.preventDefault()} className="group relative inline-block text-sm text-white/80">
                    {l}
                    <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-sun transition-transform duration-500 ease-out-expo group-hover:origin-left group-hover:scale-x-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <motion.p
        initial={{ y: "40%", opacity: 0 }}
        whileInView={{ y: "0%", opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease }}
        className="mt-24 select-none whitespace-nowrap text-center font-display text-[21vw] uppercase leading-[0.8] text-white/[0.06]"
      >
        Red Bull
      </motion.p>
      <div className="mt-6 flex flex-col justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/40 md:flex-row">
        <p>Unofficial design concept — not affiliated with or endorsed by Red Bull GmbH.</p>
        <p>High caffeine content. Not recommended for children or pregnant or breast-feeding women.</p>
      </div>
    </footer>
  );
}
