// No network requests by default. Connect a reviewed provider here only after
// configuring an appropriate privacy/consent approach. Never send phrase text,
// health scenario identifiers, stored preferences or persistent visitor IDs.
export type Event =
  | "onboarding_started"
  | "onboarding_completed"
  | "language_selected"
  | "scenario_selected"
  | "scenario_opened"
  | "scenario_completed"
  | "phrase_bookmarked"
  | "phrase_reviewed"
  | "returning_visitor"
  | "voco_clicked";
export function track(
  event: Event,
  placement?: "library" | "completion" | "phrases",
) {
  window.dispatchEvent(
    new CustomEvent("lak:analytics", {
      detail: { event, ...(placement ? { placement } : {}) },
    }),
  );
}
export function vocoUrl(placement: "library" | "completion" | "phrases") {
  return `https://www.speakwithvoco.com/?utm_source=life_abroad_kit&utm_medium=referral&utm_campaign=spanish_launch&utm_content=${placement}`;
}
