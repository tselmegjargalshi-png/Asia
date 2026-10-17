"use client";

import { useEffect, useState } from "react";
import { drawBack, drawFront } from "@/lib/cardArt";
import { useUI } from "@/lib/store";

/** CSS 3D version of the card for devices without WebGL. Uses the same artwork. */
export function CardCSS({ className = "", interactive = false }: { className?: string; interactive?: boolean }) {
  const variant = useUI((s) => s.variant);
  const flipped = useUI((s) => s.flipped);
  const [art, setArt] = useState<{ front: string; back: string } | null>(null);
  const [tilt, setTilt] = useState({ x: -8, y: 14 });
  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => {
      if (alive) setArt({ front: drawFront(variant).toDataURL("image/webp", 0.9), back: drawBack(variant).toDataURL("image/webp", 0.9) });
    });
    return () => {
      alive = false;
    };
  }, [variant]);
  return (
    <div
      className={`[perspective:1400px] ${className}`}
      onPointerMove={
        interactive
          ? (e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setTilt({ x: -((e.clientY - r.top) / r.height - 0.5) * 18, y: ((e.clientX - r.left) / r.width - 0.5) * 26 });
            }
          : undefined
      }
      aria-hidden="true"
    >
      <div
        className="relative aspect-[1.586] w-full transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] [transform-style:preserve-3d]"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y + (flipped ? 180 : 0)}deg)` }}
      >
        {(["front", "back"] as const).map((side) => (
          <div
            key={side}
            className="absolute inset-0 overflow-hidden rounded-[4.5%/7%] bg-[#141215] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)] [backface-visibility:hidden]"
            style={{
              transform: side === "back" ? "rotateY(180deg)" : undefined,
              backgroundImage: art ? `url(${art[side]})` : undefined,
              backgroundSize: "cover",
            }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.14)_45%,transparent_60%)]" />
            {side === "front" && (
              <div className="absolute left-[11.6%] top-[42%] h-[15.6%] w-[13.1%] rounded-[18%] bg-[linear-gradient(135deg,#f2d9a6,#c59a55,#8b6331)]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
