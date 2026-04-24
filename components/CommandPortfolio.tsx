"use client";

import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  Command,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import { KeyboardEvent, Suspense, lazy, startTransition, useDeferredValue, useCallback, useRef, useState } from "react";
import { profile, projects, recognition, skills, work } from "@/lib/profile";
import { analyzeContactDraft, OFFENSIVE_THRESHOLD } from "@/lib/messageSafety";
import type { ContactDraft } from "@/lib/messageSafety";

import { CommandInput } from "@/components/CommandInput";
import { CommandHistory, type OutputEntry } from "@/components/CommandHistory";
import { SurfacePanel, type SectionKey } from "@/components/SurfacePanel";
import { Footer } from "@/components/Footer";
import { MetricCard, SoftFact, ContactCard, Field, AnalysisStat, SignalChip, SectionShell } from "@/components/ui";

const TypewriterKeyboard = lazy(() =>
  import("@/components/TypewriterKeyboard").then((m) => ({ default: m.TypewriterKeyboard }))
);

type ComposerField = "name" | "email" | "subject" | "message";

const starterHistory: OutputEntry[] = [
  { id: 1, command: "system", response: "Ready. Try about, projects, search redis, work, resume, or contact." }
];

const greetings = ["Hello", "Hola", "Ola", "Bonjour", "Ciao", "Namaste"];
const portfolioRepo = "https://github.com/nishantbhadke/nishant-bhadke-command-portfolio";

function normalize(v: string) { return v.trim().toLowerCase(); }

function commandAlias(cmd: string) {
  const aliases: Record<string, string> = {
    overview: "about", intro: "about", exp: "work", experience: "work",
    stack: "skills", tech: "skills", cv: "resume", mail: "contact",
    email: "contact", project: "projects", composer: "contact"
  };
  return aliases[cmd] ?? cmd;
}

const commandHelpFull = [
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

export function CommandPortfolio() {
  const contactRef = useRef<HTMLElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const [activeSection, setActiveSection] = useState<SectionKey>("overview");
  const [projectIndex, setProjectIndex] = useState(0);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<OutputEntry[]>(starterHistory);
  const [pressedKey, setPressedKey] = useState("");
  const [notice, setNotice] = useState("");
  const [composer, setComposer] = useState<ContactDraft>({ name: "", email: "", subject: "", message: "" });

  const deferredMessage = useDeferredValue(composer.message);
  const draftAnalysis = analyzeContactDraft({ ...composer, message: deferredMessage });

  const addHistory = useCallback((command: string, response: string) => {
    setHistory((items) => [...items.slice(-5), { id: Date.now(), command, response }]);
  }, []);

  const activateSection = useCallback((section: SectionKey, scroll = true) => {
    startTransition(() => setActiveSection(section));
    if (section === "contact" && scroll) {
      contactRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const openProject = useCallback((index: number, commandLabel?: string) => {
    setProjectIndex(index);
    activateSection("projects", false);
    addHistory(commandLabel ?? projects[index].command, `Opened ${projects[index].title}.`);
  }, [activateSection, addHistory]);

  function runSearch(rawTerm: string) {
    const query = normalize(rawTerm);
    if (!query) { addHistory("search", "Type a keyword like redis, docker, radc, aws, contact, or resume."); return; }
    const pMatch = projects.findIndex((p) =>
      [p.title, p.label, p.summary, p.impact, p.command, p.tech.join(" ")].join(" ").toLowerCase().includes(query)
    );
    if (pMatch >= 0) { openProject(pMatch, `search ${query}`); return; }
    const sMatch = skills.find((g) => [g.group, g.items.join(" ")].join(" ").toLowerCase().includes(query));
    if (sMatch) { activateSection("skills", false); addHistory(`search ${query}`, `Found ${sMatch.group}. Moved to the technical stack.`); return; }
    const wMatch = work.find((w) => [w.company, w.role, w.bullets.join(" ")].join(" ").toLowerCase().includes(query));
    if (wMatch) { activateSection("work", false); addHistory(`search ${query}`, `Matched ${wMatch.company}. Opening experience.`); return; }
    if ([profile.name, profile.role, profile.location, recognition.awards.join(" "), recognition.certifications.join(" ")]
      .join(" ").toLowerCase().includes(query)) {
      activateSection("overview", false); addHistory(`search ${query}`, "Matched the profile narrative."); return;
    }
    if (["email", "contact", "message", "linkedin"].some((t) => t.includes(query) || query.includes(t))) {
      activateSection("contact"); addHistory(`search ${query}`, "Moved to the contact composer."); return;
    }
    addHistory(`search ${query}`, "No exact match. Try redis, banking, docker, radc, aws, contact, or resume.");
  }

  function runCommand(rawCommand?: string) {
    const original = normalize(rawCommand ?? input);
    const command = commandAlias(original);
    if (!command) return;
    setInput(""); setNotice("");
    if (command === "clear") { setHistory(starterHistory); return; }
    if (command.startsWith("search ")) { runSearch(command.replace(/^search\s+/, "")); return; }
    const pIdx = projects.findIndex((p) => p.command === command || p.id === command);
    if (pIdx >= 0) { openProject(pIdx, command); return; }
    switch (command) {
      case "help":
        activateSection("overview", false);
        addHistory("help", `Available commands: ${commandHelpFull.map(([c]) => c).join(", ")}.`);
        break;
      case "about": activateSection("overview", false); addHistory("about", "Moved to the introduction."); break;
      case "projects": activateSection("projects", false); addHistory("projects", "Opened the project showcase."); break;
      case "work": activateSection("work", false); addHistory("work", "Opened the delivery timeline."); break;
      case "skills": activateSection("skills", false); addHistory("skills", "Opened the technical stack."); break;
      case "resume": window.location.href = profile.resume; addHistory("resume", "Resume download started."); break;
      case "contact":
        activateSection("contact"); addHistory("contact", "Opened the guarded contact composer.");
        window.setTimeout(() => messageRef.current?.focus(), 180); break;
      case "search": runSearch(""); break;
      default: runSearch(command);
    }
  }

  function registerKey(key: string) {
    const label = key.length === 1 ? key.toUpperCase() : key;
    setPressedKey(label);
    window.setTimeout(() => setPressedKey(""), 120);
  }

  function updateComposer(field: ComposerField, value: string) {
    setComposer((c) => ({ ...c, [field]: value }));
    setNotice("");
  }

  function typeKey(key: string) {
    registerKey(key);
    activateSection("contact", false);
    messageRef.current?.focus();
    if (key === "backspace") { setComposer((c) => ({ ...c, message: c.message.slice(0, -1) })); return; }
    if (key === "space") { setComposer((c) => ({ ...c, message: `${c.message} ` })); return; }
    if (key === "enter") { setComposer((c) => ({ ...c, message: `${c.message}\n` })); return; }
    setComposer((c) => ({ ...c, message: `${c.message}${key.toLowerCase()}` }));
  }

  function onMessageKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) { registerKey(event.key); }

  function openDraftEmail() {
    const analysis = analyzeContactDraft(composer);
    if (!composer.message.trim()) { setNotice("Add a message before opening the draft."); activateSection("contact"); return; }
    if (analysis.blocked) {
      setNotice(`Draft blocked. Offensiveness is ${analysis.offensivenessPercent}% and must stay below ${Math.round(OFFENSIVE_THRESHOLD * 100)}%.`);
      activateSection("contact"); return;
    }
    const body = ["Hi Nishant,", "", composer.message.trim(), "",
      composer.name.trim() ? `From: ${composer.name.trim()}` : null,
      composer.email.trim() ? `Reply email: ${composer.email.trim()}` : null
    ].filter(Boolean).join("\n");
    const subject = composer.subject.trim() || "Portfolio conversation";
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setNotice("Safe draft prepared in your mail client.");
    addHistory("contact", "Opened a safe email draft.");
  }

  const thresholdPercent = Math.round(OFFENSIVE_THRESHOLD * 100);
  const safetyTone = draftAnalysis.blocked ? "text-[#9f2f1a]" : "text-[#17603a]";

  return (
    <main id="main-content" className="min-h-screen overflow-x-hidden bg-paper text-ink">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(202,117,62,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(104,140,176,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.65),rgba(246,239,229,0.92))]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(84,61,43,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(84,61,43,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {/* ── Navigation ── */}
        <nav className="rounded-[2rem] border border-line/80 bg-card/88 px-4 py-3 shadow-soft backdrop-blur-xl" aria-label="Main navigation">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-command text-accent">
                <Command size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.24em] text-accent">Portfolio V2</p>
                <p className="text-sm text-muted">Command-first navigation with direct recruiter access.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={profile.resume} download className="rounded-full border border-accent bg-accent px-4 py-2 text-sm font-bold text-card transition hover:brightness-95">
                Resume
              </a>
              <button type="button" onClick={() => activateSection("contact")} className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent">
                Contact
              </button>
              <a href={portfolioRepo} target="_blank" rel="noreferrer" className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent">
                Repo
              </a>
            </div>
          </div>
        </nav>

        {/* ── Hero + Command Line ── */}
        <header className="grid gap-6">
          <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="rounded-[2.2rem] border border-line bg-card/92 p-6 shadow-soft sm:p-8">
            <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
              <div>
                <div className="flex flex-wrap gap-2">
                  {greetings.map((g) => (
                    <span key={g} className="rounded-full border border-line bg-surface/88 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-accent">{g}</span>
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
              </div>
              <div>
                <CommandInput input={input} setInput={setInput} runCommand={runCommand} />
                <CommandHistory history={history} />
              </div>
            </div>
          </motion.section>

          {/* ── Live Surface ── */}
          <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }} className="rounded-[2rem] border border-line bg-card/92 p-6 shadow-soft">
            <SurfacePanel activeSection={activeSection} projectIndex={projectIndex} openProject={openProject} setProjectIndex={setProjectIndex} />
          </motion.section>
        </header>

        {/* ── Contact Composer ── */}
        <section ref={contactRef} aria-label="Contact composer">
          <SectionShell title="Contact" eyebrow="Composer" description="One card, direct contact details, and a guarded email composer with a live offensiveness threshold.">
            <form onSubmit={(e) => { e.preventDefault(); openDraftEmail(); }} className="grid gap-5">
              <div className="grid gap-3 md:grid-cols-3">
                <ContactCard label="Email" value={profile.email} href={`mailto:${profile.email}`} icon={<Mail size={16} />} />
                <ContactCard label="Phone" value={profile.phone} href={`tel:${profile.phone.replace(/\s/g, "")}`} icon={<Phone size={16} />} />
                <ContactCard label="LinkedIn" value="nishant-bhadke-983837185" href={profile.linkedin} icon={<Linkedin size={16} />} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" value={composer.name} onChange={(v) => updateComposer("name", v)} placeholder="Your name" id="composer-name" />
                <Field label="Your email" value={composer.email} onChange={(v) => updateComposer("email", v)} placeholder="you@example.com" type="email" id="composer-email" />
              </div>
              <Field label="Subject" value={composer.subject} onChange={(v) => updateComposer("subject", v)} placeholder="Discussing a backend engineering role" id="composer-subject" />
              <div>
                <label htmlFor="composer-message" className="mb-2 block text-sm font-semibold text-ink">Message</label>
                <textarea ref={messageRef} id="composer-message" value={composer.message} onChange={(e) => updateComposer("message", e.target.value)} onKeyDown={onMessageKeyDown} placeholder="Hi Nishant, I saw your portfolio and would like to discuss a backend opportunity..." className="min-h-48 w-full rounded-[1.6rem] border border-line bg-surface/80 p-4 text-sm leading-7 text-ink outline-none transition placeholder:text-muted/70 focus:border-accent" />
              </div>

              {/* Semantic analysis */}
              <article className="rounded-[1.6rem] border border-line bg-surface/88 p-5" role="status" aria-label="Draft safety analysis">
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
                    <div className={`h-3 rounded-full transition-all ${draftAnalysis.blocked ? "bg-[#cb5d38]" : "bg-[#2f8a59]"}`} style={{ width: `${Math.min(draftAnalysis.offensivenessPercent, 100)}%` }} />
                    <div className="pointer-events-none absolute inset-y-[-3px] w-[2px] bg-ink/80" style={{ left: `${thresholdPercent}%` }} aria-hidden="true" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted">
                    <span>0%</span><span>Block threshold {thresholdPercent}%</span><span>100%</span>
                  </div>
                </div>
                <div className="mt-5 rounded-[1.2rem] border border-line bg-card/70 p-4">
                  <p className="text-sm font-semibold">Draft guidance</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm leading-6">
                    {(draftAnalysis.guidance.length > 0 ? draftAnalysis.guidance : ["Draft is respectful and can be opened in the mail client."]).map((item) => (
                      <p key={item} className="rounded-full bg-surface/80 px-3 py-2 text-muted">{item}</p>
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
                  <button type="button" onClick={() => { setComposer({ name: "", email: "", subject: "", message: "" }); setNotice(""); }} className="rounded-full border border-line bg-surface px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent">
                    Clear draft
                  </button>
                  <button type="submit" disabled={draftAnalysis.blocked || !composer.message.trim()} className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition ${draftAnalysis.blocked || !composer.message.trim() ? "cursor-not-allowed bg-line text-muted" : "bg-accent text-card hover:brightness-95"}`}>
                    Open email draft <Send size={16} />
                  </button>
                </div>
              </div>
            </form>

            <Suspense fallback={<div className="mt-5 h-64 animate-pulse rounded-[1.8rem] bg-command/60" />}>
              <TypewriterKeyboard pressedKey={pressedKey} typeKey={typeKey} />
            </Suspense>
          </SectionShell>
        </section>

        <Footer />
      </div>
    </main>
  );
}
