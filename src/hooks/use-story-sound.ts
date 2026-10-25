import { useEffect, useRef, useState } from "react";
import { createStorySound } from "@/lib/story-sound";

export function useStorySound(progress: number) {
  const engine = useRef<ReturnType<typeof createStorySound> | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const pending = useRef(false);
  useEffect(() => { engine.current?.update(progress); }, [progress]);
  useEffect(() => () => { engine.current?.dispose(); engine.current = null; }, []);
  const toggle = async () => {
    if (pending.current) return;
    pending.current = true;
    try {
      if (!engine.current) engine.current = createStorySound();
      engine.current.update(progress);
      await engine.current.setEnabled(!enabled);
      setEnabled(!enabled);
      setUnavailable(false);
    } catch {
      engine.current?.dispose();
      engine.current = null;
      setEnabled(false);
      setUnavailable(true);
    } finally { pending.current = false; }
  };
  return { enabled, unavailable, toggle };
}