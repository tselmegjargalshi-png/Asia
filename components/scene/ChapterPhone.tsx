"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { frame, getUI, setUI, useUI } from "@/lib/store";
import { S } from "@/lib/sections";
import { damp } from "@/lib/math";
import { drawPhoneScreen } from "@/lib/phoneArt";
import { roundedRect } from "./AsiaCard";
import { applyChapter } from "./layout";
import { useFontsReady } from "./useFontsReady";

const PW = 1.5;
const PH = 3.1;

/** "Experience": a floating phone running the fictional ASIA app. */
export function ChapterPhone() {
  const { gl } = useThree();
  const group = useRef<THREE.Group>(null);
  const tilt = useRef({ x: 0, y: 0 });
  const tab = useUI((s) => s.phoneTab);
  const fonts = useFontsReady();
  const screenGeo = useMemo(() => {
    const g = new THREE.ShapeGeometry(roundedRect(PW - 0.1, PH - 0.1, 0.16), 12);
    const uv = g.attributes.uv as THREE.BufferAttribute;
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / (PW - 0.1) + 0.5, pos.getY(i) / (PH - 0.1) + 0.5);
    return g;
  }, []);
  const canvas = useMemo(() => (typeof document !== "undefined" ? document.createElement("canvas") : null), []);
  const texture = useMemo(() => {
    if (!canvas) return null;
    drawPhoneScreen(0, canvas);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    return t;
  }, [canvas, gl]);
  useEffect(() => {
    if (!canvas || !texture) return;
    drawPhoneScreen(tab, canvas);
    texture.needsUpdate = true;
  }, [tab, fonts, canvas, texture]);
  useEffect(() => () => { texture?.dispose(); screenGeo.dispose(); }, [texture, screenGeo]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g || !applyChapter(g, S.experience, [1.35, 0.25, 0.6], [0, 1.15, 0.4], 1, 0.82)) return;
    const lp = frame.lp[S.experience] || 0;
    const next = lp < 0.36 ? 0 : lp < 0.7 ? 1 : 2;
    if (getUI().phoneTab !== next) setUI({ phoneTab: next });
    const t = frame.time;
    tilt.current.x = damp(tilt.current.x, -frame.pointerSmooth.y * 0.25 + Math.sin(t * 0.5) * 0.04, 4, dt);
    tilt.current.y = damp(tilt.current.y, -0.35 + frame.pointerSmooth.x * 0.4 + Math.sin(t * 0.3) * 0.06 + lp * 0.5, 4, dt);
    g.rotation.set(tilt.current.x, tilt.current.y, 0.04);
    g.position.y += Math.sin(t * 0.8) * 0.04;
  });

  return (
    <group ref={group} visible={false}>
      <RoundedBox args={[PW, PH, 0.16]} radius={0.2} smoothness={6}>
        <meshPhysicalMaterial color="#1a1517" metalness={0.9} roughness={0.32} clearcoat={0.6} envMapIntensity={1.4} />
      </RoundedBox>
      <mesh position-z={0.0805}>
        <planeGeometry args={[PW - 0.04, PH - 0.04]} />
        <meshPhysicalMaterial color="#020202" roughness={0.05} metalness={0} clearcoat={1} />
      </mesh>
      {texture && (
        <mesh geometry={screenGeo} position-z={0.082}>
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      )}
      {/* dynamic island */}
      <mesh position={[0, PH / 2 - 0.16, 0.084]}>
        <planeGeometry args={[0.36, 0.09]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      {/* side buttons */}
      <mesh position={[PW / 2 + 0.005, 0.6, 0]}>
        <boxGeometry args={[0.02, 0.3, 0.06]} />
        <meshStandardMaterial color="#3a3234" metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
}
