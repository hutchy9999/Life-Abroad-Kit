import { scenarios } from "./content.ts";
import { italianScenarios } from "./italianContent.ts";
import type { Language } from "./languages.ts";
export const allScenarios = [...scenarios, ...italianScenarios];
export function scenariosFor(language: Language) { return allScenarios.filter(s => s.language === language); }
