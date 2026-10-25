import recordings from "./generated/audio.json";
import italianRecordings from "./generated/audio-it.json";
import type { Language } from "./languages.ts";

let active: HTMLAudioElement | null = null;
const recordingsByLanguage: Record<Language, Record<string, string>> = { "es-ES": recordings, "it-IT": italianRecordings };

export function stopAudio() {
  const previous = active;
  active = null;
  if (previous) {
    previous.onended = null;
    previous.onerror = null;
    previous.pause();
    previous.removeAttribute("src");
    previous.load();
  }
}

export function playAudio(
  text: string,
  _slow: boolean,
  onEnd: () => void,
  onError?: (message: string) => void,
  language: Language = "es-ES",
): string | null {
  stopAudio();
  const path = recordingsByLanguage[language][text];
  if (!path) return "Audio isn’t ready for this phrase yet. You can still read and practise it.";
  const audio = new Audio(`${import.meta.env.BASE_URL}${path}`);
  active = audio;
  const finish = (failed = false) => {
    if (active !== audio) return;
    active = null;
    audio.onended = null;
    audio.onerror = null;
    onEnd();
    if (failed) onError?.("Audio couldn’t play. Check your connection and try again.");
  };
  audio.onended = () => finish();
  audio.onerror = () => finish(true);
  try {
    void audio.play().catch(() => finish(true));
  } catch {
    active = null;
    return "Audio couldn’t start. Please try again.";
  }
  return null;
}
