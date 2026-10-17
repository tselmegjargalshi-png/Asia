"use client";

import { useEffect, useState } from "react";
import { drawPhoneScreen } from "@/lib/phoneArt";
import { useUI } from "@/lib/store";

/** The same app screens as the 3D phone, in a CSS device frame (no-WebGL fallback). */
export function PhoneCSS() {
  const tab = useUI((s) => s.phoneTab);
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => alive && setSrc(drawPhoneScreen(tab).toDataURL("image/webp", 0.9)));
    return () => {
      alive = false;
    };
  }, [tab]);
  return (
    <div className="aspect-[1.5/3.1] w-full rounded-[2.6rem] bg-[#1a1517] p-[3.5%] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.9),inset_0_0_0_1px_rgba(255,255,255,0.08)]" aria-hidden="true">
      <div className="h-full w-full overflow-hidden rounded-[2.2rem] bg-black">
        {src && <img src={src} alt="" className="h-full w-full object-cover" />}
      </div>
    </div>
  );
}
