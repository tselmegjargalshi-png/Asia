"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { frame, getUI, useUI, type CardFinish, type CardVariant } from "@/lib/store";
import { CARD_H, CARD_W, VARIANTS, drawBack, drawChip, drawFront, drawRoughness } from "@/lib/cardArt";
import { clamp, damp, easeInOutCubic } from "@/lib/math";
import { S } from "@/lib/sections";
import { distanceFactor, place } from "./layout";
import { useFontsReady } from "./useFontsReady";
import { LIQUID_Y } from "./World";

export const CARD_DEPTH = 0.03;

export function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Shared card geometry: a thin extruded body plus front/back faces with 0..1 UVs. */
export function useCardGeometry() {
  return useMemo(() => {
    const shape = roundedRect(CARD_W, CARD_H, 0.12);
    const face = new THREE.ShapeGeometry(shape, 16);
    const uv = face.attributes.uv as THREE.BufferAttribute;
    const pos = face.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + CARD_W / 2) / CARD_W, (pos.getY(i) + CARD_H / 2) / CARD_H);
    const body = new THREE.ExtrudeGeometry(shape, { depth: CARD_DEPTH, bevelEnabled: false, curveSegments: 16 });
    body.translate(0, 0, -CARD_DEPTH / 2);
    return { face, body };
  }, []);
}

const FINISH: Record<CardFinish, { roughness: number; clearcoat: number; clearcoatRoughness: number }> = {
  polished: { roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.14 },
  brushed: { roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.3 },
  matte: { roughness: 0.78, clearcoat: 0, clearcoatRoughness: 0.6 },
};

function toTexture(c: HTMLCanvasElement, aniso: number, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  t.needsUpdate = true;
  return t;
}

function useCardTextures(variant: CardVariant, finish: CardFinish) {
  const fonts = useFontsReady();
  const { gl } = useThree();
  const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
  const faces = useMemo(() => {
    if (typeof document === "undefined") return null;
    return { front: toTexture(drawFront(variant), aniso), back: toTexture(drawBack(variant), aniso) };
    // fonts in deps: redraw once web fonts are available
  }, [variant, fonts, aniso]); // eslint-disable-line react-hooks/exhaustive-deps
  const rough = useMemo(() => toTexture(drawRoughness(finish), aniso, false), [finish, aniso]);
  const chip = useMemo(() => toTexture(drawChip(), aniso), [aniso]);
  useEffect(() => () => { faces?.front.dispose(); faces?.back.dispose(); }, [faces]);
  useEffect(() => () => rough.dispose(), [rough]);
  useEffect(() => () => chip.dispose(), [chip]);
  return { faces, rough, chip };
}

/** Local positions of the explorable details (front: +z, back: -z). */
const HOTSPOTS: { id: string; pos: [number, number, number]; side: 1 | -1 | 0 }[] = [
  { id: "hs-chip", pos: [-1.05, 0, CARD_DEPTH / 2], side: 1 },
  { id: "hs-contactless", pos: [-0.62, 0.02, CARD_DEPTH / 2], side: 1 },
  { id: "hs-mark", pos: [1.3, 0.67, CARD_DEPTH / 2], side: 1 },
  { id: "hs-edge", pos: [CARD_W / 2, -0.55, 0], side: 0 },
  { id: "hs-signature", pos: [0.55, 0.12, -CARD_DEPTH / 2], side: -1 },
  { id: "hs-holo", pos: [-1.05, -0.45, -CARD_DEPTH / 2], side: -1 },
];

const v3 = new THREE.Vector3();
const n3 = new THREE.Vector3();
const camDir = new THREE.Vector3();
const q = new THREE.Quaternion();

export function AsiaCard() {
  const variant = useUI((s) => s.variant);
  const finish = useUI((s) => s.finish);
  const { face, body } = useCardGeometry();
  const { faces, rough, chip } = useCardTextures(variant, finish);
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const state = useRef({ flip: 0, px: 0, py: 0, pz: 0, rx: 0, ry: 0, rz: 0, s: 1, lastY: 0 });
  const { camera } = useThree();
  const v = VARIANTS[variant];
  const f = FINISH[finish];

  useFrame((_, dt) => {
    const g = group.current;
    const inn = inner.current;
    if (!g || !inn) return;
    const t = frame.time;
    const ui = getUI();
    const st = state.current;
    const motion = ui.reducedMotion ? 0.2 : 1;
    const px = frame.pointerSmooth.x;
    const py = frame.pointerSmooth.y;

    const wHero = frame.pres[S.hero] || 0;
    const wCard = frame.pres[S.card] || 0;
    const wFinal = frame.pres[S.final] || 0;
    const total = wHero + wCard + wFinal;
    g.visible = total > 0.002;
    if (!g.visible) return;

    let X = 0, Y = 0, Z = 0, RX = 0, RY = 0, RZ = 0, SC = 0;
    const add = (w: number, p: number[], r: number[], s: number) => {
      X += p[0] * w; Y += p[1] * w; Z += p[2] * w;
      RX += r[0] * w; RY += r[1] * w; RZ += r[2] * w; SC += s * w;
    };

    // Hero: floats, follows the cursor, approaches the camera as you scroll.
    if (wHero > 0) {
      const lp = easeInOutCubic(frame.lp[S.hero] || 0);
      const exit = (frame.v[S.hero] || 0) > 0 ? 1 - wHero : 0;
      const bob = Math.sin(t * 0.8) * 0.06 * motion;
      const base = place([0.2, 0.72, 0], [0, 1.15, 0]);
      add(
        wHero,
        [base[0], base[1] + bob - lp * 0.15 - exit * 3.4, base[2] + lp * (frame.portrait ? 1.6 : 2.4) - exit * 0.5],
        [
          -0.18 + Math.sin(t * 0.5) * 0.05 * motion - py * 0.22 + lp * 0.12 + exit * 1.1 - frame.ctaHover * 0.12,
          0.38 * (1 - lp) + Math.sin(t * 0.3) * 0.22 * motion * (1 - lp) + px * 0.45,
          0.06 * (1 - lp) + Math.sin(t * 0.4) * 0.03 * motion,
        ],
        frame.portrait ? 0.74 : 0.8,
      );
    }

    // Product chapter: large, user-rotatable, rises out of the liquid.
    if (wCard > 0) {
      const vv = frame.v[S.card] || 0;
      const hidden = 1 - wCard;
      const dy = -hidden * (vv < 0 ? 3.6 : 3.0);
      const d = frame.cardDrag;
      d.y += d.vy * dt * 60;
      d.x = clamp(d.x + d.vx * dt * 60, -0.9, 0.9);
      d.vy *= Math.pow(0.9, dt * 60);
      d.vx *= Math.pow(0.9, dt * 60);
      const base = place([1.3, 0.2, 0.2], [0, 1.05, 0.2]);
      const hover = frame.cardHover;
      add(
        wCard,
        [base[0], base[1] + dy + Math.sin(t * 0.7) * 0.04 * motion, base[2] + hover * 0.25],
        [d.x - py * 0.12 + hidden * 0.9 - 0.08, d.y + px * 0.25 - 0.32 + Math.sin(t * 0.35) * 0.08 * motion, 0.02],
        frame.portrait ? 0.78 : 0.88,
      );
    }

    // Final: the card drifts away into darkness.
    if (wFinal > 0) {
      const lp = frame.lp[S.final] || 0;
      const vv = frame.v[S.final] || 0;
      const enter = vv < 0 ? 1 - wFinal : 0;
      const base = place([0, 1.25, -0.5], [0, 1.6, -0.5]);
      add(
        wFinal,
        [base[0], base[1] - enter * 3.2, base[2] - easeInOutCubic(lp) * 11],
        [-0.25 + enter * 0.8, -0.3 + Math.sin(t * 0.2) * 0.2 * motion + lp * 0.9, 0.05],
        frame.portrait ? 0.6 : 0.62,
      );
    }

    const k = 1 / Math.max(total, 1e-4);
    const lambda = 5;
    st.px = damp(st.px, X * k, lambda, dt);
    st.py = damp(st.py, Y * k, lambda, dt);
    st.pz = damp(st.pz, Z * k, lambda, dt);
    st.rx = damp(st.rx, RX * k, lambda, dt);
    st.ry = damp(st.ry, RY * k, lambda, dt);
    st.rz = damp(st.rz, RZ * k, lambda, dt);
    st.s = damp(st.s, SC * k, lambda, dt);
    st.flip = damp(st.flip, ui.flipped ? Math.PI : 0, 4.5, dt);

    const df = distanceFactor();
    g.position.set(st.px * (frame.portrait ? 1 : df), st.py, st.pz);
    g.rotation.set(st.rx, st.ry, st.rz);
    inn.rotation.y = st.flip;
    g.scale.setScalar(st.s * Math.min(1, total * 1.4));

    // disturb the liquid when the card passes through its surface
    const nearSurface = Math.abs(st.py - LIQUID_Y) < 0.9;
    if (nearSurface && Math.abs(st.py - st.lastY) > 0.002) frame.ripple = Math.min(1.5, frame.ripple + Math.abs(st.py - st.lastY) * 2);
    st.lastY = st.py;

    // Project hotspots into the DOM (only meaningful in the product chapter).
    if (frame.anchors.size) {
      camera.getWorldDirection(camDir);
      inn.getWorldQuaternion(q);
      for (const h of HOTSPOTS) {
        const el = frame.anchors.get(h.id);
        if (!el) continue;
        v3.set(...h.pos);
        inn.localToWorld(v3);
        n3.set(h.side === 0 ? 1 : 0, 0, h.side === 0 ? 0 : h.side).applyQuaternion(q);
        const facing = -n3.dot(camDir);
        v3.project(camera);
        const x = (v3.x * 0.5 + 0.5) * frame.vw;
        const y = (-v3.y * 0.5 + 0.5) * frame.vh;
        const visible = wCard > 0.85 && facing > (h.side === 0 ? 0.25 : 0.2) && Math.abs(v3.x) < 1.1;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        el.dataset.visible = visible ? "true" : "false";
      }
    }
  });

  if (!faces) return null;
  return (
    <group ref={group}>
      <group ref={inner}>
        <mesh geometry={body}>
          <meshStandardMaterial color={v.edge} metalness={1} roughness={0.28} envMapIntensity={1.4} />
        </mesh>
        <mesh geometry={face} position-z={CARD_DEPTH / 2 + 0.0006}>
          <meshPhysicalMaterial
            map={faces.front}
            roughnessMap={rough}
            metalness={v.metalness}
            roughness={f.roughness}
            clearcoat={f.clearcoat}
            clearcoatRoughness={f.clearcoatRoughness}
            envMapIntensity={1.25}
          />
        </mesh>
        <mesh geometry={face} position-z={-CARD_DEPTH / 2 - 0.0006} rotation-y={Math.PI}>
          <meshPhysicalMaterial
            map={faces.back}
            roughnessMap={rough}
            metalness={v.metalness * 0.9}
            roughness={f.roughness + 0.05}
            clearcoat={f.clearcoat * 0.8}
            clearcoatRoughness={f.clearcoatRoughness}
            envMapIntensity={1.1}
          />
        </mesh>
        <mesh position={[-1.05, 0, CARD_DEPTH / 2 + 0.0025]}>
          <planeGeometry args={[0.42, 0.315]} />
          <meshStandardMaterial map={chip} metalness={1} roughness={0.25} envMapIntensity={1.6} />
        </mesh>
      </group>
    </group>
  );
}
