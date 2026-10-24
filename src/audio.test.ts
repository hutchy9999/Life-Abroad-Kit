import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { playAudio, stopAudio } from "./audio";
import recordings from "./generated/audio.json";
import { scenarios } from "./content";

class FakeAudio {
  src: string;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  load = vi.fn();
  removeAttribute = vi.fn();
  constructor(src: string) { this.src = src; instances.push(this); }
}
let instances: FakeAudio[];
const first = scenarios[0].phrases[0].es;
const second = scenarios[0].phrases[1].es;
beforeEach(() => {
  instances = [];
  vi.stubGlobal("Audio", FakeAudio);
});
afterEach(() => { stopAudio(); vi.unstubAllGlobals(); });

describe("recorded Spanish audio", () => {
  it("has a generated recording for every current phrase", () => {
    const files: Record<string, string> = recordings;
    for (const phrase of scenarios.flatMap(s => s.phrases)) {
      expect(files[phrase.es], phrase.id).toMatch(/^audio\/es-ES\/[a-f0-9]+\.mp3$/);
    }
  });
  it("plays the recorded file under the configured app base path", () => {
    expect(playAudio(first, false, vi.fn())).toBeNull();
    expect(instances[0].src).toBe(import.meta.env.BASE_URL + recordings[first as keyof typeof recordings]);
    expect(instances[0].play).toHaveBeenCalledOnce();
  });
  it("stops previous audio and ignores its late completion", () => {
    const previous = vi.fn(), current = vi.fn();
    playAudio(first, false, previous);
    const lateEnd = instances[0].onended;
    playAudio(second, false, current);
    expect(instances[0].pause).toHaveBeenCalledOnce();
    lateEnd?.();
    expect(previous).not.toHaveBeenCalled();
    instances[1].onended?.();
    expect(current).toHaveBeenCalledOnce();
  });
  it("reports failed playback only once and restores the Listen state", async () => {
    const end = vi.fn(), error = vi.fn();
    playAudio(first, false, end, error);
    const lateError = instances[0].onerror;
    instances[0].onerror?.();
    lateError?.();
    expect(end).toHaveBeenCalledOnce();
    expect(error).toHaveBeenCalledOnce();
  });
  it("handles rejected browser playback without an unhandled rejection", async () => {
    const error = vi.fn();
    playAudio(first, false, vi.fn(), error);
    stopAudio();
    // Reject the next playback as a mobile browser might do.
    vi.stubGlobal("Audio", class extends FakeAudio {
      play = vi.fn(() => Promise.reject(new Error("blocked")));
    });
    const end = vi.fn();
    playAudio(first, false, end, error);
    await Promise.resolve();
    expect(end).toHaveBeenCalledOnce();
    expect(error).toHaveBeenCalledOnce();
  });
  it("does not switch to an unpredictable device voice when a recording is missing", () => {
    expect(playAudio("Unknown phrase", false, vi.fn())).toContain("isn’t ready");
    expect(instances).toHaveLength(0);
  });
});
