import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide, Mesh, ShaderMaterial, SphereGeometry } from 'three'
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
uniform float uStars;
uniform float uAurora;
varying vec3 vWorldPos;

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

vec3 stars(vec3 dir) {
  vec3 col = vec3(0.0);
  for (int layer = 0; layer < 2; layer++) {
    float scale = layer == 0 ? 180.0 : 340.0;
    vec3 d = dir * scale;
    vec3 id = floor(d);
    vec3 f = fract(d) - 0.5;
    float h = hash13(id + float(layer) * 17.0);
    if (h > (layer == 0 ? 0.988 : 0.975)) {
      vec3 jitter = vec3(hash13(id + 1.3), hash13(id + 2.7), hash13(id + 4.1)) - 0.5;
      float dd = length(f - jitter * 0.6);
      float size = layer == 0 ? 0.11 : 0.07;
      float s = smoothstep(size, 0.0, dd);
      float tw = 0.65 + 0.35 * sin(uTime * (1.0 + h * 3.0) + h * 40.0);
      vec3 tint = mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.86, 0.7), hash13(id + 9.0));
      col += tint * s * tw * (layer == 0 ? 1.6 : 0.8);
    }
  }
  return col;
}

vec3 aurora(vec3 dir) {
  if (dir.y < 0.02) return vec3(0.0);
  vec2 uv = dir.xz / (dir.y + 0.18);
  vec3 col = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float t = uTime * (0.025 + fi * 0.01);
    float center = -2.4 - fi * 0.9 + sin(uv.x * 0.55 + t * 2.0 + fi) * 0.45 + fbm(vec2(uv.x * 0.35 + t, fi * 3.1)) * 0.6;
    float d = uv.y - center;
    // Sharp edge toward the horizon, soft curtain trailing up into the sky.
    float band = d < 0.0 ? exp(d * (14.0 + fi * 4.0)) : exp(-d * (3.2 + fi));
    float rays = pow(0.5 + 0.5 * snoise(vec2(uv.x * 7.0 + fi * 11.0, t * 4.0)), 2.0);
    float shape = band * (0.35 + 0.9 * rays);
    vec3 green = vec3(0.18, 1.0, 0.62);
    vec3 violet = vec3(0.55, 0.25, 0.9);
    vec3 c = mix(green, violet, smoothstep(-0.05, 0.6, -d) * 0.7 + fi * 0.12);
    col += c * shape * (0.32 - fi * 0.08);
  }
  float horizonFade = smoothstep(0.02, 0.18, dir.y) * (1.0 - smoothstep(0.75, 1.0, dir.y));
  return col * horizonFade;
}

void main() {
  vec3 dir = normalize(vWorldPos - cameraPosition);
  float y = dir.y;
  vec3 horizon = mix(uSkyHorizon, uFogColor, 0.35);
  vec3 col = mix(horizon, uSkyTop, pow(smoothstep(-0.02, 0.65, y), 0.75));
  // Below the horizon dissolve into fog so the terrain edge disappears.
  col = mix(col, fogTint(dir), smoothstep(0.04, -0.06, y));

  float sd = max(dot(dir, uSunDir), 0.0);
  float sunUp = smoothstep(-0.3, 0.02, uSunDir.y);
  col += uSunColor * (pow(sd, 8.0) * 0.28 + pow(sd, 90.0) * 0.6) * sunUp;
  col += uSunColor * smoothstep(0.99978, 0.99992, sd) * 5.0 * sunUp;

  col += stars(dir) * uStars * smoothstep(0.0, 0.25, y);
  col += aurora(dir) * uAurora;

  col = mix(col, uFogColor * 1.4 + uSunColor * 0.1, uVeil * 0.7);
  gl_FragColor = vec4(tonemap(col), 1.0);
  #include <colorspace_fragment>
}
`

export function Sky() {
  const ref = useRef<Mesh>(null)
  const geometry = useMemo(() => new SphereGeometry(900, 48, 24), [])
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: shared,
        side: BackSide,
        depthWrite: false,
      }),
    [],
  )

  useFrame(({ camera }) => {
    ref.current?.position.copy(camera.position)
  })

  return <mesh ref={ref} geometry={geometry} material={material} renderOrder={-10} frustumCulled={false} />
}
