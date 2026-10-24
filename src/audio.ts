let active: SpeechSynthesisUtterance | null = null;
export function stopAudio() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  active = null;
}
export function playAudio(
  text: string,
  slow: boolean,
  onEnd: () => void,
): string | null {
  if (!("speechSynthesis" in window))
    return "Audio is not available in this browser. You can still read and practise every phrase.";
  stopAudio();
  const voices = window.speechSynthesis.getVoices();
  const voice =
    voices.find((v) => v.lang === "es-ES") ||
    voices.find((v) => v.lang.startsWith("es"));
  if (!voice)
    return "No Spanish voice is available yet. Enable a Spanish speech voice in your device settings, then try again.";
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "es-ES";
  u.voice = voice;
  u.rate = slow ? 0.72 : 0.95;
  u.onend = onEnd;
  u.onerror = onEnd;
  active = u;
  window.speechSynthesis.speak(u);
  return null;
}
