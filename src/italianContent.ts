import { scenarios, type Scenario } from "./content.ts";
import { italianPhrases } from "./italianPhrases.ts";
const english: Record<string,string> = {
  "neighbours-p4": "I’m learning Italian.",
  "neighbours-p10": "My name’s Anna. And yours?",
  "appointment-p19": "Where is the clinic entrance?",
  "haircut-p3": "Just a trim, please.",
  "haircut-p11": "How would you like your hair?",
};
export const italianScenarios: Scenario[] = scenarios.map((s) => ({
  ...s, id: "it-" + s.id, language: "it-IT",
  phrases: s.phrases.map((p) => {
    const row = italianPhrases[p.id];
    if (!row) throw new Error("Missing Italian phrase: " + p.id);
    const [text, pattern] = row;
    const en = english[p.id] || p.en;
    return { ...p, id: "it-" + p.id, es: text, en, pattern,
      prompt: p.speaker === "native" ? "Understand: “" + text + "”" : "Say: “" + en + "”" };
  }),
  dialogue: [],
}));
