import * as THREE from "three";

export function makeSmokeTexture() {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const rand = mulberry(3);
  for (let i = 0; i < 26; i++) {
    const x = S / 2 + (rand() - 0.5) * S * 0.45;
    const y = S / 2 + (rand() - 0.5) * S * 0.45;
    const rad = S * (0.12 + rand() * 0.22);
    const grad = g.createRadialGradient(x, y, 0, x, y, rad);
    grad.addColorStop(0, "rgba(255,255,255,0.22)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, S, S);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
