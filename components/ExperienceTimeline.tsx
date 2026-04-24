"use client";

import { projects, work } from "@/lib/profile";

interface ExperienceTimelineProps {
  projectIndex: number;
  openProject: (index: number, commandLabel?: string) => void;
}

export function ExperienceTimeline({ projectIndex, openProject }: ExperienceTimelineProps) {
  return (
    <article className="rounded-[1.6rem] border border-line bg-surface/88 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-accent">Experience</p>
          <h3 className="mt-2 font-display text-3xl tracking-[-0.03em]">Delivery timeline</h3>
        </div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Project tabs">
          {projects.map((project, index) => (
            <button
              key={project.id}
              type="button"
              role="tab"
              aria-selected={index === projectIndex}
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

      <div className="mt-5 grid gap-4" role="tabpanel">
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
  );
}
