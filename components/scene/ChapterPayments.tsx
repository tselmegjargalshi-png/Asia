"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { frame } from "@/lib/store";
import { S } from "@/lib/sections";
import { clamp, rng } from "@/lib/math";
import { applyChapter } from "./layout";

const TRAIL = 70;

const pointVertex = /* glsl */ `
attribute float aSize;
attribute float aGlow;
uniform float uPixelRatio;
varying float vGlow;
void main(){
  vec4 mv = modelViewMatrix * vec4(position,1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uPixelRatio * (10. / -mv.z);
  vGlow = aGlow;
}`;
const pointFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uHot;
uniform float uOpacity;
varying float vGlow;
void main(){
  float d = length(gl_PointCoord - .5);
  float a = smoothstep(.5, .0, d); a *= a;
  vec3 c = mix(uColor, uHot, vGlow);
  gl_FragColor = vec4(c * a * (0.5 + vGlow*2.5) * uOpacity, 1.);
}`;

/** "PERSON → ASIA → WORLD": a transaction travels through a living network. */
export function ChapterPayments({ nodes }: { nodes: number }) {
  const { gl } = useThree();
  const group = useRef<THREE.Group>(null);
  const asiaRing = useRef<THREE.Mesh>(null);
  const world = useRef<THREE.Group>(null);

  const data = useMemo(() => {
    const r = rng(42);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < nodes; i++) {
      const a = r() * Math.PI * 2;
      const rad = 0.6 + Math.pow(r(), 0.7) * 3.4;
      pts.push(new THREE.Vector3(Math.cos(a) * rad * 1.2, (r() - 0.5) * 2.2, Math.sin(a) * rad * 0.7 - 0.5));
    }
    // nearest-neighbour edges
    const edges: number[] = [];
    const pairs: [number, number][] = [];
    pts.forEach((p, i) => {
      const near = pts
        .map((q, j) => ({ j, d: p.distanceToSquared(q) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      near.forEach(({ j }) => {
        if (i < j) {
          edges.push(p.x, p.y, p.z, pts[j].x, pts[j].y, pts[j].z);
          pairs.push([i, j]);
        }
      });
    });
    const nodeGeo = new THREE.BufferGeometry().setFromPoints(pts);
    nodeGeo.setAttribute("aSize", new THREE.BufferAttribute(Float32Array.from(pts.map(() => 2 + r() * 4)), 1));
    nodeGeo.setAttribute("aGlow", new THREE.BufferAttribute(new Float32Array(pts.length), 1));
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(edges), 3));

    const person = new THREE.Vector3(-2.7, -0.2, 0.6);
    const asia = new THREE.Vector3(0, 0.25, 0);
    const worldP = new THREE.Vector3(2.7, -0.1, 0.4);
    const curve = new THREE.CatmullRomCurve3([
      person,
      new THREE.Vector3(-1.6, 0.9, 0.5),
      new THREE.Vector3(-0.7, 0.55, 0.2),
      asia,
      new THREE.Vector3(0.8, -0.35, 0.3),
      new THREE.Vector3(1.8, 0.8, 0.5),
      worldP,
    ]);
    const tube = new THREE.TubeGeometry(curve, 240, 0.006, 6, false);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TRAIL * 3), 3));
    trailGeo.setAttribute("aSize", new THREE.BufferAttribute(Float32Array.from({ length: TRAIL }, (_, i) => 14 * Math.pow(1 - i / TRAIL, 1.6) + 1), 1));
    trailGeo.setAttribute("aGlow", new THREE.BufferAttribute(Float32Array.from({ length: TRAIL }, (_, i) => Math.pow(1 - i / TRAIL, 2)), 1));
    // ambient pulses along random edges
    const pulseCount = Math.min(40, pairs.length);
    const pulseGeo = new THREE.BufferGeometry();
    pulseGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pulseCount * 3), 3));
    pulseGeo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(pulseCount).fill(5), 1));
    pulseGeo.setAttribute("aGlow", new THREE.BufferAttribute(new Float32Array(pulseCount).fill(0.6), 1));
    const pulses = Array.from({ length: pulseCount }, () => ({ pair: pairs[Math.floor(r() * pairs.length)], t: r(), speed: 0.15 + r() * 0.35 }));
    return { pts, pairs, nodeGeo, edgeGeo, curve, tube, trailGeo, pulseGeo, pulses, person, asia, worldP };
  }, [nodes]);

  useEffect(
    () => () => {
      data.nodeGeo.dispose();
      data.edgeGeo.dispose();
      data.tube.dispose();
      data.trailGeo.dispose();
      data.pulseGeo.dispose();
    },
    [data],
  );

  const mkUniforms = (color: string, hot: string) => ({
    uPixelRatio: { value: 1 },
    uColor: { value: new THREE.Color(color) },
    uHot: { value: new THREE.Color(hot).multiplyScalar(1.6) },
    uOpacity: { value: 1 },
  });
  const nodeU = useMemo(() => mkUniforms("#a8323e", "#ffd7a0"), []);
  const trailU = useMemo(() => mkUniforms("#ff6a4a", "#fff0d0"), []);
  const pulseU = useMemo(() => mkUniforms("#d2ad72", "#ffcf8a"), []);
  const tubeMat = useRef<THREE.MeshBasicMaterial>(null);
  const tmp = new THREE.Vector3();

  useFrame((_, dt) => {
    const g = group.current;
    const pres = g ? applyChapter(g, S.payments, [0.9, -0.3, 0], [0, 0.9, 0], 1.05, 0.62) : 0;
    if (!g || !pres) return;
    const pr = gl.getPixelRatio();
    nodeU.uPixelRatio.value = trailU.uPixelRatio.value = pulseU.uPixelRatio.value = pr;
    const lp = frame.lp[S.payments] || 0;
    const head = clamp((lp - 0.08) / 0.8);
    // transaction trail
    const pos = data.trailGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < TRAIL; i++) {
      const t = clamp(head - i * 0.0035);
      data.curve.getPointAt(t, tmp);
      pos.setXYZ(i, tmp.x, tmp.y, tmp.z);
    }
    pos.needsUpdate = true;
    trailU.uOpacity.value = head > 0.001 && head < 0.999 ? 1 : 0.35;

    // nodes light up as the transaction passes near them
    data.curve.getPointAt(head, tmp);
    const glow = data.nodeGeo.attributes.aGlow as THREE.BufferAttribute;
    data.pts.forEach((p, i) => {
      const d = p.distanceTo(tmp);
      const target = Math.max(0, 1 - d / 1.1);
      glow.setX(i, glow.getX(i) + (target - glow.getX(i)) * Math.min(1, dt * 4));
    });
    glow.needsUpdate = true;

    // ambient pulses
    const pp = data.pulseGeo.attributes.position as THREE.BufferAttribute;
    data.pulses.forEach((p, i) => {
      p.t += dt * p.speed;
      if (p.t > 1) {
        p.t = 0;
        p.pair = data.pairs[Math.floor(Math.random() * data.pairs.length)];
      }
      const a = data.pts[p.pair[0]];
      const b = data.pts[p.pair[1]];
      pp.setXYZ(i, a.x + (b.x - a.x) * p.t, a.y + (b.y - a.y) * p.t, a.z + (b.z - a.z) * p.t);
    });
    pp.needsUpdate = true;

    const t = frame.time;
    const reached = head > 0.5 ? 1 : 0;
    if (asiaRing.current) {
      asiaRing.current.rotation.z = t * 0.4;
      const s = 1 + Math.max(0, 1 - Math.abs(head - 0.5) * 8) * 0.25;
      asiaRing.current.scale.setScalar(s);
    }
    if (world.current) world.current.rotation.y = t * 0.2;
    if (tubeMat.current) tubeMat.current.opacity = 0.18 + reached * 0.12;
    g.rotation.y = frame.pointerSmooth.x * 0.12;
    g.rotation.x = -frame.pointerSmooth.y * 0.06;
  });

  return (
    <group ref={group} visible={false}>
      <lineSegments geometry={data.edgeGeo}>
        <lineBasicMaterial color="#7a1f2a" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
      <points geometry={data.nodeGeo} frustumCulled={false}>
        <shaderMaterial vertexShader={pointVertex} fragmentShader={pointFragment} uniforms={nodeU} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <points geometry={data.pulseGeo} frustumCulled={false}>
        <shaderMaterial vertexShader={pointVertex} fragmentShader={pointFragment} uniforms={pulseU} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <mesh geometry={data.tube}>
        <meshBasicMaterial ref={tubeMat} color={[1.6, 0.6, 0.4]} transparent opacity={0.2} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <points geometry={data.trailGeo} frustumCulled={false}>
        <shaderMaterial vertexShader={pointVertex} fragmentShader={pointFragment} uniforms={trailU} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      {/* PERSON */}
      <group position={data.person}>
        <mesh>
          <sphereGeometry args={[0.12, 32, 32]} />
          <meshStandardMaterial color="#efe3cc" metalness={0.6} roughness={0.2} emissive="#5a1a1a" />
        </mesh>
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.26, 0.006, 8, 96]} />
          <meshBasicMaterial color={[2, 1.4, 0.9]} toneMapped={false} />
        </mesh>
      </group>
      {/* ASIA */}
      <group position={data.asia}>
        <mesh ref={asiaRing}>
          <torusGeometry args={[0.55, 0.03, 24, 160]} />
          <meshStandardMaterial color="#e0bf86" metalness={1} roughness={0.18} envMapIntensity={1.8} />
        </mesh>
        <mesh position={[0.08, 0, 0]}>
          <sphereGeometry args={[0.3, 48, 48]} />
          <meshPhysicalMaterial color="#5a0f1d" roughness={0.1} clearcoat={1} emissive="#3a0508" />
        </mesh>
      </group>
      {/* WORLD */}
      <group ref={world} position={data.worldP}>
        <mesh>
          <icosahedronGeometry args={[0.42, 2]} />
          <meshBasicMaterial color="#e8cfa2" wireframe transparent opacity={0.5} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.38, 32, 32]} />
          <meshStandardMaterial color="#120809" roughness={0.3} metalness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
