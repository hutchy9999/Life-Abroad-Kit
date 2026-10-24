import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { playAudio, stopAudio } from "./audio";
let spoken: SpeechSynthesisUtterance[];
let synth: {
  cancel: ReturnType<typeof vi.fn>;
  getVoices: ReturnType<typeof vi.fn>;
  speak: ReturnType<typeof vi.fn>;
};
beforeEach(() => {
  spoken = [];
  synth = {
    cancel: vi.fn(),
    getVoices: vi.fn(() => []),
    speak: vi.fn((u) => spoken.push(u)),
  };
  vi.stubGlobal("window", { speechSynthesis: synth });
  vi.stubGlobal(
    "SpeechSynthesisUtterance",
    class {
      text: string;
      constructor(text: string) {
        this.text = text;
      }
    },
  );
});
afterEach(() => {
  stopAudio();
  vi.unstubAllGlobals();
});
describe("browser speech playback", () => {
  it("speaks the target text in Spanish even before the voice list loads", () => {
    expect(playAudio("Hola", false, vi.fn())).toBeNull();
    expect(spoken[0].text).toBe("Hola");
    expect(spoken[0].lang).toBe("es-ES");
    expect(synth.cancel).toHaveBeenCalled();
  });
  it("prefers a Spain Spanish voice", () => {
    const voice = { lang: "es-ES" };
    synth.getVoices.mockReturnValue([
      { lang: "en-GB" },
      { lang: "es-MX" },
      voice,
    ]);
    playAudio("Hola", false, vi.fn());
    expect(spoken[0].voice).toBe(voice);
  });
  it("ignores stale completion events when another phrase is playing", () => {
    const previous = vi.fn(),
      current = vi.fn();
    playAudio("Uno", false, previous);
    playAudio("Dos", false, current);
    spoken[0].onend?.({} as SpeechSynthesisEvent);
    expect(previous).not.toHaveBeenCalled();
    spoken[1].onend?.({} as SpeechSynthesisEvent);
    expect(current).toHaveBeenCalledOnce();
  });
  it("reports failed playback and restores the Listen state", () => {
    const end = vi.fn(),
      error = vi.fn();
    playAudio("Hola", false, end, error);
    spoken[0].onerror?.({
      error: "language-unavailable",
    } as SpeechSynthesisErrorEvent);
    expect(end).toHaveBeenCalledOnce();
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("Spanish speech voice"),
    );
  });
  it("does not show an error when playback is stopped deliberately", () => {
    const error = vi.fn();
    playAudio("Hola", false, vi.fn(), error);
    stopAudio();
    spoken[0].onerror?.({ error: "canceled" } as SpeechSynthesisErrorEvent);
    expect(error).not.toHaveBeenCalled();
  });
  it("explains when the browser has no speech synthesis support", () => {
    vi.stubGlobal("window", {});
    expect(playAudio("Hola", false, vi.fn())).toContain("not available");
  });
});
