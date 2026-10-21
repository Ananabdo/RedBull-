"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

// `*word*` = accent colour.
const COPY =
  "Born in the *Austrian* *Alps* in *1987*, one slim can changed how the world gets things done. Made for pilots, students, athletes and night owls — anyone who *refuses* *to* *slow* *down.*";

const chapters = [
  { n: "01", t: "Origin", d: "Fuschl am See, 1987. One formula, one can, one idea." },
  { n: "02", t: "Fuel", d: "From exam halls to the Formula 1 grid — the same slim can." },
  { n: "03", t: "Craft", d: "Infinitely recyclable aluminium. Chilled. Ready." },
];

export function Story() {
  const root = useRef<HTMLElement>(null);
  const [chapter, setChapter] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>(".story-word");
      gsap.fromTo(
        words,
        { opacity: 0.12, y: 12 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=220%",
            pin: true,
            scrub: 0.6,
            onUpdate: (self) => setChapter(Math.min(2, Math.floor(self.progress * 3))),
          },
        },
      );
      gsap.fromTo(
        ".story-bar",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=220%", scrub: true },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="story"
      data-can="0.28 0 0.82 0.18 -0.28"
      data-bg="#060D26"
      className="relative z-10 flex h-[100svh] items-center overflow-hidden"
    >
      <div className="grid w-full gap-10 px-5 md:grid-cols-12 md:px-10">
        <div className="md:col-span-7">
          <p className="eyebrow mb-8 text-sun">(02) — The story</p>
          <p className="font-display text-[9vw] uppercase leading-[0.98] md:text-[4.6vw]">
            {COPY.split(" ").map((w, i) => {
              const accent = w.startsWith("*");
              return (
                <span key={i} className={`story-word mr-[0.22em] inline-block ${accent ? "text-sun" : ""}`}>
                  {w.replaceAll("*", "")}
                </span>
              );
            })}
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4 md:max-w-2xl">
            {chapters.map((c, i) => (
              <div key={c.n} className={`transition-opacity duration-500 ${i === chapter ? "opacity-100" : "opacity-35"}`}>
                <div className="mb-3 h-px bg-white/20">
                  <div className={`h-px bg-sun transition-all duration-700 ${i <= chapter ? "w-full" : "w-0"}`} />
                </div>
                <p className="eyebrow">
                  <span className="text-sun">{c.n}</span> {c.t}
                </p>
                <p className="mt-2 hidden text-sm text-white/60 md:block">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="story-bar absolute bottom-0 left-0 h-1 w-full origin-left bg-bull" />
    </section>
  );
}
