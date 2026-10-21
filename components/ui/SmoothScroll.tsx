"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { LOADED_EVENT, store } from "@/lib/store";

export function SmoothScroll() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({ lerp: reduced ? 1 : 0.09, wheelMultiplier: 1 });
    store.lenis = lenis;
    if (!store.loaded) lenis.stop();

    lenis.on("scroll", (e: Lenis) => {
      store.velocity = e.velocity;
      ScrollTrigger.update();
    });
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onLoaded = () => {
      lenis.start();
      ScrollTrigger.refresh();
    };
    window.addEventListener(LOADED_EVENT, onLoaded);

    return () => {
      window.removeEventListener(LOADED_EVENT, onLoaded);
      gsap.ticker.remove(tick);
      lenis.destroy();
      store.lenis = null;
    };
  }, []);

  return null;
}

/** Fades the page background as each `[data-bg]` section reaches centre. */
export function BackgroundController() {
  useEffect(() => {
    const triggers = Array.from(document.querySelectorAll<HTMLElement>("[data-bg]")).map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 45%",
        onToggle: (self) => {
          if (self.isActive)
            gsap.to(document.body, { backgroundColor: el.dataset.bg, duration: 0.9, overwrite: "auto" });
        },
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);
  return null;
}
