export type Language = "es-ES" | "it-IT";
export const languages = {
  "es-ES": { name: "Spanish", country: "Spain", voice: "es-ES-ElviraNeural", voiceName: "Elvira" },
  "it-IT": { name: "Italian", country: "Italy", voice: "it-IT-DiegoNeural", voiceName: "Diego" },
} as const;
