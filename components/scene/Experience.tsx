"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { frame, getUI, setUI, useUI, type Tier } from "@/lib/store";
import { damp } from "@/lib/math";
import { TIER_CONFIG } from "@/lib/quality";
import { World } from "./World";
import { AsiaCard } from "./AsiaCard";
import { ChapterStandard } from "./ChapterStandard";
import { ChapterAsia } from "./ChapterAsia";
import { ChapterPayments } from "./ChapterPayments";
import { ChapterGlobe } from "./ChapterGlobe";
import { ChapterWealth } from "./ChapterWealth";
import { ChapterSecurity } from "./ChapterSecurity";
import { ChapterPhone } from "./ChapterPhone";

const CHROMA = new THREE.Vector2(0.0006, 0.0004);
const DOWNGRADE: Record<Tier, Tier> = { high: "medium", medium: "low", low: "low" };

/** Advances shared animation time and smooths pointer input once per frame. */
function Clock() {
  const ready = useRef(0);
  const { gl } = useThree();
  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const ui = getUI();
    frame.time += dt * (ui.reducedMotion ? 0.15 : 1);
    const k = ui.reducedMotion ? 0 : 1;
    frame.pointerSmooth.x = damp(frame.pointerSmooth.x, frame.pointer.x * k, 3, dt);
    frame.pointerSmooth.y = damp(frame.pointerSmooth.y, frame.pointer.y * k, 3, dt);
    frame.portrait = frame.vw / Math.max(frame.vh, 1) < 0.85;
    if (ready.current < 3 && ++ready.current === 3) setUI({ sceneReady: true });
  });
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (e: Event) => {
      e.preventDefault();
      setUI({ webgl: "none" });
    };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl]);
  return null;
}

function Effects({ tier }: { tier: Tier }) {
  const cfg = TIER_CONFIG[tier];
  if (!cfg.post) return null;
  if (cfg.chroma)
    return (
      <EffectComposer multisampling={4} enableNormalPass={false}>
        <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.95} luminanceSmoothing={0.2} radius={0.75} />
        <ChromaticAberration offset={CHROMA} radialModulation modulationOffset={0.3} />
        <Vignette eskil={false} offset={0.25} darkness={0.75} />
        <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.22} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    );
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.95} luminanceSmoothing={0.2} radius={0.7} />
      <Vignette eskil={false} offset={0.25} darkness={0.75} />
      <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.22} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}

export default function Experience() {
  const initialTier = useUI((s) => s.tier);
  const [tier, setTier] = useState<Tier>(initialTier);
  const cfg = TIER_CONFIG[tier];
  const [dpr, setDpr] = useState(Math.min(cfg.dpr[1], typeof window !== "undefined" ? window.devicePixelRatio : 1));
  const dprRef = useRef(dpr);

  useEffect(() => {
    dprRef.current = Math.min(TIER_CONFIG[tier].dpr[1], window.devicePixelRatio || 1);
    setDpr(dprRef.current);
    setUI({ tier });
  }, [tier]);

  return (
    <Canvas
      dpr={dpr}
      camera={{ fov: 32, near: 0.1, far: 80, position: [0, 0.3, 7.2] }}
      gl={{ antialias: tier !== "high", powerPreference: "high-performance", alpha: false, stencil: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <PerformanceMonitor
        flipflops={2}
        onDecline={() => {
          // first lower the resolution, then the whole tier
          const min = TIER_CONFIG[tier].dpr[0];
          if (dprRef.current > min + 0.01) {
            dprRef.current = Math.max(min, dprRef.current - 0.25);
            setDpr(dprRef.current);
          } else setTier((t) => DOWNGRADE[t]);
        }}
      />
      <Clock />
      <Suspense fallback={null}>
        <World tier={tier} />
        <AsiaCard />
        <ChapterStandard />
        <ChapterAsia tier={tier} />
        <ChapterPayments nodes={cfg.network} />
        <ChapterGlobe dots={cfg.globeDots} />
        <ChapterWealth count={cfg.wealth} />
        <ChapterSecurity tier={tier} />
        <ChapterPhone />
        <Effects tier={tier} />
      </Suspense>
    </Canvas>
  );
}
