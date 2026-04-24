"use client";

interface OutputEntry {
  id: number;
  command: string;
  response: string;
}

interface CommandHistoryProps {
  history: OutputEntry[];
}

export function CommandHistory({ history }: CommandHistoryProps) {
  return (
    <div className="mt-5 rounded-[1.4rem] border border-line bg-card/80 p-4">
      <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted">Recent commands</p>
      <div className="mt-3 grid gap-3" role="log" aria-label="Command history" aria-live="polite">
        {history.map((entry) => (
          <div key={entry.id} className="rounded-[1rem] border border-line bg-surface/78 px-3 py-3 font-mono text-xs leading-6 text-muted">
            <p className="text-accent">{entry.command}</p>
            <p>{entry.response}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { OutputEntry };
