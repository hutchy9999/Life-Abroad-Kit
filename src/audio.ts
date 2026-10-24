let active: SpeechSynthesisUtterance | null = null;
export function stopAudio() {
  active = null;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
export function playAudio(
  text: string,
  slow: boolean,
  onEnd: () => void,
  onError?: (message: string) => void,
): string | null {
  if (!("speechSynthesis" in window))
    return "Audio is not available in this browser. You can still read and practise every phrase.";
  stopAudio();
  const voices = window.speechSynthesis.getVoices();
  const voice =
    voices.find((v) => v.lang.toLowerCase() === "es-es") ||
    voices.find((v) => v.lang.toLowerCase().startsWith("es"));
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  // Some browsers populate their voice list only after the first request.
  // With no listed Spanish voice, let the browser resolve the requested locale.
  if (voice) utterance.voice = voice;
  utterance.rate = slow ? 0.72 : 0.95;
  utterance.onend = () => {
    if (active !== utterance) return;
    active = null;
    onEnd();
  };
  utterance.onerror = (event) => {
    if (active !== utterance) return;
    active = null;
    onEnd();
    if (event.error !== "canceled" && event.error !== "interrupted")
      onError?.(
        "Audio couldn’t play. Check that your device has a Spanish speech voice, then try again.",
      );
  };
  active = utterance;
  try {
    window.speechSynthesis.speak(utterance);
  } catch {
    active = null;
    return "Audio couldn’t start. Please try again in a browser that supports text-to-speech.";
  }
  return null;
}
