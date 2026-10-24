import recordings from "./generated/audio.json";

let active: HTMLAudioElement | null = null;
const files: Record<string, string> = recordings;

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
): string | null {
  stopAudio();
  const path = files[text];
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
