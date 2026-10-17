import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, ShaderMaterial } from 'three'
import { shared } from './uniforms'

const vertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aSeed;
varying float vAlpha;

void main() {
  vec3 p = position;
  // Slow drift with a gentle wander, wrapped inside a box around the camera.
  p.x += sin(uTime * 0.15 + aSeed * 12.0) * 1.5;
  p.y += sin(uTime * 0.21 + aSeed * 7.0) * 1.2 + uTime * 0.12 * (0.3 + aSeed);
  p.z += uTime * 1.1 * (0.4 + aSeed * 0.6);
  p = mod(p + vec3(30.0, 12.0, 60.0), vec3(60.0, 24.0, 70.0)) - vec3(30.0, 12.0, 60.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = (0.6 + aSeed * 1.6) * uPixelRatio;
  gl_PointSize = size * (40.0 / -mv.z);
  vAlpha = smoothstep(70.0, 20.0, -mv.z) * smoothstep(0.5, 4.0, -mv.z) * (0.35 + 0.65 * fract(aSeed * 13.0));
}
`

const fragment = /* glsl */ `
uniform vec3 uDustColor;
uniform float uExposure;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uDustColor * 0.9 * uExposure, a * a * vAlpha * 0.55);
  #include <colorspace_fragment>
}
`

export function Dust({ count, pixelRatio }: { count: number; pixelRatio: number }) {
  const ref = useRef<Points>(null)
  const geometry = useMemo(() => {
    const g = new BufferGeometry()
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60
      pos[i * 3 + 1] = (Math.random() - 0.5) * 24
      pos[i * 3 + 2] = -Math.random() * 70 + 10
      seed[i] = Math.random()
    }
    g.setAttribute('position', new BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new BufferAttribute(seed, 1))
    return g
  }, [count])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uTime: shared.uTime,
          uDustColor: shared.uDustColor,
          uExposure: shared.uExposure,
          uPixelRatio: { value: pixelRatio },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [pixelRatio],
  )

  useFrame(({ camera }) => {
    // Dust lives in camera space horizontally so it always surrounds the viewer.
    ref.current?.position.set(camera.position.x, camera.position.y, 0)
  })

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} renderOrder={3} />
}
