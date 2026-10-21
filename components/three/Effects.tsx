"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Cold vapour curling off the lid. */
export function Mist({ texture, count = 16 }: { texture: THREE.Texture; count?: number }) {
  const refs = useRef<(THREE.Sprite | null)[]>([]);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        off: i / count,
        x: (Math.random() - 0.5) * 0.4,
        z: (Math.random() - 0.5) * 0.3,
        drift: (Math.random() - 0.5) * 0.9,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 1.2,
        speed: 0.07 + Math.random() * 0.05,
      })),
    [count],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    seeds.forEach((s, i) => {
      const sp = refs.current[i];
      if (!sp) return;
      const p = (t * s.speed + s.off) % 1;
      sp.position.set(s.x + s.drift * p * p, 1.42 + p * 1.1, s.z);
      const sc = 0.4 + p * 2.2;
      sp.scale.set(sc, sc, 1);
      const m = sp.material as THREE.SpriteMaterial;
      m.opacity = Math.sin(p * Math.PI) ** 2 * 0.09;
      m.rotation = s.rot + p * s.spin;
    });
  });

  return (
    <>
      {seeds.map((_, i) => (
        <sprite key={i} ref={(el) => void (refs.current[i] = el)}>
          <spriteMaterial
            map={texture}
            transparent
            depthWrite={false}
            opacity={0}
            color="#eef3ff"
          />
        </sprite>
      ))}
    </>
  );
}

/** Fizz: tiny glossy droplets orbiting and rising around the can. */
export function Bubbles({ count = 70 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        a: Math.random() * Math.PI * 2,
        r: 0.85 + Math.random() * 1.7,
        y: Math.random() * 5.2 - 2.6,
        s: 0.008 + Math.random() ** 3 * 0.028,
        sp: 0.12 + Math.random() * 0.35,
        w: Math.random() * 6,
      })),
    [count],
  );

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    data.forEach((d, i) => {
      d.y += d.sp * dt;
      if (d.y > 2.6) d.y = -2.6;
      d.a += dt * 0.06;
      dummy.position.set(
        Math.cos(d.a) * d.r + Math.sin(t * 1.3 + d.w) * 0.04,
        d.y,
        Math.sin(d.a) * d.r * 0.7,
      );
      // Fade in/out at the ends of the column via scale.
      const edge = Math.min(1, (2.6 - Math.abs(d.y)) * 2);
      dummy.scale.setScalar(d.s * edge);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 18, 18]} />
      <meshPhysicalMaterial
        color="#ffffff"
        emissive="#9fb6ff"
        emissiveIntensity={0.25}
        roughness={0}
        metalness={0.1}
        transparent
        opacity={0.45}
        clearcoat={1}
        envMapIntensity={3}
      />
    </instancedMesh>
  );
}
