import { useEffect, useRef } from "react";
import mountain from "@/assets/reference-scene-01-back.webp.asset.json";
import foreground from "@/assets/reference-scene-01-front.webp.asset.json";
import clouds from "@/assets/reference-clouds.webp.asset.json";
import sunset from "@/assets/reference-scene-07.webp.asset.json";
import { LivingLandscape } from "@/components/living-landscape";

export function StoryLandscape({ kind, src, poster, progress }: {
  kind: "opening" | "video" | "sunset" | "silk" | "current" | "living-video" | "horizon" | "clarity";
  src?: string | undefined;
  poster?: string | undefined;
  progress: number;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const playhead = useRef(progress);
  playhead.current = progress;

  useEffect(() => {
    const element = video.current;
    if (!element || kind !== "living-video") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (reduced.matches) element.pause();
      else void element.play().catch(() => undefined);
    };
    update();
    reduced.addEventListener("change", update);
    return () => { element.pause(); reduced.removeEventListener("change", update); };
  }, [kind, src]);

  useEffect(() => {
    const element = video.current;
    if (!element || kind !== "video") return;
    let frame = 0;
    const seek = () => {
      if (!Number.isFinite(element.duration) || element.readyState < 2 || element.seeking) return;
      const time = Math.min(element.duration - 0.03, Math.max(0, playhead.current) * element.duration);
      if (Math.abs(element.currentTime - time) > 0.035) element.currentTime = time;
    };
    const tick = () => { seek(); frame = requestAnimationFrame(tick); };
    element.addEventListener("loadeddata", seek);
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); element.removeEventListener("loadeddata", seek); };
  }, [src, kind]);

  if (kind === "video") return (
    <video ref={video} src={src} poster={poster} muted playsInline preload="auto" className="absolute inset-0 h-full w-full object-cover" aria-hidden="true" />
  );
  if (kind === "horizon") return <div className="horizon-canvas absolute inset-0"><div className="horizon-glow" style={{ opacity: 0.5 + progress * 0.5 }} /><div className="horizon-line"><div className="horizon-light" /></div><span className="horizon-mark" style={{ left: "8%" }}>Today</span><span className="horizon-mark" style={{ right: "8%" }}>Long term</span></div>;
  if (kind === "clarity") return <div className="clarity-canvas absolute inset-0"><div className="clarity-image"><img src={poster} alt="" style={{ transform: `scale(${1.12 - progress * 0.08})` }} /></div></div>;
  if (kind === "silk" || kind === "current") return <><LivingLandscape variant={kind} progress={progress} /><div className="cloud-drift cloud-drift-atmos"><img src={clouds.url} alt="" /><img src={clouds.url} alt="" /></div></>;
  if (kind === "living-video") return <><video ref={video} src={src} poster={poster} loop muted playsInline preload="auto" className="absolute inset-0 h-full w-full object-cover" aria-hidden="true" /><div className="side-shade absolute inset-0" /></>;
  if (kind === "sunset") return <><img src={sunset.url} alt="" className="sunset-foreground" /><div className="side-shade absolute inset-0" /></>;

  return (
    <div className="opening-landscape absolute inset-0 overflow-hidden">
      <img src={mountain.url} alt="" className="mountain-back" style={{ transform: `translateY(${progress * -24}px) scale(${1 + progress * 0.06})` }} />
      <div className="cloud-drift cloud-drift-high"><img src={clouds.url} alt="" /><img src={clouds.url} alt="" /></div>
      <img src={clouds.url} alt="" className="cloud-bank cloud-bank-far" />
      <img src={foreground.url} alt="" className="mountain-front" style={{ transform: `translateY(${progress * 30}px) scale(${1 + progress * 0.13})` }} />
      <img src={clouds.url} alt="" className="cloud-bank cloud-bank-near" />
      <div className="opening-scrim absolute inset-0" />
    </div>
  );
}
/** Clouds part from both sides as the playhead advances, clearing a calm field for the copy. */
export function CloudReveal({ progress }: { progress: number }) {
  const open = Math.min(1, Math.max(0, (progress - 0.2) / 0.35));
  return (
    <div className="cloud-reveal absolute inset-0" aria-hidden="true">
      <div className="cloud-reveal-wash" style={{ opacity: 0.25 + open * 0.45 }} />
      <img src={clouds.url} alt="" className="cloud-reveal-left" style={{ transform: `translateX(${-10 - open * 32}%)` }} />
      <img src={clouds.url} alt="" className="cloud-reveal-right" style={{ transform: `translateX(${10 + open * 32}%) scaleX(-1)` }} />
    </div>
  );
}
