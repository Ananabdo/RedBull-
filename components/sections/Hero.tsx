"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { ease, store, useLoaded } from "@/lib/store";
import { Arrow, PillButton, RiseText } from "../ui/Interactions";

export function Hero() {
  const loaded = useLoaded();
  const word = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  // Giant word drifts and fades as you leave the hero.
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(word.current, {
        yPercent: 35,
        scale: 0.9,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: { trigger: "#top", start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(glow.current, {
        scale: 1.6,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: "#top", start: "top top", end: "bottom top", scrub: true },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="top"
      data-can="0 -0.03 1 0 0.12"
      data-bg="#0B1A46"
      className="lattice relative flex h-[100svh] min-h-[640px] flex-col overflow-hidden"
    >
      {/* Behind the can (z-1 < canvas z-5) */}
      <div ref={glow} className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={loaded ? { scale: 1, opacity: 1 } : undefined}
          transition={{ duration: 2, ease, delay: 0.2 }}
          className="h-[70vmin] w-[70vmin] rounded-full bg-[radial-gradient(circle,rgba(255,201,6,0.55),rgba(255,201,6,0.12)_45%,transparent_70%)] blur-2xl"
        />
      </div>
      <div
        ref={word}
        className="pointer-events-none absolute inset-0 z-[1] flex select-none items-center justify-center"
      >
        <h1 className="font-display text-[27vw] uppercase leading-none tracking-[-0.01em] text-cream md:text-[25vw]">
          <RiseText text="ENERGY" play={loaded} delay={0.1} stagger={0.06} />
        </h1>
      </div>

      {/* In front of the can */}
      <div className="relative z-10 flex flex-1 flex-col justify-between px-5 pb-8 pt-28 md:px-10 md:pb-10">
        <div className="flex items-start justify-between text-white/70">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={loaded ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1, ease, delay: 0.6 }}
            className="eyebrow max-w-[14rem]"
          >
            Since 1987 <br /> Fuschl am See, Austria
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={loaded ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1, ease, delay: 0.7 }}
            className="eyebrow text-right"
          >
            Nº 01 <br /> The Original
          </motion.p>
        </div>

        <div className="grid items-end gap-8 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={loaded ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1.1, ease, delay: 0.8 }}
          >
            <h2 className="font-display text-4xl uppercase leading-[0.95] md:text-5xl">
              Engineered for <br />
              <span className="text-sun">the moments</span> that matter.
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <PillButton cursor="Shop" onClick={() => store.lenis?.scrollTo("#shop", { duration: 2 })}>
                Shop now <Arrow />
              </PillButton>
              <PillButton variant="ghost" onClick={() => store.lenis?.scrollTo("#editions", { duration: 2 })}>
                Editions
              </PillButton>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={loaded ? { opacity: 1 } : undefined}
            transition={{ duration: 1, delay: 1.2 }}
            className="hidden flex-col items-center gap-3 md:flex"
          >
            <span className="eyebrow text-white/60">Scroll</span>
            <span className="relative block h-14 w-px overflow-hidden bg-white/15">
              <motion.span
                className="absolute inset-x-0 top-0 h-1/2 bg-sun"
                animate={{ y: ["-100%", "200%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
          </motion.div>

          <motion.ul
            initial="hide"
            animate={loaded ? "show" : "hide"}
            variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 1 } } }}
            className="hidden justify-self-end text-right md:block"
          >
            {[
              ["80", "mg caffeine"],
              ["1000", "mg taurine"],
              ["250", "ml of focus"],
            ].map(([n, l]) => (
              <motion.li
                key={l}
                variants={{ hide: { opacity: 0, x: 30 }, show: { opacity: 1, x: 0, transition: { duration: 0.9, ease } } }}
                className="flex items-baseline justify-end gap-3 border-b border-white/10 py-2"
              >
                <span className="font-display text-3xl">{n}</span>
                <span className="eyebrow text-white/60">{l}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

export function Marquee({ items, tone = "red" }: { items: string[]; tone?: "red" | "sun" }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tween = gsap.to(track.current, { xPercent: -50, duration: 22, ease: "none", repeat: -1 });
    // Scroll velocity speeds up / reverses the ribbon.
    let dir = 1;
    const tick = () => {
      const v = store.velocity;
      if (v > 0.5) dir = 1;
      else if (v < -0.5) dir = -1;
      const target = dir * Math.min(6, 1 + Math.abs(v) * 0.15);
      tween.timeScale(gsap.utils.interpolate(tween.timeScale(), target, 0.1));
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      tween.kill();
    };
  }, []);

  const bg = tone === "red" ? "bg-bull text-white" : "bg-sun text-navy";
  const row = [...items, ...items];
  return (
    <div className={`relative z-10 -my-6 -rotate-2 overflow-hidden py-5 shadow-2xl ${bg}`}>
      <div ref={track} className="flex w-max">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0">
            {row.map((t, i) => (
              <span key={i} className="flex items-center gap-8 px-8 font-display text-5xl uppercase md:text-7xl">
                {t}
                <svg viewBox="0 0 24 24" className="h-7 w-7 md:h-9 md:w-9" fill="currentColor">
                  <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" />
                </svg>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
