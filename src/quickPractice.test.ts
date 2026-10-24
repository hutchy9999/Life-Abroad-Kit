import { describe, it, expect } from "vitest";
import { fresh } from "./storage";
import {
  activeSituation,
  resumeExpandedSituations,
  situationPracticeProgress,
  pickQuickPhrase,
  recordQuickPhrase,
} from "./quickPractice";
describe("immediate home practice", () => {
  it("starts with one chosen situation and its first phrase without creating progress", () => {
    const s = { ...fresh(), selected: ["flat", "doctor"] };
    expect(pickQuickPhrase(s)?.phrase.id).toBe("flat-p1");
    expect(s.progress).toEqual({});
  });
  it("keeps the most recent unfinished chosen situation in focus", () => {
    const s = {
      ...fresh(),
      selected: ["flat", "doctor"],
      last: "doctor",
      progress: {
        flat: { index: 3, completed: false },
        doctor: { index: 2, completed: false },
      },
    };
    expect(activeSituation(s)?.id).toBe("doctor");
  });
  it("uses another unfinished situation after one is completed or removed", () => {
    const s = {
      ...fresh(),
      selected: ["flat", "doctor"],
      last: "doctor",
      progress: { doctor: { index: 7, completed: true } },
    };
    expect(activeSituation(s)?.id).toBe("flat");
    expect(activeSituation({ ...s, selected: ["flat"] })?.id).toBe("flat");
  });
  it("does not show unreached phrases or immediately repeat the previous one", () => {
    const s = {
      ...fresh(),
      selected: ["flat"],
      progress: { flat: { index: 2, completed: false } },
    };
    for (const n of [0, 0.2, 0.6, 0.99]) {
      const p = pickQuickPhrase(s, "flat-p2", () => n);
      expect(["flat-p1", "flat-p9"]).toContain(p?.phrase.id);
    }
  });
  it("gives difficult phrases a higher share of the review selection", () => {
    const s = {
      ...fresh(),
      selected: ["flat"],
      progress: { flat: { index: 1, completed: false } },
      recall: {
        "flat-p1": { again: 3, got: 0 },
        "flat-p9": { again: 0, got: 3 },
      },
    };
    expect(pickQuickPhrase(s, undefined, () => 0.7)?.phrase.id).toBe("flat-p1");
  });
  it("saves feedback and advances without erasing other situations or bookmarks", () => {
    const s = {
      ...fresh(),
      selected: ["flat", "doctor"],
      bookmarks: ["doctor-p1"],
      progress: { doctor: { index: 4, completed: false } },
    };
    const card = pickQuickPhrase(s)!;
    const next = recordQuickPhrase(s, card, false);
    expect(next.last).toBe("doctor");
    expect(next.progress.doctor.index).toBeGreaterThanOrEqual(4);
    expect(next.bookmarks).toEqual(s.bookmarks);
    expect(next.recall[card.phrase.id].again).toBe(1);
  });
  it("does not mark a lesson complete or reopen completed lessons during quick review", () => {
    const s = {
      ...fresh(),
      selected: ["flat"],
      progress: { flat: { index: 7, completed: false } },
    };
    const c = pickQuickPhrase(s, undefined, () => 0.99)!;
    expect(recordQuickPhrase(s, c, true).progress.flat.completed).toBe(false);
    const completed = {
      ...s,
      progress: { flat: { index: 7, completed: true } },
    };
    expect(
      recordQuickPhrase(completed, pickQuickPhrase(completed)!, true).progress
        .flat.completed,
    ).toBe(true);
  });
  it("handles no selected situations safely", () =>
    expect(pickQuickPhrase(fresh())).toBeNull());
});

describe("reviewed phrase statistics", () => {
  it("counts every review and saves the latest answer without changing earlier totals", () => {
    let s = { ...fresh(), selected: ["flat"] };
    const card = pickQuickPhrase(s)!;
    s = recordQuickPhrase(s, card, true);
    expect(s.recall[card.phrase.id]).toEqual({ again: 0, got: 1, lastKnown: true });
    s = recordQuickPhrase(s, card, false);
    expect(s.recall[card.phrase.id]).toEqual({ again: 1, got: 1, lastKnown: false });
    s = recordQuickPhrase(s, card, true);
    expect(s.recall[card.phrase.id]).toEqual({ again: 1, got: 2, lastKnown: true });
  });
});

describe("situation practice progress", () => {
  it("counts distinct practised phrases equally for either answer, without counting repeats twice", () => {
    const initial = { ...fresh(), selected: ["flat"] };
    const card = pickQuickPhrase(initial)!;
    let s = recordQuickPhrase(initial, card, false);
    s = recordQuickPhrase(s, card, true);
    expect(situationPracticeProgress(s, card.scenario)).toEqual({practised:1,total:20,percent:5});
    const other = { scenario: card.scenario, phrase: card.scenario.phrases[1] };
    s = recordQuickPhrase(s, other, true);
    expect(situationPracticeProgress(s, card.scenario).percent).toBe(10);
  });
});

describe("progress after content expansion", () => {
  it("makes new content available without discarding earlier progress or feedback", () => {
    const s = { ...fresh(), selected: ["flat"], progress: { flat: {index:7,completed:true} }, recall: {"flat-p1":{again:2,got:1}} };
    const updated = resumeExpandedSituations(s);
    expect(updated.progress.flat).toEqual({index:7,completed:false});
    expect(updated.recall).toBe(s.recall);
    expect(s.progress.flat.completed).toBe(true);
  });
  it("preserves completion of a full twenty-phrase situation", () => {
    const s = {...fresh(), progress: {flat:{index:19,completed:true}}};
    expect(resumeExpandedSituations(s)).toBe(s);
  });
});
