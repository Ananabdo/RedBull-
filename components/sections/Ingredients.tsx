"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { gsap } from "@/lib/gsap";
import { ease } from "@/lib/store";
import { RevealLine } from "../ui/Interactions";

const items = [
  { value: 80, unit: "mg", name: "Caffeine", body: "About the same as a cup of coffee. Sharpens focus and reaction time." },
  { value: 1000, unit: "mg", name: "Taurine", body: "An amino acid naturally present in the human body, involved in many processes." },
  { value: 4, unit: "", name: "B-Vitamins", body: "Niacin, pantothenic acid, B6 and B12 — contributing to normal energy metabolism." },
  { value: 100, unit: "%", name: "Alpine Water", body: "Fresh water sourced in Austria and Switzerland, close to our production sites." },
];

function Card({ item, index }: { item: (typeof items)[number]; index: number }) {
  const num = useRef<HTMLSpanElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const rx = useSpring(0, { stiffness: 200, damping: 20 });
  const ry = useSpring(0, { stiffness: 200, damping: 20 });
  const spot = useMotionTemplate`radial-gradient(420px circle at ${mx}% ${my}%, rgba(255,201,6,0.22), transparent 60%)`;

  useEffect(() => {
    const o = { v: 0 };
    const ctx = gsap.context(() => {
      gsap.to(o, {
        v: item.value,
        duration: 2,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        onUpdate: () => {
          if (num.current) num.current.textContent = Math.round(o.v).toLocaleString("en-US");
        },
      });
    });
    return () => ctx.revert();
  }, [item.value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1, ease, delay: index * 0.08 }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        mx.set(px * 100);
        my.set(py * 100);
        ry.set((px - 0.5) * 10);
        rx.set(-(py - 0.5) * 10);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      data-cursor="Fuel"
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#101a46]/85 p-6 md:p-8"
    >
      <motion.div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: spot }} />
      <div className="relative">
        <div className="flex items-start justify-between">
          <span className="eyebrow text-white/50">0{index + 1}</span>
          <span className="h-2 w-2 rounded-full bg-sun shadow-[0_0_20px_4px_rgba(255,201,6,0.6)]" />
        </div>
        <p className="mt-10 font-display text-6xl leading-none md:text-7xl">
          <span ref={num}>0</span>
          <span className="ml-1 text-2xl text-sun md:text-3xl">{item.unit}</span>
        </p>
        <p className="mt-3 font-display text-2xl uppercase tracking-wide">{item.name}</p>
        <p className="mt-3 text-sm leading-relaxed text-white/60">{item.body}</p>
      </div>
    </motion.div>
  );
}

export function Ingredients() {
  return (
    <section
      id="inside"
      data-can="-0.26 0 0.92 -0.12 0.35"
      data-bg="#0A1238"
      className="relative overflow-hidden px-5 py-32 md:px-10 md:py-44"
    >
      <div className="pointer-events-none absolute inset-x-0 top-24 z-[1] select-none text-center font-display text-[30vw] uppercase leading-none text-white/[0.04]">
        Inside
      </div>
      <div className="relative z-10 grid gap-12 md:grid-cols-12">
        <div className="hidden md:col-span-5 md:block" />
        <div className="md:col-span-7">
          <p className="eyebrow mb-6 text-sun">(03) — What’s inside</p>
          <h2 className="font-display text-[14vw] uppercase leading-[0.88] md:text-[7.5vw]">
            <RevealLine>Four things.</RevealLine>
            <RevealLine delay={0.1}>
              <span className="text-outline text-cream">Zero</span> nonsense.
            </RevealLine>
          </h2>
          <p className="mt-6 max-w-md text-white/60">
            A short, honest ingredient list — balanced for the moments when you need to be sharp.
          </p>

          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {items.map((it, i) => (
              <Card key={it.name} item={it} index={i} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 rounded-full border border-white/10 px-6 py-4 text-xs uppercase tracking-[0.2em] text-white/60"
          >
            <span className="text-sun">Per 250 ml can</span>
            <span>110 cal</span>
            <span>27 g sugars</span>
            <span>Vegan</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
