"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { frame, type Tier } from "@/lib/store";
import { S, steppedProgress } from "@/lib/sections";
import { damp } from "@/lib/math";
import { drawFront } from "@/lib/cardArt";
import { applyChapter } from "./layout";
import { useCardGeometry } from "./AsiaCard";
import { useFontsReady } from "./useFontsReady";

export const PILLARS = 6;
const SPACING = 3.8;

const gold = { color: "#e0bf86", metalness: 1, roughness: 0.22, envMapIntensity: 1.5 };
const dark = { color: "#1a1112", metalness: 0.6, roughness: 0.18, envMapIntensity: 1.6 };

function Emblem() {
  return (
    <group>
      <mesh>
        <torusGeometry args={[0.95, 0.055, 32, 200]} />
        <meshStandardMaterial {...gold} />
      </mesh>
      <mesh position={[0.2, -0.04, 0.02]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.55, 0.55, 0.08, 96]} />
        <meshPhysicalMaterial {...dark} color="#5a0f1d" clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
    </group>
  );
}

function gridTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 352;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = "rgba(255,190,140,0.9)";
  ctx.lineWidth = 1.5;
  for (let x = 16; x < c.width; x += 28) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke(); }
  for (let y = 16; y < c.height; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke(); }
  ctx.fillStyle = "rgba(255,120,90,1)";
  ctx.fillRect(16, 128, 224, 3);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function GlassSlab({ tier }: { tier: Tier }) {
  const tex = useMemo(() => gridTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group rotation={[0.1, -0.4, 0.05]}>
      <RoundedBox args={[1.35, 1.85, 0.12]} radius={0.06} smoothness={4}>
        {tier === "high" ? (
          <meshPhysicalMaterial transmission={1} thickness={0.4} roughness={0.08} ior={1.4} color="#ffd9cf" envMapIntensity={1.2} />
        ) : (
          <meshPhysicalMaterial transparent opacity={0.35} roughness={0.05} metalness={0.2} color="#ffdcd0" envMapIntensity={1.6} />
        )}
      </RoundedBox>
      <mesh position-z={-0.01}>
        <planeGeometry args={[1.15, 1.6]} />
        <meshBasicMaterial map={tex} transparent blending={THREE.AdditiveBlending} opacity={0.55} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Coins() {
  return (
    <group rotation={[0.9, 0.2, -0.3]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[i * 0.18 - 0.18, i * 0.14 - 0.14, i * 0.1]}>
          <cylinderGeometry args={[0.72, 0.72, 0.07, 96]} />
          <meshStandardMaterial {...(i === 1 ? dark : gold)} color={i === 2 ? "#efe3cc" : i === 1 ? "#251a1b" : gold.color} />
        </mesh>
      ))}
    </group>
  );
}

function CardFan() {
  const { face, body } = useCardGeometry();
  const fonts = useFontsReady();
  const textures = useMemo(() => {
    return (["black", "gold", "signature"] as const).map((v) => {
      const t = new THREE.CanvasTexture(drawFront(v));
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    });
  }, [fonts]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);
  return (
    <group scale={0.55} rotation={[-0.2, 0.3, 0]}>
      {textures.map((tex, i) => (
        <group key={i} rotation-z={(i - 1) * 0.32} position={[(i - 1) * 0.5, (i - 1) * -0.05, i * 0.06]}>
          <mesh geometry={body}>
            <meshStandardMaterial color="#3a3030" metalness={1} roughness={0.3} />
          </mesh>
          <mesh geometry={face} position-z={0.0156}>
            <meshPhysicalMaterial map={tex} metalness={i === 1 ? 1 : 0.6} roughness={0.25} clearcoat={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Tower() {
  return (
    <group position-y={-0.9}>
      {Array.from({ length: 10 }, (_, i) => {
        const a = i * 0.62;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.45, i * 0.19, Math.sin(a) * 0.45]} rotation-y={-a}>
            <boxGeometry args={[0.7, 0.12, 0.26]} />
            <meshStandardMaterial {...(i % 3 === 2 ? dark : gold)} />
          </mesh>
        );
      })}
    </group>
  );
}

function WireGlobe() {
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.95, 2)), []);
  useEffect(() => () => edges.dispose(), [edges]);
  return (
    <group>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#e8cfa2" transparent opacity={0.55} />
      </lineSegments>
      <mesh>
        <sphereGeometry args={[0.9, 48, 48]} />
        <meshPhysicalMaterial color="#0d0708" roughness={0.15} clearcoat={1} envMapIntensity={1.2} />
      </mesh>
      <mesh rotation={[1.2, 0.3, 0]}>
        <torusGeometry args={[1.3, 0.008, 8, 200]} />
        <meshBasicMaterial color={[2.2, 0.35, 0.3]} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** "ASIA": six pillars of the bank travel past the camera as the section scrolls sideways. */
export function ChapterAsia({ tier }: { tier: Tier }) {
  const group = useRef<THREE.Group>(null);
  const track = useRef<THREE.Group>(null);
  const items = useRef<(THREE.Group | null)[]>([]);
  const idx = useRef(0);
  useThree();
  useFrame((_, dt) => {
    const g = group.current;
    if (!g || !applyChapter(g, S.asia, [1.35, 0.35, 0], [0, 1.2, 0], 1, 1)) return;
    const target = steppedProgress(frame.lp[S.asia] || 0, PILLARS) * (PILLARS - 1);
    idx.current = damp(idx.current, target, 4, dt);
    if (track.current) track.current.position.x = -idx.current * SPACING;
    items.current.forEach((m, i) => {
      if (!m) return;
      const d = Math.abs(i - idx.current);
      const s = 1 - Math.min(1, d / 0.85);
      m.scale.setScalar(Math.max(0.001, s * s * (3 - 2 * s)));
      m.visible = d < 0.85;
      m.rotation.y += dt * (0.25 + 0.1 * i) * (frame.time > 0 ? 1 : 0);
      m.position.y = Math.sin(frame.time * 0.7 + i) * 0.06;
      m.position.z = -Math.min(d, 2) * 1.6;
    });
    g.rotation.y = frame.pointerSmooth.x * 0.15;
  });
  const children = [<Emblem key="e" />, <GlassSlab key="g" tier={tier} />, <Coins key="c" />, <CardFan key="f" />, <Tower key="t" />, <WireGlobe key="w" />];
  return (
    <group ref={group} visible={false}>
      <group ref={track}>
        {children.map((c, i) => (
          <group key={i} position-x={i * SPACING} ref={(m) => { items.current[i] = m; }}>
            {c}
          </group>
        ))}
      </group>
    </group>
  );
}
