"use client";
import { useEffect, useState } from "react";

/** Canvas-drawn textures must wait for web fonts, otherwise they bake in a fallback face. */
export function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    const fonts = document.fonts;
    Promise.all([
      fonts.load('300 64px "Manrope Variable"'),
      fonts.load('500 64px "Space Grotesk Variable"'),
    ])
      .catch(() => undefined)
      .then(() => fonts.ready)
      .then(() => alive && setReady(true));
    const t = setTimeout(() => alive && setReady(true), 2500);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);
  return ready;
}
