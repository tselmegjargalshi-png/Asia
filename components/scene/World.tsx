"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { frame, getUI, type Tier } from "@/lib/store";
import { blend, damp, rng } from "@/lib/math";
import { TIER_CONFIG } from "@/lib/quality";
import { distanceFactor } from "./layout";
import { Shader } from "./Shader";
import { dustFragment, dustVertex, haloFragment, haloVertex, liteLiquidFragment, liteLiquidVertex } from "./shaders";

const LIQUID_Y = -1.4;

/* ----------------------------------------------------------------------------
 * Per-chapter art direction. Each row is blended by section presence so the
 * universe changes mood continuously as the reader scrolls.
 * ------------------------------------------------------------------------- */
//            haloX haloY  scale  intensity
const HALO = [
  [0, 0.95, 1.0, 1.0],
  [3.0, 0.7, 0.72, 0.55],
  [2.4, 0.6, 0.66, 0.45],
  [2.3, 0.6, 0.8, 0.6],
  [0, 0.9, 0.62, 0.22],
  [2.7, 0.75, 1.12, 0.42],
  [2.5, 1.2, 0.95, 0.3],
  [2.4, 0.6, 0.8, 0.7],
  [2.5, 0.6, 0.7, 0.42],
  [0, 1.1, 0.9, 0.85],
];
// corona colour (crimson family)
const HALO_A = [
  [0.75, 0.06, 0.08], [0.7, 0.1, 0.08], [0.55, 0.05, 0.1], [0.6, 0.25, 0.12], [0.7, 0.05, 0.08],
  [0.72, 0.12, 0.08], [0.7, 0.42, 0.14], [0.85, 0.04, 0.07], [0.6, 0.18, 0.12], [0.6, 0.05, 0.07],
];
// rim colour (gold / ivory)
const HALO_B = [
  [1.0, 0.72, 0.42], [1.0, 0.66, 0.4], [1.0, 0.7, 0.45], [1.0, 0.86, 0.66], [1.0, 0.5, 0.36],
  [1.0, 0.7, 0.42], [1.0, 0.8, 0.5], [1.0, 0.62, 0.48], [1.0, 0.78, 0.6], [1.0, 0.7, 0.45],
];
//            camX  camY  camZ  lookX lookY lookZ
const CAMERA = [
  [0, 0.3, 7.2, 0, 0.15, 0],
  [-0.4, 0.6, 7.6, 0.3, 0.3, 0],
  [0, 0.5, 8.0, 0, 0.3, 0],
  [0, 0.4, 7.0, 0.3, 0.2, 0],
  [0, 1.4, 8.6, 0, 0.1, 0],
  [0, 0.45, 7.8, 0.2, 0.3, 0],
  [0.3, 0.1, 7.8, 0.3, 0.55, 0],
  [0, 0.45, 7.4, 0.1, 0.25, 0],
  [0, 0.3, 7.2, 0.2, 0.25, 0],
  [0, 0.6, 8.4, 0, 0.35, -2],
];
//          key intensity, rim intensity, key r g b
const LIGHT = [
  [2.4, 3.0, 1.0, 0.9, 0.8], [2.0, 2.4, 1.0, 0.86, 0.74], [2.0, 2.6, 1.0, 0.88, 0.78], [3.8, 2.2, 1.0, 0.96, 0.9],
  [1.4, 3.4, 1.0, 0.8, 0.72], [2.0, 3.0, 1.0, 0.88, 0.76], [2.6, 1.8, 1.0, 0.86, 0.62], [2.2, 3.6, 0.95, 0.9, 0.95],
  [2.2, 2.2, 1.0, 0.9, 0.82], [1.6, 2.4, 1.0, 0.85, 0.75],
];

const tmp6 = [0, 0, 0, 0, 0, 0];
const tmp4 = [0, 0, 0, 0];
const tmp3 = [0, 0, 0];
const tmp5 = [0, 0, 0, 0, 0];

export const worldState = { haloX: 0, haloIntensity: 1, liquidCalm: 0 };

function finalFade() {
  // The final chapter dims everything into darkness as it plays out.
  const p9 = frame.pres[9] || 0;
  const lp9 = frame.lp[9] || 0;
  return 1 - p9 * Math.min(1, Math.max(0, (lp9 - 0.15) / 0.75));
}

/* --------------------------------- Halo ---------------------------------- */
function Halo() {
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 1 },
      uColorA: { value: new THREE.Color(0.75, 0.06, 0.08) },
      uColorB: { value: new THREE.Color(1, 0.72, 0.42) },
      uColorC: { value: new THREE.Color(0.9, 0.2, 0.15) },
    }),
    [],
  );
  const cur = useRef({ x: 0, y: 0.65, s: 1, i: 0 });
  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    blend(frame.pres, HALO, tmp4);
    let [x, y, s, i] = tmp4;
    if (frame.portrait) {
      x = 0;
      y = y + 1.6;
      s *= 1.15;
    }
    i *= finalFade();
    i *= 1 + frame.ctaHover * 0.35;
    const c = cur.current;
    c.x = damp(c.x, x, 2.5, dt);
    c.y = damp(c.y, y, 2.5, dt);
    c.s = damp(c.s, s, 2.5, dt);
    c.i = damp(c.i, i, 1.8, dt);
    const df = distanceFactor();
    m.position.set(c.x * df, c.y, -6);
    m.scale.setScalar(12 * c.s * (frame.portrait ? Math.min(df, 1.8) * 0.9 : 1));
    worldState.haloX = m.position.x;
    worldState.haloIntensity = c.i;
    uniforms.uTime.value = frame.time;
    uniforms.uIntensity.value = c.i * (1 + Math.sin(frame.time * 0.6) * 0.04);
    blend(frame.pres, HALO_A, tmp3);
    uniforms.uColorA.value.setRGB(tmp3[0], tmp3[1], tmp3[2]);
    blend(frame.pres, HALO_B, tmp3);
    uniforms.uColorB.value.setRGB(tmp3[0], tmp3[1], tmp3[2]);
  });
  return (
    <mesh ref={mesh} position={[0, 0.65, -6]} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
      <Shader
        vertexShader={haloVertex}
        fragmentShader={haloFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

/* -------------------------------- Liquid --------------------------------- */
function makeRippleTextures(size = 256) {
  // Tileable height field: integer-frequency sine waves wrap seamlessly.
  const r = rng(7);
  const waves = Array.from({ length: 9 }, (_, i) => ({
    fx: Math.round(1 + r() * (2 + i)) * (r() > 0.5 ? 1 : -1),
    fy: Math.round(1 + r() * (3 + i)),
    ph: r() * Math.PI * 2,
    a: 1 / (1 + i * 0.7),
  }));
  const h = new Float32Array(size * size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      let v = 0;
      for (const w of waves) v += w.a * Math.sin(((w.fx * x + w.fy * y) / size) * Math.PI * 2 + w.ph);
      h[y * size + x] = v;
    }
  let min = Infinity;
  let max = -Infinity;
  for (const v of h) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const dist = new Uint8Array(size * size * 4);
  const norm = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const v = (h[i] - min) / (max - min);
      dist.set([v * 255, v * 255, v * 255, 255], i * 4);
      const hl = h[y * size + ((x - 1 + size) % size)];
      const hr = h[y * size + ((x + 1) % size)];
      const hd = h[((y - 1 + size) % size) * size + x];
      const hu = h[((y + 1) % size) * size + x];
      const nx = (hl - hr) * 0.6;
      const ny = (hd - hu) * 0.6;
      const len = Math.hypot(nx, ny, 1);
      norm.set([((nx / len) * 0.5 + 0.5) * 255, ((ny / len) * 0.5 + 0.5) * 255, ((1 / len) * 0.5 + 0.5) * 255, 255], i * 4);
    }
  const mk = (data: Uint8Array) => {
    const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    t.needsUpdate = true;
    return t;
  };
  return { distortion: mk(dist), normal: mk(norm) };
}

function ReflectiveLiquid({ resolution }: { resolution: number }) {
  const { distortion, normal } = useMemo(() => makeRippleTextures(), []);
  const mat = useRef<THREE.MeshStandardMaterial & { distortion: number }>(null);
  useEffect(() => () => {
    distortion.dispose();
    normal.dispose();
  }, [distortion, normal]);
  useMemo(() => {
    distortion.repeat.set(3, 6);
    normal.repeat.set(10, 20);
  }, [distortion, normal]);
  useFrame((_, dt) => {
    const t = frame.time;
    frame.ripple = damp(frame.ripple, 0, 1.2, dt);
    const calm = 1 - finalFade();
    const agitation = (0.18 + Math.min(0.5, Math.abs(frame.velocity) * 0.012) + frame.ripple * 0.9) * (1 - calm * 0.9);
    distortion.offset.set(t * 0.004, t * 0.02);
    normal.offset.set(-t * 0.006, t * 0.035);
    if (mat.current) {
      mat.current.distortion = damp(mat.current.distortion, agitation, 3, dt);
      mat.current.normalScale.setScalar(0.12 + agitation * 0.5);
    }
  });
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, LIQUID_Y, 0]}>
      <planeGeometry args={[60, 60]} />
      <MeshReflectorMaterial
        ref={mat as never}
        resolution={resolution}
        blur={[260, 80]}
        mixBlur={0.9}
        mixStrength={5.5}
        mixContrast={1.15}
        mirror={0.9}
        depthScale={0.6}
        minDepthThreshold={0.6}
        maxDepthThreshold={1.6}
        distortionMap={distortion}
        distortion={0.2}
        normalMap={normal}
        normalScale={new THREE.Vector2(0.2, 0.2)}
        color="#0b0607"
        metalness={0.55}
        roughness={0.75}
        envMapIntensity={0.35}
      />
    </mesh>
  );
}

function LiteLiquid() {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uGlow: { value: new THREE.Color(1, 0.45, 0.32) },
      uGlowX: { value: 0 },
      uIntensity: { value: 1 },
      uRipple: { value: 1 },
      uBase: { value: new THREE.Color("#080405") },
    }),
    [],
  );
  useFrame((_, dt) => {
    frame.ripple = damp(frame.ripple, 0, 1.2, dt);
    uniforms.uTime.value = frame.time;
    uniforms.uGlowX.value = worldState.haloX;
    uniforms.uIntensity.value = worldState.haloIntensity;
    uniforms.uRipple.value = (1 + frame.ripple) * finalFade();
  });
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, LIQUID_Y, 0]}>
      <planeGeometry args={[60, 60]} />
      <Shader vertexShader={liteLiquidVertex} fragmentShader={liteLiquidFragment} uniforms={uniforms} />
    </mesh>
  );
}

/* --------------------------------- Dust ---------------------------------- */
function Dust({ count }: { count: number }) {
  const { gl } = useThree();
  const geo = useMemo(() => {
    const r = rng(11);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos.set([(r() - 0.5) * 18, r() * 9 - 3.5, r() * 13 - 8], i * 3);
      seed.set([r(), r(), r()], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 3));
    return g;
  }, [count]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 4.2 },
      uPixelRatio: { value: 1 },
      uSpeed: { value: 1 },
      uOpacity: { value: 1 },
      uColorA: { value: new THREE.Color(1, 0.7, 0.42) },
      uColorB: { value: new THREE.Color(0.9, 0.18, 0.16) },
    }),
    [],
  );
  useFrame(() => {
    uniforms.uTime.value = frame.time;
    uniforms.uPixelRatio.value = gl.getPixelRatio();
    uniforms.uOpacity.value = (0.25 + 0.75 * finalFade()) * 0.55;
  });
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <points geometry={geo} frustumCulled={false}>
      <Shader
        vertexShader={dustVertex}
        fragmentShader={dustFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------ Camera + lights --------------------------- */
function Rig() {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 0.15, 0));
  const cur = useRef([0, 0.3, 7.2, 0, 0.15, 0]);
  const key = useRef<THREE.SpotLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  const fog = useRef<THREE.Fog>(null);
  useFrame((state, dt) => {
    blend(frame.pres, CAMERA, tmp6);
    const df = distanceFactor();
    const motion = getUI().reducedMotion ? 0 : 1;
    const px = frame.pointerSmooth.x * motion;
    const py = frame.pointerSmooth.y * motion;
    const target = [
      tmp6[0] * (frame.portrait ? 0.2 : 1) + px * 0.35,
      tmp6[1] + (frame.portrait ? 0.9 : 0) + py * 0.18,
      tmp6[2] * df,
      tmp6[3] * (frame.portrait ? 0 : 1),
      tmp6[4] + (frame.portrait ? 0.9 : 0),
      tmp6[5],
    ];
    const c = cur.current;
    for (let i = 0; i < 6; i++) c[i] = damp(c[i], target[i], 3.2, dt);
    camera.position.set(c[0], c[1], c[2]);
    look.current.set(c[3], c[4], c[5]);
    camera.lookAt(look.current);

    blend(frame.pres, LIGHT, tmp5);
    const fade = finalFade();
    if (key.current) {
      key.current.intensity = damp(key.current.intensity, tmp5[0] * 22 * fade, 3, dt);
      key.current.color.setRGB(tmp5[2], tmp5[3], tmp5[4]);
    }
    if (rim.current) rim.current.intensity = damp(rim.current.intensity, tmp5[1] * 12 * fade * (1 + frame.ctaHover * 0.6), 3, dt);
    if (fog.current) {
      fog.current.near = 6 + 4 * fade;
      fog.current.far = 14 + 18 * fade + (df - 1) * 10;
    }
    state.scene.fog = fog.current;
  });
  return (
    <>
      <fog ref={fog} attach="fog" args={["#070304", 8, 30]} />
      <ambientLight intensity={0.12} />
      <spotLight ref={key} position={[-3, 9, 1.5]} angle={0.5} penumbra={1} intensity={40} decay={1.6} />
      <pointLight ref={rim} position={[0.5, 1.2, -3]} color="#ff3b3b" intensity={30} distance={14} decay={1.4} />
      <directionalLight position={[4, 2, 3]} intensity={0.35} color="#f3e6cf" />
    </>
  );
}

export function World({ tier }: { tier: Tier }) {
  const cfg = TIER_CONFIG[tier];
  return (
    <>
      <color attach="background" args={["#070304"]} />
      <Rig />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={1.5} color="#fff1dc" position={[0, 5, -1]} rotation-x={Math.PI / 2} scale={[10, 0.6, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#c23a45" position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[2, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#d2ad72" position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[2, 6, 1]} />
        <Lightformer form="ring" intensity={4} color="#ff5a4a" position={[0, 0.5, -8]} scale={6} />
        <Lightformer form="circle" intensity={0.35} color="#ffe9d0" position={[-3, 1, 7]} scale={2} />
      </Environment>
      <Halo />
      {cfg.reflector > 0 ? <ReflectiveLiquid resolution={cfg.reflector} /> : <LiteLiquid />}
      <Dust count={cfg.dust} />
    </>
  );
}

export { LIQUID_Y };
