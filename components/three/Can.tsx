"use client";

import { forwardRef, useMemo } from "react";
import * as THREE from "three";
import { CAN_H, CAN_R } from "@/lib/canPhotos";

const R = CAN_R;
const H = CAN_H;
// Profiles below were drawn for a 0.53 radius body; scale them to fit.
const K = CAN_R / 0.53;

// Neck, rim and recessed lid, measured up from the top of the label.
const TOP_PROFILE: [number, number][] = [
  [0.53, 0],
  [0.528, 0.03],
  [0.512, 0.08],
  [0.485, 0.135],
  [0.458, 0.185],
  [0.448, 0.215],
  [0.452, 0.238],
  [0.449, 0.258],
  [0.437, 0.266],
  [0.422, 0.258],
  [0.416, 0.236],
  [0.408, 0.218],
  [0.39, 0.205],
  [0.25, 0.204],
  [0.001, 0.204],
];

// Bottom chime and dome, measured down from the bottom of the label.
const BOTTOM_PROFILE: [number, number][] = [
  [0.001, -0.088],
  [0.15, -0.09],
  [0.3, -0.1],
  [0.37, -0.12],
  [0.395, -0.15],
  [0.415, -0.16],
  [0.44, -0.155],
  [0.475, -0.13],
  [0.51, -0.085],
  [0.528, -0.03],
  [0.53, 0],
];

function tabShape() {
  const s = new THREE.Shape();
  const w = 0.075;
  const l1 = -0.06;
  const l2 = 0.22;
  s.moveTo(-w, l1);
  s.lineTo(-w, l2 - w);
  s.quadraticCurveTo(-w, l2, 0, l2);
  s.quadraticCurveTo(w, l2, w, l2 - w);
  s.lineTo(w, l1);
  s.quadraticCurveTo(w, l1 - 0.05, 0, l1 - 0.05);
  s.quadraticCurveTo(-w, l1 - 0.05, -w, l1);
  const hole = new THREE.Path();
  hole.absellipse(0, 0.14, 0.045, 0.04, 0, Math.PI * 2, false, 0);
  s.holes.push(hole);
  return s;
}

type Props = {
  /** Unwrapped product photo (already carries its own studio sheen). */
  label: THREE.Texture;
};

export const Can = forwardRef<THREE.MeshPhysicalMaterial, Props>(function Can(
  { label },
  bodyMaterial,
) {
  const geo = useMemo(() => {
    // thetaStart −π puts u = 0.5 (the front seam of the artwork) facing +z.
    const body = new THREE.CylinderGeometry(R, R, H, 256, 1, true, -Math.PI);
    const top = new THREE.LatheGeometry(
      TOP_PROFILE.map(([x, y]) => new THREE.Vector2(x * K, y * K)),
      256,
    );
    const bottom = new THREE.LatheGeometry(
      BOTTOM_PROFILE.map(([x, y]) => new THREE.Vector2(x * K, y * K)),
      256,
    );
    const tab = new THREE.ExtrudeGeometry(tabShape(), {
      depth: 0.012,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      bevelSegments: 2,
      curveSegments: 24,
    });
    const score = new THREE.RingGeometry(0.1, 0.112, 48);
    return { body, top, bottom, tab, score };
  }, []);

  const metal = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#d7dae1",
        metalness: 1,
        roughness: 0.2,
        clearcoat: 0.6,
        clearcoatRoughness: 0.15,
        envMapIntensity: 1.6,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const tabMetal = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#b9bec8",
        metalness: 1,
        roughness: 0.28,
        envMapIntensity: 1.4,
      }),
    [],
  );

  const lidY = H / 2 + 0.204 * K;

  return (
    <group>
      <mesh geometry={geo.body}>
        {/* Printed aluminium under a clear lacquer: the photo gives the
            colour, the clearcoat gives moving studio reflections. */}
        <meshPhysicalMaterial
          ref={bodyMaterial}
          map={label}
          color="#ffffff"
          metalness={0.35}
          roughness={0.38}
          clearcoat={1}
          clearcoatRoughness={0.04}
          specularIntensity={0.6}
          envMapIntensity={0.85}
        />
      </mesh>
      <mesh geometry={geo.top} material={metal} position={[0, H / 2, 0]} />
      <mesh geometry={geo.bottom} material={metal} position={[0, -H / 2, 0]} />

      {/* Opening score + pull tab */}
      <mesh
        geometry={geo.score}
        material={tabMetal}
        position={[0, lidY + 0.002, 0.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1, 1.35, 1]}
      />
      <mesh
        geometry={geo.tab}
        material={tabMetal}
        position={[0, lidY + 0.006, 0.04]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <mesh material={tabMetal} position={[0, lidY + 0.012, 0.04]}>
        <cylinderGeometry args={[0.028, 0.032, 0.02, 24]} />
      </mesh>
    </group>
  );
});
