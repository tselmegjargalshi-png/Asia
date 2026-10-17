"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { frame } from "@/lib/store";
import { S } from "@/lib/sections";
import { damp } from "@/lib/math";
import { CITIES, ROUTES, latLonToVec, sampleGlobe } from "@/lib/geo";
import { applyChapter } from "./layout";
import { Shader } from "./Shader";

const R = 1.6;

const dotVertex = /* glsl */ `
uniform float uPixelRatio;
uniform float uSize;
varying float vFacing;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.);
  vec3 n = normalize(normalMatrix * normalize(position));
  vFacing = dot(n, normalize(-mv.xyz));
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (10. / -mv.z);
}`;
const dotFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vFacing;
void main(){
  float d = length(gl_PointCoord - .5);
  float a = smoothstep(.5, .25, d);
  float f = smoothstep(-.1, .5, vFacing);
  gl_FragColor = vec4(uColor * a * f * uOpacity, 1.);
}`;

const atmoVertex = /* glsl */ `
varying vec3 vN; varying vec3 vV;
void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`;
const atmoFragment = /* glsl */ `
uniform vec3 uColor; uniform float uPower; uniform float uOpacity;
varying vec3 vN; varying vec3 vV;
void main(){ float f = pow(1. - max(dot(vN, vV), 0.), uPower); gl_FragColor = vec4(uColor * f * uOpacity, 1.); }`;

const arcVertex = /* glsl */ `
varying float vT;
void main(){ vT = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`;
const arcFragment = /* glsl */ `
uniform float uTime; uniform float uOffset; uniform vec3 uColor; uniform float uOpacity;
varying float vT;
void main(){
  float head = fract(uTime * .18 + uOffset);
  float d = vT - head; if (d > 0.) d -= 1.;
  float pulse = exp(d * 9.) ;
  float a = .12 + pulse * 1.4;
  gl_FragColor = vec4(uColor * a * uOpacity, 1.);
}`;

/** "Global": a dotted sculptural globe, turned towards Asia, with glowing routes. */
export function ChapterGlobe({ dots }: { dots: number }) {
  const { gl, camera } = useThree();
  const group = useRef<THREE.Group>(null);
  const globe = useRef<THREE.Group>(null);
  const rot = useRef({ y: 0, x: 0 });

  const data = useMemo(() => {
    const { land, ocean } = sampleGlobe(dots);
    const landGeo = new THREE.BufferGeometry();
    landGeo.setAttribute("position", new THREE.BufferAttribute(land.map((v) => v * R * 1.002), 3));
    const oceanGeo = new THREE.BufferGeometry();
    oceanGeo.setAttribute("position", new THREE.BufferAttribute(ocean.map((v) => v * R), 3));
    const byName = Object.fromEntries(CITIES.map((c) => [c.name, c]));
    const arcs = ROUTES.map(([a, b], i) => {
      const A = new THREE.Vector3(...latLonToVec(byName[a].lat, byName[a].lon, R));
      const B = new THREE.Vector3(...latLonToVec(byName[b].lat, byName[b].lon, R));
      const mid = A.clone().add(B).multiplyScalar(0.5);
      const lift = 1 + A.distanceTo(B) * 0.22;
      mid.normalize().multiplyScalar(R * lift);
      const curve = new THREE.QuadraticBezierCurve3(A, mid, B);
      return { geo: new THREE.TubeGeometry(curve, 96, 0.0065, 6, false), offset: i * 0.137 };
    });
    const cities = CITIES.map((c) => ({ ...c, pos: new THREE.Vector3(...latLonToVec(c.lat, c.lon, R * 1.01)) }));
    return { landGeo, oceanGeo, arcs, cities };
  }, [dots]);

  useEffect(
    () => () => {
      data.landGeo.dispose();
      data.oceanGeo.dispose();
      data.arcs.forEach((a) => a.geo.dispose());
    },
    [data],
  );

  const landU = useMemo(() => ({ uPixelRatio: { value: 1 }, uSize: { value: 1.7 }, uColor: { value: new THREE.Color(1.25, 0.95, 0.7) }, uOpacity: { value: 1 } }), []);
  const oceanU = useMemo(() => ({ uPixelRatio: { value: 1 }, uSize: { value: 1.4 }, uColor: { value: new THREE.Color(0.45, 0.12, 0.13) }, uOpacity: { value: 1 } }), []);
  const atmoU = useMemo(() => ({ uColor: { value: new THREE.Color(1.2, 0.18, 0.15) }, uPower: { value: 3.2 }, uOpacity: { value: 1 } }), []);
  const arcU = useMemo(
    () => data.arcs.map((a) => ({ uTime: { value: 0 }, uOffset: { value: a.offset }, uColor: { value: new THREE.Color(1.6, 1.0, 0.55) }, uOpacity: { value: 1 } })),
    [data],
  );

  const v = new THREE.Vector3();
  const camDir = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  const gq = new THREE.Quaternion();

  useFrame((_, dt) => {
    const g = group.current;
    const pres = g ? applyChapter(g, S.global, [1.5, 0.3, 0], [0, 1.3, 0], 0.8, 0.74) : 0;
    if (!g || !pres) {
      data.cities.forEach((c) => {
        const el = frame.anchors.get("city-" + c.code);
        if (el) el.dataset.visible = "false";
      });
      return;
    }
    const pr = gl.getPixelRatio();
    landU.uPixelRatio.value = oceanU.uPixelRatio.value = pr;
    const lp = frame.lp[S.global] || 0;
    // focus moves from East Asia towards the west as you read, then the user can drag
    const focusLon = 128 - lp * 70;
    const focusLat = 32 - lp * 6;
    const fv = latLonToVec(focusLat, focusLon, 1);
    const targetY = -Math.atan2(fv[0], fv[2]) + frame.globeDrag.y + Math.sin(frame.time * 0.15) * 0.06;
    frame.globeDrag.y += frame.globeDrag.vy * dt * 60;
    frame.globeDrag.vy *= Math.pow(0.92, dt * 60);
    rot.current.y = damp(rot.current.y, targetY, 2.2, dt);
    rot.current.x = damp(rot.current.x, (focusLat * Math.PI) / 180 * 0.85 - frame.pointerSmooth.y * 0.1, 2.2, dt);
    if (globe.current) {
      globe.current.rotation.set(rot.current.x, rot.current.y, 0, "XYZ");
    }
    arcU.forEach((u) => (u.uTime.value = frame.time));

    // project city labels into the DOM
    camera.getWorldDirection(camDir);
    if (globe.current) globe.current.getWorldQuaternion(gq);
    data.cities.forEach((c) => {
      const el = frame.anchors.get("city-" + c.code);
      if (!el || !globe.current) return;
      v.copy(c.pos);
      globe.current.localToWorld(v);
      nrm.copy(c.pos).normalize().applyQuaternion(gq);
      const facing = -nrm.dot(camDir);
      v.project(camera);
      el.style.transform = `translate3d(${((v.x * 0.5 + 0.5) * frame.vw).toFixed(1)}px, ${((-v.y * 0.5 + 0.5) * frame.vh).toFixed(1)}px, 0)`;
      el.dataset.visible = pres > 0.9 && facing > 0.15 ? "true" : "false";
    });
  });

  return (
    <group ref={group} visible={false}>
      <group ref={globe}>
        <mesh>
          <sphereGeometry args={[R * 0.985, 64, 64]} />
          <meshStandardMaterial color="#090405" roughness={0.6} metalness={0.3} />
        </mesh>
        <points geometry={data.oceanGeo}>
          <Shader vertexShader={dotVertex} fragmentShader={dotFragment} uniforms={oceanU} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
        <points geometry={data.landGeo}>
          <Shader vertexShader={dotVertex} fragmentShader={dotFragment} uniforms={landU} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
        {data.arcs.map((a, i) => (
          <mesh key={i} geometry={a.geo}>
            <Shader vertexShader={arcVertex} fragmentShader={arcFragment} uniforms={arcU[i]} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        ))}
        {data.cities.map((c) => (
          <mesh key={c.code} position={c.pos}>
            <sphereGeometry args={[0.022, 16, 16]} />
            <meshBasicMaterial color={[2.4, 1.7, 1.0]} toneMapped={false} />
          </mesh>
        ))}
        {[0.5, -0.5, 0].map((lat, i) => (
          <mesh key={i} rotation-x={Math.PI / 2} position-y={Math.sin(lat) * R * 1.06}>
            <torusGeometry args={[Math.cos(lat) * R * 1.06, 0.0025, 6, 200]} />
            <meshBasicMaterial color="#6b2a2a" transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
      <mesh scale={1.035}>
        <sphereGeometry args={[R, 64, 64]} />
        <Shader vertexShader={atmoVertex} fragmentShader={atmoFragment} uniforms={atmoU} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}
