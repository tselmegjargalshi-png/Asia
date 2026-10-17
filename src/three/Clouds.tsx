import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, Group, PlaneGeometry, ShaderMaterial } from 'three'
import { noiseGLSL } from './shaders/noise'
import { atmosphereGLSL, shared } from './uniforms'

const vertex = /* glsl */ `
varying vec3 vWorldPos;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const fragment = /* glsl */ `
${noiseGLSL}
${atmosphereGLSL}
uniform vec2 uOffset;
uniform float uClouds;
uniform float uSeed;
uniform float uCover;
varying vec3 vWorldPos;

void main() {
  vec2 p = (vWorldPos.xz + uOffset * 0.6) * 0.012 + uSeed;
  float n = fbm(p + vec2(uTime * 0.006, uTime * 0.004));
  float detail = fbm(p * 3.1 - uTime * 0.01) * 0.35;
  float density = smoothstep(uCover, uCover + 0.45, n + detail);

  vec3 toFrag = vWorldPos - cameraPosition;
  float dist = length(toFrag);
  vec3 v = toFrag / dist;
  // Fade with distance and when the camera is about to cross the layer.
  float near = smoothstep(2.0, 14.0, abs(cameraPosition.y - vWorldPos.y));
  float far = 1.0 - smoothstep(180.0, 360.0, dist);
  float alpha = density * uClouds * near * far * 0.7;
  if (alpha < 0.004) discard;

  float sunUp = smoothstep(-0.25, 0.08, uSunDir.y);
  float forward = pow(max(dot(v, uSunDir), 0.0), 4.0);
  vec3 base = mix(uFogColor * 1.1, uSkyHorizon * 1.2, 0.5);
  vec3 lit = base * 0.8 + uSunColor * (0.18 + forward * 0.9) * sunUp * (1.0 - density * 0.5);
  lit = mix(lit, fogTint(v), smoothstep(80.0, 320.0, dist) * 0.6);
  gl_FragColor = vec4(tonemap(lit), alpha);
  #include <colorspace_fragment>
}
`

export function Clouds({ layers }: { layers: number }) {
  const group = useRef<Group>(null)
  const geometry = useMemo(() => new PlaneGeometry(760, 760, 1, 1).rotateX(-Math.PI / 2), [])
  const items = useMemo(
    () =>
      Array.from({ length: layers }, (_, i) => {
        const material = new ShaderMaterial({
          vertexShader: vertex,
          fragmentShader: fragment,
          uniforms: { ...shared, uSeed: { value: i * 7.31 }, uCover: { value: 0.05 + (i % 3) * 0.07 } },
          transparent: true,
          depthWrite: false,
          side: DoubleSide,
        })
        return { material, y: 24 + i * (40 / Math.max(layers - 1, 1)) }
      }),
    [layers],
  )

  useFrame(({ camera }) => {
    if (!group.current) return
    group.current.position.x = camera.position.x
    group.current.visible = shared.uClouds.value > 0.01
  })

  return (
    <group ref={group}>
      {items.map((it, i) => (
        <mesh
          key={i}
          geometry={geometry}
          material={it.material}
          position={[0, it.y, -260]}
          renderOrder={2}
          frustumCulled={false}
        />
      ))}
    </group>
  )
}
