"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { flavors } from "@/lib/flavors";
import { READY_EVENT, store } from "@/lib/store";
import { makePhotoLabel } from "@/lib/canPhotos";
import { makeSmokeTexture } from "./textures";
import { Can } from "./Can";
import { Bubbles, Mist } from "./Effects";

type Assets = {
  labels: LabelCache;
  smoke: THREE.Texture;
};

const damp = THREE.MathUtils.damp;

/**
 * Photo labels are big (up to 4K wide), so they're built on demand and only a
 * few are kept on the GPU. The label on the can is never evicted.
 */
class LabelCache {
  private cache = new Map<number, Promise<THREE.Texture>>();
  private order: number[] = [];
  inUse = 0;
  constructor(private gl: THREE.WebGLRenderer, private max = 4) {}

  get(i: number): Promise<THREE.Texture> {
    let p = this.cache.get(i);
    if (!p) {
      p = makePhotoLabel(flavors[i])
        .then(({ image, flipY }) => {
          const t = new THREE.Texture(image);
          t.flipY = flipY; // worker bitmaps arrive pre-flipped
          t.needsUpdate = true;
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = this.gl.capabilities.getMaxAnisotropy();
          t.generateMipmaps = true;
          t.minFilter = THREE.LinearMipmapLinearFilter;
          this.gl.initTexture(t); // upload now, not mid-spin
          return t;
        })
        .catch(() => {
          // No photo? A plain can in the flavour colour.
          const c = document.createElement("canvas");
          c.width = c.height = 4;
          const g = c.getContext("2d")!;
          g.fillStyle = flavors[i].primary;
          g.fillRect(0, 0, 4, 4);
          const t = new THREE.CanvasTexture(c);
          t.colorSpace = THREE.SRGBColorSpace;
          return t;
        });
      this.cache.set(i, p);
    }
    this.order = [...this.order.filter((k) => k !== i), i];
    while (this.order.length > this.max) {
      const victim = this.order.find((k) => k !== this.inUse && k !== i);
      if (victim === undefined) break;
      this.order = this.order.filter((k) => k !== victim);
      this.cache.get(victim)?.then((t) => {
        t.dispose();
        if (t.image instanceof ImageBitmap) t.image.close();
      });
      this.cache.delete(victim);
    }
    return p;
  }

  /** Warm the neighbours so scrolling through editions never waits. */
  prefetch(i: number) {
    for (const k of [i + 1, i - 1]) if (k >= 0 && k < flavors.length && !this.cache.has(k)) void this.get(k);
  }
}

export default function Stage() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[5]" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6.5], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <World />
      </Canvas>
    </div>
  );
}

function World() {
  const [assets, setAssets] = useState<Assets | null>(null);

  const gl = useThree((st) => st.gl);
  useEffect(() => {
    let cancelled = false;
    const labels = new LabelCache(gl);
    labels.get(0).then(() => {
      if (cancelled) return;
      labels.prefetch(0);
      setAssets({ labels, smoke: makeSmokeTexture() });
    });
    return () => {
      cancelled = true;
    };
  }, [gl]);

  useEffect(() => {
    if (!assets) return;
    store.ready = true;
    window.dispatchEvent(new Event(READY_EVENT));
  }, [assets]);

  useEffect(() => {
    const on = (e: PointerEvent) => {
      store.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      store.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", on);
    return () => window.removeEventListener("pointermove", on);
  }, []);

  return (
    <>
      <ambientLight intensity={0.15} />
      <KeyLight />
      <RimLights />
      <Environment resolution={256} frames={1}>
        {/* Studio softboxes — these are what the can's lacquer reflects. */}
        <Lightformer form="rect" intensity={3} position={[0, 5, 1]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={5} position={[-4, 0.5, 2]} rotation-y={Math.PI / 2} scale={[1.1, 7, 1]} />
        <Lightformer form="rect" intensity={3} position={[4, 0, 1.5]} rotation-y={-Math.PI / 2} scale={[0.5, 7, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[0, 0, 7]} rotation-y={Math.PI} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={2} color="#E4002B" position={[0, -2, -5]} scale={[12, 3, 1]} />
        <Lightformer form="ring" intensity={3} color="#FFC906" position={[3, 3, -3]} scale={2} />
        <Lightformer form="rect" intensity={1.5} color="#3B6CFF" position={[-5, 2, -3]} rotation-y={Math.PI / 4} scale={[3, 5, 1]} />
      </Environment>

      {assets && <CanRig assets={assets} />}

      <Sparkles count={70} scale={[10, 6, 4]} size={2.6} speed={0.35} opacity={0.85} color="#FFC906" noise={1} />
      <Sparkles count={50} scale={[10, 6, 5]} size={1.6} speed={0.25} opacity={0.6} color="#DCE6FF" />
    </>
  );
}

/** Spot light that follows the pointer — the "dynamic" key light. */
function KeyLight() {
  const ref = useRef<THREE.SpotLight>(null!);
  useFrame((_, dt) => {
    const p = ref.current.position;
    p.x = damp(p.x, 2 + store.pointer.x * 5, 3, dt);
    p.y = damp(p.y, 3 + store.pointer.y * 3, 3, dt);
  });
  return (
    <spotLight
      ref={ref}
      position={[3, 4, 6]}
      angle={0.55}
      penumbra={1}
      intensity={90}
      decay={2}
      color="#FFF4E2"
    />
  );
}

/** Coloured rim lights that shift to the active edition's colour. */
function RimLights() {
  const right = useRef<THREE.PointLight>(null!);
  const target = useRef(new THREE.Color());
  useFrame((_, dt) => {
    target.current.set(flavors[store.flavor]?.glow ?? "#3B6CFF");
    right.current.color.lerp(target.current, 1 - Math.exp(-3 * dt));
  });
  return (
    <>
      <pointLight position={[-3, 1.5, -1.5]} intensity={25} color="#5C86FF" />
      <pointLight ref={right} position={[3, -1, -1.5]} intensity={40} color="#3B6CFF" />
    </>
  );
}

type Key = { x: number; y: number; s: number; rx: number; rz: number };
const parseKey = (el: HTMLElement): Key => {
  const [x = 0, y = 0, s = 1, rx = 0, rz = 0] = (el.dataset.can ?? "").split(/\s+/).map(Number);
  return { x, y, s, rx, rz };
};

/**
 * Each section carries `data-can="x y scale rotX rotZ"`. Every frame we find
 * the two sections straddling the viewport centre and blend their keyframes,
 * so the can choreographs itself through the page (pinned sections included).
 */
function targetFromScroll(sections: HTMLElement[]): Key {
  if (!sections.length) return { x: 0, y: 0, s: 1, rx: 0, rz: 0 };
  const vh = window.innerHeight;
  const anchors = sections.map((s) => {
    const r = s.getBoundingClientRect();
    return r.top + r.height / 2 - vh / 2;
  });
  if (anchors[0] >= 0) return parseKey(sections[0]);
  const last = sections.length - 1;
  if (anchors[last] <= 0) return parseKey(sections[last]);
  let i = 0;
  while (i < last && !(anchors[i] <= 0 && anchors[i + 1] > 0)) i++;
  const span = anchors[i + 1] - anchors[i] || 1;
  let t = THREE.MathUtils.clamp(-anchors[i] / span, 0, 1);
  t = t * t * (3 - 2 * t);
  const a = parseKey(sections[i]);
  const b = parseKey(sections[i + 1]);
  const l = THREE.MathUtils.lerp;
  return { x: l(a.x, b.x, t), y: l(a.y, b.y, t), s: l(a.s, b.s, t), rx: l(a.rx, b.rx, t), rz: l(a.rz, b.rz, t) };
}

function CanRig({ assets }: { assets: Assets }) {
  const outer = useRef<THREE.Group>(null!);
  const inner = useRef<THREE.Group>(null!);
  const body = useRef<THREE.MeshPhysicalMaterial>(null!);
  const sections = useRef<HTMLElement[]>([]);
  const frame = useRef(0);
  const { viewport } = useThree();
  const s = useRef({
    x: 0, y: 0, sc: 1, rx: 0, rz: 0,
    base: 0, spin: 0, spinTarget: 0, swapAt: 0, flavor: 0, intro: 0,
    /** Flavour we've asked the cache for, and when the scroll last changed it. */
    requested: 0, changedAt: 0,
  });
  const [first, setFirst] = useState<THREE.Texture | null>(null);
  /** Texture for the edition we're spinning towards, once it's ready. */
  const incoming = useRef<{ i: number; t: THREE.Texture } | null>(null);

  useEffect(() => {
    assets.labels.get(0).then(setFirst);
  }, [assets]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const v = s.current;
    if (frame.current++ % 30 === 0) {
      sections.current = Array.from(document.querySelectorAll<HTMLElement>("[data-can]"));
    }

    const k = targetFromScroll(sections.current);
    const narrow = viewport.aspect < 0.9;
    v.x = damp(v.x, k.x * viewport.width * (narrow ? 0.3 : 1), 4, dt);
    v.y = damp(v.y, k.y * viewport.height, 4, dt);
    v.sc = damp(v.sc, k.s * (narrow ? 0.8 : 1), 4, dt);
    v.rx = damp(v.rx, k.rx, 4, dt);
    v.rz = damp(v.rz, k.rz, 4, dt);
    v.intro = damp(v.intro, store.loaded ? 1 : 0, 2.2, dt);

    // Edition change: whip the can round and swap the label mid-spin.
    const now = state.clock.elapsedTime;
    if (store.flavor !== v.flavor) {
      v.flavor = store.flavor;
      v.changedAt = now;
      v.spinTarget += Math.PI * 2;
      v.swapAt = v.spinTarget - Math.PI;
      incoming.current = null;
    }
    // Only fetch once the scroll settles on an edition, so flicking through
    // the range doesn't queue a label for every one passed.
    if (v.requested !== v.flavor && now - v.changedAt > 0.12) {
      const want = v.flavor;
      v.requested = want;
      assets.labels.get(want).then((t) => {
        if (s.current.flavor === want) incoming.current = { i: want, t };
        assets.labels.prefetch(want);
      });
    }
    v.spin = damp(v.spin, v.spinTarget, 3.2, dt);
    if (incoming.current && v.spin >= v.swapAt && body.current) {
      body.current.map = incoming.current.t;
      assets.labels.inUse = incoming.current.i;
      incoming.current = null;
    }

    // Scroll velocity adds momentum to the idle rotation.
    store.velocity *= 0.92;
    v.base += dt * 0.35 + store.velocity * dt * 0.06;

    if (!outer.current) return;
    const t = state.clock.elapsedTime;
    const introOff = 1 - v.intro;
    outer.current.position.set(v.x, v.y + Math.sin(t * 1.1) * 0.06 - introOff * 3.5, 0);
    outer.current.scale.setScalar(v.sc * (0.65 + 0.35 * v.intro));
    outer.current.rotation.set(
      v.rx - store.pointer.y * 0.12 + Math.sin(t * 0.7) * 0.03,
      0,
      v.rz - store.pointer.x * 0.1 + introOff * 0.6,
    );
    inner.current.rotation.y = v.base + v.spin - introOff * 5;
  });

  return (
    <group ref={outer}>
      <group ref={inner}>
        {first && <Can ref={body} label={first} />}
      </group>
      <Mist texture={assets.smoke} />
      <Bubbles />
    </group>
  );
}
