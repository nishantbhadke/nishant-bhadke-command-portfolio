"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { projects } from "@/lib/profile";

interface ProjectDetailProps {
  projectIndex: number;
  setProjectIndex: React.Dispatch<React.SetStateAction<number>>;
}

export function ProjectDetail({ projectIndex, setProjectIndex }: ProjectDetailProps) {
  const selectedProject = projects[projectIndex];

  return (
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
  );
}
