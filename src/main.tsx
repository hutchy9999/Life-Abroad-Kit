import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Bookmark,
  Check,
  ChevronRight,
  Compass,
  Headphones,
  Home,
  LayoutGrid,
  Leaf,
  MessageCircle,
  Play,
  RotateCcw,
  Settings,
  ShieldCheck,
  Volume2,
  X,
  Pause,
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
import "./style.css";
import "./accessibility.css";
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
const initial = load();
function App() {
  const [state, setState] = useState<State>(initial.state);
  const [storageError, setStorageError] = useState(initial.error);
  const [blocked, setBlocked] = useState(initial.blocked);
  const [route, setRoute] = useState(location.hash.slice(1) || "home");
  const [step, setStep] = useState(0);
  const [selection, setSelection] = useState(state.selected);
  const [situation, setSituation] = useState(state.situation);
  const [tab, setTab] = useState("learn");
  const [revealed, setRevealed] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All situations");
  const [reset, setReset] = useState(false);
  const [audio, setAudio] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [reviewIds, setReviewIds] = useState<string[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewDone, setReviewDone] = useState(false);
  useEffect(() => {
    const f = () => {
      stopAudio();
      setAudio(null);
      setRoute(location.hash.slice(1) || "home");
      setTab("learn");
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
    stopAudio();
    setAudio(null);
  }, [tab]);
  useEffect(() => {
    if (!reset) return;
    const focusBefore = document.activeElement as HTMLElement | null;
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
  const update = (fn: (s: State) => State) => setState(fn);
  const nav = (r: string) => {
    location.hash = r;
  };
  const all = scenarios.flatMap((s) =>
    s.phrases.map((p) => ({ ...p, scenario: s })),
  );
  const scenario = scenarios.find((s) => route === `scenario/${s.id}`);
  const idx = scenario
    ? Math.min(
        state.progress[scenario.id]?.index || 0,
        scenario.phrases.length - 1,
      )
    : 0;
  const phrase = scenario?.phrases[idx];
  const selected = scenarios.filter((s) => state.selected.includes(s.id));
  const open = (s: Scenario) => {
    track("scenario_opened");
    update((v) => ({
      ...v,
      last: s.id,
      progress: {
        ...v.progress,
        [s.id]: v.progress[s.id] || { index: 0, completed: false },
      },
    }));
    nav(`scenario/${s.id}`);
  };
  const bookmark = (id: string) => {
    track("phrase_bookmarked");
    update((v) => ({
      ...v,
      bookmarks: v.bookmarks.includes(id)
        ? v.bookmarks.filter((x) => x !== id)
        : [...v.bookmarks, id],
    }));
  };
  function listen(p: Phrase | string, slow = false) {
    const text = typeof p === "string" ? p : p.es;
    if (audio === text && !slow) {
      stopAudio();
      setAudio(null);
      return;
    }
    setAudio(text);
    const error = playAudio(text, slow, () => setAudio(null));
    setAudioError(error);
    if (error) setAudio(null);
  }
  function review(ids: string[]) {
    const ordered = [...new Set(ids)]
      .filter((id) => all.some((p) => p.id === id))
      .sort(
        (a, b) =>
          (state.recall[b]?.again || 0) -
          (state.recall[b]?.got || 0) -
          ((state.recall[a]?.again || 0) - (state.recall[a]?.got || 0)),
      );
    setReviewIds(ordered);
    setReviewIndex(0);
    setReviewDone(false);
    setRevealed(false);
    nav("review");
  }
  function feedback(p: Phrase, again: boolean) {
    track("phrase_reviewed");
    update((v) => {
      const r = v.recall[p.id] || { again: 0, got: 0 };
      return {
        ...v,
        recall: {
          ...v.recall,
          [p.id]: {
            again: r.again + (again ? 1 : 0),
            got: r.got + (again ? 0 : 1),
          },
        },
      };
    });
    setRevealed(false);
    if (route === "review") {
      if (reviewIndex + 1 >= reviewIds.length) setReviewDone(true);
      else setReviewIndex((i) => i + 1);
    } else if (scenario) {
      if (idx + 1 < scenario.phrases.length) move(idx + 1);
      else setTab("finish");
    }
  }
  function move(index: number) {
    if (!scenario) return;
    stopAudio();
    setAudio(null);
    setRevealed(false);
    update((v) => ({
      ...v,
      progress: {
        ...v.progress,
        [scenario.id]: {
          ...v.progress[scenario.id],
          index,
          completed: v.progress[scenario.id]?.completed || false,
        },
      },
    }));
  }
  const savedNotice = (
    <span className="save-note">
      <ShieldCheck size={14} />
      {storageError
        ? "Saving needs attention"
        : "Progress saved on this device"}
    </span>
  );
  const voco = (placement: "library" | "completion" | "phrases") => (
    <div className={`voco ${placement === "completion" ? "large" : ""}`}>
      <div>
        <span className="eyebrow">THE NEXT CONVERSATION</span>
        <h3>
          {placement === "completion"
            ? "Ready to practise this conversation?"
            : "Put your phrases into conversation."}
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
        Practise speaking with Voco <ArrowRight size={16} />
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
            : "Play Spanish audio"
        }
      >
        {audio === (typeof p === "string" ? p : p.es) ? (
          <Pause size={18} />
        ) : (
          <Volume2 size={18} />
        )}{" "}
        Listen
      </button>
      <button className="text-button" onClick={() => listen(p, true)}>
        Slower
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
          <span className="time">5–10 min</span>
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
  const phraseCard = (p: Phrase) => (
    <div className="phrase-card">
      <div className="phrase-top">
        <span className="eyebrow">SOMETHING YOU CAN SAY</span>
        <button
          className={`icon-button ${state.bookmarks.includes(p.id) ? "marked" : ""}`}
          aria-label={
            state.bookmarks.includes(p.id)
              ? "Remove bookmark"
              : "Bookmark phrase"
          }
          aria-pressed={state.bookmarks.includes(p.id)}
          onClick={() => bookmark(p.id)}
        >
          <Bookmark size={22} />
        </button>
      </div>
      <h2 lang="es">{p.es}</h2>
      {revealed ? (
        <p className="translation">{p.en}</p>
      ) : (
        <button className="reveal" onClick={() => setRevealed(true)}>
          Reveal English translation
        </button>
      )}
      {audioButtons(p)}
      <div className="pattern">
        <span className="eyebrow">MAKE IT YOURS</span>
        <p>{p.pattern}</p>
      </div>
    </div>
  );
  const recallCard = (p: Phrase) => (
    <div className="recall-card">
      <span className="pill">
        <MessageCircle size={14} /> Your turn to speak
      </span>
      <h2>{p.prompt}</h2>
      <p>Say it aloud. Take your time—there’s no microphone and no pressure.</p>
      {revealed ? (
        <>
          <div className="answer" lang="es">
            {p.es}
          </div>
          {audioButtons(p)}
          <p className="muted">
            One natural answer. Other ways of saying it can work too.
          </p>
          <div className="button-row">
            <button className="secondary" onClick={() => feedback(p, true)}>
              <RotateCcw size={17} /> Practise again
            </button>
            <button className="primary" onClick={() => feedback(p, false)}>
              <Check size={18} /> Got it
            </button>
          </div>
        </>
      ) : (
        <button className="primary" onClick={() => setRevealed(true)}>
          Reveal an answer <ArrowRight size={17} />
        </button>
      )}
    </div>
  );
  return (
    <>
      <header>
        <a className="brand" href="#home" aria-label="Life Abroad Kit home">
          <span className="brand-mark">
            <Leaf size={23} />
          </span>
          <span>
            Life Abroad Kit<small>BY JAMES HUTCHINSON LANGUAGES</small>
          </span>
        </a>
        {state.onboarded && (
          <nav aria-label="Main navigation">
            {[
              ["home", "My kit", Home],
              ["library", "Explore", Compass],
              ["phrases", "My phrases", Bookmark],
            ].map(([r, label, Icon]) => (
              <a
                key={r as string}
                href={`#${r}`}
                className={route === r ? "active" : ""}
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
      <main>
        {!state.onboarded && route !== "settings" ? (
          <section className="onboarding">
            <div className="onboarding-intro">
              <span className="eyebrow">
                A LITTLE PREPARATION. A LOT MORE CONFIDENCE.
              </span>
              <h1>
                Make yourself
                <br />
                at home.<span>In Spanish.</span>
              </h1>
              <p>
                Learn what you’ll actually need to say.
                <br />
                Before you need to say it.
              </p>
              <div className="intro-features">
                <span>
                  <Check size={16} /> Completely free
                </span>
                <span>
                  <Check size={16} /> No account needed
                </span>
                <span>
                  <Check size={16} /> Made for real life
                </span>
              </div>
              <div className="illustration" aria-hidden="true">
                <div className="arch">
                  <div className="sun" />
                  <div className="window" />
                  <div className="door" />
                </div>
                <div className="floating-note">
                  <MessageCircle size={18} /> Poco a poco.
                  <small>A little at a time.</small>
                </div>
                <span className="plant">✳</span>
              </div>
            </div>
            <div className="onboarding-panel">
              <div className="step-dots">
                {[0, 1, 2].map((i) => (
                  <i key={i} className={i <= step ? "filled" : ""} />
                ))}
              </div>
              <span className="eyebrow">
                YOUR KIT, YOUR WAY · {step + 1} OF 3
              </span>
              {step === 0 ? (
                <>
                  <h2>Where will your words take you?</h2>
                  <p>Let’s start with the language you’re learning.</p>
                  <button className="language-choice" aria-pressed="true">
                    <span className="flag">🇪🇸</span>
                    <span>
                      <strong>Spanish</strong>
                      <small>Everyday Spanish for life in Spain</small>
                    </span>
                    <span className="selected-check">
                      <Check size={15} />
                    </span>
                  </button>
                  <p className="muted">
                    More languages will join the kit in the future.
                  </p>
                  <button
                    className="primary wide"
                    onClick={() => {
                      track("onboarding_started");
                      track("language_selected");
                      setStep(1);
                    }}
                  >
                    Make it mine <ArrowRight size={18} />
                  </button>
                </>
              ) : step === 1 ? (
                <>
                  <h2>
                    A new chapter,
                    <br />
                    at your own pace.
                  </h2>
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
                  <h2>What would you like to feel ready for?</h2>
                  <p>Pick a few situations. You can change these any time.</p>
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
                  <button
                    className="primary wide"
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
                    Open my kit <ArrowRight size={18} />
                  </button>
                  <button className="text-button" onClick={() => setStep(1)}>
                    Back
                  </button>
                </>
              )}
              {savedNotice}
            </div>
          </section>
        ) : route === "settings" ? (
          <section className="narrow">
            <span className="eyebrow">MAKE IT YOURS</span>
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
                  Preferences, bookmarks and progress stay on this device and
                  browser. Clearing browser data, using private browsing or
                  switching devices may remove or hide them. They aren’t backed
                  up online or synced.
                </p>
                <p>
                  Audio uses your device’s Spanish speech voice. Voice
                  availability varies by browser and device.
                </p>
                <p>
                  No analytics data is sent by this version. Spanish content is
                  a draft awaiting linguistic review.
                </p>
              </div>
            </div>
            <button className="danger" onClick={() => setReset(true)}>
              Reset device progress
            </button>
            <button className="secondary" onClick={() => nav("home")}>
              Back to my kit
            </button>
          </section>
        ) : scenario && phrase ? (
          <section className="lesson">
            <button className="text-button back" onClick={() => nav("home")}>
              <ArrowLeft size={16} /> Back to my kit
            </button>
            <div className="lesson-heading">
              <span className="eyebrow">
                {scenario.category} · 5–10 MINUTES
              </span>
              <h1>{scenario.title}</h1>
              <p>{scenario.description}</p>
            </div>
            <div
              className="lesson-tabs"
              role="group"
              aria-label="Lesson sections"
            >
              {[
                ["learn", "Useful phrases", BookOpen],
                ["dialogue", "What might they say?", Headphones],
                ["practice", "Practise recall", MessageCircle],
              ].map(([t, l, I]) => (
                <button
                  className={tab === t ? "active" : ""}
                  key={t as string}
                  onClick={() => {
                    setTab(t as string);
                    setRevealed(false);
                  }}
                >
                  {React.createElement(I as typeof Home, { size: 17 })}
                  {l as string}
                </button>
              ))}
            </div>
            {tab === "learn" ? (
              <div className="lesson-grid">
                <aside>
                  <span className="eyebrow">YOUR CONVERSATION</span>
                  {scenario.stages.map((s, i) => (
                    <button
                      className={phrase.stage === i ? "active" : ""}
                      key={s}
                      onClick={() => move(i * 2)}
                    >
                      <span>{i + 1}</span>
                      {s}
                    </button>
                  ))}
                  <p className="muted">
                    A little preparation for both sides of the conversation.
                  </p>
                </aside>
                <div>
                  <div className="phrase-position">
                    <span>{scenario.stages[phrase.stage]}</span>
                    <span>
                      {idx + 1} / {scenario.phrases.length}
                    </span>
                  </div>
                  {phraseCard(phrase)}
                  <div className="lesson-controls">
                    <button
                      className="secondary"
                      disabled={idx === 0}
                      onClick={() => move(idx - 1)}
                    >
                      <ArrowLeft size={16} /> Previous
                    </button>
                    {idx < scenario.phrases.length - 1 ? (
                      <button className="primary" onClick={() => move(idx + 1)}>
                        Next phrase <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        className="primary"
                        onClick={() => setTab("dialogue")}
                      >
                        Hear both sides <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : tab === "dialogue" ? (
              <div className="dialogue">
                <div className="section-intro">
                  <h2>Conversations go both ways.</h2>
                  <p>
                    Get familiar with what you might hear back. These are
                    examples, so real conversations may vary.
                  </p>
                </div>
                {scenario.dialogue.map((line, i) => (
                  <div
                    className={`bubble ${line.speaker === "You" ? "you" : ""}`}
                    key={i}
                  >
                    <span className="eyebrow">{line.speaker}</span>
                    <p lang="es">{line.es}</p>
                    <small>{line.en}</small>
                    {audioButtons(line.es)}
                  </div>
                ))}
                <button
                  className="primary"
                  onClick={() => {
                    move(0);
                    setTab("practice");
                  }}
                >
                  Give it a go <ArrowRight size={17} />
                </button>
              </div>
            ) : tab === "practice" ? (
              <div className="practice">
                <div className="phrase-position">
                  <span>Recall practice</span>
                  <span>
                    {idx + 1} / {scenario.phrases.length}
                  </span>
                </div>
                {recallCard(phrase)}
              </div>
            ) : (
              <div className="completion">
                <span className="completion-icon">
                  <Check size={35} />
                </span>
                <span className="eyebrow">ONE CONVERSATION CLOSER</span>
                <h2>You’re a little more ready.</h2>
                <p>
                  You’ve worked through {scenario.title.toLowerCase()}. Come
                  back whenever you need a refresher.
                </p>
                {!state.progress[scenario.id]?.completed ? (
                  <button
                    className="primary"
                    onClick={() => {
                      track("scenario_completed");
                      update((v) => ({
                        ...v,
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
                    Mark scenario completed <Check size={17} />
                  </button>
                ) : (
                  <span className="pill">
                    <Check size={16} /> Scenario completed
                  </span>
                )}
                {voco("completion")}
                <button className="text-button" onClick={() => nav("home")}>
                  Back to my kit <ArrowRight size={16} />
                </button>
              </div>
            )}
          </section>
        ) : route === "phrases" ? (
          <section>
            <div className="page-heading">
              <span className="eyebrow">WORDS WORTH KEEPING</span>
              <h1>
                My phrases
                <span className="count">{state.bookmarks.length}</span>
              </h1>
              <p>Your own little collection, ready when you need it.</p>
            </div>
            {state.bookmarks.length ? (
              <>
                <button
                  className="primary"
                  onClick={() => review(state.bookmarks)}
                >
                  Review my phrases <ArrowRight size={17} />
                </button>
                <div className="saved-grid">
                  {all
                    .filter((p) => state.bookmarks.includes(p.id))
                    .map((p) => (
                      <div className="saved-card" key={p.id}>
                        <div className="phrase-top">
                          <button
                            className="text-button"
                            onClick={() => open(p.scenario)}
                          >
                            {p.scenario.title}
                          </button>
                          <button
                            className="icon-button marked"
                            onClick={() => bookmark(p.id)}
                            aria-label="Remove bookmark"
                          >
                            <Bookmark size={19} />
                          </button>
                        </div>
                        <h3 lang="es">{p.es}</h3>
                        <p>{p.en}</p>
                        {audioButtons(p)}
                      </div>
                    ))}
                </div>
                {voco("phrases")}
              </>
            ) : (
              <div className="empty">
                <Bookmark size={35} />
                <h2>Your favourite words belong here.</h2>
                <p>Tap the bookmark on any phrase to keep it in your kit.</p>
                <button className="primary" onClick={() => nav("library")}>
                  Find a situation <ArrowRight size={17} />
                </button>
              </div>
            )}
          </section>
        ) : route === "review" ? (
          <section className="practice">
            <button className="text-button back" onClick={() => nav("home")}>
              <ArrowLeft size={16} /> Back to my kit
            </button>
            {reviewDone ? (
              <div className="completion">
                <Check size={35} />
                <h1>A little practice goes a long way.</h1>
                <p>
                  Review complete. Phrases marked “Practise again” move to the
                  front of your next review.
                </p>
                <button className="primary" onClick={() => review(reviewIds)}>
                  Review again <RotateCcw size={17} />
                </button>
              </div>
            ) : all.find((p) => p.id === reviewIds[reviewIndex]) ? (
              <>
                <div className="phrase-position">
                  <span>Quick review</span>
                  <span>
                    {reviewIndex + 1} / {reviewIds.length}
                  </span>
                </div>
                {recallCard(all.find((p) => p.id === reviewIds[reviewIndex])!)}
              </>
            ) : (
              <div className="empty">
                <h1>Build your review kit.</h1>
                <p>Bookmark a phrase or practise a scenario to get started.</p>
                <button className="primary" onClick={() => nav("library")}>
                  Explore situations
                </button>
              </div>
            )}
          </section>
        ) : route === "library" ? (
          <section>
            <div className="page-heading">
              <span className="eyebrow">SMALL STEPS. REAL LIFE.</span>
              <h1>A situation for every day.</h1>
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
            <h1>That page isn’t in your kit.</h1>
            <button className="primary" onClick={() => nav("home")}>
              Back to my kit
            </button>
          </section>
        ) : (
          <section>
            <div className="dashboard-hero">
              <div>
                <span className="eyebrow">
                  <span className="tiny-dot" /> YOUR NEXT CHAPTER STARTS HERE
                </span>
                <h1>
                  A little more ready.
                  <br />
                  <em>One conversation at a time.</em>
                </h1>
                <p>
                  From finding your feet to feeling at home.
                  <br />
                  Your Spanish for the moments that matter.
                </p>
                <span className="language-tag">
                  🇪🇸 Spanish for life in Spain <span>·</span> A2–B1+
                </span>
              </div>
              <div className="hero-art" aria-hidden="true">
                <div className="arch">
                  <div className="sun" />
                  <div className="window" />
                  <div className="door" />
                </div>
                <div className="hero-note">
                  “¿Te apetece tomar algo?”
                  <small>A conversation waiting to happen.</small>
                </div>
              </div>
            </div>
            {state.last &&
              scenarios.find((s) => s.id === state.last) &&
              !state.progress[state.last]?.completed && (
                <div className="continue">
                  <span className="icon-tile">
                    <BookOpen size={24} />
                  </span>
                  <div>
                    <span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span>
                    <h3>{scenarios.find((s) => s.id === state.last)!.title}</h3>
                    <p>
                      Phrase {(state.progress[state.last]?.index || 0) + 1} of{" "}
                      {
                        scenarios.find((s) => s.id === state.last)!.phrases
                          .length
                      }{" "}
                      · You’re making yourself more ready.
                    </p>
                  </div>
                  <button
                    className="primary"
                    onClick={() =>
                      open(scenarios.find((s) => s.id === state.last)!)
                    }
                  >
                    Continue <ArrowRight size={17} />
                  </button>
                </div>
              )}
            <div className="section-heading">
              <div>
                <h2>Your situations</h2>
                <p>A few useful conversations to make your own.</p>
              </div>
              <button className="text-button" onClick={() => nav("settings")}>
                Personalise my kit <Settings size={15} />
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
            <button className="explore-more" onClick={() => nav("library")}>
              <Plus size={19} /> There’s more to everyday life. Explore all
              situations <ArrowRight size={17} />
            </button>
            <div className="tool-grid">
              <button className="tool-card" onClick={() => nav("phrases")}>
                <Bookmark size={23} />
                <div>
                  <h3>Your words, ready to go.</h3>
                  <p>
                    {state.bookmarks.length} saved phrases in your personal
                    collection.
                  </p>
                </div>
                <ChevronRight size={20} />
              </button>
              <button
                className="tool-card"
                onClick={() =>
                  review([...state.bookmarks, ...Object.keys(state.recall)])
                }
              >
                <RotateCcw size={23} />
                <div>
                  <h3>A few minutes to make it stick.</h3>
                  <p>A quick review of saved and practised phrases.</p>
                </div>
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="gentle-note">
              <Leaf size={20} />
              <p>
                You don’t need perfect Spanish. Just a few words to open the
                next conversation.
              </p>
            </div>
          </section>
        )}
      </main>
      <footer>
        <div>
          <Leaf size={17} />
          <span>
            Life Abroad Kit <small>by James Hutchinson Languages</small>
          </span>
        </div>
        <div>
          {savedNotice}
          <button className="text-button" onClick={() => nav("settings")}>
            How saving works
          </button>
        </div>
        <span className="footer-free">
          A little confidence. Completely free.
        </span>
      </footer>
      {reset && (
        <div className="modal-backdrop">
          <div
            className="modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reset-title"
          >
            <h2 id="reset-title">Start fresh on this device?</h2>
            <p>
              This removes your bookmarks, preferences and learning progress
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
