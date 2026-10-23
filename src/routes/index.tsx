import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import s1 from "@/assets/s1-mountain.jpg";
import s2 from "@/assets/s2-ridge.jpg";
import s3 from "@/assets/s6-alpine.jpg";
import s4 from "@/assets/s3-trail.jpg";
import s5 from "@/assets/s4-beach.jpg";
import s8 from "@/assets/s5-silhouette.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "iCapital — The value is in the journey" },
      { name: "description", content: "A cinematic journey through independent wealth advice: perspective, legacy and twenty years of setting the course." },
      { property: "og:title", content: "iCapital — The value is in the journey" },
      { property: "og:description", content: "A cinematic scroll story about independence, perspective and long-term vision." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const A = ({ children }: { children: ReactNode }) => <em className="accent-word">{children}</em>;

type Scene = { bg: "img" | "birds" | "stars" | "vision"; src?: string; title: ReactNode; body?: ReactNode; pos?: string };

const scenes: Scene[] = [
  {
    bg: "img", src: s1,
    title: <>The value is in the <A>journey</A></>,
    body: <>For 20 years we have guided your wealth with judgement and independence, because the journey matters as much as reaching the destination</>,
  },
  { bg: "img", src: s2, title: <>The decisions that<br />matter most demand<br /><A>perspective</A></> },
  {
    bg: "img", src: s3,
    title: <>Our <A>compass:</A></>,
    body: <>A life lived with independence, a long-term vision and interests that are always aligned with yours</>,
  },
  { bg: "img", src: s4, title: <>No two<br /><A>journeys</A> are<br />travelled alike</> },
  { bg: "img", src: s5, title: <><A>Neither</A><br />do we</> },
  { bg: "birds", title: <>And for 20 years<br />we have set the <A>course</A></> },
  {
    bg: "stars",
    title: <>Some fortunes speak of <A>legacy</A></>,
    body: <>Whether you are a family, an institution or a company, we are by your side to preserve, grow and project your future</>,
  },
  { bg: "img", src: s8, title: <>We take<br />your side</> },
  { bg: "vision", title: <>Vision matters<br />when it becomes<br />a <A>decision</A></> },
];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function Birds() {
  const birds = useMemo(
    () => [
      [10, 18, 1.2], [22, 30, 0.9], [33, 14, 1], [40, 28, 0.7], [58, 10, 1.3], [66, 22, 0.8],
      [74, 12, 1.1], [82, 30, 0.9], [14, 52, 0.8], [30, 64, 1], [70, 56, 0.9], [86, 70, 0.8], [60, 80, 0.7], [46, 72, 0.6],
    ],
    [],
  );
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-sky to-ink">
      {birds.map(([x, y, s], i) => (
        <svg key={i} className="bird absolute" style={{ left: `${x}%`, top: `${y}%`, width: 46 * s, animationDelay: `${i * -0.6}s` }} viewBox="0 0 40 20">
          <path d="M0 8 Q10 0 20 10 Q30 0 40 8 Q30 6 20 16 Q10 6 0 8Z" fill="var(--night)" style={{ animationDelay: `${i * -0.13}s` }} />
        </svg>
      ))}
    </div>
  );
}

function Stars() {
  const stars = useMemo(
    () => Array.from({ length: 220 }, (_, i) => {
      const r = (n: number) => ((Math.sin(i * 9301 + n * 49297) + 1) / 2);
      return { x: r(1) * 100, y: r(2) * 100, s: r(3) * 1.8 + 0.4, d: r(4) * 3 };
    }),
    [],
  );
  return (
    <div className="absolute inset-0 bg-night">
      {stars.map((st, i) => (
        <span key={i} className="star absolute rounded-full bg-foreground" style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s, animationDelay: `${st.d}s` }} />
      ))}
    </div>
  );
}

function Index() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0); // continuous scene index

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const max = el.offsetHeight - window.innerHeight;
        setP(clamp(window.scrollY / max) * (scenes.length - 1));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  const go = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    const max = el.offsetHeight - window.innerHeight;
    const target = clamp((Math.round(p) + dir) / (scenes.length - 1));
    window.scrollTo({ top: target * max, behavior: "smooth" });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(1); }
      if (["ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); go(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const progress = p / (scenes.length - 1);

  return (
    <div ref={ref} style={{ height: `${scenes.length * 120}vh` }} className="relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {scenes.map((sc, i) => {
          const d = p - i; // <0 upcoming, >0 passed
          const op = clamp(1 - Math.abs(d) * 1.4);
          if (op <= 0) return null;
          const scale = 1.08 - clamp(d + 1, 0, 2) * 0.04;
          const textOp = clamp(1 - Math.abs(d) * 2.6);
          const ty = d * -60;
          return (
            <div key={i} className="absolute inset-0" style={{ opacity: op, zIndex: i }}>
              <div className="absolute inset-0 will-change-transform" style={{ transform: `scale(${scale})` }}>
                {sc.bg === "img" && <img src={sc.src} alt="" width={1920} height={1088} className="h-full w-full object-cover" loading={i === 0 ? "eager" : "lazy"} />}
                {sc.bg === "birds" && <Birds />}
                {sc.bg === "stars" && <Stars />}
                {sc.bg === "vision" && <div className="absolute inset-0 bg-gradient-to-b from-sky to-ink" />}
              </div>
              <div
                className="text-cine absolute inset-x-0 top-[17vh] mx-auto flex max-w-xl flex-col items-center px-6 text-center"
                style={{ opacity: textOp, transform: `translateY(${ty}px)`, filter: `blur(${Math.abs(d) * 6}px)` }}
              >
                <h2 className="text-[clamp(1.6rem,2.6vw,2.4rem)] font-normal leading-[1.15] tracking-tight">{sc.title}</h2>
                {sc.body && <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-muted-foreground">{sc.body}</p>}
              </div>
            </div>
          );
        })}

        {/* Header */}
        <header className="text-cine absolute inset-x-0 top-0 z-50 flex items-center justify-center px-6 py-6">
          <a href="#" className="flex items-center gap-1.5" aria-label="iCapital home">
            <span className="text-[26px] font-medium tracking-tight"><span className="text-accent">i</span>Capital</span>
            <span className="text-[6.5px] uppercase leading-[1.25] tracking-wider text-muted-foreground">Wealth<br />Management<br />Advisors</span>
          </a>
          <div className="absolute right-6 flex items-center gap-4 text-[11px] md:right-10">
            <a href="mailto:hello@example.com" className="rounded-full border border-border bg-muted px-4 py-1.5 backdrop-blur-sm transition hover:bg-foreground hover:text-primary-foreground">Contact</a>
            <span className="hidden opacity-70 sm:inline">ES</span>
            <span className="hidden font-semibold sm:inline">EN</span>
            <button aria-label="Menu" className="flex flex-col gap-[3px]"><span className="block h-px w-4 bg-foreground" /><span className="block h-px w-4 bg-foreground" /><span className="block h-px w-4 bg-foreground" /></button>
          </div>
        </header>

        {/* Right progress rail */}
        <div className="absolute right-6 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center gap-2 md:right-10 md:flex" style={{ opacity: clamp(p * 3) }}>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1"><path d="M1 9 L5 3 L7 6 L9 2 L13 9Z" /></svg>
          <div className="relative h-40 w-px bg-border">
            <div className="absolute left-0 top-0 w-px bg-accent" style={{ height: `${progress * 100}%` }} />
          </div>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M6 0a5 5 0 1 0 4 7A4 4 0 0 1 6 0Z" /></svg>
        </div>

        {/* Bottom cue */}
        <div className="absolute inset-x-0 bottom-6 z-50 flex justify-center">
          {p < 0.3 ? (
            <button onClick={() => go(1)} className="text-cine bob text-[11px] tracking-wide text-muted-foreground">Discover more</button>
          ) : (
            <button onClick={() => go(1)} aria-label="Next scene" className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted backdrop-blur-sm">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M2 3.5 L5 6.5 L8 3.5" /></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
