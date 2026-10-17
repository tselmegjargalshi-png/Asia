"use client";

import { useEffect } from "react";
import { gsap } from "gsap";

/** Run a callback on the shared animation ticker (after the scroll state update). */
export function useTicker(cb: () => void, deps: unknown[] = []) {
  useEffect(() => {
    gsap.ticker.add(cb);
    return () => gsap.ticker.remove(cb);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
