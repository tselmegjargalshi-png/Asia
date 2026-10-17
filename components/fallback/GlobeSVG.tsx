"use client";

import { useEffect, useState } from "react";
import { CITIES, sampleGlobe } from "@/lib/geo";

/** Orthographic dotted globe for devices without WebGL, centred on Asia. */
export function GlobeSVG() {
  const [dots, setDots] = useState<{ land: [number, number][]; cities: [number, number, string][] } | null>(null);
  useEffect(() => {
    const { land } = sampleGlobe(5000);
    const lon0 = (105 * Math.PI) / 180;
    const lat0 = (28 * Math.PI) / 180;
    const project = (x: number, y: number, z: number): [number, number] | null => {
      const lat = Math.asin(y);
      const lon = Math.atan2(z, -x) - Math.PI;
      const cosc = Math.sin(lat0) * Math.sin(lat) + Math.cos(lat0) * Math.cos(lat) * Math.cos(lon - lon0);
      if (cosc < 0) return null;
      return [Math.cos(lat) * Math.sin(lon - lon0), Math.cos(lat0) * Math.sin(lat) - Math.sin(lat0) * Math.cos(lat) * Math.cos(lon - lon0)];
    };
    const out: [number, number][] = [];
    for (let i = 0; i < land.length; i += 3) {
      const p = project(land[i], land[i + 1], land[i + 2]);
      if (p) out.push(p);
    }
    const cities: [number, number, string][] = [];
    CITIES.forEach((c) => {
      const lat = (c.lat * Math.PI) / 180;
      const lon = (c.lon * Math.PI) / 180;
      const cosc = Math.sin(lat0) * Math.sin(lat) + Math.cos(lat0) * Math.cos(lat) * Math.cos(lon - lon0);
      if (cosc < 0) return;
      cities.push([Math.cos(lat) * Math.sin(lon - lon0), Math.cos(lat0) * Math.sin(lat) - Math.sin(lat0) * Math.cos(lat) * Math.cos(lon - lon0), c.code]);
    });
    setDots({ land: out, cities });
  }, []);
  return (
    <svg viewBox="-1.1 -1.1 2.2 2.2" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="g-atmo" r="0.5">
          <stop offset="0.86" stopColor="#d8473f" stopOpacity="0" />
          <stop offset="0.93" stopColor="#d8473f" stopOpacity="0.35" />
          <stop offset="1" stopColor="#d8473f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="1.08" fill="url(#g-atmo)" />
      <circle r="1" fill="#0b0506" stroke="#3a1414" strokeWidth="0.004" />
      {dots?.land.map(([x, y], i) => <circle key={i} cx={x} cy={-y} r="0.006" fill="#e7cfa3" opacity="0.8" />)}
      {dots?.cities.map(([x, y, code]) => (
        <g key={code}>
          <circle cx={x} cy={-y} r="0.016" fill="#ffcf9a" />
          <text x={x + 0.03} y={-y + 0.01} fontSize="0.045" fill="#efe7da" fontFamily="monospace">{code}</text>
        </g>
      ))}
    </svg>
  );
}
