import type { Language } from "./languages.ts";
export const KEY = "life-abroad-kit:v1";
export type Progress = { index: number; completed: boolean };
export type State = {
  version: 1;
  onboarded: boolean;
  language: Language;
  situation: string;
  selected: string[];
  bookmarks: string[];
  progress: Record<string, Progress>;
  recall: Record<string, { again: number; got: number; lastKnown?: boolean }>;
  last: string | null;
};
export const fresh = (language: Language = "es-ES"): State => ({
  version: 1,
  onboarded: false,
  language,
  situation: "moving",
  selected: [],
  bookmarks: [],
  progress: {},
  recall: {},
  last: null,
});
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const strings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");
export function decode(raw: string | null): State {
  if (!raw) return fresh();
  const v: unknown = JSON.parse(raw);
  if (
    !record(v) ||
    v.version !== 1 ||
    typeof v.onboarded !== "boolean" ||
    (v.language !== "es-ES" && v.language !== "it-IT") ||
    typeof v.situation !== "string" ||
    !strings(v.selected) ||
    !strings(v.bookmarks) ||
    !record(v.progress) ||
    !record(v.recall) ||
    (v.last !== null && typeof v.last !== "string")
  )
    throw Error("Unsupported or damaged saved progress");
  for (const p of Object.values(v.progress))
    if (
      !record(p) ||
      !Number.isInteger(p.index) ||
      (p.index as number) < 0 ||
      typeof p.completed !== "boolean"
    )
      throw Error("Invalid progress");
  for (const r of Object.values(v.recall))
    if (
      !record(r) ||
      !Number.isInteger(r.again) ||
      !Number.isInteger(r.got) ||
      (r.again as number) < 0 ||
      (r.got as number) < 0 ||
      (r.lastKnown !== undefined && typeof r.lastKnown !== "boolean")
    )
      throw Error("Invalid review");
  return v as unknown as State;
}
export function load(): {
  state: State;
  error: string | null;
  blocked: boolean;
} {
  try {
    return {
      state: decode(localStorage.getItem(KEY)),
      error: null,
      blocked: false,
    };
  } catch {
    return {
      state: fresh(),
      error:
        "Your saved progress could not be opened. The original data has been kept. You can use the kit for this visit, or reset device progress in Settings.",
      blocked: true,
    };
  }
}
