"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { flavors } from "@/lib/flavors";
import { ease, store } from "@/lib/store";
import { useCart } from "../ui/Cart";
import { Arrow, PillButton } from "../ui/Interactions";

const N = flavors.length;

export function Flavors() {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const st = useRef<ScrollTrigger | null>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const { add } = useCart();

  useEffect(() => {
    const paint = (i: number) =>
      gsap.to(document.body, { backgroundColor: flavors[i].bg, duration: 0.9, overwrite: "auto" });
    const select = (i: number) => {
      if (i === activeRef.current) return;
      activeRef.current = i;
      setActive(i);
      store.flavor = i;
      paint(i);
    };

    const ctx = gsap.context(() => {
      st.current = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: `+=${N * 45}%`,
        pin: true,
        onUpdate: (self) => {
          select(Math.min(N - 1, Math.floor(self.progress * N)));
          if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
        },
        onToggle: (self) => self.isActive && paint(activeRef.current),
        onLeaveBack: () => select(0),
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const jump = (i: number) => {
    const t = st.current;
    if (!t) return;
    store.lenis?.scrollTo(t.start + ((i + 0.5) / N) * (t.end - t.start), { duration: 1.2 });
  };

  const f = flavors[active];

  return (
    <section
      ref={root}
      id="editions"
      data-can="0.2 -0.02 1.02 0 0"
      className="relative z-[1] h-[100svh] overflow-hidden"
    >
      {/* giant outlined name behind the can */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-end overflow-hidden pr-[2vw] opacity-60">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={f.id}
            initial={{ y: "40%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-40%", opacity: 0 }}
            transition={{ duration: 0.9, ease }}
            className="select-none whitespace-nowrap font-display text-[30vw] uppercase leading-none text-transparent md:text-[22vw]"
            style={{ WebkitTextStroke: `2px ${f.primary}` }}
          >
            {f.name}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="relative flex h-full flex-col justify-between px-5 pb-8 pt-28 md:px-10 md:pb-10">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-sun">(04) — The editions</p>
          <p className="font-display text-2xl tabular-nums">
            {String(active + 1).padStart(2, "0")}
            <span className="text-white/40"> / {String(N).padStart(2, "0")}</span>
          </p>
        </div>

        <div className="max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div key={f.id} initial="hide" animate="show" exit="out">
              <motion.p
                variants={{ hide: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 }, out: { opacity: 0 } }}
                transition={{ duration: 0.5 }}
                className="eyebrow mb-3"
                style={{ color: f.primary }}
              >
                {f.edition ?? "Red Bull Energy Drink"} · {f.taste}
              </motion.p>
              <h2 className="overflow-hidden font-display text-[22vw] uppercase leading-[0.85] md:text-[10vw]">
                <motion.span
                  className="block"
                  variants={{ hide: { y: "100%" }, show: { y: "0%" }, out: { y: "-100%" } }}
                  transition={{ duration: 0.7, ease }}
                >
                  {f.name}
                </motion.span>
              </h2>
              <motion.p
                variants={{ hide: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 }, out: { opacity: 0, y: -10 } }}
                transition={{ duration: 0.6, ease, delay: 0.1 }}
                className="mt-5 max-w-sm text-white/70"
              >
                {f.description}
              </motion.p>
              <motion.div
                variants={{ hide: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } }, out: {} }}
                className="mt-6 flex flex-wrap gap-2"
              >
                {f.notes.map((n) => (
                  <motion.span
                    key={n}
                    variants={{ hide: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 }, out: { opacity: 0 } }}
                    className="rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em]"
                    style={{ borderColor: f.primary + "88", color: f.primary }}
                  >
                    {n}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center gap-6">
            <PillButton
              variant="sun"
              cursor="Add"
              onClick={(e) =>
                add(
                  { id: `single-${f.id}`, name: `${f.edition ?? `Red Bull ${f.name}`} 250 ml`, subtitle: f.taste, price: f.price, color: f.primary },
                  1,
                  e.currentTarget,
                )
              }
            >
              Add a can <Arrow />
            </PillButton>
            <span className="font-display text-3xl">${f.price.toFixed(2)}</span>
          </div>
        </div>

        {/* edition selector */}
        <div>
          <div className="mb-4 h-px w-full bg-white/15">
            <div ref={bar} className="h-px origin-left bg-sun" style={{ transform: "scaleX(0)" }} />
          </div>
          <div className="flex gap-2 overflow-x-auto md:gap-6">
            {flavors.map((x, i) => (
              <button
                key={x.id}
                onClick={() => jump(i)}
                data-cursor="View"
                className={`group flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition ${
                  i === active ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full ring-2 ring-white/20 transition-transform group-hover:scale-125"
                  style={{ background: x.primary }}
                />
                {x.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
