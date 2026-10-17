"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { frame } from "@/lib/store";
import { S } from "@/lib/sections";
import { clamp, damp, rng } from "@/lib/math";
import { applyChapter } from "./layout";
import { Shader } from "./Shader";

const vertex = /* glsl */ `
attribute vec3 aStruct;
attribute vec3 aNet;
attribute float aRand;
uniform float uMorph;
uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;
varying float vStage;
varying float vRand;
void main(){
  float d = aRand * .35;
  float m1 = smoothstep(d, .65 + d, uMorph);
  float m2 = smoothstep(1. + d, 1.65 + d, uMorph);
  vec3 cloud = position + vec3(sin(uTime*.4 + aRand*30.), cos(uTime*.3 + aRand*20.), sin(uTime*.35 + aRand*10.)) * .12;
  vec3 p = mix(cloud, aStruct, m1);
  vec3 net = aNet * (1. + max(uMorph - 1.6, 0.) * .35) ;
  p = mix(p, net, m2);
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (.6 + aRand) * uPixelRatio * (10. / -mv.z);
  vStage = m1 + m2;
  vRand = aRand;
}`;
const fragment = /* glsl */ `
uniform float uOpacity;
varying float vStage;
varying float vRand;
void main(){
  float d = length(gl_PointCoord - .5);
  float a = smoothstep(.5, .1, d);
  vec3 crimson = vec3(.9, .16, .14);
  vec3 gold = vec3(1.25, .86, .5);
  vec3 ivory = vec3(1.2, 1.05, .9);
  vec3 c = mix(crimson, gold, clamp(vStage, 0., 1.));
  c = mix(c, mix(gold, ivory, vRand), clamp(vStage - 1., 0., 1.));
  gl_FragColor = vec4(c * a * uOpacity * (.5 + vRand*.7), 1.);
}`;

/** "Make your money move": scattered particles organise into growth, then a network. */
export function ChapterWealth({ count }: { count: number }) {
  const { gl } = useThree();
  const group = useRef<THREE.Group>(null);
  const lines = useRef<THREE.LineBasicMaterial>(null);
  const linesObj = useRef<THREE.LineSegments>(null);

  const { geo, edgeGeo } = useMemo(() => {
    const r = rng(99);
    const cloud = new Float32Array(count * 3);
    const struct = new Float32Array(count * 3);
    const net = new Float32Array(count * 3);
    const rand = new Float32Array(count);

    // growth structure: 14 bars on a spiral, each taller than the last
    const BARS = 14;
    const barPts: number[] = [];
    for (let b = 0; b < BARS; b++) {
      const a = (b / BARS) * Math.PI * 2;
      const cx = Math.cos(a) * 1.15;
      const cz = Math.sin(a) * 1.15;
      const h = 0.35 + (b / (BARS - 1)) * 2.4;
      const w = 0.09;
      const corners = [[-w, -w], [w, -w], [w, w], [-w, w]];
      barPts.push(cx, cz, h, w, corners.length);
    }
    const ico = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.1, 1));
    const seg = ico.attributes.position.array as Float32Array;
    const segCount = seg.length / 6;

    for (let i = 0; i < count; i++) {
      // cloud: soft sphere
      const u = r() * 2 - 1;
      const th = r() * Math.PI * 2;
      const rad = 2.7 * Math.cbrt(r());
      const s = Math.sqrt(1 - u * u);
      cloud.set([Math.cos(th) * s * rad, u * rad * 0.8, Math.sin(th) * s * rad], i * 3);

      // structure: points on bar edges + caps
      const b = i % BARS;
      const cx = barPts[b * 5];
      const cz = barPts[b * 5 + 1];
      const h = barPts[b * 5 + 2];
      const w = barPts[b * 5 + 3];
      const e = Math.floor(r() * 4);
      const corner = [[-w, -w], [w, -w], [w, w], [-w, w]][e];
      const onCap = r() < 0.25;
      const y = onCap ? h : r() * h;
      const ox = onCap ? (r() * 2 - 1) * w : corner[0];
      const oz = onCap ? (r() * 2 - 1) * w : corner[1];
      struct.set([cx + ox, y - 1.4, cz + oz], i * 3);

      // network: along icosahedron edges
      const k = Math.floor(r() * segCount);
      const t = r();
      net.set(
        [
          seg[k * 6] + (seg[k * 6 + 3] - seg[k * 6]) * t,
          seg[k * 6 + 1] + (seg[k * 6 + 4] - seg[k * 6 + 1]) * t,
          seg[k * 6 + 2] + (seg[k * 6 + 5] - seg[k * 6 + 2]) * t,
        ],
        i * 3,
      );
      rand[i] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(cloud, 3));
    g.setAttribute("aStruct", new THREE.BufferAttribute(struct, 3));
    g.setAttribute("aNet", new THREE.BufferAttribute(net, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
    return { geo: g, edgeGeo: ico };
  }, [count]);

  useEffect(() => () => { geo.dispose(); edgeGeo.dispose(); }, [geo, edgeGeo]);

  const uniforms = useMemo(
    () => ({ uMorph: { value: 0 }, uTime: { value: 0 }, uPixelRatio: { value: 1 }, uSize: { value: 2.6 }, uOpacity: { value: 1 } }),
    [],
  );

  useFrame((_, dt) => {
    const g = group.current;
    if (!g || !applyChapter(g, S.wealth, [1.45, 0.45, 0], [0, 1.3, 0], 0.9, 0.7)) return;
    const lp = frame.lp[S.wealth] || 0;
    const morph = clamp((lp - 0.08) / 0.34) + clamp((lp - 0.52) / 0.34);
    uniforms.uMorph.value = damp(uniforms.uMorph.value, morph, 3.5, dt);
    uniforms.uTime.value = frame.time;
    uniforms.uPixelRatio.value = gl.getPixelRatio();
    const m2 = clamp(uniforms.uMorph.value - 1.2);
    if (lines.current) lines.current.opacity = m2 * 0.35;
    if (linesObj.current) linesObj.current.scale.setScalar(1 + Math.max(uniforms.uMorph.value - 1.6, 0) * 0.35);
    g.rotation.y = frame.time * 0.08 + frame.pointerSmooth.x * 0.2;
    g.rotation.x = -frame.pointerSmooth.y * 0.08;
  });

  return (
    <group ref={group} visible={false}>
      <points geometry={geo} frustumCulled={false}>
        <Shader vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <lineSegments ref={linesObj} geometry={edgeGeo}>
        <lineBasicMaterial ref={lines} color="#d2ad72" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
    </group>
  );
}
