"use client";

import { Send, Search } from "lucide-react";
import { useRef } from "react";

interface CommandInputProps {
  input: string;
  setInput: (value: string) => void;
  runCommand: (rawCommand?: string) => void;
}

export function CommandInput({ input, setInput, runCommand }: CommandInputProps) {
  const commandInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-[1.8rem] border border-line bg-command/85 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.24em] text-accent">Command line</p>
          <h2 className="mt-3 font-display text-3xl tracking-[-0.03em]">Navigate the portfolio here.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Use commands to open about, projects, work, skills, resume, or contact without hunting through sections.
          </p>
        </div>
        <Search size={18} className="mt-1 text-muted" aria-hidden="true" />
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-[1.4rem] border border-line bg-card px-4 py-3">
        <span className="font-mono text-accent" aria-hidden="true">&gt;</span>
        <label htmlFor="command-input" className="sr-only">
          Enter a command
        </label>
        <input
          ref={commandInputRef}
          id="command-input"
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
          autoComplete="off"
          aria-label="Command input"
        />
        <button
          type="button"
          onClick={() => runCommand()}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-card transition hover:brightness-95"
        >
          Run <Send size={14} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Quick commands">
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
    </div>
  );
}
