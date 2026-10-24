import { describe, it, expect } from "vitest";
import { fresh } from "./storage";
import {
  activeSituation,
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
      expect(["flat-p1", "flat-p3"]).toContain(p?.phrase.id);
    }
  });
  it("gives difficult phrases a higher share of the review selection", () => {
    const s = {
      ...fresh(),
      selected: ["flat"],
      progress: { flat: { index: 1, completed: false } },
      recall: {
        "flat-p1": { again: 3, got: 0 },
        "flat-p2": { again: 0, got: 3 },
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
