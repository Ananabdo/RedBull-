"use client";

import { useEffect, useRef, useState } from "react";
import { animate, AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ease, markLoaded, READY_EVENT, store } from "@/lib/store";

/** Wraps children so they lean toward the pointer. */
export function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className={`inline-block ${className}`}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Pill button with a fill that wipes up from the bottom on hover. */
export function PillButton({
  children,
  variant = "solid",
  onClick,
  className = "",
  cursor,
  type = "button",
  full = false,
}: {
  children: React.ReactNode;
  variant?: "solid" | "ghost" | "sun";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  cursor?: string;
  type?: "button" | "submit";
  full?: boolean;
}) {
  const base =
    variant === "solid"
      ? "bg-bull text-white"
      : variant === "sun"
        ? "bg-sun text-navy"
        : "border border-current/40 text-current";
  const fill = variant === "ghost" ? "bg-cream" : "bg-white";
  return (
    <Magnetic className={full ? "w-full" : ""} strength={full ? 0.08 : 0.35}>
      <button
        type={type}
        data-cursor={cursor}
        onClick={onClick}
        className={`group relative inline-flex items-center gap-3 overflow-hidden rounded-full ${full ? "w-full justify-center" : ""} px-7 py-4 text-sm font-semibold uppercase tracking-[0.14em] transition-colors duration-500 ${base} ${className}`}
      >
        <span
          className={`absolute inset-0 translate-y-full rounded-full ${fill} transition-transform duration-500 ease-out-expo group-hover:translate-y-0`}
        />
        <span className="relative z-10 flex items-center gap-3 transition-colors duration-500 group-hover:text-navy">
          {children}
        </span>
      </button>
    </Magnetic>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${className}`} fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

/** Custom cursor: a fast dot and a lagging ring that grows over targets. */
export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const dx = useSpring(x, { stiffness: 900, damping: 50 });
  const dy = useSpring(y, { stiffness: 900, damping: 50 });
  const rx = useSpring(x, { stiffness: 180, damping: 22 });
  const ry = useSpring(y, { stiffness: 180, damping: 22 });
  const [hover, setHover] = useState(false);
  const [label, setLabel] = useState("");
  const [down, setDown] = useState(false);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor],a,button");
      setHover(!!el);
      setLabel(el?.dataset.cursor ?? "");
    };
    const d = () => setDown(true);
    const u = () => setDown(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    window.addEventListener("pointerdown", d);
    window.addEventListener("pointerup", u);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", d);
      window.removeEventListener("pointerup", u);
    };
  }, [x, y]);

  const scale = down ? 0.8 : hover ? (label ? 2.4 : 1.6) : 1;

  return (
    <div className="pointer-events-none fixed inset-0 z-[95] hidden [@media(pointer:fine)]:block">
      <motion.div style={{ x: dx, y: dy }} className="absolute -ml-1 -mt-1 h-2 w-2 rounded-full bg-sun" />
      <motion.div
        style={{ x: rx, y: ry }}
        animate={{ scale }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`absolute -ml-5 -mt-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 mix-blend-difference ${label ? "bg-white" : ""}`}
      >
        <AnimatePresence>
          {label && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="text-[5px] font-bold uppercase tracking-[0.1em] text-black"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/** Intro loader — counts up while the can artwork is painted, then lifts. */
export function Loader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let ready = store.ready;
    let reached = false;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      animate(90, 100, {
        duration: 0.5,
        ease: "easeOut",
        onUpdate: (v) => setCount(Math.round(v)),
        onComplete: () => {
          setDone(true);
          setTimeout(markLoaded, 250);
        },
      });
    };
    const first = animate(0, 90, {
      duration: 1.6,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => {
        reached = true;
        if (ready) finish();
      },
    });
    const onReady = () => {
      ready = true;
      if (reached) finish();
    };
    window.addEventListener(READY_EVENT, onReady);
    // Never trap the visitor if WebGL is unavailable.
    const fallback = setTimeout(() => {
      ready = true;
      if (reached) finish();
    }, 6000);
    return () => {
      first.stop();
      clearTimeout(fallback);
      window.removeEventListener(READY_EVENT, onReady);
    };
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          exit={{ y: "-100%" }}
          transition={{ duration: 1.1, ease }}
          className="lattice fixed inset-0 z-[80] flex flex-col justify-between bg-navy p-6 md:p-10"
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-2xl tracking-wide">RED BULL</span>
            <span className="eyebrow text-white/60">Chilling to 4°C</span>
          </div>
          <div>
            <div className="mb-6 h-px w-full bg-white/15">
              <div className="h-px bg-sun transition-[width] duration-100" style={{ width: `${count}%` }} />
            </div>
            <div className="flex items-end justify-between">
              <p className="max-w-xs text-sm text-white/60">
                Energy, engineered since 1987. Loading the experience…
              </p>
              <span className="font-display text-[22vw] leading-[0.75] tabular-nums md:text-[16vw]">
                {count}
                <span className="text-sun">%</span>
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Splits a line into letters that rise into place. */
export function RiseText({
  text,
  className = "",
  delay = 0,
  play = true,
  stagger = 0.045,
}: {
  text: string;
  className?: string;
  delay?: number;
  play?: boolean;
  stagger?: number;
}) {
  return (
    <span className={`inline-flex overflow-hidden pb-[0.04em] ${className}`} aria-label={text}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block whitespace-pre"
          initial={{ y: "110%", rotate: 6 }}
          animate={play ? { y: "0%", rotate: 0 } : undefined}
          transition={{ duration: 1.1, ease, delay: delay + i * stagger }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

/** A line that slides up from a mask when it enters the viewport. */
export function RevealLine({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    // Observe the (unclipped) mask, not the clipped inner line — otherwise the
    // IntersectionObserver never sees it.
    <motion.span
      className={`block overflow-hidden ${className}`}
      initial="hide"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
    >
      <motion.span
        className="block"
        variants={{ hide: { y: "105%" }, show: { y: "0%" } }}
        transition={{ duration: 1, ease, delay }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}
