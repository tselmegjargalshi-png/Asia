/** 2D simplex noise (Ashima Arts, MIT) plus fbm helpers, shared by the world shaders. */
export const noiseGLSL = /* glsl */ `
vec3 permute3(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute3(permute3(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * snoise(p);
    p = r * p * 2.02;
    a *= 0.5;
  }
  return v;
}

float ridged(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  float prev = 1.0;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    float n = 1.0 - abs(snoise(p));
    n *= n;
    v += a * n * prev;
    prev = n;
    p = r * p * 2.05;
    a *= 0.5;
  }
  return v;
}
`

/** Height field shared by the terrain vertex shader. */
export const heightGLSL = /* glsl */ `
uniform float uAmplitude;
uniform float uDunes;
uniform vec2 uOffset;

float mountainHeight(vec2 p) {
  float r = ridged(p * 0.0085);
  float h = pow(r, 1.35) * 40.0 + fbm(p * 0.035) * 2.2;
  // Carve a valley along the flight path so the camera glides between peaks.
  float valley = smoothstep(6.0, 70.0, abs(p.x + sin(p.y * 0.012) * 18.0));
  return h * mix(0.18, 1.0, valley) - 6.0;
}

float duneHeight(vec2 p) {
  vec2 q = p + vec2(fbm(p * 0.01) * 30.0, 0.0);
  float ridge = 1.0 - abs(sin(q.x * 0.045 + q.y * 0.012));
  ridge = pow(ridge, 2.2);
  float big = fbm(p * 0.006) * 0.5 + 0.5;
  float valley = smoothstep(4.0, 55.0, abs(p.x));
  return (ridge * 7.0 + big * 16.0) * mix(0.25, 1.0, valley) - 6.0;
}

float worldHeight(vec2 xz) {
  vec2 p = xz + uOffset;
  float h = mix(mountainHeight(p), duneHeight(p), uDunes);
  return h * uAmplitude;
}
`
