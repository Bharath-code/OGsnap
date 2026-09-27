"use client";

import { useEffect, useState } from "react";
import { R, aperturePaths } from "./aperture-geometry";

function useSnap(trigger: unknown) {
  const [open, setOpen] = useState(1);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let start = 0;
    const tick = (now: number) => {
      start ||= now;
      const p = Math.min(1, (now - start) / 520);
      setOpen(p < 0.35 ? 1 - (p / 0.35) * 0.92 : 1 - (1 - (p - 0.35) / 0.65) ** 2 * 0.92);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => (frame = requestAnimationFrame(tick)), 400);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [trigger]);
  return open;
}

// Snaps shut and reopens on mount and whenever `trigger` changes.
export function Aperture({ className, trigger }: { className?: string; trigger?: unknown }) {
  const { hole, blades } = aperturePaths(useSnap(trigger));
  return (
    <svg viewBox="-50 -50 100 100" className={className} aria-hidden="true">
      <circle r={R + 3} fill="currentColor" />
      <polygon points={hole} fill="hsl(var(--flash))" />
      <path d={blades} stroke="hsl(var(--background))" strokeWidth={2.4} strokeLinecap="round" fill="none" />
    </svg>
  );
}
