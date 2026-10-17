import type { Tier } from "./store";

export type Capability = { webgl: boolean; tier: Tier; renderer: string };

function param(name: string) {
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

/** Detect WebGL support and choose a quality tier from the device's capabilities. */
export function detectCapability(): Capability {
  if (param("webgl") === "0") return { webgl: false, tier: "low", renderer: "disabled" };

  let renderer = "";
  let webgl = false;
  let maxTexture = 0;
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (gl) {
      webgl = true;
      maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    webgl = false;
  }
  if (!webgl) return { webgl: false, tier: "low", renderer };

  const forced = param("quality");
  if (forced === "high" || forced === "medium" || forced === "low") return { webgl, tier: forced, renderer };

  const r = renderer.toLowerCase();
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency || 4;
  const memory = nav.deviceMemory || 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.screen.width, window.screen.height) < 820;
  const mobile = coarse && small;

  let tier: Tier;
  if (/swiftshader|llvmpipe|software|basic render/.test(r) || maxTexture < 4096) tier = "low";
  else if (mobile) tier = memory >= 6 && cores >= 8 && /apple|adreno \(tm\) (7|8)|mali-g7|immortalis/.test(r) ? "medium" : "low";
  else if (/intel|uhd|iris|mali|adreno/.test(r) || cores < 6) tier = "medium";
  else tier = "high";

  return { webgl, tier, renderer };
}

export const TIER_CONFIG = {
  high: { dpr: [1, 2] as [number, number], dust: 2600, globeDots: 14000, wealth: 7000, network: 150, reflector: 1024, post: true, chroma: true },
  medium: { dpr: [1, 1.5] as [number, number], dust: 1400, globeDots: 9000, wealth: 4000, network: 110, reflector: 512, post: true, chroma: false },
  low: { dpr: [0.75, 1] as [number, number], dust: 500, globeDots: 5000, wealth: 1800, network: 70, reflector: 0, post: false, chroma: false },
} as const;
