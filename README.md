# Life Abroad Kit

A free, browser-local Spanish conversation preparation app by James Hutchinson Languages. React + TypeScript + Vite. No backend, accounts, AI API, email collection or cloud progress storage.

## App flow

- My Learning opens directly on a compact phrase from the current situation. Ten reviews per session offer “Don’t know this” / “I know this” feedback, with difficult phrases weighted more heavily in later review. An orange bar counts both answers equally as practice completed. After ten reviews, learners can practise ten more or finish for now; feedback and situation progress are saved after each answer.
- All Situations is the library. Opening a situation shows every phrase in a scrollable list with independent translation reveals, Listen and a short usage note. There is no multi-step lesson navigation.

## Run locally

Use Node.js 22.12+ (or a compatible newer LTS).

```sh
npm ci
npm run dev
```

Open the printed URL including `/life-abroad-kit/` (normally `http://127.0.0.1:5173/life-abroad-kit/`).

```sh
npm test
npm run build
npm run preview
```

`dist/` is the production output. The preview command is for local verification, not public hosting.

## Structure

- `src/main.tsx`: onboarding, My learning, situation library and settings.
- `src/content.ts`: typed Spanish content with stable scenario and phrase IDs.
- `src/storage.ts`: versioned storage validation and safe recovery.
- `src/audio.ts`: playback of static Elvira recordings, with cancellation and playback error handling.
- `src/analytics.ts`: disabled-by-default event hook and Voco campaign URLs.
- `src/style.css`: component layouts and reduced-motion support.
- `src/brand.css`: navy/orange brand styling and Omnes typography.
- `src/ux.css`: readable type scale, touch targets, focus states and responsive reflow.
- `docs/UX-REVIEW.md`: UX changes, accessibility checks and verification limits.
- `src/storage.test.ts`: content integrity and persistence validation tests.
- `docs/DEPLOYMENT.md`: hosting choices and domain integration.

## Content

All 12 initial scenarios / 108 phrases are **drafts requiring linguistic review before public launch**. Review naturalness, translations, register, regional usage and whether dialogues prepare both participants. This is language practice; health and administration scenarios do not provide medical or legal advice.

To add a scenario, add a `scenario(...)` entry in `src/content.ts`, giving it a unique permanent ID, one category, four stages, eight or more phrase rows and a two-way dialogue. Existing IDs must remain stable after wording changes; changing IDs disconnects saved progress. Phrase counts and stage grouping adapt to the content. Do not reuse a retired ID for different content.

To add a language, extend the Scenario/State language types, put content in a separate language module, filter all library/review data by language, add a supported-language selector, and select the matching audio locale. Namespace progress by language or use globally unique IDs. Add a storage migration rather than discarding v1 data. Do not show unavailable languages as selectable.

## Branding

The visual theme follows James Hutchinson Languages: navy backgrounds, white text and warm orange accents. `src/brand.css` contains brand-specific styling. Life Abroad Kit is a text title in Omnes, with no separate logo mark. The old decorative house artwork has been removed.

Omnes SemiBold, Bold and Black are loaded from `public/fonts/Omnes-SemiBold.ttf`, `Omnes-Bold.ttf` and `Omnes-Black.ttf`. The local project includes copies from existing content assets. Those proprietary font binaries are ignored by Git and are not redistributed in the public repository. Supply appropriately licensed webfont assets at these paths when deploying from a fresh checkout, or connect the existing brand's licensed webfont service. Without those files, headings fall back to bundled Manrope. Body text uses bundled DM Sans. No Google Fonts request is made by the app.

## Progress and privacy

`life-abroad-kit:v1` in localStorage contains language, situation, scenario selections, bookmarks, completion, current phrase, recall feedback and last active scenario. Progress survives normal refreshes and browser restarts on the same origin/device/profile. It is neither synced nor backed up. Moving to a different domain changes the storage origin. Clearing site data or private browsing can remove progress.

Malformed or unknown-version storage is not overwritten: the app starts a temporary session and explains recovery/reset. Unavailable/full storage produces a clear notice. Preferences update only their own fields. Reset asks for confirmation. Future schema changes require explicit migration. This implementation assumes one active learning tab; simultaneous edits in several tabs can overwrite each other.

## Audio

All 108 phrases use saved Spain-Spanish Elvira recordings generated with Azure Speech (
`es-ES-ElviraNeural`, natural speed, 48 kHz / 192 kbps MP3). Listen plays the same
recording on every device. Recordings are AI-generated and still require a linguistic
quality check before public launch. Playback does not call Azure or need an API key.
The app fetches only the clip requested, and a new phrase stops previous audio.
Missing clips or failed playback show a message rather than switching to an unpredictable
device voice. An internet connection is needed for clips not already cached by the browser.

To regenerate after editing Spanish text, use Node 22.18+ (Node 24 recommended), set
`AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` in the private `.env.audio.local`, then run
`npm run audio:generate`. Never prefix these variables with `VITE_` or commit the file.
The generator stays below the F0 synthesis rate limit and reuses files with the same text,
voice and format. Rerunning resumes interrupted work without regenerating completed clips.
Commit `public/audio/` and `src/generated/audio.json` together. Production builds need
neither Azure credentials nor synthesis access. Old clips can remain cached safely because
changed text produces a different filename. To compare voices, run
`node scripts/generate-voice-samples.mjs`; local samples are Git-ignored.

## Analytics

No analytics provider is configured and no analytics requests are sent. `track` dispatches a local `lak:analytics` CustomEvent containing an event name and, for Voco clicks only, a generic placement. Wire a reviewed provider inside this adapter after deciding the applicable privacy/consent approach. If consent is required, start disabled and enable only after the user's choice; support withdrawal. Document the provider, retention and data handling in the production privacy notice. Do not send phrase text, health scenario identifiers, preferences, bookmarks or persistent visitor IDs. The current event hooks intentionally omit scenario-level identifiers and do not measure individual visitor retention across sessions. Campaign links contain only generic source/placement parameters.

## Before launch

- Linguistic review of every scenario.
- Verify Spanish audio on physical iOS and Android devices.
- Review keyboard operation, focus states and colour contrast with assistive technology.
- Decide whether analytics is needed; configure only after privacy review.
- Select final hosting/origin before users accumulate progress.
- Confirm subpath assets, direct scenario links and HTTPS on the actual host.
- Keep Voco a separate, optional service and use its standard home-page links.

No live deployment or DNS change is performed by local development commands.

Legacy saved-phrase IDs remain in the version 1 storage format for compatibility with existing browser data. Saving controls and the Saved phrases page have been removed. Old saved-phrase and review links return to My learning.

My learning includes a compact Practised phrases list for the current situation, combining repeated appearances into one row. Rows show only lifetime practice counts and recorded-audio playback. An orange outline marks phrases that have received at least one I know this answer, including older saved progress. The underlying answer history remains available for scheduling practice. Finish for now focuses this list.

Situation cards show distinct phrases practised as a percentage, rather than the next-phrase index. Both self-assessment answers count equally, and repeating a phrase does not inflate this percentage. My learning lists the current situation first and uses compact cards with a clear current label.

The home phrase list is scoped to the current ten-practice round, with repeated phrases combined and five rows visible initially. Show all expands that round. Starting another round clears this list while keeping lifetime counts and known-phrase outlines. The current situation links to a separate full practised-phrase view.

Getting something fixed is the first expanded content pilot: 20 phrases, including 14 learner phrases and six replies to recognise. Original repairs-p1 through repairs-p8 IDs keep their original text. The list follows a conversation with alternative symptom and availability responses; it is not a single dialogue to memorise. Speaker cues distinguish what learners can say from what they might hear. The other 11 situations still have eight phrases each.
