"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownToLine,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Keyboard,
  Mail,
  RotateCcw,
  Send,
  Volume2,
  VolumeX
} from "lucide-react";
import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { education, profile, projects, recognition, skills, work } from "@/lib/profile";

type OutputEntry = {
  id: number;
  command: string;
  response: string;
};

const starterHistory: OutputEntry[] = [
  {
    id: 1,
    command: "system",
    response: "Portfolio console ready. Try: projects, rbl-bcms, skills, resume, contact."
  }
];

const commandHelp = [
  ["about", "short profile"],
  ["work", "experience"],
  ["projects", "project carousel"],
  ["rbl-bcms", "BCMS details"],
  ["rbl-radc", "RADC details"],
  ["suryoday", "Suryoday APIs"],
  ["cub", "City Union Bank"],
  ["skills", "technical stack"],
  ["resume", "download resume"],
  ["contact", "contact links"],
  ["clear", "reset console"]
];

const keyboardRows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function CommandPortfolio() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<OutputEntry[]>(starterHistory);
  const [activeView, setActiveView] = useState("overview");
  const [projectIndex, setProjectIndex] = useState(0);
  const [pressedKey, setPressedKey] = useState("");
  const [soundOn, setSoundOn] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const selectedProject = projects[projectIndex];

  const resumeHref = profile.resume;

  const commandSet = useMemo(() => new Set([...profile.commands, "churn"]), []);

  const playKeySound = useCallback(
    (tone = 280) => {
      if (!soundOn || typeof window === "undefined") {
        return;
      }

      const AudioContextCtor =
        window.AudioContext ||
        (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) {
        return;
      }

      const audio = audioRef.current ?? new AudioContextCtor();
      audioRef.current = audio;

      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = tone;
      gain.gain.setValueAtTime(0.0001, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.025, audio.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.055);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.06);
    },
    [soundOn]
  );

  const addHistory = useCallback((command: string, response: string) => {
    setHistory((items) => [...items.slice(-5), { id: Date.now(), command, response }]);
  }, []);

  const showProject = useCallback(
    (id: string) => {
      const index = projects.findIndex((project) => project.id === id || project.command === id);
      if (index >= 0) {
        setProjectIndex(index);
        setActiveView("projects");
        addHistory(id, `Opening ${projects[index].title}.`);
        return true;
      }
      return false;
    },
    [addHistory]
  );

  const runCommand = useCallback(
    (rawCommand?: string) => {
      const command = normalize(rawCommand ?? input);
      if (!command) {
        return;
      }

      playKeySound(420);
      setInput("");

      if (command === "clear") {
        setHistory(starterHistory);
        setActiveView("overview");
        return;
      }

      if (showProject(command)) {
        return;
      }

      switch (command) {
        case "help":
          setActiveView("help");
          addHistory(command, "Showing available portfolio commands.");
          break;
        case "about":
          setActiveView("about");
          addHistory(command, profile.intro);
          break;
        case "work":
          setActiveView("work");
          addHistory(command, "Opening experience timeline.");
          break;
        case "projects":
          setActiveView("projects");
          addHistory(command, "Opening project carousel.");
          break;
        case "skills":
          setActiveView("skills");
          addHistory(command, "Showing technical stack.");
          break;
        case "resume":
          setActiveView("resume");
          addHistory(command, "Resume download is ready.");
          break;
        case "contact":
          setActiveView("contact");
          addHistory(command, "Opening contact panel.");
          break;
        default:
          addHistory(command, `Unknown command. Try: ${Array.from(commandSet).slice(0, 8).join(", ")}.`);
      }
    },
    [addHistory, commandSet, input, playKeySound, showProject]
  );

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    setPressedKey(event.key.length === 1 ? event.key.toUpperCase() : event.key);
    playKeySound(event.key === "Enter" ? 420 : 240);
    window.setTimeout(() => setPressedKey(""), 130);

    if (event.key === "Enter") {
      event.preventDefault();
      runCommand();
    }
  };

  const typeKey = (key: string) => {
    playKeySound(key === "enter" ? 420 : 260);
    setPressedKey(key.toUpperCase());
    window.setTimeout(() => setPressedKey(""), 130);

    if (key === "enter") {
      runCommand();
      return;
    }

    if (key === "backspace") {
      setInput((value) => value.slice(0, -1));
      inputRef.current?.focus();
      return;
    }

    if (key === "space") {
      setInput((value) => `${value} `);
      inputRef.current?.focus();
      return;
    }

    setInput((value) => `${value}${key.toLowerCase()}`);
    inputRef.current?.focus();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onGlobalKey = (event: globalThis.KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      if (document.activeElement !== inputRef.current && event.key.length === 1) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onGlobalKey);
    return () => window.removeEventListener("keydown", onGlobalKey);
  }, []);

  const nextProject = () => {
    playKeySound(360);
    setProjectIndex((index) => (index + 1) % projects.length);
    setActiveView("projects");
  };

  const previousProject = () => {
    playKeySound(320);
    setProjectIndex((index) => (index - 1 + projects.length) % projects.length);
    setActiveView("projects");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-paper text-ink">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(#ded8cf_1px,transparent_1px),linear-gradient(90deg,#ded8cf_1px,transparent_1px)] bg-[size:56px_56px] opacity-70" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(215,255,101,0.38),transparent_34%),radial-gradient(circle_at_92%_14%,rgba(17,17,17,0.09),transparent_32%)]" />

      <section className="relative mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div className="flex flex-col gap-5">
          <header className="rounded-2xl border border-line bg-card/82 p-5 shadow-soft backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-muted">{profile.role}</p>
                <h1 className="mt-3 text-4xl font-semibold leading-none tracking-tight sm:text-5xl">{profile.name}</h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base">{profile.intro}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSoundOn((value) => !value);
                  playKeySound(480);
                }}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-paper text-ink transition hover:border-ink"
                aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
              >
                {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>

            <div className="mt-6">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted">Worked across</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.workedAcross.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      const command = item.includes("BCMS") ? "rbl-bcms" : item.includes("RADC") ? "rbl-radc" : "work";
                      runCommand(command);
                    }}
                    className="rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold text-ink transition hover:border-ink hover:bg-accent"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <section className="rounded-2xl border border-line bg-command p-4 text-white shadow-soft">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Command line</p>
                <p className="mt-1 text-sm text-white/80">Type a command or use the keyboard below.</p>
              </div>
              <button
                type="button"
                onClick={() => runCommand("clear")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/70 transition hover:border-white/50 hover:text-white"
                aria-label="Clear console"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/12 bg-white/7 px-3 py-3">
              <span className="font-mono text-accent">&gt;</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="projects"
                className="min-w-0 flex-1 bg-transparent font-mono text-sm text-white outline-none placeholder:text-white/35"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => runCommand()}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-bold text-ink transition hover:brightness-95"
              >
                Run <Send size={14} />
              </button>
            </div>

            <div className="mt-4 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-black/18 p-3">
              <div className="grid gap-3">
                {history.map((entry) => (
                  <div key={entry.id} className="font-mono text-xs leading-5">
                    <p className="text-accent">&gt; {entry.command}</p>
                    <p className="text-white/74">{entry.response}</p>
                  </div>
                ))}
              </div>
            </div>

            <CommandSuggestions runCommand={runCommand} />
          </section>

          <TypewriterKeyboard pressedKey={pressedKey} typeKey={typeKey} />
        </div>

        <div className="grid gap-5 lg:grid-rows-[auto_1fr]">
          <DisplayPanel
            activeView={activeView}
            selectedProject={selectedProject}
            projectIndex={projectIndex}
            previousProject={previousProject}
            nextProject={nextProject}
            runCommand={runCommand}
            resumeHref={resumeHref}
          />
        </div>
      </section>
    </main>
  );
}

function CommandSuggestions({ runCommand }: { runCommand: (command: string) => void }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {commandHelp.slice(0, 8).map(([command, label]) => (
        <button
          key={command}
          type="button"
          onClick={() => runCommand(command)}
          className="rounded-lg border border-white/10 px-2.5 py-1.5 font-mono text-xs text-white/72 transition hover:border-accent hover:text-accent"
        >
          {command}
          <span className="ml-2 text-white/35">{label}</span>
        </button>
      ))}
    </div>
  );
}

function TypewriterKeyboard({
  pressedKey,
  typeKey
}: {
  pressedKey: string;
  typeKey: (key: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-line bg-card/88 p-4 shadow-soft backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Keyboard size={17} />
          <h2 className="text-sm font-bold">Typewriter input</h2>
        </div>
        <p className="font-mono text-xs text-muted">physical keyboard also works</p>
      </div>

      <div className="mt-4 grid gap-2">
        {keyboardRows.map((row, rowIndex) => (
          <div key={row} className={`flex justify-center gap-1.5 ${rowIndex === 1 ? "px-4" : rowIndex === 2 ? "px-9" : ""}`}>
            {row.split("").map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => typeKey(letter)}
                className={`h-10 min-w-8 rounded-lg border border-ink bg-paper px-2 font-mono text-xs font-bold shadow-key transition duration-100 ${
                  pressedKey === letter ? "translate-y-1 shadow-none" : "hover:-translate-y-0.5"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
        <div className="flex justify-center gap-1.5">
          <button type="button" onClick={() => typeKey("backspace")} className="h-10 rounded-lg border border-ink bg-paper px-4 font-mono text-xs font-bold shadow-key transition hover:-translate-y-0.5">
            back
          </button>
          <button type="button" onClick={() => typeKey("space")} className="h-10 w-40 rounded-lg border border-ink bg-paper font-mono text-xs font-bold shadow-key transition hover:-translate-y-0.5">
            space
          </button>
          <button type="button" onClick={() => typeKey("enter")} className="h-10 rounded-lg border border-ink bg-accent px-4 font-mono text-xs font-bold shadow-key transition hover:-translate-y-0.5">
            enter
          </button>
        </div>
      </div>
    </section>
  );
}

function DisplayPanel({
  activeView,
  selectedProject,
  projectIndex,
  previousProject,
  nextProject,
  runCommand,
  resumeHref
}: {
  activeView: string;
  selectedProject: (typeof projects)[number];
  projectIndex: number;
  previousProject: () => void;
  nextProject: () => void;
  runCommand: (command: string) => void;
  resumeHref: string;
}) {
  return (
    <section className="rounded-2xl border border-line bg-card/88 p-5 shadow-soft backdrop-blur-xl lg:min-h-[calc(100vh-2.5rem)]">
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-center">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted">Live portfolio surface</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{panelTitle(activeView)}</h2>
        </div>
        <div className="flex gap-2">
          <a href={resumeHref} download className="inline-flex items-center gap-2 rounded-xl border border-ink bg-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-accent hover:text-ink">
            Resume <ArrowDownToLine size={16} />
          </a>
          <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 rounded-xl border border-line bg-paper px-4 py-2 text-sm font-bold transition hover:border-ink">
            Contact <Mail size={16} />
          </a>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView === "projects" ? `${activeView}-${selectedProject.id}` : activeView}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="pt-6"
        >
          {activeView === "help" ? <HelpPanel runCommand={runCommand} /> : null}
          {activeView === "about" || activeView === "overview" ? <AboutPanel runCommand={runCommand} /> : null}
          {activeView === "work" ? <WorkPanel /> : null}
          {activeView === "skills" ? <SkillsPanel /> : null}
          {activeView === "resume" ? <ResumePanel resumeHref={resumeHref} /> : null}
          {activeView === "contact" ? <ContactPanel /> : null}
          {activeView === "projects" ? (
            <ProjectPanel
              selectedProject={selectedProject}
              projectIndex={projectIndex}
              previousProject={previousProject}
              nextProject={nextProject}
            />
          ) : null}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function panelTitle(activeView: string) {
  switch (activeView) {
    case "help":
      return "Command map";
    case "work":
      return "Experience";
    case "projects":
      return "Project carousel";
    case "skills":
      return "Technical stack";
    case "resume":
      return "Resume";
    case "contact":
      return "Contact";
    default:
      return "Overview";
  }
}

function HelpPanel({ runCommand }: { runCommand: (command: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {commandHelp.map(([command, label]) => (
        <button
          key={command}
          type="button"
          onClick={() => runCommand(command)}
          className="flex items-center justify-between rounded-xl border border-line bg-paper p-4 text-left transition hover:border-ink hover:bg-accent"
        >
          <span className="font-mono text-sm font-bold">{command}</span>
          <span className="text-sm text-muted">{label}</span>
        </button>
      ))}
    </div>
  );
}

function AboutPanel({ runCommand }: { runCommand: (command: string) => void }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <article className="rounded-2xl border border-line bg-paper p-5">
        <p className="text-lg leading-8 text-muted">{profile.intro}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {profile.workedAcross.map((item) => (
            <span key={item} className="rounded-xl border border-line bg-card px-3 py-2 text-sm font-semibold">
              {item}
            </span>
          ))}
        </div>
        <div className="mt-6 grid gap-3 border-t border-line pt-5 sm:grid-cols-2">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted">Certification</p>
            <p className="mt-2 text-sm font-semibold">{recognition.certifications[0]}</p>
          </div>
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted">Award</p>
            <p className="mt-2 text-sm font-semibold">{recognition.awards[0]}</p>
          </div>
        </div>
      </article>
      <article className="rounded-2xl border border-line bg-ink p-5 text-white">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/45">Fast routes</p>
        <div className="mt-4 grid gap-2">
          {["projects", "rbl-bcms", "skills", "resume", "contact"].map((command) => (
            <button
              key={command}
              type="button"
              onClick={() => runCommand(command)}
              className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-left font-mono text-sm text-white/78 transition hover:border-accent hover:text-accent"
            >
              {command}
              <ArrowUpRight size={15} />
            </button>
          ))}
        </div>
      </article>
    </div>
  );
}

function WorkPanel() {
  return (
    <div className="grid gap-4">
      {work.map((item) => (
        <article key={item.company} className="rounded-2xl border border-line bg-paper p-5">
          <div className="flex flex-col justify-between gap-2 sm:flex-row">
            <div>
              <h3 className="text-xl font-semibold">{item.role}</h3>
              <p className="mt-1 text-sm text-muted">{item.company}</p>
            </div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-muted">{item.period}</p>
          </div>
          <ul className="mt-5 grid gap-3">
            {item.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 text-sm leading-6 text-muted">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function ProjectPanel({
  selectedProject,
  projectIndex,
  previousProject,
  nextProject
}: {
  selectedProject: (typeof projects)[number];
  projectIndex: number;
  previousProject: () => void;
  nextProject: () => void;
}) {
  return (
    <article className="rounded-2xl border border-line bg-paper p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted">{selectedProject.label}</p>
          <h3 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight">{selectedProject.title}</h3>
          <p className="mt-2 font-mono text-xs text-muted">{selectedProject.duration}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={previousProject} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-card transition hover:border-ink" aria-label="Previous project">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={nextProject} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-card transition hover:border-ink" aria-label="Next project">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <p className="mt-5 max-w-3xl text-base leading-7 text-muted">{selectedProject.summary}</p>
      <p className="mt-5 border-l border-ink pl-4 text-base font-semibold leading-7">{selectedProject.impact}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {selectedProject.tech.map((item) => (
          <span key={item} className="rounded-xl border border-line bg-card px-3 py-2 text-sm text-muted">
            {item}
          </span>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-between border-t border-line pt-4">
        <p className="font-mono text-xs text-muted">
          {projectIndex + 1} / {projects.length}
        </p>
        <p className="font-mono text-xs text-muted">command: {selectedProject.command}</p>
      </div>
    </article>
  );
}

function SkillsPanel() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {skills.map((group) => (
        <article key={group.group} className="rounded-2xl border border-line bg-paper p-5">
          <h3 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted">{group.group}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {group.items.map((item) => (
              <span key={item} className="rounded-xl border border-line bg-card px-3 py-2 text-sm font-semibold">
                {item}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function ResumePanel({ resumeHref }: { resumeHref: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <article className="rounded-2xl border border-line bg-paper p-5">
        <h3 className="text-2xl font-semibold">Resume download</h3>
        <p className="mt-3 text-sm leading-6 text-muted">Download the current resume PDF for recruiter review or interview context.</p>
        <a href={resumeHref} download className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-bold text-white transition hover:bg-accent hover:text-ink">
          Download resume <ArrowDownToLine size={16} />
        </a>
      </article>
      <article className="rounded-2xl border border-line bg-paper p-5">
        <h3 className="text-2xl font-semibold">Education</h3>
        <div className="mt-4 grid gap-4">
          {education.map((item) => (
            <div key={item.degree}>
              <p className="font-semibold">{item.degree}</p>
              <p className="text-sm text-muted">{item.school}</p>
              <p className="font-mono text-xs text-muted">{item.year}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function ContactPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <a href={`mailto:${profile.email}`} className="rounded-2xl border border-line bg-paper p-5 transition hover:border-ink">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Email</p>
        <p className="mt-3 break-words text-xl font-semibold">{profile.email}</p>
      </a>
      <a href={profile.linkedin} className="rounded-2xl border border-line bg-paper p-5 transition hover:border-ink">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">LinkedIn</p>
        <p className="mt-3 text-xl font-semibold">nishant-bhadke-983837185</p>
      </a>
      <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className="rounded-2xl border border-line bg-paper p-5 transition hover:border-ink">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Phone</p>
        <p className="mt-3 text-xl font-semibold">{profile.phone}</p>
      </a>
      <article className="rounded-2xl border border-line bg-paper p-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Recognition</p>
        <div className="mt-3 grid gap-2 text-sm font-semibold">
          {recognition.certifications.concat(recognition.awards).map((item) => (
            <p key={item} className="rounded-xl bg-card px-3 py-2">
              {item}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
