import type { Flavor } from "@/lib/flavors";

/**
 * Product-shot can for cards: the real photo (transparent, tightly cropped),
 * decoded off the main thread and only once it nears the viewport.
 */
export function MiniCan({ f, h = 150, className = "" }: { f: Flavor; h?: number; className?: string }) {
  // 250 ml slim can: 53 mm × 134 mm (plus lid).
  const w = h * 0.392;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={f.photo}
      alt={`${f.edition ?? `Red Bull ${f.name}`} can`}
      width={Math.round(w)}
      height={Math.round(h)}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`shrink-0 object-contain drop-shadow-[0_18px_18px_rgba(0,0,0,0.35)] ${className}`}
      style={{ width: w, height: h }}
    />
  );
}
