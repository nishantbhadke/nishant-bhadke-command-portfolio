"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  BriefcaseBusiness,
  Download,
  Grip,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Send,
  Terminal,
  Wrench
} from "lucide-react";
import { FormEvent, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { analyzeContactDraft } from "@/lib/messageSafety";
import type { ContactDraft } from "@/lib/messageSafety";
import { profile, projects, skills, work } from "@/lib/profile";

type SectionKey = "overview" | "projects" | "work" | "skills" | "contact";
type DockMode = "right" | "bottom" | "wide";
type ContactStep = "name" | "email" | "message";

type HistoryEntry = {
  id: number;
  command: string;
  response: string;
};

type ContactFlow = {
  step: ContactStep;
  name: string;
  email: string;
};

const commandList = ["about", "projects", "work", "skills", "contact", "download resume", "clear"];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function commandAlias(command: string) {
  const aliases: Record<string, string> = {
    intro: "about",
    profile: "about",
    project: "projects",
    experience: "work",
    exp: "work",
    stack: "skills",
    tech: "skills",
    resume: "download resume",
    cv: "download resume",
    mail: "contact",
    email: "contact"
  };

  return aliases[command] ?? command;
}

function sectionForCommand(command: string): SectionKey | null {
  if (command === "about") return "overview";
  if (command === "projects") return "projects";
  if (command === "work") return "work";
  if (command === "skills") return "skills";
  if (command === "contact") return "contact";
  return null;
}

function promptFor(flow: ContactFlow | null) {
  if (!flow) return "$";
  if (flow.step === "name") return "[INPUT: Your Name]>";
  if (flow.step === "email") return "[INPUT: Your Email]>";
  return "[INPUT: Your Message]>";
}

export function CommandPortfolio() {
  const [activeSection, setActiveSection] = useState<SectionKey>("overview");
  const [projectIndex, setProjectIndex] = useState(0);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      id: 1,
      command: "boot",
      response: "Portfolio loaded. Try `projects`, `rbl-bcms`, `download resume`, or move this console from the dock controls."
    }
  ]);
  const [dockMode, setDockMode] = useState<DockMode>("right");
  const [consoleHeaderProgress, setConsoleHeaderProgress] = useState(0);
  const [contactFlow, setContactFlow] = useState<ContactFlow | null>(null);
  const [notice, setNotice] = useState("");
  const [composer, setComposer] = useState<ContactDraft>({ name: "", email: "", subject: "", message: "" });

  const outputRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const workRef = useRef<HTMLElement>(null);
  const skillsRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const deferredMessage = useDeferredValue(composer.message);
  const draftAnalysis = analyzeContactDraft({ ...composer, message: deferredMessage });

  const refs: Record<SectionKey, React.RefObject<HTMLElement | null>> = useMemo(
    () => ({
      overview: overviewRef,
      projects: projectsRef,
      work: workRef,
      skills: skillsRef,
      contact: contactRef
    }),
    []
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    let ticking = false;

    const updateConsoleMode = () => {
      const scrollY = window.scrollY;
      const projectsTop = projectsRef.current?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      const scrollProgress = Math.min(1, Math.max(0, (scrollY - 80) / 140));
      const sectionProgress = Math.min(1, Math.max(0, (window.innerHeight * 0.78 - projectsTop) / 180));
      const nextProgress = Math.max(scrollProgress, sectionProgress);
      setConsoleHeaderProgress((current) => (Math.abs(current - nextProgress) < 0.015 ? current : nextProgress));
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateConsoleMode);
    };

    updateConsoleMode();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function addHistory(command: string, response: string) {
    setHistory((items) => [...items.slice(-7), { id: Date.now(), command, response }]);
    window.setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function openSection(section: SectionKey, response: string) {
    setActiveSection(section);
    addHistory(section === "overview" ? "about" : section, response);
    window.setTimeout(() => refs[section].current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function downloadResume() {
    const link = document.createElement("a");
    link.href = profile.resume;
    link.download = "Nishant_Bhadke_Resume.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function startContactFlow() {
    setContactFlow({ step: "name", name: "", email: "" });
    setActiveSection("contact");
    addHistory("contact", "Terminal contact started. Answer the three prompts, or type `cancel`.");
    window.setTimeout(() => contactRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function handleContactInput(rawValue: string) {
    const value = rawValue.trim();
    const lowered = normalize(value);

    if (lowered === "cancel") {
      setContactFlow(null);
      addHistory("cancel", "Contact flow cancelled. Command mode restored.");
      return;
    }

    if (!contactFlow) return;

    if (contactFlow.step === "name") {
      if (!value) {
        addHistory("name", "Name is required.");
        return;
      }
      setContactFlow({ step: "email", name: value, email: "" });
      addHistory("name", `Got it, ${value}.`);
      return;
    }

    if (contactFlow.step === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        addHistory("email", "That email format looks wrong. Try again.");
        return;
      }
      setContactFlow({ step: "message", name: contactFlow.name, email: value });
      addHistory("email", "Email saved. Add the message next.");
      return;
    }

    if (!value) {
      addHistory("message", "Message cannot be empty.");
      return;
    }

    setComposer({
      name: contactFlow.name,
      email: contactFlow.email,
      subject: "Portfolio conversation",
      message: value
    });
    setContactFlow(null);
    addHistory("message", `Message Sent. Thanks, ${contactFlow.name}. I can reply at ${contactFlow.email}.`);
  }

  function runCommand(rawCommand?: string) {
    const original = normalize(rawCommand ?? input);
    const command = commandAlias(original);

    if (!command) return;

    setInput("");
    setNotice("");

    if (contactFlow) {
      handleContactInput(rawCommand ?? input);
      return;
    }

    if (command === "clear") {
      setHistory([]);
      return;
    }

    if (command === "help" || command === "ls" || command === "list") {
      addHistory(command, `Available commands: ${commandList.join(", ")}. Project shortcuts: ${projects.map((project) => project.command).join(", ")}.`);
      return;
    }

    if (command === "download resume") {
      downloadResume();
      addHistory(command, "Resume download started.");
      return;
    }

    const directSection = sectionForCommand(command);
    if (directSection === "contact") {
      startContactFlow();
      return;
    }

    if (directSection) {
      openSection(directSection, `Moved to ${directSection === "overview" ? "about" : directSection}.`);
      return;
    }

    const projectIndexMatch = projects.findIndex(
      (project) => project.command === command || project.id === command || project.title.toLowerCase().includes(command)
    );

    if (projectIndexMatch >= 0) {
      setProjectIndex(projectIndexMatch);
      setActiveSection("projects");
      addHistory(command, `Opened ${projects[projectIndexMatch].shortTitle}. Problem, contribution, and result are now in view.`);
      window.setTimeout(() => projectsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      return;
    }

    if (command.startsWith("search ")) {
      const query = command.replace(/^search\s+/, "");
      const projectMatch = projects.findIndex((project) =>
        [project.title, project.shortTitle, project.summary, project.problem, project.contribution, project.impact, project.tech.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );

      if (projectMatch >= 0) {
        setProjectIndex(projectMatch);
        setActiveSection("projects");
        addHistory(command, `Found ${projects[projectMatch].shortTitle}.`);
        window.setTimeout(() => projectsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
        return;
      }

      addHistory(command, "No exact match. Try `redis`, `loan`, `oracle`, `pdf`, or `aws`.");
      return;
    }

    addHistory(command, "I did not recognize that command. Try `help`, `projects`, `rbl-bcms`, `skills`, or `contact`.");
  }

  function submitCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runCommand(input);
  }

  function openDraftEmail() {
    const analysis = analyzeContactDraft(composer);
    if (!composer.message.trim()) {
      setNotice("Add a short message first.");
      return;
    }
    if (analysis.blocked) {
      setNotice("Tone check blocked this draft. Rewrite it and try again.");
      return;
    }

    const body = [
      "Hi Nishant,",
      "",
      composer.message.trim(),
      "",
      composer.name.trim() ? `From: ${composer.name.trim()}` : null,
      composer.email.trim() ? `Reply email: ${composer.email.trim()}` : null
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(composer.subject || "Portfolio conversation")}&body=${encodeURIComponent(body)}`;
    setNotice("Email draft opened in your mail client.");
  }

  const selectedProject = projects[projectIndex];
  const isConsoleHeader = consoleHeaderProgress > 0.92;
  const showFloatingConsole = consoleHeaderProgress > 0.02;
  const layoutProgress = Math.min(1, Math.max(0, (consoleHeaderProgress - 0.35) / 0.65));
  const shellClass = dockMode === "right" ? "portfolio-shell-right" : dockMode === "wide" ? "portfolio-shell-wide" : "portfolio-shell-bottom";
  const shellStyle = {
    "--console-col": `${Math.round(410 * (1 - layoutProgress))}px`,
    "--console-gap": `${Math.round(24 * (1 - layoutProgress))}px`
  } as React.CSSProperties;

  return (
    <main id="main-content" className="min-h-screen bg-paper text-ink">
      <div className="ambient-wash pointer-events-none fixed inset-0" />
      <div className="ambient-grid pointer-events-none fixed inset-0" />

      <div
        className="console-floating-shell fixed inset-x-3 top-3 z-50 lg:inset-x-6"
        style={{
          opacity: consoleHeaderProgress,
          pointerEvents: isConsoleHeader ? "auto" : "none",
          transform: `translate3d(0, ${Math.round((1 - consoleHeaderProgress) * -16)}px, 0) scale(${0.985 + consoleHeaderProgress * 0.015})`
        }}
        aria-hidden={!showFloatingConsole}
      >
        <div className="mx-auto max-w-[92rem]">
          <CommandConsole
            activeSection={activeSection}
            contactFlow={contactFlow}
            dockMode={dockMode}
            history={history}
            input={input}
            inputRef={isConsoleHeader ? inputRef : null}
            isHeaderMode
            outputRef={outputRef}
            runCommand={runCommand}
            setDockMode={setDockMode}
            setInput={setInput}
            submitCommand={submitCommand}
          />
        </div>
      </div>

      <div className={`portfolio-shell ${shellClass} relative mx-auto grid w-full max-w-[92rem] px-4 py-5 sm:px-6 lg:px-8`} style={shellStyle}>
        <div className="grid min-w-0 gap-6">
          <HeroSection overviewRef={overviewRef} runCommand={runCommand} />

          <section ref={projectsRef} className="section-shell scroll-mt-6">
            <SectionHeader
              eyebrow="Selected work"
              title="Projects that had business rules, deadlines, and people depending on them."
              copy="I kept this to five projects because a hiring manager should not need to dig through everything I have touched."
            />
            <div className="project-showcase mt-5 grid gap-4">
              <div className="project-rail flex gap-2 overflow-x-auto pb-1">
                {projects.map((project, index) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => {
                      setProjectIndex(index);
                      setActiveSection("projects");
                    }}
                    className={`project-tab min-w-64 rounded-lg border px-4 py-3 text-left transition lg:min-w-0 ${
                      index === projectIndex
                        ? "border-accent bg-accent text-[#1b1609]"
                        : "border-line bg-card/86 text-muted hover:border-accent hover:text-ink"
                    }`}
                  >
                    <span className="font-mono text-xs">{project.command}</span>
                    <span className="mt-2 block text-sm font-bold">{project.shortTitle}</span>
                    <span className="mt-1 block text-xs leading-5 opacity-80">{project.label}</span>
                  </button>
                ))}
              </div>
              <motion.article
                key={selectedProject.id}
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                className="project-detail-card rounded-lg border border-line bg-card/92 p-5 shadow-soft"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-xs font-bold uppercase text-accent">{selectedProject.label}</p>
                    <h2 className="mt-2 text-2xl font-black leading-tight text-ink sm:text-3xl xl:text-4xl">{selectedProject.title}</h2>
                    <p className="mt-2 font-mono text-xs uppercase text-muted">{selectedProject.duration}</p>
                  </div>
                  <span className="rounded-md border border-line bg-command px-3 py-2 font-mono text-xs text-muted">
                    {selectedProject.command}
                  </span>
                </div>
                <p className="mt-5 text-base leading-8 text-muted">{selectedProject.summary}</p>
                <div className="mt-5 grid gap-3 xl:grid-cols-3">
                  <ProofBlock label="Problem" value={selectedProject.problem} />
                  <ProofBlock label="My part" value={selectedProject.contribution} />
                  <ProofBlock label="Result" value={selectedProject.impact} strong />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {selectedProject.tech.map((item) => (
                    <span key={item} className="rounded-md border border-line bg-command px-3 py-2 text-xs font-semibold text-muted">
                      {item}
                    </span>
                  ))}
                </div>
              </motion.article>
            </div>
          </section>

          <section ref={workRef} className="section-shell scroll-mt-6">
            <SectionHeader
              eyebrow="Experience"
              title="Production work, not just portfolio demos."
              copy="Most of my work has been inside banking workflows where small mistakes turn into support calls, audit questions, or blocked operations."
            />
            <div className="mt-5 grid gap-4">
              {work.map((item) => (
                <article key={item.company} className="interactive-card rounded-lg border border-line bg-card/92 p-5 shadow-soft">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-black text-ink">{item.role}</h3>
                      <p className="mt-1 font-mono text-sm text-accent">{item.company}</p>
                    </div>
                    <p className="font-mono text-xs uppercase text-muted">{item.period}</p>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {item.bullets.map((bullet) => (
                      <p key={bullet} className="soft-tile rounded-md border border-line bg-surface/78 px-4 py-3 text-sm leading-7 text-muted">
                        {bullet}
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section ref={skillsRef} className="section-shell scroll-mt-6">
            <SectionHeader
              eyebrow="Stack"
              title="Tools I have actually used to ship backend systems."
              copy="The list is intentionally grouped by how I use the tools, not by keyword stuffing."
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {skills.map((group) => (
                <article key={group.group} className="interactive-card rounded-lg border border-line bg-card/92 p-4">
                  <p className="font-mono text-xs font-bold uppercase text-accent">{group.group}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span key={item} className="skill-chip rounded-md bg-command px-2.5 py-2 text-xs font-semibold text-muted">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section ref={contactRef} className="section-shell scroll-mt-6">
            <SectionHeader
              eyebrow="Contact"
              title="Reach out directly, or use the terminal prompt."
              copy="If you want the fastest route, send the message from here. If you like the concept, run `contact` in the console."
            />
            <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="grid gap-3">
                <ContactLink icon={<Mail size={18} />} label="Email" value={profile.email} href={`mailto:${profile.email}`} />
                <ContactLink icon={<Phone size={18} />} label="Phone" value={profile.phone} href={`tel:${profile.phone.replace(/\s/g, "")}`} />
                <ContactLink icon={<Linkedin size={18} />} label="LinkedIn" value="nishant-bhadke-983837185" href={profile.linkedin} />
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  openDraftEmail();
                }}
                className="interactive-card rounded-lg border border-line bg-card/92 p-5 shadow-soft"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <InputField label="Name" value={composer.name} onChange={(value) => setComposer((current) => ({ ...current, name: value }))} />
                  <InputField label="Email" value={composer.email} onChange={(value) => setComposer((current) => ({ ...current, email: value }))} type="email" />
                </div>
                <div className="mt-3">
                  <InputField label="Subject" value={composer.subject} onChange={(value) => setComposer((current) => ({ ...current, subject: value }))} />
                </div>
                <label className="mt-3 block text-sm font-bold text-ink" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  value={composer.message}
                  onChange={(event) => setComposer((current) => ({ ...current, message: event.target.value }))}
                  className="input-glow mt-2 min-h-36 w-full rounded-md border border-line bg-surface px-3 py-3 text-sm leading-7 text-ink outline-none focus:border-accent"
                  placeholder="Hi Nishant, I saw your banking platform work and wanted to talk about..."
                />
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-muted">
                    {notice || `Tone check: ${draftAnalysis.blocked ? "rewrite needed" : "clear"}; readiness ${draftAnalysis.readinessPercent}%.`}
                  </p>
                  <button type="submit" className="action-button inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-black text-[#1b1609] transition hover:bg-accentSoft">
                    Draft email <Send size={16} />
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>

        <aside
          className={`console-dock-shell z-20 ${
            dockMode === "right"
              ? "lg:sticky lg:top-5 lg:h-[calc(100vh-40px)]"
              : dockMode === "bottom"
                ? "fixed inset-x-3 bottom-3"
                : "lg:order-first"
          }`}
          style={{
            opacity: 1 - consoleHeaderProgress,
            pointerEvents: isConsoleHeader ? "none" : "auto",
            transform: `translate3d(0, ${Math.round(consoleHeaderProgress * 8)}px, 0)`,
            filter: `blur(${consoleHeaderProgress * 2}px)`
          }}
          aria-hidden={isConsoleHeader}
        >
          <div
            className={
              dockMode === "wide"
                  ? "grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]"
                  : "grid gap-4"
            }
          >
            <CommandConsole
              activeSection={activeSection}
              contactFlow={contactFlow}
              dockMode={dockMode}
              history={history}
              input={input}
              inputRef={isConsoleHeader ? null : inputRef}
              isHeaderMode={false}
              outputRef={outputRef}
              runCommand={runCommand}
              setDockMode={setDockMode}
              setInput={setInput}
              submitCommand={submitCommand}
            />
            <AnimatePresence initial={false}>
              <Mascot dockMode={dockMode} />
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </main>
  );
}

function HeroSection({
  overviewRef,
  runCommand
}: {
  overviewRef: React.RefObject<HTMLElement | null>;
  runCommand: (command?: string) => void;
}) {
  return (
    <motion.section
      ref={overviewRef}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="site-reveal min-h-[88vh] scroll-mt-6 py-8 sm:py-12"
    >
      <div className="grid min-h-[76vh] items-center gap-8">
        <div>
          <p className="font-mono text-sm font-bold uppercase text-accent">Hello, I build & worked on backend systems for banks.</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight text-ink sm:text-7xl">
            Nishant Bhadke
          </h1>
          <p className="mt-4 max-w-3xl text-2xl font-black leading-snug text-ink sm:text-4xl">
            .NET backend engineer for banking workflows, APIs, and SQL-heavy platforms.
          </p>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{profile.intro}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={() => runCommand("projects")} className="action-button inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-black text-[#1b1609] transition hover:bg-accentSoft">
              View projects <ArrowDown size={16} />
            </button>
            <button onClick={() => runCommand("download resume")} className="secondary-action inline-flex items-center gap-2 rounded-md border border-line bg-card px-5 py-3 text-sm font-bold text-ink transition hover:border-accent">
              Resume <Download size={16} />
            </button>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <HeroStat icon={<BriefcaseBusiness size={18} />} label="Role" value={profile.role} />
            <HeroStat icon={<Wrench size={18} />} label="Core lane" value="APIs, SQL, BFSI flows" />
            <HeroStat icon={<MapPin size={18} />} label="Location" value={profile.location} />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function CommandConsole({
  activeSection,
  contactFlow,
  dockMode,
  history,
  isHeaderMode,
  input,
  inputRef,
  outputRef,
  runCommand,
  setDockMode,
  setInput,
  submitCommand
}: {
  activeSection: SectionKey;
  contactFlow: ContactFlow | null;
  dockMode: DockMode;
  history: HistoryEntry[];
  isHeaderMode: boolean;
  input: string;
  inputRef: React.RefObject<HTMLInputElement | null> | null;
  outputRef: React.RefObject<HTMLDivElement | null>;
  runCommand: (command?: string) => void;
  setDockMode: (mode: DockMode) => void;
  setInput: (value: string) => void;
  submitCommand: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const quickCommands = contactFlow ? ["cancel"] : ["about", "projects", "rbl-bcms", "skills", "contact", "download resume"];
  const latestResponse = history.length > 0 ? history[history.length - 1].response : "Console cleared.";

  const dockControls = (
    <div className="flex rounded-md border border-line bg-surface p-1" aria-label="Console dock controls">
      {(["right", "bottom", "wide"] as DockMode[]).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => setDockMode(mode)}
          className={`dock-button rounded px-2 py-1 font-mono text-[0.68rem] uppercase ${dockMode === mode ? "bg-accent text-[#1b1609]" : "text-muted"}`}
        >
          {mode}
        </button>
      ))}
    </div>
  );

  const commandForm = (className: string) => (
    <form onSubmit={submitCommand} className={className}>
      <div className="flex items-center gap-2">
        <span className="shrink-0 font-mono text-sm font-bold text-accent">{promptFor(contactFlow)}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="min-w-0 flex-1 bg-transparent font-mono text-sm text-[#ffe69a] outline-none placeholder:text-[#9c8542]"
          placeholder={contactFlow ? "type your answer" : "projects, search redis, contact"}
          spellCheck={false}
          autoComplete="off"
        />
        <span aria-hidden="true" className="console-cursor" />
        <button type="submit" className="action-button rounded bg-accent px-3 py-2 text-xs font-black text-[#1b1609] transition hover:bg-accentSoft">
          Run
        </button>
      </div>
    </form>
  );

  return (
    <motion.div
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      initial={{ opacity: 0, y: isHeaderMode ? -8 : 8, scale: 0.995, filter: "blur(2px)" }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={`console-panel ${
        isHeaderMode
          ? "console-header rounded-xl border border-line bg-card/96 p-3 shadow-soft backdrop-blur-xl"
          : "rounded-lg border border-line bg-card/96 p-4 shadow-soft backdrop-blur-xl"
      }`}
    >
      {isHeaderMode ? (
        <>
        <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-center">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-accent" />
            <div>
              <p className="font-mono text-xs font-bold uppercase text-accent">Command console</p>
              <p className="text-xs text-muted">header mode / active: {activeSection}</p>
            </div>
          </div>
          {commandForm("console-screen rounded-md border border-line bg-[#141106] p-3")}
          {dockControls}
        </div>
        <p className="mt-2 truncate font-mono text-[0.72rem] text-muted">last: {latestResponse}</p>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Terminal size={18} className="text-accent" />
              <div>
                <p className="font-mono text-xs font-bold uppercase text-accent">Command console</p>
                <p className="text-xs text-muted">active: {activeSection}</p>
              </div>
            </div>
            {dockControls}
          </div>
          {commandForm("console-screen mt-4 rounded-md border border-line bg-[#141106] p-3")}
          <div className="mt-3 flex flex-wrap gap-2">
            {quickCommands.map((command) => (
              <button
                key={command}
                type="button"
                onClick={() => runCommand(command)}
                className="command-chip rounded-md border border-line bg-surface px-2.5 py-2 font-mono text-xs text-muted transition hover:border-accent hover:text-ink"
              >
                {command}
              </button>
            ))}
          </div>
          <div ref={outputRef} className="console-screen mt-4 max-h-[48vh] overflow-y-auto rounded-md border border-line bg-[#141106] p-3" role="log" aria-live="polite">
            {history.length === 0 ? (
              <p className="font-mono text-xs leading-6 text-[#9c8542]">Console cleared.</p>
            ) : (
              history.map((entry) => (
                <div key={entry.id} className="history-entry border-b border-[#3c3214] py-2 last:border-0">
                  <p className="font-mono text-xs text-accent">$ {entry.command}</p>
                  <p className="mt-1 text-sm leading-6 text-[#ffe69a]">{entry.response}</p>
                </div>
              ))
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted">
            <Grip size={14} />
            <span>Dock it right, bottom, or wide. Every command scrolls to the result.</span>
          </div>
        </>
      )}
    </motion.div>
  );
}

function Mascot({ dockMode }: { dockMode: DockMode }) {
  const wrapperClass =
    dockMode === "bottom"
      ? "hidden lg:flex items-center gap-4 rounded-lg border border-line bg-card/96 p-3 shadow-soft backdrop-blur-xl"
      : "mascot-card mx-auto w-full rounded-lg border border-line bg-card/92 p-4 shadow-soft";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 8, filter: "blur(2px)" }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={wrapperClass}
    >
      <div className={`${dockMode === "bottom" ? "w-20 shrink-0" : "mx-auto w-40"} rounded-lg border border-line bg-[#151107] p-3`}>
        <div className="mx-auto h-4 w-20 rounded-t-full bg-accent" />
        <div className={`${dockMode === "bottom" ? "h-16 w-16" : "h-28 w-32"} mascot-head relative mx-auto mt-1 rounded-lg border-4 border-[#3b3318] bg-[#ffdb62]`}>
          <div className={`${dockMode === "bottom" ? "left-3 top-4 h-3 w-3" : "left-5 top-7 h-5 w-5"} absolute rounded-full bg-[#191408]`} />
          <div className={`${dockMode === "bottom" ? "right-3 top-4 h-3 w-3" : "right-5 top-7 h-5 w-5"} absolute rounded-full bg-[#191408]`} />
          <div className={`${dockMode === "bottom" ? "top-9 h-2 w-8" : "top-14 h-3 w-14"} absolute left-1/2 -translate-x-1/2 rounded-full bg-[#191408]`} />
          {dockMode !== "bottom" && (
            <>
              <div className="absolute -left-4 top-9 h-8 w-3 rounded bg-accent" />
              <div className="absolute -right-4 top-9 h-8 w-3 rounded bg-accent" />
            </>
          )}
        </div>
        {dockMode !== "bottom" && <div className="mx-auto mt-3 h-9 w-24 rounded-lg border border-line bg-command" />}
      </div>
      <p className={`${dockMode === "bottom" ? "text-left" : "mt-4 text-center"} font-mono text-xs leading-6 text-muted`}>
        NishBot stays with the console now. He watches logs, nudges the prompt, and keeps the page from feeling too polished.
      </p>
    </motion.div>
  );
}

function SectionHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="site-reveal">
      <p className="font-mono text-xs font-black uppercase text-accent">{eyebrow}</p>
      <h2 className="mt-2 max-w-4xl text-3xl font-black leading-tight text-ink sm:text-4xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-base leading-7 text-muted">{copy}</p>
    </div>
  );
}

function HeroStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="site-reveal rounded-lg border border-line bg-card/90 p-4 transition duration-300 hover:-translate-y-1 hover:border-accent">
      <div className="text-accent">{icon}</div>
      <p className="mt-3 font-mono text-xs uppercase text-muted">{label}</p>
      <p className="mt-1 text-sm font-black text-ink">{value}</p>
    </div>
  );
}

function ProofBlock({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`site-reveal rounded-lg border border-line p-4 transition duration-300 hover:-translate-y-1 ${strong ? "bg-accent text-[#1b1609]" : "bg-surface/82 text-muted"}`}>
      <p className={`font-mono text-xs font-black uppercase ${strong ? "text-[#3f3107]" : "text-accent"}`}>{label}</p>
      <p className="mt-2 text-sm font-semibold leading-7">{value}</p>
    </div>
  );
}

function ContactLink({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className="interactive-card flex items-center gap-3 rounded-lg border border-line bg-card/92 p-4 text-ink transition hover:border-accent">
      <span className="text-accent">{icon}</span>
      <span>
        <span className="block font-mono text-xs uppercase text-muted">{label}</span>
        <span className="block break-all text-sm font-bold">{value}</span>
      </span>
    </a>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  const id = label.toLowerCase();

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input-glow mt-2 w-full rounded-md border border-line bg-surface px-3 py-3 text-sm text-ink outline-none focus:border-accent"
      />
    </div>
  );
}
