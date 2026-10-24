# Life Abroad Kit: UX and accessibility review

Reviewed and updated on 24 October 2026.

## What changed

- Replaced 8–12px supporting text with a consistent scale: 16px body text, 14px secondary text, 13px section labels and 12px brand attribution. Spanish phrase text remains larger. The scale uses rem units to respect browser font preferences.
- Set interactive controls to at least 48px tall, with 48px square icon buttons. Added clearer borders and visible focus outlines.
- Shortened the dashboard so lessons and the Continue action appear sooner. Navigation consistently uses My learning, All situations and Saved phrases.
- Added explicit Start lesson, Continue and Review lesson actions. Saved phrases now have a visible Save phrase / Saved control.
- Simplified lesson navigation to Phrases, Conversation and Practice. Conversation stages wrap into a two-column grid on mobile instead of requiring horizontal scrolling.
- Replaced vague or promotional labels with direct instructions. Removed em dashes from interface copy and simplified scenario descriptions. Review later explains that a phrase will appear first in the next review.
- Added a keyboard skip link, page-heading focus on navigation, selected-page and selected-stage semantics, answer announcements and focus, and Spanish language markup on answers.
- Reset dialog keeps keyboard focus inside, closes with Escape, restores focus to its trigger and makes the background inert while open.
- Clarified which audio action stops playback and which plays slowly. External Voco links announce that they open a new tab to screen readers.
- Added non-colour active-page indicators and forced-colour styling, while retaining the reduced-motion option.

## Checks performed

- Narrow layout measured at 320 CSS pixels, tablet at 768 CSS pixels and desktop at 1280 CSS pixels.
- Checked onboarding, dashboard, lessons, conversation, recall practice, library, saved phrases and settings. Measured pages fitted within the viewport without page-level horizontal overflow.
- DOM-based checks in visited states found no text below 12px and no controls smaller than 44px in either dimension. CSS sets the reviewed controls to a 48px minimum height.
- Computed text/background contrast checks found no failures in the checked states. The check composites ancestor backgrounds and uses 4.5:1 for normal text and 3:1 for large text. It does not replace a full assistive-technology audit.
- Verified the skip link, route focus, Spanish answer focus and next-question focus using the browser.
- Verified Shift+Tab and Tab remain within the reset dialog, Escape closes it, and focus returns to Reset device progress.
- First-time onboarding was checked on a separate local origin to preserve the user's existing progress.
- Production build and 11 existing regression tests pass.

## Verification limits

This review does not certify complete WCAG conformance. Physical-device testing, VoiceOver/NVDA testing and actual browser zoom/text-resize testing remain useful before public release. The viewport checks cover narrow reflow, but are not a substitute for those tests. OS forced-colour and reduced-motion settings are supported in CSS but were not exercised on physical devices during this review.

## Reference criteria

- [W3C: contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [W3C: target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [W3C: reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

The 16px body type and 48px control height are practical design choices for this app, not claims that WCAG mandates those exact sizes.
