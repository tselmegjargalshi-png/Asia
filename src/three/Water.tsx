import { useMemo } from 'react'
import { PlaneGeometry, ShaderMaterial } from 'three'
import { heightGLSL, noiseGLSL } from './shaders/noise'
import { atmosphereGLSL, shared } from './uniforms'

const SIZE = 420

const vertex = /* glsl */ `
${noiseGLSL}
${heightGLSL}
uniform float uWater;
varying vec3 vWorldPos;
varying float vDepth;

void main() {
  vec3 pos = (modelMatrix * vec4(position, 1.0)).xyz;
  pos.y = uWater;
  vDepth = uWater - worldHeight(pos.xz);
  vWorldPos = pos;
  gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
}
`

const fragment = /* glsl */ `
${noiseGLSL}
${atmosphereGLSL}
uniform vec3 uWaterDeep;
uniform vec3 uWaterShallow;
uniform vec2 uOffset;
uniform float uStars;
varying vec3 vWorldPos;
varying float vDepth;

float waves(vec2 p) {
  float t = uTime;
  return snoise(p * 0.18 + vec2(t * 0.05, t * 0.08)) * 0.6
       + snoise(p * 0.45 - vec2(t * 0.11, -t * 0.04)) * 0.3
       + snoise(p * 1.2 + vec2(t * 0.2, t * 0.15)) * 0.1;
}

void main() {
  vec2 p = vWorldPos.xz + uOffset;
  float e = 0.2;
  float w = waves(p);
  vec3 n = normalize(vec3((w - waves(p + vec2(e, 0.0))) * 1.6, 1.0, (w - waves(p + vec2(0.0, e))) * 1.6));

  vec3 toFrag = vWorldPos - cameraPosition;
  float dist = length(toFrag);
  vec3 v = toFrag / dist;
  vec3 r = reflect(v, n);

  vec3 skyRefl = mix(mix(uSkyHorizon, uFogColor, 0.4), uSkyTop, smoothstep(0.0, 0.5, r.y));
  float spec = pow(max(dot(r, uSunDir), 0.0), 220.0) * 6.0 + pow(max(dot(r, uSunDir), 0.0), 18.0) * 0.35;
  spec *= smoothstep(-0.15, 0.05, uSunDir.y);
  float fresnel = 0.04 + 0.96 * pow(1.0 - max(dot(-v, n), 0.0), 5.0);

  float shallow = 1.0 - smoothstep(0.0, 5.5, vDepth);
  vec3 body = mix(uWaterDeep, uWaterShallow, shallow * 0.9 + 0.1);
  body *= 0.55 + 0.45 * max(uSunDir.y + 0.2, 0.0) * 2.0;
  // Breaking foam where reefs reach the surface.
  float foam = smoothstep(0.55, 0.0, vDepth) * (0.6 + 0.4 * snoise(p * 0.9 + uTime * 0.3));
  vec3 col = mix(body, skyRefl, fresnel) + uSunColor * spec;
  col = mix(col, vec3(0.9, 0.97, 0.95) * (0.5 + 0.5 * max(uSunDir.y, 0.0)), clamp(foam, 0.0, 1.0) * 0.32 * smoothstep(-0.1, 0.2, uSunDir.y));
  // Starlight shimmer on calm night water.
  col += vec3(0.6, 0.9, 0.85) * uStars * pow(max(n.x * 3.0, 0.0), 8.0) * 0.02;

  col = applyFog(col, vWorldPos);
  gl_FragColor = vec4(tonemap(col), 1.0);
  #include <colorspace_fragment>
}
`

export function Water({ segments }: { segments: number }) {
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(SIZE, SIZE, segments, segments)
    g.rotateX(-Math.PI / 2)
    // Pack rows toward the camera so near ground stays smooth.
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const d = (SIZE / 2 - pos.getZ(i)) / SIZE
      pos.setZ(i, SIZE / 2 - Math.pow(d, 1.45) * SIZE)
    }
    g.computeBoundingSphere()
    return g
  }, [segments])

  const material = useMemo(
    () => new ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms: shared }),
    [],
  )

  return <mesh geometry={geometry} material={material} position={[0, 0, -SIZE / 2 + 30]} frustumCulled={false} />
}
