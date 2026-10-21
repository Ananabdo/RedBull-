/// <reference lib="webworker" />
/*
 * Builds unwrapped can labels off the main thread, so switching editions
 * never blocks scrolling. Replies with an ImageBitmap (transferred, zero-copy)
 * painted upside-down, ready for a `flipY = false` texture.
 */
import { findCanBox, LABEL_H, LABEL_W, paintLabel } from "./canSpec";

type Req = { id: number; url: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async (e: MessageEvent<Req>) => {
  const { id, url } = e.data;
  try {
    const blob = await (await fetch(url)).blob();
    const photo = await createImageBitmap(blob);
    const probe = new OffscreenCanvas(photo.width, photo.height);
    const pg = probe.getContext("2d", { willReadFrequently: true })!;
    pg.drawImage(photo, 0, 0);
    const box = findCanBox(pg.getImageData(0, 0, photo.width, photo.height).data, photo.width, photo.height);

    const out = new OffscreenCanvas(LABEL_W, LABEL_H);
    paintLabel(out.getContext("2d")!, photo, box, true);
    photo.close();
    const bitmap = out.transferToImageBitmap();
    ctx.postMessage({ id, bitmap }, [bitmap]);
  } catch (err) {
    ctx.postMessage({ id, error: String(err) });
  }
};
