import { Color, Vector2, Vector3 } from 'three'

/**
 * One uniform bag shared by every world material, so a single update per frame
 * keeps sky, terrain, water, clouds and dust in the same light.
 */
export const shared = {
  uTime: { value: 0 },
  uOffset: { value: new Vector2() },
  uAmplitude: { value: 1 },
  uDunes: { value: 0 },
  uWater: { value: -2 },
  uSunDir: { value: new Vector3(0, 0.1, -1).normalize() },
  uSunColor: { value: new Color() },
  uSkyTop: { value: new Color() },
  uSkyHorizon: { value: new Color() },
  uFogColor: { value: new Color() },
  uFogDensity: { value: 0.01 },
  uTerrainLow: { value: new Color() },
  uTerrainMid: { value: new Color() },
  uTerrainHigh: { value: new Color() },
  uWaterDeep: { value: new Color() },
  uWaterShallow: { value: new Color() },
  uStars: { value: 0 },
  uAurora: { value: 0 },
  uClouds: { value: 0 },
  uExposure: { value: 1 },
  uDustColor: { value: new Color() },
  /** Extra veil while the camera is inside the cloud deck during the intro. */
  uVeil: { value: 0 },
}

/** Fog, sun scattering and tone mapping shared by world fragment shaders. */
export const atmosphereGLSL = /* glsl */ `
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uSkyTop;
uniform vec3 uSkyHorizon;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uExposure;
uniform float uVeil;
uniform float uTime;

vec3 fogTint(vec3 viewDir) {
  float sunAmt = pow(max(dot(viewDir, uSunDir), 0.0), 6.0);
  return uFogColor + uSunColor * sunAmt * 0.22 * smoothstep(-0.25, 0.1, uSunDir.y);
}

vec3 applyFog(vec3 col, vec3 worldPos) {
  vec3 toFrag = worldPos - cameraPosition;
  float dist = length(toFrag);
  vec3 viewDir = toFrag / dist;
  float density = uFogDensity * (1.0 + uVeil * 3.0);
  float f = 1.0 - exp(-pow(dist * density, 1.6));
  // Low lying mist pooled in valleys.
  float ground = exp(-max(worldPos.y + 2.0, 0.0) * 0.12) * 0.35 * smoothstep(20.0, 140.0, dist);
  f = clamp(f + ground, 0.0, 1.0);
  // Hide the far edge of the world.
  f = max(f, smoothstep(230.0, 360.0, dist));
  return mix(col, fogTint(viewDir), f);
}

vec3 tonemap(vec3 c) {
  c *= uExposure;
  // Filmic curve (Narkowicz ACES fit), gentle on highlights.
  c = (c * (2.51 * c + 0.03)) / (c * (2.43 * c + 0.59) + 0.14);
  return clamp(c, 0.0, 1.0);
}
`
