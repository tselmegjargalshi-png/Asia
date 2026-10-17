"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { frame, type Tier } from "@/lib/store";
import { S } from "@/lib/sections";
import { clamp, easeInOutCubic } from "@/lib/math";
import { applyChapter } from "./layout";

/** "Quietly secure": layered geometry closes into a vault as the section plays. */
export function ChapterSecurity({ tier }: { tier: Tier }) {
  const group = useRef<THREE.Group>(null);
  const outer = useRef<THREE.LineSegments>(null);
  const shell = useRef<THREE.Mesh>(null);
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const core = useRef<THREE.Mesh>(null);
  const coreMat = useRef<THREE.MeshBasicMaterial>(null);
  const orbit = useRef<THREE.Points>(null);

  const { outerEdges, orbitGeo } = useMemo(() => {
    const outerEdges = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.55, 0));
    const n = 260;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = 2.0 + Math.sin(i * 12.9898) * 0.08;
      p.set([Math.cos(a) * r, Math.sin(i * 3.1) * 0.05, Math.sin(a) * r], i * 3);
    }
    const orbitGeo = new THREE.BufferGeometry();
    orbitGeo.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return { outerEdges, orbitGeo };
  }, []);
  useEffect(() => () => { outerEdges.dispose(); orbitGeo.dispose(); }, [outerEdges, orbitGeo]);

  const RING = [
    { r: 1.05, axis: "x", speed: 0.5, arc: Math.PI * 1.6 },
    { r: 0.88, axis: "y", speed: -0.7, arc: Math.PI * 1.3 },
    { r: 0.72, axis: "z", speed: 0.9, arc: Math.PI * 1.75 },
  ] as const;

  useFrame(() => {
    const g = group.current;
    if (!g || !applyChapter(g, S.security, [1.5, 0.35, 0], [0, 1.3, 0], 0.72, 0.62)) return;
    const t = frame.time;
    const lp = frame.lp[S.security] || 0;
    const lock = easeInOutCubic(clamp((lp - 0.05) / 0.7));
    const open = 1 - lock;
    if (outer.current) {
      outer.current.rotation.set(t * 0.05, t * 0.08, 0);
      outer.current.scale.setScalar(1 + open * 0.5);
      (outer.current.material as THREE.LineBasicMaterial).opacity = 0.25 + lock * 0.45;
    }
    if (shell.current) {
      shell.current.rotation.set(-t * 0.06, t * 0.1 + open * 2, 0);
      shell.current.scale.setScalar(0.6 + lock * 0.4);
    }
    rings.current.forEach((m, i) => {
      if (!m) return;
      const R = RING[i];
      const spin = t * R.speed * (0.4 + open);
      // rings start scattered and settle into concentric alignment (the vault locks)
      m.rotation.set(
        (R.axis === "x" ? spin : i * 0.9) * open + (Math.PI / 2) * lock,
        (R.axis === "y" ? spin : i * 1.4) * open,
        R.axis === "z" ? spin : spin * 0.5 * lock + i * 2.1,
      );
      m.scale.setScalar(1 + open * (0.6 + i * 0.25));
    });
    const pulse = 0.6 + 0.4 * Math.sin(t * 2.2);
    if (core.current) core.current.rotation.set(t * 0.4, t * 0.6, 0);
    if (coreMat.current) coreMat.current.color.setRGB(2.2 * (0.5 + lock * pulse), 0.25 + lock * 0.2, 0.22);
    if (orbit.current) orbit.current.rotation.y = -t * 0.15;
    g.rotation.y = frame.pointerSmooth.x * 0.3;
    g.rotation.x = -frame.pointerSmooth.y * 0.15;
  });

  return (
    <group ref={group} visible={false}>
      <lineSegments ref={outer} geometry={outerEdges}>
        <lineBasicMaterial color="#e0bf86" transparent opacity={0.5} />
      </lineSegments>
      <mesh ref={shell}>
        <dodecahedronGeometry args={[1.25, 0]} />
        {tier === "high" ? (
          <meshPhysicalMaterial transmission={1} thickness={0.6} roughness={0.12} ior={1.45} color="#ffd4cc" envMapIntensity={1.4} flatShading />
        ) : (
          <meshPhysicalMaterial transparent opacity={0.22} roughness={0.08} metalness={0.3} color="#ffd4cc" envMapIntensity={1.8} flatShading depthWrite={false} />
        )}
      </mesh>
      {RING.map((R, i) => (
        <mesh key={i} ref={(m) => { rings.current[i] = m; }}>
          <torusGeometry args={[R.r, 0.035, 16, 160, R.arc]} />
          <meshStandardMaterial color={i === 1 ? "#2a2324" : "#e0bf86"} metalness={1} roughness={0.22} envMapIntensity={1.6} />
        </mesh>
      ))}
      <mesh ref={core}>
        <octahedronGeometry args={[0.26, 0]} />
        <meshBasicMaterial ref={coreMat} color={[2, 0.3, 0.25]} toneMapped={false} />
      </mesh>
      <points ref={orbit} geometry={orbitGeo}>
        <pointsMaterial size={0.025} color="#ffcf9a" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  );
}
