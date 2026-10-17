"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { setUI, useUI } from "@/lib/store";
import { Emblem } from "./Emblem";

const Experience = dynamic(() => import("@/components/scene/Experience"), { ssr: false });

/** Static cinematic poster: the first paint, and the permanent backdrop without WebGL. */
export function Poster({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="grain pointer-events-none fixed inset-0 z-0 overflow-hidden bg-ink transition-opacity duration-[1600ms]"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className="absolute left-1/2 top-[14vh] aspect-square w-[min(74vh,92vw)] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(120,20,26,0.18) 0 40%, rgba(0,0,0,0) 56%, rgba(255,214,160,0.95) 58.2%, rgba(216,71,63,0.6) 60%, rgba(168,50,62,0.22) 66%, rgba(90,15,29,0.08) 72%, transparent 76%)",
          filter: "blur(0.6px)",
        }}
      />
      <div className="absolute inset-x-0 top-[58vh] bottom-0" style={{ background: "linear-gradient(#0a0405, #040202 70%)" }} />
      <div
        className="absolute left-1/2 top-[58vh] h-[42vh] w-[38vw] -translate-x-1/2"
        style={{ background: "radial-gradient(ellipse 30% 70% at 50% 0%, rgba(216,71,63,0.35), rgba(216,71,63,0.06) 60%, transparent 80%)" }}
      />
      <div className="absolute inset-x-0 top-[58vh] h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </div>
  );
}

function Loader({ done }: { done: boolean }) {
  const [hide, setHide] = useState(false);
  useEffect(() => {
    if (!done) return;
    const intro = setTimeout(() => setUI({ intro: true }), 250);
    const t = setTimeout(() => setHide(true), 1200);
    return () => {
      clearTimeout(t);
      clearTimeout(intro);
    };
  }, [done]);
  if (hide) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-ink transition-opacity duration-1000"
      style={{ opacity: done ? 0 : 1 }}
    >
      <div className="flex flex-col items-center gap-6">
        <Emblem size={44} className="text-gold" />
        <div className="h-px w-40 overflow-hidden bg-line">
          <div className="h-full w-full origin-left animate-[scroll-cue_1.6s_ease-in-out_infinite] bg-gold" />
        </div>
        <span className="eyebrow">Entering ASIA</span>
      </div>
    </div>
  );
}

export function SceneLayer() {
  const webgl = useUI((s) => s.webgl);
  const ready = useUI((s) => s.sceneReady);
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 4500);
    return () => clearTimeout(t);
  }, []);
  const showScene = webgl === "ok";
  return (
    <>
      <Poster visible={!(showScene && ready)} />
      {showScene && (
        <div className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-[1400ms]" style={{ opacity: ready ? 1 : 0 }} aria-hidden="true">
          <Experience />
        </div>
      )}
      <Loader done={ready || webgl === "none" || timedOut} />
    </>
  );
}
