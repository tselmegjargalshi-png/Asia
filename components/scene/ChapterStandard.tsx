"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { frame } from "@/lib/store";
import { S } from "@/lib/sections";
import { easeInOutCubic } from "@/lib/math";
import { applyChapter } from "./layout";

const RINGS = [
  { r: 1.35, tube: 0.012, axis: [0.3, 1, 0.1], speed: 0.18, gold: true },
  { r: 1.18, tube: 0.03, axis: [1, 0.2, 0.3], speed: -0.24, gold: false },
  { r: 1.0, tube: 0.014, axis: [0.2, 0.4, 1], speed: 0.3, gold: true },
  { r: 0.84, tube: 0.026, axis: [1, 1, 0], speed: -0.36, gold: false },
  { r: 0.68, tube: 0.012, axis: [0, 1, 1], speed: 0.45, gold: true },
  { r: 0.54, tube: 0.02, axis: [1, 0, 1], speed: -0.55, gold: true },
];

const axes = RINGS.map((r) => new THREE.Vector3(...(r.axis as [number, number, number])).normalize());
const angles = RINGS.map(() => 0);
const ALIGN_AXIS = new THREE.Vector3(1, 0.15, 0).normalize();
const qFree = new THREE.Quaternion();
const qAligned = new THREE.Quaternion();

/** "Built for a moving world": a gyroscope of precision rings that settles as you read. */
export function ChapterStandard() {
  const group = useRef<THREE.Group>(null);
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const core = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const g = group.current;
    if (!g || !applyChapter(g, S.standard, [1.65, 0.35, 0], [0, 1.25, 0], 1, 0.95)) return;
    const lp = easeInOutCubic(frame.lp[S.standard] || 0);
    const t = frame.time;
    rings.current.forEach((m, i) => {
      if (!m) return;
      const r = RINGS[i];
      angles[i] += r.speed * dt * (1 - lp * 0.7);
      qFree.setFromAxisAngle(axes[i], angles[i] + i * 1.3);
      // as the section plays the rings settle into one calm, aligned orbit
      qAligned.setFromAxisAngle(ALIGN_AXIS, angles[i] * 0.3 + Math.PI / 2.4);
      m.quaternion.slerpQuaternions(qFree, qAligned, lp * 0.85);
      m.position.y = Math.sin(t * 0.6 + i) * 0.02;
    });
    g.rotation.y = frame.pointerSmooth.x * 0.25 + t * 0.05;
    g.rotation.x = -frame.pointerSmooth.y * 0.15;
    if (core.current) core.current.rotation.y = t * 0.4;
  });
  return (
    <group ref={group} visible={false}>
      {RINGS.map((r, i) => (
        <mesh key={i} ref={(m) => { rings.current[i] = m; }}>
          <torusGeometry args={[r.r, r.tube, 24, 220]} />
          <meshStandardMaterial
            color={r.gold ? "#e2c48e" : "#2b2526"}
            metalness={1}
            roughness={r.gold ? 0.2 : 0.35}
            envMapIntensity={1.5}
          />
        </mesh>
      ))}
      <mesh ref={core}>
        <sphereGeometry args={[0.3, 64, 64]} />
        <meshPhysicalMaterial color="#120708" metalness={0.4} roughness={0.08} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={2} />
      </mesh>
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.36, 0.006, 8, 120]} />
        <meshBasicMaterial color={[2.4, 0.5, 0.35]} toneMapped={false} />
      </mesh>
    </group>
  );
}
