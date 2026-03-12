import { useState, useEffect, useRef } from "react";

export function useAnimatedCount(target) {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);

  useEffect(() => {
    const start = prev.current;
    const end   = target;
    if (start === end) return;

    const duration = 800;
    const t0 = performance.now();
    let raf;

    const step = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const e = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p; // ease-in-out
      setDisplay(Math.round(start + (end - start) * e));
      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        prev.current = end;
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return display;
}
