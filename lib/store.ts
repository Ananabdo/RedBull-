"use client";

import { useEffect, useState } from "react";
import type Lenis from "lenis";

/**
 * Mutable, non-reactive state shared between the DOM (GSAP / Lenis) and the
 * WebGL scene. The render loop reads it every frame, so it must never trigger
 * React re-renders.
 */
export const store = {
  /** Index into `flavors` currently shown on the can. */
  flavor: 0,
  /** Pointer in normalised device coords (-1..1). */
  pointer: { x: 0, y: 0 },
  /** Lenis scroll velocity. */
  velocity: 0,
  /** Textures generated, scene can render. */
  ready: false,
  /** Loader finished, intro animations may play. */
  loaded: false,
  lenis: null as Lenis | null,
};

export const LOADED_EVENT = "app-loaded";
export const READY_EVENT = "scene-ready";

export function markLoaded() {
  store.loaded = true;
  window.dispatchEvent(new Event(LOADED_EVENT));
}

export function useLoaded() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (store.loaded) {
      setLoaded(true);
      return;
    }
    const on = () => setLoaded(true);
    window.addEventListener(LOADED_EVENT, on);
    return () => window.removeEventListener(LOADED_EVENT, on);
  }, []);
  return loaded;
}

export const ease = [0.16, 1, 0.3, 1] as const;
