import { useEffect, useRef } from "react";

/** Broad, continuously evolving silk surfaces; no particles or decorative line grids. */
export function LivingLandscape({ progress, variant }: { progress: number; variant: "silk" | "current" }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const playhead = useRef(progress);
  playhead.current = progress;

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const tokens = getComputedStyle(element);
    const base = tokens.getPropertyValue("--flow-base").trim();
    const deep = tokens.getPropertyValue("--flow-deep").trim();
    const mid = tokens.getPropertyValue("--flow-mid").trim();
    const light = tokens.getPropertyValue("--flow-light").trim();
    let width = 0;
    let height = 0;
    let frame = 0;
    let pointer = 0;
    let easedPointer = 0;
    const resize = () => {
      width = element.clientWidth;
      height = element.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      element.width = width * ratio;
      element.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const move = (event: PointerEvent) => { pointer = event.clientX / Math.max(1, width) - 0.5; };
    const draw = (time: number) => {
      const t = reduced.matches ? 0 : time * 0.00016;
      easedPointer += (pointer - easedPointer) * 0.025;
      context.fillStyle = base;
      context.fillRect(0, 0, width, height);
      const spread = variant === "current" ? 0.2 : 0.12;
      for (let layer = 0; layer < 5; layer++) {
        const y = height * (0.56 + layer * 0.1 + Math.sin(t + layer * 0.7) * 0.055);
        const bend = Math.sin(t * 0.8 + layer * 0.9 + playhead.current) * height * spread;
        const gradient = context.createLinearGradient(0, y - height * 0.2, width * 0.4, y + height * 0.32);
        gradient.addColorStop(0, deep);
        gradient.addColorStop(0.42, mid);
        gradient.addColorStop(0.5, light);
        gradient.addColorStop(0.56, mid);
        gradient.addColorStop(1, deep);
        context.fillStyle = gradient;
        context.beginPath();
        context.moveTo(-width * 0.1, y + height * 0.17);
        context.bezierCurveTo(width * 0.24, y - bend, width * (0.45 + easedPointer * 0.1), y + bend, width * 1.1, y - height * 0.25);
        context.lineTo(width * 1.1, height * 1.2);
        context.lineTo(-width * 0.1, height * 1.2);
        context.closePath();
        context.fill();
      }
      if (!reduced.matches) frame = requestAnimationFrame(draw);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("pointermove", move, { passive: true });
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("pointermove", move); };
  }, [variant]);

  return <canvas ref={canvas} className={`living-surface living-surface-${variant} absolute inset-0 h-full w-full`} aria-hidden="true" />;
}