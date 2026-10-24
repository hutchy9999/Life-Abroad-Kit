import { scenarios, type Scenario, type Phrase } from "./content";
import type { State } from "./storage";
export type QuickPhrase = { scenario: Scenario; phrase: Phrase };
export function activeSituation(state: State): Scenario | undefined {
  const chosen = scenarios.filter((s) => state.selected.includes(s.id));
  const last = chosen.find((s) => s.id === state.last);
  if (last && !state.progress[last.id]?.completed) return last;
  return (
    chosen.find(
      (s) => state.progress[s.id] && !state.progress[s.id].completed,
    ) ||
    chosen.find((s) => !state.progress[s.id]?.completed) ||
    last ||
    chosen[0]
  );
}
export function pickQuickPhrase(
  state: State,
  exclude?: string,
  random: () => number = Math.random,
): QuickPhrase | null {
  const scenario = activeSituation(state);
  if (!scenario) return null;
  const progress = state.progress[scenario.id];
  const frontier = Math.min(progress?.index || 0, scenario.phrases.length - 1);
  let phrases = scenario.phrases.filter(
    (p, i) => progress?.completed || i <= frontier || state.recall[p.id],
  );
  if (phrases.length > 1) phrases = phrases.filter((p) => p.id !== exclude);
  const weights = phrases.map((p) => {
    const r = state.recall[p.id];
    return r ? 1 + Math.min(3, Math.max(0, r.again - r.got)) : 2;
  });
  let ticket =
    Math.max(0, Math.min(0.999999, random())) *
    weights.reduce((a, b) => a + b, 0);
  let phrase = phrases[phrases.length - 1];
  for (let i = 0; i < phrases.length; i++) {
    ticket -= weights[i];
    if (ticket < 0) {
      phrase = phrases[i];
      break;
    }
  }
  return { scenario, phrase };
}
export function recordQuickPhrase(
  state: State,
  card: QuickPhrase,
  known: boolean,
): State {
  const id = card.scenario.id;
  const previous = state.progress[id];
  const recall = state.recall[card.phrase.id] || { again: 0, got: 0 };
  return {
    ...state,
    last: id,
    progress: {
      ...state.progress,
      [id]: {
        index: Math.max(
          previous?.index || 0,
          Math.min(
            card.scenario.phrases.indexOf(card.phrase) + 1,
            card.scenario.phrases.length - 1,
          ),
        ),
        completed: previous?.completed || false,
      },
    },
    recall: {
      ...state.recall,
      [card.phrase.id]: {
        again: recall.again + (known ? 0 : 1),
        got: recall.got + (known ? 1 : 0),
      },
    },
  };
}
