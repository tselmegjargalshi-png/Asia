export const NOISE_GLSL = /* glsl */ `
float hash21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  float a = hash21(i), b = hash21(i+vec2(1.,0.)), c = hash21(i+vec2(0.,1.)), d = hash21(i+vec2(1.,1.));
  vec2 u = f*f*(3.-2.*f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.-u.x) + (d-b)*u.x*u.y;
}
float fbm(vec2 p){ float v = 0.; float a = .5; for(int i=0;i<4;i++){ v += a*vnoise(p); p *= 2.03; a *= .5; } return v; }
`;

export const haloVertex = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }
`;

export const haloFragment = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
varying vec2 vUv;
${NOISE_GLSL}
void main(){
  vec2 p = vUv - .5;
  float d = length(p) * 2.;
  float ang = atan(p.y, p.x);
  float r0 = .42;
  float n = fbm(vec2(ang * 2.2 + uTime*.04, d*3. - uTime*.12));
  float rim = exp(-pow((d - r0) / (.0065 + .004*n), 2.));
  float rimSoft = exp(-pow((d - r0) / .035, 2.));
  float corona = exp(-max(d - r0, 0.) * (11. - 4.*n)) * step(r0, d);
  float inner = smoothstep(r0, r0 - .18, d);
  // eclipse crescent: brighter on the upper-left edge
  float cres = .55 + .45 * dot(normalize(p + 1e-5), normalize(vec2(-.6,.8)));
  vec3 col = uColorB * rim * (1.3 + 1.4*cres) + uColorA * rimSoft * .55 + uColorA * corona * (.3 + .35*n) + uColorC * inner * .05 * (1. - d);
  float fade = smoothstep(1., .72, d);
  col *= fade * uIntensity;
  gl_FragColor = vec4(col, 1.);
}
`;

export const dustVertex = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uSpeed;
attribute vec3 aSeed;
varying float vAlpha;
varying float vTone;
void main(){
  vec3 p = position;
  float t = uTime * uSpeed;
  p.y = mod(p.y + t * (.05 + aSeed.x*.12) + 3.5, 9.) - 3.5;
  p.x += sin(t*.2 + aSeed.y*6.283) * .35;
  p.z += cos(t*.17 + aSeed.z*6.283) * .35;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.35 + aSeed.z) * uPixelRatio * (10. / -mv.z);
  vAlpha = (.35 + .65 * sin(t*1.3 + aSeed.x*40.)*.5+.5) * smoothstep(-3.5, -2.6, p.y) * smoothstep(5.5, 3.5, p.y);
  vTone = aSeed.y;
}
`;

export const dustFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;
varying float vAlpha;
varying float vTone;
void main(){
  float d = length(gl_PointCoord - .5);
  float a = smoothstep(.5, 0., d);
  a *= a;
  vec3 col = mix(uColorA, uColorB, vTone);
  gl_FragColor = vec4(col * a * vAlpha * uOpacity, 1.);
}
`;

/** Cheap liquid for the LOW tier: fake glitter path of reflected halo light. */
export const liteLiquidVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorld;
void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
`;

export const liteLiquidFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uGlow;
uniform float uGlowX;
uniform float uIntensity;
uniform float uRipple;
uniform vec3 uBase;
varying vec2 vUv;
varying vec3 vWorld;
${NOISE_GLSL}
void main(){
  vec2 q = vWorld.xz;
  float n = fbm(q * vec2(.9, 2.6) + vec2(0., uTime*.25)) ;
  float streak = exp(-pow((vWorld.x - uGlowX + (n-.5)*1.2*uRipple) / (0.55 + max(-vWorld.z,0.)*.12), 2.));
  float depthFade = 1. - smoothstep(-8., 8., vWorld.z);
  float glitter = smoothstep(.62, .9, n) * streak;
  vec3 col = uBase + uGlow * (streak * .22 + glitter * .9) * uIntensity * depthFade;
  gl_FragColor = vec4(col, 1.);
}
`;
