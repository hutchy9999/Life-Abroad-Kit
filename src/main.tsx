import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Compass,
  Home,
  Settings,
  ShieldCheck,
  Volume2,
  X,
  Square,
  Search,
  Heart,
  KeyRound,
  Wrench,
  CalendarDays,
  ShoppingBag,
  Scissors,
  Users,
  Coffee,
  TrainFront,
  FileText,
  Plus,
} from "lucide-react";
import { scenarios, categories, type Scenario, type Phrase } from "./content";
import { load, KEY, fresh, type State } from "./storage";
import { playAudio, stopAudio } from "./audio";
import { track, vocoUrl } from "./analytics";
import {
  REVIEW_SESSION_SIZE,
  activeSituation,
  pickQuickPhrase,
  recordQuickPhrase,
  type QuickPhrase,
} from "./quickPractice";
import "./style.css";
import "./brand.css";
import "./ux.css";
const icons: Record<string, typeof Home> = {
  home: Home,
  key: KeyRound,
  wrench: Wrench,
  calendar: CalendarDays,
  heart: Heart,
  cross: Plus,
  bag: ShoppingBag,
  scissors: Scissors,
  people: Users,
  coffee: Coffee,
  train: TrainFront,
  file: FileText,
};
function readRoute() {
  const path = location.hash.slice(1) || "home";
  return path === "phrases" || path === "review" ? "home" : path;
}
const initial = load();
function App() {
  const [state, setState] = useState<State>(initial.state);
  const [storageError, setStorageError] = useState(initial.error);
  const [blocked, setBlocked] = useState(initial.blocked);
  const [route, setRoute] = useState(readRoute());
  const settingsReturnPath = useRef("home");
  const [step, setStep] = useState(0);
  const [selection, setSelection] = useState(state.selected);
  const [situation, setSituation] = useState(state.situation);
  const [revealed, setRevealed] = useState(false);
  const [visibleTranslations, setVisibleTranslations] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All situations");
  const [reset, setReset] = useState(false);
  const resetTrigger = useRef<HTMLElement | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [homePhrase, setHomePhrase] = useState<QuickPhrase | null>(() =>
    pickQuickPhrase(initial.state),
  );
  const [homeCount, setHomeCount] = useState(0);
  const [homePaused, setHomePaused] = useState(false);
  useEffect(() => {
    const redirectOldRoute = () => {
      if (["#phrases", "#review"].includes(location.hash))
        history.replaceState(null, "", "#home");
    };
    redirectOldRoute();
    const f = () => {
      redirectOldRoute();
      stopAudio();
      setAudio(null);
      setRoute(readRoute());
      setVisibleTranslations([]);
      setRevealed(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  useEffect(() => {
    if (blocked) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      setStorageError(null);
    } catch {
      setStorageError(
        "Progress cannot be saved on this device. Your changes are available for this visit. Check browser storage settings.",
      );
    }
  }, [state, blocked]);
  useEffect(() => {
    if (initial.state.onboarded) track("returning_visitor");
    return stopAudio;
  }, []);
  useEffect(() => {
    if (!reset) return;
    const focusBefore = resetTrigger.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setReset(false);
        return;
      }
      if (e.key === "Tab") {
        const controls =
          document.querySelectorAll<HTMLButtonElement>(".modal button");
        const first = controls[0],
          last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      focusBefore?.focus();
    };
  }, [reset]);
  useEffect(() => {
    const main = document.getElementById("main-content");
    const heading = main?.querySelector<HTMLElement>("h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }, [route]);
  useEffect(() => {
    if (step > 0) {
      const heading = document.querySelector<HTMLElement>(
        ".onboarding-panel h2",
      );
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }
  }, [step]);
  useEffect(() => {
    if (revealed) {
      const answer = document.querySelector<HTMLElement>(
        ".answer, .translation",
      );
      if (answer) {
        answer.tabIndex = -1;
        answer.focus();
      }
    }
  }, [revealed]);
  const update = (fn: (s: State) => State) => setState(fn);
  const nav = (r: string) => {
    if (r === "settings" && route !== "settings")
      settingsReturnPath.current = route;
    location.hash = r;
  };
  const scenario = scenarios.find((s) => route === `scenario/${s.id}`);
  const selected = scenarios.filter((s) => state.selected.includes(s.id));
  const currentSituation = activeSituation(state);
  useEffect(() => {
    if (route === "home") {
      setHomePhrase(pickQuickPhrase(state));
      setHomeCount(0);
      setHomePaused(false);
      setRevealed(false);
    }
  }, [route, currentSituation?.id]);
  useEffect(() => {
    if (route === "home" && homeCount > 0) {
      document
        .querySelector<HTMLElement>(
          ".home-quick .quick-phrase-line h2, .quick-finished h2",
        )
        ?.focus();
    }
  }, [homeCount, homePaused]);
  const open = (s: Scenario) => {
    track("scenario_opened");
    update((v) => ({
      ...v,
      last: s.id,
      selected: v.selected.includes(s.id) ? v.selected : [...v.selected, s.id],
      progress: {
        ...v.progress,
        [s.id]: v.progress[s.id] || { index: 0, completed: false },
      },
    }));
    nav(`scenario/${s.id}`);
  };
  function listen(p: Phrase | string, slow = false) {
    const text = typeof p === "string" ? p : p.es;
    if (audio === text && !slow) {
      stopAudio();
      setAudio(null);
      return;
    }
    setAudio(text);
    const error = playAudio(
      text,
      slow,
      () => setAudio(null),
      (message) => setAudioError(message),
    );
    setAudioError(error);
    if (error) setAudio(null);
  }
  const savedNotice = (
    <span className="save-note">
      <ShieldCheck size={14} />
      {storageError
        ? "Saving needs attention"
        : "Progress saved on this device"}
    </span>
  );
  const voco = (placement: "library" | "completion") => (
    <div className={`voco ${placement === "completion" ? "large" : ""}`}>
      <div>
        <span className="eyebrow">SPEAKING PRACTICE WITH VOCO</span>
        <h3>
          {placement === "completion"
            ? "Ready to practise this conversation?"
            : "Want more speaking practice?"}
        </h3>
        <p>
          Voco is a separate, paid AI speaking partner. This kit stays
          completely free.
        </p>
      </div>
      <a
        href={vocoUrl(placement)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("voco_clicked", placement)}
      >
        Practise speaking with Voco{" "}
        <span className="sr-only">(opens in a new tab)</span>
        <ArrowRight size={16} />
      </a>
    </div>
  );
  const audioButtons = (p: Phrase | string) => (
    <div className="audio-buttons">
      <button
        className="audio"
        onClick={() => listen(p)}
        aria-label={
          audio === (typeof p === "string" ? p : p.es)
            ? "Stop audio"
            : "Listen to Spanish audio"
        }
      >
        {audio === (typeof p === "string" ? p : p.es) ? (
          <Square size={18} />
        ) : (
          <Volume2 size={18} />
        )}{" "}
        {audio === (typeof p === "string" ? p : p.es) ? "Stop audio" : "Listen"}
      </button>
    </div>
  );
  const card = (s: Scenario) => {
    const Icon = icons[s.icon];
    const p = state.progress[s.id];
    return (
      <button className="scenario-card" key={s.id} onClick={() => open(s)}>
        <div className="card-top">
          <span className={`icon-tile ${s.icon}`}>
            <Icon size={23} />
          </span>
          <span className="time">5 to 10 min</span>
        </div>
        <span className="category">{s.category}</span>
        <h3>{s.title}</h3>
        <p>{s.description}</p>
        <div className="card-bottom">
          <span>
            {p?.completed ? (
              <>
                <Check size={14} /> Completed
              </>
            ) : p ? (
              `In progress · ${Math.round((p.index / s.phrases.length) * 100)}%`
            ) : (
              `${s.phrases.length} useful phrases`
            )}
          </span>
          <span className="round-arrow">
            <span>
              {p?.completed ? "Review lesson" : p ? "Continue" : "Start lesson"}
            </span>{" "}
            <ArrowRight size={17} />
          </span>
        </div>
        {p && (
          <div className="progress-line">
            <i
              style={{
                width: `${p.completed ? 100 : (p.index / s.phrases.length) * 100}%`,
              }}
            />
          </div>
        )}
      </button>
    );
  };
  function rateHomePhrase(known: boolean) {
    if (!homePhrase || homeCount >= REVIEW_SESSION_SIZE) return;
    stopAudio();
    setAudio(null);
    setRevealed(false);
    const next = recordQuickPhrase(state, homePhrase, known);
    setState(next);
    track("phrase_reviewed");
    setHomeCount((n) => Math.min(n + 1, REVIEW_SESSION_SIZE));
    setHomePhrase(pickQuickPhrase(next, homePhrase.phrase.id));
  }
  return (
    <>
      <a
        className="skip-link"
        aria-hidden={reset || undefined}
        tabIndex={reset ? -1 : undefined}
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to content
      </a>
      <header inert={reset}>
        <a className="brand" href="#home" aria-label="Life Abroad Kit home">
          <span>Life Abroad Kit</span>
        </a>
        {state.onboarded && (
          <nav aria-label="Main navigation">
            {[
              ["home", "My learning", Home],
              ["library", "All situations", Compass],
            ].map(([r, label, Icon]) => (
              <a
                key={r as string}
                href={`#${r}`}
                className={route === r ? "active" : ""}
                aria-current={route === r ? "page" : undefined}
              >
                {React.createElement(Icon as typeof Home, { size: 17 })}
                <span>{label as string}</span>
              </a>
            ))}
          </nav>
        )}
        <button
          className="icon-button settings"
          aria-label="Settings"
          onClick={() => nav("settings")}
        >
          <Settings size={21} />
        </button>
      </header>
      {storageError && (
        <div className="notice" role="status">
          {storageError}
        </div>
      )}
      {audioError && (
        <div className="notice" role="status">
          {audioError}
          <button
            className="icon-button"
            onClick={() => setAudioError(null)}
            aria-label="Dismiss audio message"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <main id="main-content" tabIndex={-1} inert={reset}>
        {!state.onboarded && route !== "settings" ? (
          <section className="onboarding">
            <div className="onboarding-intro">
              <h1>Prepare yourself for <span>life abroad.</span></h1>
              <p>Find useful phrases for everyday situations, practise them in advance, and look them up when you need them.</p>
              <p className="welcome-examples-label">A few examples of what you can practise:</p>
              <ul className="welcome-examples" aria-label="Example situations">
                <li>Explaining a health problem to a doctor</li>
                <li>Asking for directions around town</li>
                <li>Viewing an apartment and asking about rent</li>
              </ul>
            </div>
            <div className="onboarding-panel">
              {step === 0 ? (
                <>
                  <h2>Get started</h2>
                  <div className="language-choice">
                    <svg className="language-flag" viewBox="0 0 30 20" width="30" height="20" aria-hidden="true" focusable="false">
                      <rect width="30" height="20" rx="2" fill="#c60b1e" />
                      <path d="M0 5h30v10H0z" fill="#ffc400" />
                    </svg>
                    <span>
                      <strong>Spanish</strong>
                      <small>Everyday Spanish for life in Spain</small>
                    </span>
                    <span className="selected-check">
                      <Check size={15} />
                    </span>
                  </div>

                  <button
                    className="primary wide"
                    onClick={() => {
                      track("onboarding_started");
                      track("language_selected");
                      setStep(1);
                    }}
                  >
                    Continue <ArrowRight size={18} />
                  </button>
                  <p className="welcome-free-note">Free to use. No email or sign-up required.</p>
                </>
              ) : step === 1 ? (
                <>
                  <h2>What brings you here?</h2>
                  <p>Which best describes you?</p>
                  {[
                    ["moving", "I’m moving abroad soon."],
                    ["living", "I already live abroad."],
                    ["future", "I’m preparing for the future."],
                  ].map(([v, l]) => (
                    <button
                      className={`choice ${situation === v ? "chosen" : ""}`}
                      onClick={() => setSituation(v)}
                      key={v}
                      aria-pressed={situation === v}
                    >
                      {l}
                      {situation === v && <Check size={18} />}
                    </button>
                  ))}
                  <button className="primary wide" onClick={() => setStep(2)}>
                    Choose my situations <ArrowRight size={18} />
                  </button>
                  <button className="text-button" onClick={() => setStep(0)}>
                    Back
                  </button>
                </>
              ) : (
                <>
                  <h2>Which situations do you want to practise?</h2>
                  <p>Select at least one. You can change your choices later.</p>
                  <div className="scenario-picks">
                    {scenarios.map((s) => {
                      const Icon = icons[s.icon];
                      return (
                        <button
                          key={s.id}
                          className={`pick ${selection.includes(s.id) ? "chosen" : ""}`}
                          aria-pressed={selection.includes(s.id)}
                          onClick={() => {
                            track("scenario_selected");
                            setSelection((v) =>
                              v.includes(s.id)
                                ? v.filter((x) => x !== s.id)
                                : [...v, s.id],
                            );
                          }}
                        >
                          <Icon size={19} />
                          <span>{s.title}</span>
                          {selection.includes(s.id) && <Check size={16} />}
                        </button>
                      );
                    })}
                  </div>
                  <p id="selection-help" role="status">
                    {selection.length
                      ? `${selection.length} selected`
                      : "Select at least one situation to continue."}
                  </p>
                  <button
                    className="primary wide"
                    aria-describedby="selection-help"
                    disabled={!selection.length}
                    onClick={() => {
                      update((v) => ({
                        ...v,
                        onboarded: true,
                        situation,
                        selected: selection,
                      }));
                      track("onboarding_completed");
                      nav("home");
                    }}
                  >
                    Start learning <ArrowRight size={18} />
                  </button>
                  <button className="text-button" onClick={() => setStep(1)}>
                    Back
                  </button>
                </>
              )}
            </div>
          </section>
        ) : route === "settings" ? (
          <section className="narrow">
            <button
              className="text-button back settings-back"
              onClick={() => nav(settingsReturnPath.current)}
              aria-label="Back to previous page"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <span className="eyebrow">SETTINGS</span>
            <h1>Your preferences</h1>
            <p>Spanish · For life in Spain</p>
            <label>
              Your situation
              <select
                value={state.situation}
                onChange={(e) =>
                  update((v) => ({ ...v, situation: e.target.value }))
                }
              >
                <option value="moving">I’m moving abroad soon</option>
                <option value="living">I already live abroad</option>
                <option value="future">I’m preparing for the future</option>
              </select>
            </label>
            <h2>Your situations</h2>
            <div className="scenario-picks">
              {scenarios.map((s) => (
                <button
                  className={`pick ${state.selected.includes(s.id) ? "chosen" : ""}`}
                  aria-pressed={state.selected.includes(s.id)}
                  key={s.id}
                  onClick={() =>
                    update((v) => ({
                      ...v,
                      selected: v.selected.includes(s.id)
                        ? v.selected.filter((x) => x !== s.id)
                        : [...v.selected, s.id],
                    }))
                  }
                >
                  {s.title}
                  {state.selected.includes(s.id) && <Check size={17} />}
                </button>
              ))}
            </div>
            <div className="info">
              <ShieldCheck />
              <div>
                <h3>Saved in your browser</h3>
                <p>
                  Preferences and learning progress stay on this device and
                  browser. Clearing browser data, using private browsing or
                  switching devices may remove or hide them. They aren’t backed
                  up online or synced.
                </p>
                <p>
                  Audio uses Elvira, a Spain-Spanish AI voice from Microsoft
                  Azure. The recordings are saved with the app.
                </p>
                <p>
                  No analytics data is sent by this version. Spanish content is
                  a draft awaiting linguistic review.
                </p>
              </div>
            </div>
            <button
              className="danger"
              onClick={() => {
                resetTrigger.current = document.activeElement as HTMLElement;
                setReset(true);
              }}
            >
              Reset device progress
            </button>
            <button className="secondary" onClick={() => nav("home")}>
              Back to my learning
            </button>
          </section>
        ) : scenario ? (
          <section className="lesson phrase-library">
            <button className="text-button back" onClick={() => nav("library")}>
              <ArrowLeft size={16} /> All situations
            </button>
            <div className="lesson-heading">
              <span className="eyebrow">{scenario.category}</span>
              <h1>{scenario.title}</h1>
              <p>{scenario.description}</p>
            </div>
            <ul className="browse-phrases" aria-label="Spanish phrases">
              {scenario.phrases.map((p) => (
                <li key={p.id}>
                  <article
                    className="browse-phrase-card"
                    aria-labelledby={"phrase-" + p.id}
                  >
                    <div className="browse-phrase-title">
                      <h2 id={"phrase-" + p.id} lang="es">
                        {p.es}
                      </h2>
                    </div>
                    {visibleTranslations.includes(p.id) && (
                      <p
                        className="browse-translation"
                        id={"meaning-" + p.id}
                        role="status"
                      >
                        {p.en}
                      </p>
                    )}
                    <div className="browse-phrase-actions">
                      {audioButtons(p)}
                      <button
                        className="text-button"
                        aria-expanded={visibleTranslations.includes(p.id)}
                        aria-controls={"meaning-" + p.id}
                        onClick={() =>
                          setVisibleTranslations((ids) =>
                            ids.includes(p.id)
                              ? ids.filter((id) => id !== p.id)
                              : [...ids, p.id],
                          )
                        }
                      >
                        {visibleTranslations.includes(p.id)
                          ? "Hide translation"
                          : "Show translation"}
                      </button>
                    </div>
                    <p className="browse-pattern">
                      <strong>How to use it: </strong>
                      {p.pattern}
                    </p>
                  </article>
                </li>
              ))}
            </ul>
            <div className="situation-finish">
              {state.progress[scenario.id]?.completed ? (
                <span>
                  <Check size={18} /> Situation completed
                </span>
              ) : (
                <button
                  className="secondary"
                  onClick={() => {
                    track("scenario_completed");
                    update((v) => ({
                      ...v,
                      last: scenario.id,
                      progress: {
                        ...v.progress,
                        [scenario.id]: {
                          index: scenario.phrases.length - 1,
                          completed: true,
                        },
                      },
                    }));
                  }}
                >
                  Mark situation complete <Check size={17} />
                </button>
              )}
            </div>
            {state.progress[scenario.id]?.completed && voco("completion")}
          </section>
        ) : route === "library" ? (
          <section>
            <div className="page-heading">
              <span className="eyebrow">SPANISH FOR LIFE IN SPAIN</span>
              <h1>All situations</h1>
              <p>Choose a conversation you’d like to feel more confident in.</p>
            </div>
            <div className="filters">
              <label className="search">
                <Search size={19} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find a situation…"
                  aria-label="Search situations"
                />
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filter by category"
              >
                <option>All situations</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="card-grid">
              {scenarios
                .filter(
                  (s) =>
                    (category === "All situations" ||
                      s.category === category) &&
                    `${s.title} ${s.description}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                )
                .map(card)}
            </div>
            {!scenarios.some(
              (s) =>
                (category === "All situations" || s.category === category) &&
                `${s.title} ${s.description}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
            ) && (
              <div className="empty">
                <p>No situations match. Try another search.</p>
              </div>
            )}
            {voco("library")}
          </section>
        ) : route !== "home" ? (
          <section className="empty">
            <h1>We couldn’t find that page.</h1>
            <button className="primary" onClick={() => nav("home")}>
              Back to my learning
            </button>
          </section>
        ) : (
          <section className="learning-home">
            <h1 className="home-title">My learning</h1>
            {homePhrase && (
              <section
                className="home-quick"
                aria-label="Quick phrase practice"
              >
                <div className="quick-context">
                  <div>
                    <span className="eyebrow">
                      {state.progress[homePhrase.scenario.id]?.completed
                        ? "REVIEW A SITUATION"
                        : "YOUR CURRENT SITUATION"}
                    </span>
                    <h2 tabIndex={-1}>{homePhrase.scenario.title}</h2>
                  </div>

                </div>
                <div className="review-session-progress">
                  <p id="session-progress-label" className="quick-count" aria-live="polite" aria-atomic="true">
                    {homeCount} of {REVIEW_SESSION_SIZE} reviewed
                  </p>
                  <progress
                    aria-labelledby="session-progress-label"
                    value={homeCount}
                    max={REVIEW_SESSION_SIZE}
                  />
                </div>
                {homeCount < REVIEW_SESSION_SIZE ? (
                  <>
                    <div className="quick-phrase-card">
                      <div className="quick-phrase-line">
                        <h2 lang="es" tabIndex={-1}>
                          {homePhrase.phrase.es}
                        </h2>
                      </div>
                      {revealed && (
                        <p className="translation" role="status">
                          {homePhrase.phrase.en}
                        </p>
                      )}
                      <div className="quick-card-actions">
                        {audioButtons(homePhrase.phrase)}
                        {!revealed && (
                          <button
                            className="text-button"
                            onClick={() => setRevealed(true)}
                          >
                            Show meaning
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="quick-feedback">
                      <button
                        className="secondary"
                        onClick={() => rateHomePhrase(false)}
                      >
                        Don’t know this
                      </button>
                      <button
                        className="primary"
                        onClick={() => rateHomePhrase(true)}
                      >
                        I know this <ArrowRight size={17} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="quick-finished">
                    <Check size={28} />
                    <h2 tabIndex={-1}>{homePaused ? "All done for now" : "10 phrases reviewed"}</h2>
                    {homePaused && <p>Your progress is saved. Come back whenever you’re ready.</p>}
                    <div className="button-row">
                      <button
                        className="primary"
                        onClick={() => {
                          setHomeCount(0);
                          setHomePaused(false);
                          requestAnimationFrame(() =>
                            document
                              .querySelector<HTMLElement>(
                                ".quick-phrase-line h2",
                              )
                              ?.focus(),
                          );
                          setHomePhrase(
                            pickQuickPhrase(state, homePhrase.phrase.id),
                          );
                          setRevealed(false);
                        }}
                      >
                        Practise ten more
                      </button>
                      {!homePaused && (
                        <button className="text-button" onClick={() => setHomePaused(true)}>
                          Finish for now
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </section>
            )}
            <details className="my-situations" open={!homePhrase}>
              <summary>
                Your situations <span>({selected.length})</span>
              </summary>
              <div className="section-heading">
                <p>
                  Choose another situation when you’ve finished your current
                  one.
                </p>
                <button className="text-button" onClick={() => nav("settings")}>
                  Choose situations <Settings size={15} />
                </button>
              </div>
              <div className="card-grid">{selected.map(card)}</div>
              {!selected.length && (
                <div className="empty">
                  <p>Choose the conversations you want to prepare for.</p>
                  <button className="primary" onClick={() => nav("settings")}>
                    Choose my situations
                  </button>
                </div>
              )}
            </details>
            <button className="explore-more" onClick={() => nav("library")}>
              <Plus size={19} /> Browse all situations <ArrowRight size={17} />
            </button>
          </section>
        )}
      </main>
      {reset && (
        <div className="modal-backdrop">
          <div
            className="modal"
            role="alertdialog"
            aria-describedby="reset-description"
            aria-modal="true"
            aria-labelledby="reset-title"
          >
            <h2 id="reset-title">Start fresh on this device?</h2>
            <p id="reset-description">
              This removes your preferences and learning progress
              from this browser. This can’t be undone.
            </p>
            <div className="button-row">
              <button
                autoFocus
                className="secondary"
                onClick={() => setReset(false)}
              >
                Keep my progress
              </button>
              <button
                className="danger"
                onClick={() => {
                  try {
                    localStorage.removeItem(KEY);
                    setBlocked(false);
                    setStorageError(null);
                    setState(fresh());
                    setSelection([]);
                    setStep(0);
                    setReset(false);
                    nav("home");
                  } catch {
                    setStorageError(
                      "Browser storage could not be reset. Check your browser settings.",
                    );
                    setReset(false);
                  }
                }}
              >
                Reset progress
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
