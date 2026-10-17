import { useMemo } from 'react'
import { PlaneGeometry, ShaderMaterial } from 'three'
import { heightGLSL, noiseGLSL } from './shaders/noise'
import { atmosphereGLSL, shared } from './uniforms'

const SIZE = 420

const vertex = /* glsl */ `
${noiseGLSL}
${heightGLSL}
varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vHeight;

void main() {
  vec3 pos = (modelMatrix * vec4(position, 1.0)).xyz;
  float e = 0.9;
  float h = worldHeight(pos.xz);
  float hx = worldHeight(pos.xz + vec2(e, 0.0));
  float hz = worldHeight(pos.xz + vec2(0.0, e));
  vNormal = normalize(vec3(h - hx, e, h - hz));
  pos.y = h;
  vHeight = h;
  vWorldPos = pos;
  gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
}
`

const fragment = /* glsl */ `
${atmosphereGLSL}
uniform vec3 uTerrainLow;
uniform vec3 uTerrainMid;
uniform vec3 uTerrainHigh;
uniform float uAmplitude;
uniform float uDunes;
uniform float uAurora;
varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vHeight;

void main() {
  vec3 n = normalize(vNormal);
  float slope = 1.0 - n.y;
  float amp = max(uAmplitude, 0.2);

  // Mountains: emerald valleys, dark rock on steep faces, snow on high gentle ground.
  vec3 col = mix(uTerrainLow, uTerrainMid, smoothstep(-6.0, 10.0 * amp, vHeight));
  col = mix(col, uTerrainLow * 0.8 + uTerrainMid * 0.25, smoothstep(0.35, 0.75, slope));
  float snowLine = 12.0 * amp;
  float snow = smoothstep(snowLine, snowLine + 6.0, vHeight + n.y * 4.0) * smoothstep(0.62, 0.32, slope);
  col = mix(col, uTerrainHigh, snow);

  // Dunes: warm sand with crisp, lit crests.
  vec3 sand = mix(uTerrainMid, uTerrainHigh, smoothstep(-2.0, 14.0 * amp, vHeight));
  col = mix(col, sand, uDunes);

  float diffuse = max(dot(n, uSunDir), 0.0);
  float sunUp = smoothstep(-0.2, 0.05, uSunDir.y);
  vec3 sky = mix(uFogColor * 0.7, uSkyTop * 1.6 + uSkyHorizon * 0.25, n.y * 0.5 + 0.5);
  vec3 light = sky * 0.75 + uSunColor * diffuse * 2.4 * sunUp;
  // Cool rim from the sky behind the ridges.
  float rim = pow(1.0 - max(dot(n, normalize(cameraPosition - vWorldPos)), 0.0), 3.0);
  light += uSkyHorizon * rim * 0.25;
  // Faint aurora wash on upward faces at night.
  light += vec3(0.12, 0.55, 0.38) * uAurora * n.y * 0.22;

  vec3 lit = col * light;
  lit = applyFog(lit, vWorldPos);
  gl_FragColor = vec4(tonemap(lit), 1.0);
  #include <colorspace_fragment>
}
`

export function Terrain({ segments }: { segments: number }) {
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
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: shared,
      }),
    [],
  )

  // Extend toward the horizon; the camera sits near the front edge.
  return <mesh geometry={geometry} material={material} position={[0, 0, -SIZE / 2 + 30]} frustumCulled={false} />
}
