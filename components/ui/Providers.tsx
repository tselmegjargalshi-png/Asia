"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { frame, getUI, setUI, useUI } from "@/lib/store";
import { measureSections, updateSectionFrame } from "@/lib/sections";
import { detectCapability } from "@/lib/quality";
import { setLenis } from "@/lib/scroll";
import { damp } from "@/lib/math";

gsap.registerPlugin(ScrollTrigger);

/** Capability detection, smooth scrolling and the per-frame scroll/pointer loop. */
export function Providers({ children }: { children: React.ReactNode }) {
  const reduced = useUI((s) => s.reducedMotion);

  // capability + motion preferences (once)
  useEffect(() => {
    const cap = detectCapability();
    document.documentElement.dataset.webgl = cap.webgl ? "ok" : "none";
    document.documentElement.dataset.tier = cap.tier;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("asia-motion");
    } catch {}
    const initialReduced = stored ? stored === "reduced" : mq.matches;
    setUI({ webgl: cap.webgl ? "ok" : "none", tier: cap.tier, reducedMotion: initialReduced });
    const onChange = () => setUI({ reducedMotion: mq.matches });
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  }, [reduced]);

  // keep the WebGL attribute in sync if the context is lost later
  const webgl = useUI((s) => s.webgl);
  useEffect(() => {
    if (webgl !== "pending") document.documentElement.dataset.webgl = webgl;
  }, [webgl]);

  // smooth scroll (disabled for reduced motion)
  useEffect(() => {
    if (reduced) {
      setLenis(null);
      return;
    }
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, [reduced]);

  // per-frame scroll state shared with the 3D scene
  useEffect(() => {
    let last = window.scrollY;
    const measure = () => {
      measureSections();
      ScrollTrigger.refresh();
    };
    measure();
    const tick = () => {
      const y = window.scrollY;
      const dt = gsap.ticker.deltaRatio() / 60;
      frame.velocity = damp(frame.velocity, y - last, 6, Math.max(dt, 1 / 120));
      last = y;
      frame.scrollY = y;
      updateSectionFrame(y);
    };
    gsap.ticker.add(tick);
    const ro = new ResizeObserver(() => measure());
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "touch" && getUI().reducedMotion) return;
      frame.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      frame.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      frame.pointer.x = 0;
      frame.pointer.y = 0;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    // gentle device-tilt parallax is intentionally not used: it needs a permission prompt on iOS
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <>{children}</>;
}
