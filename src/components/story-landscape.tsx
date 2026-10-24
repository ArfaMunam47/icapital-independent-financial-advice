import { useEffect, useRef } from "react";
import mountain from "@/assets/reference-scene-01-back.webp.asset.json";
import foreground from "@/assets/reference-scene-01-front.webp.asset.json";
import clouds from "@/assets/reference-clouds.webp.asset.json";
import sunset from "@/assets/reference-scene-07.webp.asset.json";
import eclipse from "@/assets/vision-eclipse.jpg";
import passage from "@/assets/vision-passage.jpg";

export function StoryLandscape({ kind, src, poster, progress }: {
  kind: "opening" | "video" | "sunset" | "eclipse" | "passage";
  src?: string | undefined;
  poster?: string | undefined;
  progress: number;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const playhead = useRef(progress);
  playhead.current = progress;

  useEffect(() => {
    const element = video.current;
    if (!element) return;
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
  }, [src]);

  if (kind === "video") return (
    <video ref={video} src={src} poster={poster} muted playsInline preload="auto" className="absolute inset-0 h-full w-full object-cover" aria-hidden="true" />
  );
  if (kind === "eclipse" || kind === "passage") return (
    <div className={`creative-landscape creative-landscape-${kind} absolute inset-0 overflow-hidden`}>
      <img src={kind === "eclipse" ? eclipse : passage} alt="" loading="lazy" width={1536} height={1024} className="creative-landscape-image" style={{ transform: `scale(${1.025 + progress * 0.035}) translateY(${progress * -1.5}%)` }} />
      <div className="creative-landscape-shade absolute inset-0" />
    </div>
  );
  if (kind === "sunset") return <><img src={sunset.url} alt="" className="sunset-foreground" /><div className="side-shade absolute inset-0" /></>;

  return (
    <div className="opening-landscape absolute inset-0 overflow-hidden">
      <img src={mountain.url} alt="" className="mountain-back" style={{ transform: `translateY(${progress * -24}px) scale(${1 + progress * 0.06})` }} />
      <img src={clouds.url} alt="" className="cloud-bank cloud-bank-far" />
      <img src={foreground.url} alt="" className="mountain-front" style={{ transform: `translateY(${progress * 30}px) scale(${1 + progress * 0.13})` }} />
      <img src={clouds.url} alt="" className="cloud-bank cloud-bank-near" />
    </div>
  );
}