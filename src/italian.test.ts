import { describe, it, expect } from "vitest";
import { allScenarios, scenariosFor } from "./catalog.ts";
import { italianScenarios } from "./italianContent.ts";
import { fresh, decode } from "./storage.ts";
import { activeSituation, pickQuickPhrase, recordQuickPhrase } from "./quickPractice.ts";

describe("Italian content", () => {
  it("has twelve complete situations with twenty phrases and both speakers", () => {
    expect(italianScenarios).toHaveLength(12);
    for (const scenario of italianScenarios) {
      expect(scenario.language).toBe("it-IT");
      expect(scenario.phrases).toHaveLength(20);
      expect(scenario.phrases.filter(p => p.speaker === "you")).toHaveLength(14);
      expect(scenario.phrases.filter(p => p.speaker === "native")).toHaveLength(6);
      for (const phrase of scenario.phrases) {
        expect(phrase.es.length).toBeGreaterThan(5);
        expect(phrase.en.length).toBeGreaterThan(5);
        expect(phrase.pattern.length).toBeGreaterThan(10);
        expect(phrase.id).toMatch(/^it-/);
      }
    }
  });
  it("keeps all language IDs separate", () => {
    expect(allScenarios).toHaveLength(24);
    const ids=allScenarios.flatMap(s => [s.id, ...s.phrases.map(p => p.id)]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(scenariosFor("es-ES")).toHaveLength(12);
    expect(scenariosFor("it-IT")).toHaveLength(12);
  });
  it("adapts language learning and Italian healthcare terms", () => {
    const neighbours=italianScenarios.find(s => s.id === "it-neighbours")!;
    expect(neighbours.phrases.find(p => p.id === "it-neighbours-p4")?.en).toBe("I’m learning Italian.");
    expect(neighbours.phrases.find(p => p.id === "it-neighbours-p4")?.es).toContain("italiano");
    const appointment=italianScenarios.find(s => s.id === "it-appointment")!;
    expect(appointment.phrases.find(p => p.id === "it-appointment-p7")?.es).toContain("tessera sanitaria");
  });
  it("fits the agreed generation character cap", () => {
    const characters=italianScenarios.flatMap(s => s.phrases).reduce((n,p) => n+p.es.length,0);
    expect(characters).toBeLessThanOrEqual(15000);
  });
});

describe("fixed language choice and progress", () => {
  it("restores an Italian profile without resetting it to Spanish", () => {
    const state={...fresh("it-IT"),onboarded:true,selected:["it-flat"],last:"it-flat",recall:{"it-flat-p1":{again:1,got:2,lastKnown:true}}};
    expect(decode(JSON.stringify(state))).toEqual(state);
    expect(decode(JSON.stringify(fresh())).language).toBe("es-ES");
  });
  it("rejects unsupported language values without silently replacing saved data", () => {
    expect(() => decode(JSON.stringify({...fresh(),language:"fr-FR"}))).toThrow();
  });
  it("only selects phrases from the chosen language, even with mixed legacy IDs", () => {
    const state={...fresh("it-IT"),selected:["flat","it-flat"],last:"flat"};
    expect(activeSituation(state)?.id).toBe("it-flat");
    expect(pickQuickPhrase(state)?.scenario.language).toBe("it-IT");
    expect(pickQuickPhrase({...fresh(),selected:["it-flat"]})).toBeNull();
  });
  it("records Italian feedback under Italian IDs and refuses a Spanish card", () => {
    const state={...fresh("it-IT"),selected:["it-flat"]};
    const card=pickQuickPhrase(state)!;
    const next=recordQuickPhrase(state,card,true);
    expect(next.recall["it-flat-p1"].got).toBe(1);
    expect(next.recall["flat-p1"]).toBeUndefined();
    const spanish=pickQuickPhrase({...fresh(),selected:["flat"]})!;
    expect(recordQuickPhrase(state,spanish,true)).toBe(state);
  });
});
