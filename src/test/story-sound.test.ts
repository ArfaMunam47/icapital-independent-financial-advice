import { expect, it } from "vitest";
import { soundMix } from "@/lib/story-sound";
it("matches scene ambience", () => {
  expect(soundMix(0).wind).toBe(1);
  expect(soundMix(4).forest).toBe(1);
  expect(soundMix(6).ocean).toBe(1);
  expect(soundMix(7).birds).toBe(1);
  expect(soundMix(8).silk).toBe(1);
  expect(soundMix(13).quiet).toBe(1);
  expect(soundMix(1).steps).toBe(1);
  expect(soundMix(9).quiet).toBe(1);
});
it("crossfades adjacent scenes", () => {
  expect(soundMix(6.5).ocean).toBe(0.5);
  expect(soundMix(6.5).birds).toBe(0.5);
});