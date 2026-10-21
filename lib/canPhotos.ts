"use client";

import { findCanBox, LABEL_H, LABEL_W, paintLabel } from "./canSpec";
import type { Flavor } from "./flavors";

export { CAN_H, CAN_R } from "./canSpec";

/*
 * Real product photography → unwrapped labels for the 3D can.
 *
 * Labels are built in a Web Worker (see `labelWorker.ts`) and arrive as
 * ImageBitmaps painted upside-down (use `flipY = false`). Browsers without
 * OffscreenCanvas fall back to the main thread, painted the right way up.
 */

export type Label = { image: ImageBitmap | HTMLCanvasElement; flipY: boolean };

let worker: Worker | null | undefined;
let nextId = 0;
const waiting = new Map<number, { resolve: (b: ImageBitmap) => void; reject: (e: unknown) => void }>();

function getWorker(): Worker | null {
  if (worker !== undefined) return worker;
  try {
    if (typeof OffscreenCanvas === "undefined" || !("transferToImageBitmap" in OffscreenCanvas.prototype)) {
      throw new Error("no OffscreenCanvas");
    }
    worker = new Worker(new URL("./labelWorker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (e: MessageEvent<{ id: number; bitmap?: ImageBitmap; error?: string }>) => {
      const job = waiting.get(e.data.id);
      if (!job) return;
      waiting.delete(e.data.id);
      if (e.data.bitmap) job.resolve(e.data.bitmap);
      else job.reject(new Error(e.data.error));
    };
    // If the worker can't start, fail everything over to the main thread.
    worker.onerror = () => {
      worker?.terminate();
      worker = null;
      waiting.forEach((job) => job.reject(new Error("label worker failed")));
      waiting.clear();
    };
  } catch {
    worker = null;
  }
  return worker;
}

async function paintOnMainThread(f: Flavor): Promise<HTMLCanvasElement> {
  const img = new Image();
  img.src = f.photo;
  await img.decode();
  const probe = document.createElement("canvas");
  probe.width = img.naturalWidth;
  probe.height = img.naturalHeight;
  const pg = probe.getContext("2d", { willReadFrequently: true })!;
  pg.drawImage(img, 0, 0);
  const box = findCanBox(pg.getImageData(0, 0, probe.width, probe.height).data, probe.width, probe.height);
  const out = document.createElement("canvas");
  out.width = LABEL_W;
  out.height = LABEL_H;
  paintLabel(out.getContext("2d")!, img, box, false);
  return out;
}

export async function makePhotoLabel(f: Flavor): Promise<Label> {
  const w = getWorker();
  if (w) {
    try {
      const id = nextId++;
      const image = await new Promise<ImageBitmap>((resolve, reject) => {
        waiting.set(id, { resolve, reject });
        w.postMessage({ id, url: new URL(f.photo, location.href).href });
        setTimeout(() => {
          if (waiting.delete(id)) reject(new Error("label worker timed out"));
        }, 10000);
      });
      return { image, flipY: false };
    } catch {
      // fall through to the main thread
    }
  }
  return { image: await paintOnMainThread(f), flipY: true };
}
