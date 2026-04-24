"use client";

import { Mail, Phone, Linkedin } from "lucide-react";
import { profile, skills } from "@/lib/profile";
import { ContactCard, SoftFact } from "@/components/ui";
import { ProjectDetail } from "@/components/ProjectDetail";
import { ExperienceTimeline } from "@/components/ExperienceTimeline";

type SectionKey = "overview" | "projects" | "work" | "skills" | "contact";

const commandHelp = [
  ["about", "open the about surface"],
  ["projects", "open the featured project area"],
  ["work", "open the experience surface"],
  ["skills", "show the technical stack"],
  ["resume", "download resume instantly"],
  ["contact", "open the guarded contact composer"],
] as const;

function surfaceTitle(s: SectionKey) {
  const map: Record<SectionKey, string> = {
    projects: "Projects and experience",
    work: "Projects and experience",
    skills: "Technical stack",
    contact: "Contact",
    overview: "About",
  };
  return map[s];
}

function surfaceDesc(s: SectionKey) {
  const map: Record<SectionKey, string> = {
    projects: "Project detail and delivery experience in one place.",
    work: "Project detail and delivery experience in one place.",
    skills: "Stack grouped around backend delivery.",
    contact: "Contact below; command can jump there directly.",
    overview: "Command line controls this surface for scroll-free navigation.",
  };
  return map[s];
}

interface Props {
  activeSection: SectionKey;
  projectIndex: number;
  openProject: (i: number, cmd?: string) => void;
  setProjectIndex: React.Dispatch<React.SetStateAction<number>>;
}

export function SurfacePanel({ activeSection, projectIndex, openProject, setProjectIndex }: Props) {
  return (
    <>
      <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-accent">Live surface</p>
          <h2 className="mt-2 font-display text-4xl tracking-[-0.04em]">{surfaceTitle(activeSection)}</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted">{surfaceDesc(activeSection)}</p>
      </div>
      <div className="mt-6" role="region" aria-label={`${surfaceTitle(activeSection)} panel`}>
        <Content activeSection={activeSection} projectIndex={projectIndex} openProject={openProject} setProjectIndex={setProjectIndex} />
      </div>
    </>
  );
}

function Content({ activeSection, projectIndex, openProject, setProjectIndex }: Props) {
  if (activeSection === "projects" || activeSection === "work") {
    return (
      <div className="grid gap-4">
        <ProjectDetail projectIndex={projectIndex} setProjectIndex={setProjectIndex} />
        <ExperienceTimeline projectIndex={projectIndex} openProject={openProject} />
      </div>
    );
  }
  if (activeSection === "skills") {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {skills.map((g) => (
          <article key={g.group} className="rounded-[1.4rem] border border-line bg-surface/88 p-4">
            <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-accent">{g.group}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {g.items.map((i) => (
                <span key={i} className="rounded-full border border-line bg-card px-3 py-2 text-sm font-semibold text-muted">{i}</span>
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
        <p className="text-base leading-8 text-muted">The command line can jump to contact instantly.</p>
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
          Nishant works at the overlap of backend delivery, BFSI workflow rigor, and production pragmatism.
          He ships APIs, secure integrations, query-tuned data access, and maker-checker flows that survive real operational pressure.
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
          {commandHelp.map(([cmd, lbl]) => (
            <div key={cmd} className="rounded-[1.2rem] border border-line bg-card/70 px-4 py-3">
              <p className="font-mono text-sm font-bold text-accent">{cmd}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{lbl}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

export type { SectionKey };
