"use client";

import { motion } from "framer-motion";
import {
  ArrowDownToLine,
  ArrowRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Command,
  Github,
  Keyboard,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { KeyboardEvent, startTransition, useDeferredValue, useRef, useState } from "react";
import { education, profile, projects, recognition, skills, work } from "@/lib/profile";
import { analyzeContactDraft, OFFENSIVE_THRESHOLD } from "@/lib/messageSafety";

type OutputEntry = {
  id: number;
  command: string;
  response: string;
};

type SectionKey = "overview" | "projects" | "work" | "skills" | "resume" | "contact";
type ComposerField = "name" | "email" | "subject" | "message";

const starterHistory: OutputEntry[] = [
  {
    id: 1,
    command: "system",
    response: "Ready. Try about, projects, search redis, work, resume, or contact."
  }
];

const commandHelp = [
  ["about", "scroll to the narrative introduction"],
  ["projects", "open the featured project area"],
  ["work", "jump to the delivery timeline"],
  ["skills", "show the technical stack"],
  ["resume", "open resume and education"],
  ["contact", "open the guarded contact composer"],
  ["search <term>", "find a project, bank, or skill keyword"],
  ["rbl-bcms", "focus the BCMS engagement"],
  ["rbl-radc", "focus the RADC engagement"],
  ["clear", "reset the command log"]
] as const;

const keyboardRows = ["1234567890", "QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
const portfolioRepo = "https://github.com/nishantbhadke/nishant-bhadke-command-portfolio";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function commandAlias(command: string) {
  const aliases: Record<string, string> = {
    overview: "about",
    intro: "about",
    exp: "work",
    experience: "work",
    stack: "skills",
    tech: "skills",
    cv: "resume",
    mail: "contact",
    email: "contact",
    project: "projects",
    composer: "contact"
  };

  return aliases[command] ?? command;
}

export function CommandPortfolio() {
  const overviewRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const workRef = useRef<HTMLElement>(null);
  const skillsRef = useRef<HTMLElement>(null);
  const resumeRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const [activeSection, setActiveSection] = useState<SectionKey>("overview");
  const [projectIndex, setProjectIndex] = useState(0);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<OutputEntry[]>(starterHistory);
  const [pressedKey, setPressedKey] = useState("");
  const [notice, setNotice] = useState("");
  const [composer, setComposer] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const deferredMessage = useDeferredValue(composer.message);
  const draftAnalysis = analyzeContactDraft({ ...composer, message: deferredMessage });
  const selectedProject = projects[projectIndex];

  function addHistory(command: string, response: string) {
    setHistory((items) => [...items.slice(-5), { id: Date.now(), command, response }]);
  }

  function sectionRef(section: SectionKey) {
    switch (section) {
      case "projects":
        return projectsRef;
      case "work":
        return workRef;
      case "skills":
        return skillsRef;
      case "resume":
        return resumeRef;
      case "contact":
        return contactRef;
      default:
        return overviewRef;
    }
  }

  function activateSection(section: SectionKey, scroll = true) {
    startTransition(() => setActiveSection(section));
    if (scroll) {
      sectionRef(section).current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function openProject(index: number, commandLabel?: string) {
    setProjectIndex(index);
    activateSection("projects");
    addHistory(commandLabel ?? projects[index].command, `Opened ${projects[index].title}.`);
  }

  function runSearch(rawTerm: string) {
    const query = normalize(rawTerm);
    if (!query) {
      addHistory("search", "Type a keyword like redis, docker, radc, aws, contact, or resume.");
      return;
    }

    const projectMatch = projects.findIndex((project) =>
      [project.title, project.label, project.summary, project.impact, project.command, project.tech.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );

    if (projectMatch >= 0) {
      openProject(projectMatch, `search ${query}`);
      return;
    }

    const skillMatch = skills.find((group) =>
      [group.group, group.items.join(" ")].join(" ").toLowerCase().includes(query)
    );
    if (skillMatch) {
      activateSection("skills");
      addHistory(`search ${query}`, `Found ${skillMatch.group}. Moved to the technical stack.`);
      return;
    }

    const workMatch = work.find((item) =>
      [item.company, item.role, item.bullets.join(" ")].join(" ").toLowerCase().includes(query)
    );
    if (workMatch) {
      activateSection("work");
      addHistory(`search ${query}`, `Matched ${workMatch.company}. Opening experience.`);
      return;
    }

    if ([profile.name, profile.role, profile.location, recognition.awards.join(" "), recognition.certifications.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(query)) {
      activateSection("overview");
      addHistory(`search ${query}`, "Matched the profile narrative.");
      return;
    }

    if (["email", "contact", "message", "linkedin"].some((term) => term.includes(query) || query.includes(term))) {
      activateSection("contact");
      addHistory(`search ${query}`, "Moved to the contact composer.");
      return;
    }

    addHistory(`search ${query}`, "No exact match. Try redis, banking, docker, radc, aws, contact, or resume.");
  }

  function runCommand(rawCommand?: string) {
    const original = normalize(rawCommand ?? input);
    const command = commandAlias(original);

    if (!command) {
      return;
    }

    setInput("");
    setNotice("");

    if (command === "clear") {
      setHistory(starterHistory);
      commandInputRef.current?.focus();
      return;
    }

    if (command.startsWith("search ")) {
      runSearch(command.replace(/^search\s+/, ""));
      return;
    }

    const projectIndexMatch = projects.findIndex((project) => project.command === command || project.id === command);
    if (projectIndexMatch >= 0) {
      openProject(projectIndexMatch, command);
      return;
    }

    switch (command) {
      case "help":
        activateSection("overview");
        addHistory("help", `Available commands: ${commandHelp.map(([item]) => item).join(", ")}.`);
        break;
      case "about":
        activateSection("overview");
        addHistory("about", "Moved to the introduction.");
        break;
      case "projects":
        activateSection("projects");
        addHistory("projects", "Opened the project showcase.");
        break;
      case "work":
        activateSection("work");
        addHistory("work", "Opened the delivery timeline.");
        break;
      case "skills":
        activateSection("skills");
        addHistory("skills", "Opened the technical stack.");
        break;
      case "resume":
        activateSection("resume");
        addHistory("resume", "Opened resume and education.");
        break;
      case "contact":
        activateSection("contact");
        addHistory("contact", "Opened the guarded contact composer.");
        window.setTimeout(() => messageRef.current?.focus(), 180);
        break;
      case "search":
        runSearch("");
        break;
      default:
        runSearch(command);
    }
  }

  function registerKey(key: string) {
    const label = key.length === 1 ? key.toUpperCase() : key;
    setPressedKey(label);
    window.setTimeout(() => setPressedKey(""), 120);
  }

  function updateComposer(field: ComposerField, value: string) {
    setComposer((current) => ({ ...current, [field]: value }));
    setNotice("");
  }

  function typeKey(key: string) {
    registerKey(key);
    activateSection("contact", false);
    messageRef.current?.focus();

    if (key === "backspace") {
      setComposer((current) => ({ ...current, message: current.message.slice(0, -1) }));
      return;
    }

    if (key === "space") {
      setComposer((current) => ({ ...current, message: `${current.message} ` }));
      return;
    }

    if (key === "enter") {
      setComposer((current) => ({ ...current, message: `${current.message}\n` }));
      return;
    }

    setComposer((current) => ({ ...current, message: `${current.message}${key.toLowerCase()}` }));
  }

  function onMessageKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    registerKey(event.key);
  }

  function openDraftEmail() {
    const analysis = analyzeContactDraft(composer);

    if (!composer.message.trim()) {
      setNotice("Add a message before opening the draft.");
      activateSection("contact");
      return;
    }

    if (analysis.blocked) {
      setNotice(`Draft blocked. Offensiveness is ${analysis.offensivenessPercent}% and must stay below ${Math.round(OFFENSIVE_THRESHOLD * 100)}%.`);
      activateSection("contact");
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

    const subject = composer.subject.trim() || "Portfolio conversation";
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setNotice("Safe draft prepared in your mail client.");
    addHistory("contact", "Opened a safe email draft.");
  }

  const thresholdPercent = Math.round(OFFENSIVE_THRESHOLD * 100);
  const safetyTone = draftAnalysis.blocked ? "text-[#9f2f1a]" : "text-[#17603a]";

  return (
    <main className="min-h-screen overflow-x-hidden bg-paper text-ink">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(202,117,62,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(104,140,176,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.65),rgba(246,239,229,0.92))]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(84,61,43,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(84,61,43,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <nav className="sticky top-4 z-20 rounded-[2rem] border border-line/80 bg-card/88 px-4 py-3 shadow-soft backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-command text-accent">
                <Command size={18} />
              </div>
              <div>
                <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.24em] text-accent">Portfolio V2</p>
                <p className="text-sm text-muted">Editorial design with command routing and safe outreach.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["overview", "About"],
                ["projects", "Projects"],
                ["work", "Work"],
                ["skills", "Skills"],
                ["resume", "Resume"],
                ["contact", "Contact"]
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => activateSection(key as SectionKey)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    activeSection === key
                      ? "border-accent bg-accent text-card"
                      : "border-line bg-surface/80 text-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <header ref={overviewRef} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[2.2rem] border border-line bg-card/92 p-6 shadow-soft sm:p-8"
          >
            <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.28em] text-accent">
              Claude-inspired narrative portfolio
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.94] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Nishant Bhadke builds resilient BFSI systems with calm, audited execution.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{profile.intro}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <MetricCard label="Current role" value={profile.role} icon={<BriefcaseBusiness size={18} />} />
              <MetricCard label="Location" value={profile.location} icon={<MapPin size={18} />} />
              <MetricCard label="Recognition" value={recognition.awards[0]} icon={<Sparkles size={18} />} />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => activateSection("contact")}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-card transition hover:brightness-95"
              >
                Start a conversation <ArrowRight size={16} />
              </button>
              <a
                href={profile.resume}
                download
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              >
                Download resume <ArrowDownToLine size={16} />
              </a>
              <a
                href={portfolioRepo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              >
                View repo <Github size={16} />
              </a>
            </div>
          </motion.section>

          <div className="grid gap-6">
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[2rem] border border-line bg-command/90 p-6 shadow-soft"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.24em] text-accent">Command router</p>
                  <h2 className="mt-3 font-display text-3xl tracking-[-0.03em]">Ask the portfolio directly.</h2>
                </div>
                <Search size={18} className="mt-1 text-muted" />
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-[1.4rem] border border-line bg-card px-4 py-3">
                <span className="font-mono text-accent">&gt;</span>
                <input
                  ref={commandInputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      runCommand();
                    }
                  }}
                  placeholder="search redis"
                  className="min-w-0 flex-1 bg-transparent font-mono text-sm text-ink outline-none placeholder:text-muted/70"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => runCommand()}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-card transition hover:brightness-95"
                >
                  Run <Send size={14} />
                </button>
              </div>

              <div className="mt-5 grid gap-3 rounded-[1.6rem] border border-line bg-card/70 p-4">
                {history.map((entry) => (
                  <div key={entry.id} className="font-mono text-xs leading-6 text-muted">
                    <p className="text-accent">{entry.command}</p>
                    <p>{entry.response}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[2rem] border border-line bg-card/92 p-6 shadow-soft"
            >
              <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.24em] text-muted">Sketch translation</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {["Narrative intro", "Project spotlight", "Typed outreach", "Semantic safety"].map((item) => (
                  <div key={item} className="rounded-[1.4rem] border border-line bg-surface/85 px-4 py-4 text-sm font-semibold text-ink">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {profile.workedAcross.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => runSearch(item)}
                    className="rounded-full border border-line bg-command/70 px-3 py-2 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </motion.section>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <SectionShell
            title="About me"
            eyebrow="Narrative"
            description="The site now reads more like a considered profile than a dashboard. The command rail still exists, but the page flows as a calm story first."
          >
            <p className="text-base leading-8 text-muted">
              Nishant works at the overlap of backend delivery, BFSI workflow rigor, and production pragmatism. He ships APIs, secure integrations, query-tuned data access, and maker-checker flows that survive real operational pressure.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <SoftFact label="Core stack" value=".NET Core, SQL Server, Redis, Docker, AWS" />
              <SoftFact label="Preferred problems" value="Banking workflows, secure integrations, performance tuning" />
              <SoftFact label="Operating mode" value="Delivery-focused, compliance-aware, metrics-driven" />
              <SoftFact label="Recent focus" value="Loan journeys, document pipelines, API reliability" />
            </div>
          </SectionShell>

          <SectionShell
            title="Signals recruiters notice"
            eyebrow="Highlights"
            description="These are the themes the portfolio keeps reinforcing across sections."
          >
            <div className="grid gap-3">
              <InsightRow title="Production mindset" text="Projects are framed around operational effect, not just technology names." />
              <InsightRow title="Banking context" text="The work is clearly tied to BFSI, collections, account journeys, and compliance-heavy releases." />
              <InsightRow title="Calm communication" text="The contact composer nudges structured, respectful outreach instead of open-ended free text." />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {recognition.certifications.concat(recognition.awards).map((item) => (
                <span key={item} className="rounded-full border border-line bg-command/70 px-3 py-2 text-sm font-semibold text-muted">
                  {item}
                </span>
              ))}
            </div>
          </SectionShell>
        </section>

        <section ref={projectsRef} className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <SectionShell
            title="Project spotlight"
            eyebrow="Projects"
            description="The featured card reads like a concise case study, while the selector on the right keeps the command-portfolio behavior alive."
          >
            <div className="rounded-[1.8rem] border border-line bg-surface/90 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.24em] text-accent">{selectedProject.label}</p>
                  <h2 className="mt-3 font-display text-4xl leading-tight tracking-[-0.04em]">{selectedProject.title}</h2>
                  <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-muted">{selectedProject.duration}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProjectIndex((index) => (index - 1 + projects.length) % projects.length)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-card transition hover:border-accent hover:text-accent"
                    aria-label="Previous project"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectIndex((index) => (index + 1) % projects.length)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-card transition hover:border-accent hover:text-accent"
                    aria-label="Next project"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <p className="mt-5 text-base leading-8 text-muted">{selectedProject.summary}</p>
              <div className="mt-5 rounded-[1.4rem] border border-line bg-card/85 p-4">
                <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-muted">Impact</p>
                <p className="mt-3 text-base font-semibold leading-7">{selectedProject.impact}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedProject.tech.map((item) => (
                  <span key={item} className="rounded-full border border-line bg-command/70 px-3 py-2 text-sm font-semibold text-muted">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </SectionShell>

          <SectionShell
            title="Project index"
            eyebrow="Selector"
            description="Choose a project directly or via commands like rbl-bcms, radc, or search redis."
          >
            <div className="grid gap-3">
              {projects.map((project, index) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => openProject(index)}
                  className={`rounded-[1.5rem] border p-4 text-left transition ${
                    index === projectIndex
                      ? "border-accent bg-accent text-card"
                      : "border-line bg-surface/85 text-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.2em]">{project.label}</p>
                  <p className="mt-2 text-base font-semibold leading-6">{project.title}</p>
                  <p className="mt-2 text-sm leading-6 opacity-90">{project.summary}</p>
                </button>
              ))}
            </div>
          </SectionShell>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section ref={workRef}>
            <SectionShell
              title="Experience"
              eyebrow="Delivery timeline"
              description="The work section stays concrete about outcomes, performance, security, and banking workflows."
            >
              <div className="grid gap-4">
                {work.map((item) => (
                  <article key={item.company} className="rounded-[1.6rem] border border-line bg-surface/88 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-display text-3xl tracking-[-0.03em]">{item.role}</h3>
                        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-muted">{item.company}</p>
                      </div>
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{item.period}</p>
                    </div>
                    <div className="mt-5 grid gap-3">
                      {item.bullets.map((bullet) => (
                        <div key={bullet} className="rounded-[1.2rem] border border-line bg-card/70 px-4 py-3 text-sm leading-7 text-muted">
                          {bullet}
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </SectionShell>
          </section>

          <div className="grid gap-6">
            <section ref={skillsRef}>
              <SectionShell
                title="Technical stack"
                eyebrow="Skills"
                description="Grouped by delivery shape so the reader sees how the stack maps to backend work."
              >
                <div className="grid gap-3">
                  {skills.map((group) => (
                    <article key={group.group} className="rounded-[1.5rem] border border-line bg-surface/88 p-4">
                      <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-accent">{group.group}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <span key={item} className="rounded-full border border-line bg-card px-3 py-2 text-sm font-semibold text-muted">
                            {item}
                          </span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </SectionShell>
            </section>

            <section ref={resumeRef}>
              <SectionShell
                title="Resume and education"
                eyebrow="Resume"
                description="A direct download path stays visible, but the surrounding context reinforces role fit before the file is opened."
              >
                <div className="grid gap-4 md:grid-cols-[0.92fr_1.08fr]">
                  <article className="rounded-[1.5rem] border border-line bg-surface/88 p-5">
                    <h3 className="font-display text-3xl tracking-[-0.03em]">Resume download</h3>
                    <p className="mt-3 text-sm leading-7 text-muted">
                      Recruiters can download the current PDF directly. The site keeps the button in context instead of hiding it behind navigation.
                    </p>
                    <a
                      href={profile.resume}
                      download
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-card transition hover:brightness-95"
                    >
                      Download resume <ArrowDownToLine size={16} />
                    </a>
                  </article>
                  <article className="rounded-[1.5rem] border border-line bg-surface/88 p-5">
                    <h3 className="font-display text-3xl tracking-[-0.03em]">Education</h3>
                    <div className="mt-4 grid gap-4">
                      {education.map((item) => (
                        <div key={item.degree} className="rounded-[1.2rem] border border-line bg-card/70 px-4 py-4">
                          <p className="font-semibold">{item.degree}</p>
                          <p className="mt-1 text-sm text-muted">{item.school}</p>
                          <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-muted">{item.year}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>
              </SectionShell>
            </section>
          </div>
        </section>

        <section ref={contactRef} className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <SectionShell
            title="Contact"
            eyebrow="Reach out"
            description="This section follows your sketch: details on the left, structured email writing on the right, and a typewriter interaction under the message box."
          >
            <div className="grid gap-3">
              <ContactCard label="Email" value={profile.email} href={`mailto:${profile.email}`} icon={<Mail size={16} />} />
              <ContactCard label="Phone" value={profile.phone} href={`tel:${profile.phone.replace(/\s/g, "")}`} icon={<Phone size={16} />} />
              <ContactCard
                label="LinkedIn"
                value="nishant-bhadke-983837185"
                href={profile.linkedin}
                icon={<Linkedin size={16} />}
              />
            </div>

            <div className="mt-6 rounded-[1.6rem] border border-line bg-command/80 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-[#17603a]" />
                <div>
                  <p className="font-semibold">Semantic safety is active.</p>
                  <p className="text-sm leading-6 text-muted">
                    If the drafted message crosses {thresholdPercent}% offensiveness, the send action is blocked.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {commandHelp.slice(0, 5).map(([command, label]) => (
                  <button
                    key={command}
                    type="button"
                    onClick={() => runCommand(command)}
                    className="flex items-center justify-between rounded-[1.2rem] border border-line bg-card/75 px-4 py-3 text-left transition hover:border-accent hover:text-accent"
                  >
                    <span className="font-mono text-sm font-bold">{command}</span>
                    <span className="text-xs text-muted">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </SectionShell>

          <SectionShell
            title="Write an email"
            eyebrow="Composer"
            description="The form checks message tone in real time. Safe messages can open the mail client; offensive drafts stay blocked."
          >
            <form
              onSubmit={(event) => {
                event.preventDefault();
                openDraftEmail();
              }}
              className="grid gap-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Your name"
                  value={composer.name}
                  onChange={(value) => updateComposer("name", value)}
                  placeholder="Your name"
                />
                <Field
                  label="Your email"
                  value={composer.email}
                  onChange={(value) => updateComposer("email", value)}
                  placeholder="you@example.com"
                  type="email"
                />
              </div>

              <Field
                label="Subject"
                value={composer.subject}
                onChange={(value) => updateComposer("subject", value)}
                placeholder="Discussing a backend engineering role"
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Message</label>
                <textarea
                  ref={messageRef}
                  value={composer.message}
                  onChange={(event) => updateComposer("message", event.target.value)}
                  onKeyDown={onMessageKeyDown}
                  placeholder="Hi Nishant, I saw your portfolio and would like to discuss a backend opportunity..."
                  className="min-h-48 w-full rounded-[1.6rem] border border-line bg-surface/80 p-4 text-sm leading-7 text-ink outline-none transition placeholder:text-muted/70 focus:border-accent"
                />
              </div>

              <article className="rounded-[1.6rem] border border-line bg-surface/88 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-muted">Semantic analysis</p>
                    <h3 className="mt-2 font-display text-3xl tracking-[-0.03em]">Tone and offensiveness review</h3>
                  </div>
                  <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${draftAnalysis.blocked ? "bg-[#f7d6cd]" : "bg-[#d7efe2]"} ${safetyTone}`}>
                    {draftAnalysis.blocked ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                    {draftAnalysis.blocked ? "Blocked" : "Safe to draft"}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <AnalysisStat label="Offensiveness" value={`${draftAnalysis.offensivenessPercent}%`} hint={`Must stay below ${thresholdPercent}%`} />
                  <AnalysisStat label="Professional tone" value={`${draftAnalysis.professionalTonePercent}%`} hint="Greeting, intent, and tone signals" />
                  <AnalysisStat label="Draft readiness" value={`${draftAnalysis.readinessPercent}%`} hint="Completeness of subject and message" />
                </div>

                <div className="mt-5">
                  <div className="relative h-3 rounded-full bg-command/80">
                    <div
                      className={`h-3 rounded-full transition-all ${draftAnalysis.blocked ? "bg-[#cb5d38]" : "bg-[#2f8a59]"}`}
                      style={{ width: `${Math.min(draftAnalysis.offensivenessPercent, 100)}%` }}
                    />
                    <div
                      className="pointer-events-none absolute inset-y-[-3px] w-[2px] bg-ink/80"
                      style={{ left: `${thresholdPercent}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted">
                    <span>0%</span>
                    <span>Block threshold {thresholdPercent}%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                  <div className="rounded-[1.2rem] border border-line bg-card/70 p-4">
                    <p className="text-sm font-semibold">Detected guidance</p>
                    <div className="mt-3 grid gap-2 text-sm leading-6 text-muted">
                      {(draftAnalysis.guidance.length > 0 ? draftAnalysis.guidance : ["Draft is respectful and can be opened in the mail client."]).map((item) => (
                        <p key={item} className="rounded-[1rem] bg-surface/80 px-3 py-2">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[1.2rem] border border-line bg-card/70 p-4">
                    <p className="text-sm font-semibold">Detected signals</p>
                    <div className="mt-3 grid gap-2 text-sm leading-6 text-muted">
                      <SignalChip label="Has intent" active={draftAnalysis.intentDetected} />
                      <SignalChip label="Name included" active={draftAnalysis.completeness.hasName} />
                      <SignalChip label="Valid reply email" active={draftAnalysis.completeness.hasEmail} />
                      <SignalChip label="Subject included" active={draftAnalysis.completeness.hasSubject} />
                      <SignalChip label="Message present" active={draftAnalysis.completeness.hasMessage} />
                    </div>
                  </div>
                </div>
              </article>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className={`text-sm leading-6 ${notice ? "text-ink" : "text-muted"}`}>
                  {notice || `${composer.message.length} characters drafted. Physical typing and the on-screen typewriter both update the message.`}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setComposer({ name: "", email: "", subject: "", message: "" });
                      setNotice("");
                    }}
                    className="rounded-full border border-line bg-surface px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                  >
                    Clear draft
                  </button>
                  <button
                    type="submit"
                    disabled={draftAnalysis.blocked || !composer.message.trim()}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition ${
                      draftAnalysis.blocked || !composer.message.trim()
                        ? "cursor-not-allowed bg-line text-muted"
                        : "bg-accent text-card hover:brightness-95"
                    }`}
                  >
                    Open email draft <Send size={16} />
                  </button>
                </div>
              </div>
            </form>

            <TypewriterKeyboard pressedKey={pressedKey} typeKey={typeKey} />
          </SectionShell>
        </section>
      </div>
    </main>
  );
}

function SectionShell({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[2rem] border border-line bg-card/92 p-6 shadow-soft sm:p-7"
    >
      <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.26em] text-accent">{eyebrow}</p>
      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h2 className="font-display text-4xl tracking-[-0.04em] sm:text-5xl">{title}</h2>
          <p className="mt-3 text-base leading-8 text-muted">{description}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </motion.section>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-line bg-surface/85 p-4">
      <div className="flex items-center gap-2 text-accent">{icon}</div>
      <p className="mt-4 font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-ink">{value}</p>
    </div>
  );
}

function SoftFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-line bg-surface/85 p-4">
      <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className="mt-3 text-sm leading-7 text-ink">{value}</p>
    </div>
  );
}

function InsightRow({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-[1.4rem] border border-line bg-surface/85 p-4">
      <p className="text-base font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-7 text-muted">{text}</p>
    </article>
  );
}

function ContactCard({
  label,
  value,
  href,
  icon
}: {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="rounded-[1.5rem] border border-line bg-surface/88 p-4 transition hover:border-accent hover:text-accent"
    >
      <div className="flex items-center gap-2 text-accent">{icon}</div>
      <p className="mt-4 font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold leading-6 text-ink">{value}</p>
    </a>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-ink">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[1.2rem] border border-line bg-surface/80 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-accent"
      />
    </div>
  );
}

function AnalysisStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-[1.2rem] border border-line bg-card/70 p-4">
      <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{hint}</p>
    </div>
  );
}

function SignalChip({ label, active }: { label: string; active: boolean }) {
  return (
    <p
      className={`rounded-[1rem] px-3 py-2 ${
        active ? "bg-[#d7efe2] text-[#17603a]" : "bg-surface/80 text-muted"
      }`}
    >
      {label}
    </p>
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
    <section className="mt-5 rounded-[1.8rem] border border-line bg-command/92 p-5 shadow-soft">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Keyboard size={18} className="text-accent" />
          <p className="text-sm font-semibold">Typewriter</p>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">click keys to build the message</p>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-line bg-[linear-gradient(180deg,#efe6d8,#e5d7c2)] p-3">
        <div className="grid gap-2">
          {keyboardRows.map((row, rowIndex) => (
            <div
              key={row}
              className={`flex justify-center gap-1.5 ${
                rowIndex === 2 ? "px-4 sm:px-7" : rowIndex === 3 ? "px-8 sm:px-12" : ""
              }`}
            >
              {row.split("").map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => typeKey(letter.toLowerCase())}
                  className={`flex h-10 min-w-8 items-center justify-center rounded-full border border-[#c3b39e] bg-card px-2 font-mono text-xs font-bold text-ink shadow-[0_3px_0_rgba(109,84,58,0.35)] transition sm:h-11 sm:min-w-9 ${
                    pressedKey === letter ? "translate-y-1 shadow-none" : "hover:-translate-y-0.5 hover:border-accent"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          ))}
          <div className="flex justify-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => typeKey("backspace")}
              className="h-10 rounded-full border border-[#c3b39e] bg-card px-4 font-mono text-xs font-bold text-ink shadow-[0_3px_0_rgba(109,84,58,0.35)] transition hover:-translate-y-0.5 hover:border-accent"
            >
              back
            </button>
            <button
              type="button"
              onClick={() => typeKey("space")}
              className="h-10 w-32 rounded-full border border-[#c3b39e] bg-card font-mono text-xs font-bold text-ink shadow-[0_3px_0_rgba(109,84,58,0.35)] transition hover:-translate-y-0.5 hover:border-accent sm:w-48"
            >
              space
            </button>
            <button
              type="button"
              onClick={() => typeKey("enter")}
              className="h-10 rounded-full border border-accent bg-accent px-4 font-mono text-xs font-bold text-card shadow-[0_3px_0_rgba(109,84,58,0.35)] transition hover:-translate-y-0.5"
            >
              return
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
