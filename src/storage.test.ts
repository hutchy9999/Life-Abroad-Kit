import { describe, it, expect } from "vitest";
import { decode, fresh } from "./storage";
import { scenarios } from "./content";
describe("browser progress", () => {
  it("restores an unfinished scenario, bookmarks and recall feedback", () => {
    const s = fresh();
    s.onboarded = true;
    s.selected = ["doctor"];
    s.bookmarks = ["doctor-p1"];
    s.last = "doctor";
    s.progress.doctor = { index: 3, completed: false };
    s.recall["doctor-p1"] = { again: 2, got: 1 };
    expect(decode(JSON.stringify(s))).toEqual(s);
  });
  it("starts safely when there is no existing data", () =>
    expect(decode(null)).toEqual(fresh()));
  it.each([
    "{broken",
    "null",
    "[]",
    '{"version":2}',
    JSON.stringify({
      ...fresh(),
      progress: { doctor: { index: -1, completed: false } },
    }),
    JSON.stringify({ ...fresh(), bookmarks: [7] }),
    JSON.stringify({ ...fresh(), recall: { x: { again: "oops", got: 0 } } }),
  ])("rejects damaged or unsupported data without replacing it: %s", (raw) =>
    expect(() => decode(raw)).toThrow(),
  );
  it("retains IDs for content which is temporarily unavailable", () => {
    const s = fresh();
    s.bookmarks = ["future-phrase"];
    expect(decode(JSON.stringify(s)).bookmarks).toEqual(["future-phrase"]);
  });
});
describe("Spanish launch content", () => {
  it("has twelve complete scenarios with globally unique stable IDs", () => {
    expect(scenarios).toHaveLength(12);
    const ids = scenarios.flatMap((s) => [s.id, ...s.phrases.map((p) => p.id)]);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of scenarios) {
      expect(s.phrases).toHaveLength(8);
      expect(s.dialogue.length).toBeGreaterThanOrEqual(4);
      expect(s.stages).toHaveLength(4);
      expect(s.reviewStatus).toBe("draft");
      for (const p of s.phrases) {
        expect(p.es.length).toBeGreaterThan(4);
        expect(p.en.length).toBeGreaterThan(4);
        expect(s.stages[p.stage]).toBeTruthy();
      }
    }
  });
});
