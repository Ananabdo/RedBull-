/*
 * Pure (DOM-free) can maths, shared by the main thread and the label worker.
 */

/** 250 ml slim can, in scene units — shared with the 3D geometry. */
export const CAN_R = 0.53;
export const CAN_H = 2.41;

/** Fraction of the photographed can taken by the lid/neck and bottom chime. */
export const NECK = 0.075;
export const CHIME = 0.035;

/**
 * Label size. 2048 wide samples the photo's centre at ~1.5 px per texel —
 * plenty for a can that fills most of the viewport — while keeping each
 * texture at ~12 MB so uploads don't hitch the frame.
 */
export const LABEL_W = 2048;
export const LABEL_H = Math.round(LABEL_W / ((2 * Math.PI * CAN_R) / CAN_H));

type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type Source = CanvasImageSource;

/** Bounding box of the can in a photo with a transparent or white backdrop. */
export function findCanBox(d: Uint8ClampedArray, W: number, H: number) {
  const corners = [0, W - 1, (H - 1) * W, H * W - 1];
  const alpha = corners.some((k) => d[k * 4 + 3] < 24);
  const bg = (i: number) =>
    d[i + 3] < 24 ||
    (!alpha &&
      Math.min(d[i], d[i + 1], d[i + 2]) > 236 &&
      Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) < 16);
  const rowHit = (y: number) => {
    let n = 0;
    for (let x = 0; x < W; x += 4) if (!bg((y * W + x) * 4)) n++;
    return n > (W / 4) * 0.08;
  };
  const colHit = (x: number) => {
    let n = 0;
    for (let y = 0; y < H; y += 4) if (!bg((y * W + x) * 4)) n++;
    return n > (H / 4) * 0.15;
  };
  let y0 = 0;
  let y1 = H - 1;
  let x0 = 0;
  let x1 = W - 1;
  while (y0 < H - 1 && !rowHit(y0)) y0++;
  while (y1 > y0 && !rowHit(y1)) y1--;
  while (x0 < W - 1 && !colHit(x0)) x0++;
  while (x1 > x0 && !colHit(x1)) x1--;
  return { x0, y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/**
 * Unwraps a front-on can photo into a full-circumference label. Label column
 * u is an angle φ round the can; on the visible front its photo column is
 * sin(φ); the back reuses the front. The studio's cylindrical fall-off is
 * partly lifted, since the 3D lights add their own.
 *
 * `flipY` paints the label upside-down, for ImageBitmap textures (which
 * three.js can't flip on upload).
 */
export function paintLabel(
  g: Ctx2D,
  src: Source,
  box: { x0: number; y0: number; w: number; h: number },
  flipY: boolean,
) {
  const W = LABEL_W;
  const H = LABEL_H;
  const top = box.y0 + box.h * NECK;
  const bodyH = box.h * (1 - NECK - CHIME);
  const EDGE = 0.94; // stay inside the silhouette's dark rim

  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = "high";
  g.save();
  if (flipY) {
    g.translate(0, H);
    g.scale(1, -1);
  }
  const gains = new Float32Array(W);
  for (let px = 0; px < W; px++) {
    let phi = ((px + 0.5) / W - 0.5) * Math.PI * 2; // 0 = front centre
    if (phi > Math.PI / 2) phi -= Math.PI;
    else if (phi < -Math.PI / 2) phi += Math.PI;
    const x = Math.sin(phi) * EDGE;
    const sx = box.x0 + ((x + 1) / 2) * (box.w - 1);
    g.drawImage(src, sx, top, 1, bodyH, px, 0, 1, H);
    gains[px] = 1 / (0.8 + 0.2 * Math.sqrt(1 - x * x));
  }
  g.restore();

  // Lift the edges with a single multiply pass per column band (cheap: a
  // handful of bands, composited on the GPU-backed canvas).
  const BANDS = 32;
  g.save();
  g.globalCompositeOperation = "lighter";
  for (let b = 0; b < BANDS; b++) {
    const x0 = Math.floor((b / BANDS) * W);
    const x1 = Math.floor(((b + 1) / BANDS) * W);
    const k = gains[Math.min(W - 1, (x0 + x1) >> 1)] - 1; // extra brightness
    if (k <= 0.005) continue;
    g.globalAlpha = Math.min(1, k);
    g.drawImage(g.canvas as Source, x0, 0, x1 - x0, H, x0, 0, x1 - x0, H);
  }
  g.restore();
}
