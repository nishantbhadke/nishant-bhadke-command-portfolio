"use client";

import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Command,
  Keyboard,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import { KeyboardEvent, startTransition, useDeferredValue, useRef, useState } from "react";
import { profile, projects, recognition, skills, work } from "@/lib/profile";
import { analyzeContactDraft, OFFENSIVE_THRESHOLD } from "@/lib/messageSafety";

type OutputEntry = {
  id: number;
  command: string;
  response: string;
};

type SectionKey = "overview" | "projects" | "work" | "skills" | "contact";
type ComposerField = "name" | "email" | "subject" | "message";

const starterHistory: OutputEntry[] = [
  {
    id: 1,
    command: "system",
    response: "Ready. Try about, projects, search redis, work, resume, or contact."
  }
];

const commandHelp = [
  ["about", "open the about surface"],
  ["projects", "open the featured project area"],
  ["work", "open the experience surface"],
  ["skills", "show the technical stack"],
  ["resume", "download resume instantly"],
  ["contact", "open the guarded contact composer"],
  ["search <term>", "find a project, bank, or skill keyword"],
  ["rbl-bcms", "focus the BCMS engagement"],
  ["rbl-radc", "focus the RADC engagement"],
  ["clear", "reset the command log"]
] as const;

const keyboardRows = ["1234567890", "QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
const greetings = ["Hello", "Hola", "Ola", "Bonjour", "Ciao", "Namaste"];
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

  function activateSection(section: SectionKey, scroll = true) {
    startTransition(() => setActiveSection(section));
    if (section === "contact" && scroll) {
      contactRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function openProject(index: number, commandLabel?: string) {
    setProjectIndex(index);
    activateSection("projects", false);
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
      activateSection("skills", false);
      addHistory(`search ${query}`, `Found ${skillMatch.group}. Moved to the technical stack.`);
      return;
    }

    const workMatch = work.find((item) =>
      [item.company, item.role, item.bullets.join(" ")].join(" ").toLowerCase().includes(query)
    );
    if (workMatch) {
      activateSection("work", false);
      addHistory(`search ${query}`, `Matched ${workMatch.company}. Opening experience.`);
      return;
    }

    if ([profile.name, profile.role, profile.location, recognition.awards.join(" "), recognition.certifications.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(query)) {
      activateSection("overview", false);
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
        activateSection("overview", false);
        addHistory("help", `Available commands: ${commandHelp.map(([item]) => item).join(", ")}.`);
        break;
      case "about":
        activateSection("overview", false);
        addHistory("about", "Moved to the introduction.");
        break;
      case "projects":
        activateSection("projects", false);
        addHistory("projects", "Opened the project showcase.");
        break;
      case "work":
        activateSection("work", false);
        addHistory("work", "Opened the delivery timeline.");
        break;
      case "skills":
        activateSection("skills", false);
        addHistory("skills", "Opened the technical stack.");
        break;
      case "resume":
        window.location.href = profile.resume;
        addHistory("resume", "Resume download started.");
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
        <nav className="rounded-[2rem] border border-line/80 bg-card/88 px-4 py-3 shadow-soft backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-command text-accent">
                <Command size={18} />
              </div>
              <div>
                <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.24em] text-accent">Portfolio V2</p>
                <p className="text-sm text-muted">Command-first navigation with direct recruiter access.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={profile.resume}
                download
                className="rounded-full border border-accent bg-accent px-4 py-2 text-sm font-bold text-card transition hover:brightness-95"
              >
                Resume
              </a>
              <button
                type="button"
                onClick={() => activateSection("contact")}
                className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              >
                Contact
              </button>
              <a
                href={portfolioRepo}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              >
                Repo
              </a>
            </div>
          </div>
        </nav>

        <header className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[2.2rem] border border-line bg-card/92 p-6 shadow-soft sm:p-8"
          >
            <div className="flex flex-wrap gap-2">
              {greetings.map((item) => (
                <span key={item} className="rounded-full border border-line bg-surface/88 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-accent">
                  {item}
                </span>
              ))}
            </div>

            <p className="mt-6 font-mono text-[0.72rem] font-bold uppercase tracking-[0.28em] text-accent">{profile.role}</p>
            <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.96] tracking-[-0.04em] sm:text-6xl">
              I am {profile.name}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{profile.intro}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <MetricCard label="Role" value={profile.role} icon={<BriefcaseBusiness size={18} />} />
              <MetricCard label="Location" value={profile.location} icon={<MapPin size={18} />} />
              <MetricCard label="Focus" value="BFSI backend delivery" icon={<Command size={18} />} />
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <SoftFact label="Worked across" value={profile.workedAcross.join(", ")} />
              <SoftFact label="Recognition" value={recognition.certifications.concat(recognition.awards).join(", ")} />
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-6"
          >
            <article className="rounded-[2rem] border border-line bg-command/90 p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.24em] text-accent">Command line</p>
                  <h2 className="mt-3 font-display text-3xl tracking-[-0.03em]">Use commands instead of scrolling.</h2>
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
                  placeholder="about, projects, work, skills, search redis"
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

              <div className="mt-4 flex flex-wrap gap-2">
                {["about", "projects", "work", "skills", "resume", "contact"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => runCommand(item)}
                    className="rounded-full border border-line bg-surface/88 px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.16em] text-muted transition hover:border-accent hover:text-accent"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </article>

            <article className="rounded-[2rem] border border-line bg-card/92 p-6 shadow-soft">
              <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-accent">Live surface</p>
                  <h2 className="mt-2 font-display text-4xl tracking-[-0.04em]">{surfaceTitle(activeSection)}</h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-muted">
                  {surfaceDescription(activeSection)}
                </p>
              </div>
              <div className="mt-6">
                <SurfacePanel
                  activeSection={activeSection}
                  selectedProject={selectedProject}
                  projectIndex={projectIndex}
                  openProject={openProject}
                  setProjectIndex={setProjectIndex}
                />
              </div>
            </article>

            <article className="rounded-[2rem] border border-line bg-card/88 p-5 shadow-soft">
              <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-muted">Recent commands</p>
              <div className="mt-4 grid gap-3">
                {history.map((entry) => (
                  <div key={entry.id} className="rounded-[1.2rem] border border-line bg-surface/78 p-4 font-mono text-xs leading-6 text-muted">
                    <p className="text-accent">{entry.command}</p>
                    <p>{entry.response}</p>
                  </div>
                ))}
              </div>
            </article>
          </motion.section>
        </header>

        <section ref={contactRef}>
          <SectionShell
            title="Contact"
            eyebrow="Composer"
            description="One card, direct contact details, and a guarded email composer with a live offensiveness threshold."
          >
            <form
              onSubmit={(event) => {
                event.preventDefault();
                openDraftEmail();
              }}
              className="grid gap-5"
            >
              <div className="grid gap-3 md:grid-cols-3">
                <ContactCard label="Email" value={profile.email} href={`mailto:${profile.email}`} icon={<Mail size={16} />} />
                <ContactCard label="Phone" value={profile.phone} href={`tel:${profile.phone.replace(/\s/g, "")}`} icon={<Phone size={16} />} />
                <ContactCard
                  label="LinkedIn"
                  value="nishant-bhadke-983837185"
                  href={profile.linkedin}
                  icon={<Linkedin size={16} />}
                />
              </div>

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

                <div className="mt-5 rounded-[1.2rem] border border-line bg-card/70 p-4">
                  <p className="text-sm font-semibold">Draft guidance</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm leading-6">
                    {(draftAnalysis.guidance.length > 0 ? draftAnalysis.guidance : ["Draft is respectful and can be opened in the mail client."]).map((item) => (
                      <p key={item} className="rounded-full bg-surface/80 px-3 py-2 text-muted">
                        {item}
                      </p>
                    ))}
                    <SignalChip label="Has intent" active={draftAnalysis.intentDetected} />
                    <SignalChip label="Name included" active={draftAnalysis.completeness.hasName} />
                    <SignalChip label="Valid reply email" active={draftAnalysis.completeness.hasEmail} />
                    <SignalChip label="Subject included" active={draftAnalysis.completeness.hasSubject} />
                    <SignalChip label="Message present" active={draftAnalysis.completeness.hasMessage} />
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

function surfaceTitle(activeSection: SectionKey) {
  switch (activeSection) {
    case "projects":
      return "Projects and experience";
    case "work":
      return "Projects and experience";
    case "skills":
      return "Technical stack";
    case "contact":
      return "Contact";
    default:
      return "About";
  }
}

function surfaceDescription(activeSection: SectionKey) {
  switch (activeSection) {
    case "projects":
      return "Project detail and delivery experience stay in one place so the reader doesn’t bounce between separate cards.";
    case "work":
      return "Project detail and delivery experience stay in one place so the reader doesn’t bounce between separate cards.";
    case "skills":
      return "The stack is grouped around backend delivery instead of long scrolling sections.";
    case "contact":
      return "Contact lives below unchanged, but the command can still take the user there directly.";
    default:
      return "The command line controls this surface, so visitors can move through the portfolio without scrolling through multiple sections.";
  }
}

function SurfacePanel({
  activeSection,
  selectedProject,
  projectIndex,
  openProject,
  setProjectIndex
}: {
  activeSection: SectionKey;
  selectedProject: (typeof projects)[number];
  projectIndex: number;
  openProject: (index: number, commandLabel?: string) => void;
  setProjectIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  if (activeSection === "projects" || activeSection === "work") {
    return (
      <div className="grid gap-4">
        <article className="rounded-[1.6rem] border border-line bg-surface/90 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-accent">{selectedProject.label}</p>
              <h3 className="mt-3 font-display text-3xl leading-tight tracking-[-0.04em]">{selectedProject.title}</h3>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-muted">{selectedProject.duration}</p>
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
          <div className="mt-5 rounded-[1.2rem] border border-line bg-card/75 p-4">
            <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.2em] text-muted">Impact</p>
            <p className="mt-3 text-base font-semibold leading-7">{selectedProject.impact}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {selectedProject.tech.map((item) => (
              <span key={item} className="rounded-full border border-line bg-command/70 px-3 py-2 text-sm font-semibold text-muted">
                {item}
              </span>
            ))}
          </div>
        </article>

        <article className="rounded-[1.6rem] border border-line bg-surface/88 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-accent">Experience</p>
              <h3 className="mt-2 font-display text-3xl tracking-[-0.03em]">Delivery timeline</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {projects.map((project, index) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => openProject(index)}
                  className={`rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] transition ${
                    index === projectIndex
                      ? "border-accent bg-accent text-card"
                      : "border-line bg-card text-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  {project.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {work.map((item) => (
              <div key={item.company} className="rounded-[1.2rem] border border-line bg-card/70 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold">{item.role}</p>
                    <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-muted">{item.company}</p>
                  </div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{item.period}</p>
                </div>
                <div className="mt-4 grid gap-2">
                  {item.bullets.map((bullet) => (
                    <p key={bullet} className="rounded-[1rem] bg-surface/80 px-3 py-2 text-sm leading-6 text-muted">
                      {bullet}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    );
  }

  if (activeSection === "skills") {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {skills.map((group) => (
          <article key={group.group} className="rounded-[1.4rem] border border-line bg-surface/88 p-4">
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
    );
  }

  if (activeSection === "contact") {
    return (
      <div className="rounded-[1.5rem] border border-line bg-surface/88 p-5">
        <p className="text-base leading-8 text-muted">
          The command line can jump to contact instantly. The guarded email composer stays below exactly as the working contact flow.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <ContactCard label="Email" value={profile.email} href={`mailto:${profile.email}`} icon={<Mail size={16} />} />
          <ContactCard label="Phone" value={profile.phone} href={`tel:${profile.phone.replace(/\s/g, "")}`} icon={<Phone size={16} />} />
          <ContactCard label="LinkedIn" value="nishant-bhadke-983837185" href={profile.linkedin} icon={<Linkedin size={16} />} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <article className="rounded-[1.6rem] border border-line bg-surface/88 p-5">
        <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-accent">About me</p>
        <h3 className="mt-3 font-display text-3xl tracking-[-0.03em]">{profile.name}</h3>
        <p className="mt-4 text-base leading-8 text-muted">
          Nishant works at the overlap of backend delivery, BFSI workflow rigor, and production pragmatism. He ships APIs, secure integrations, query-tuned data access, and maker-checker flows that survive real operational pressure.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <SoftFact label="Core stack" value=".NET Core, SQL Server, Redis, Docker, AWS" />
          <SoftFact label="Preferred problems" value="Banking workflows, secure integrations, performance tuning" />
          <SoftFact label="Operating mode" value="Delivery-focused, compliance-aware, metrics-driven" />
          <SoftFact label="Recent focus" value="Loan journeys, document pipelines, API reliability" />
        </div>
      </article>

      <article className="rounded-[1.6rem] border border-line bg-surface/88 p-5">
        <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-accent">Suggested commands</p>
        <div className="mt-4 grid gap-3">
          {commandHelp.slice(0, 6).map(([command, label]) => (
            <div key={command} className="rounded-[1.2rem] border border-line bg-card/70 px-4 py-3">
              <p className="font-mono text-sm font-bold text-accent">{command}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{label}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
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
