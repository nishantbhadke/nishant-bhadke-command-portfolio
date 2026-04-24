"use client";

import { Keyboard } from "lucide-react";

const keyboardRows = ["1234567890", "QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

interface TypewriterKeyboardProps {
  pressedKey: string;
  typeKey: (key: string) => void;
}

export function TypewriterKeyboard({ pressedKey, typeKey }: TypewriterKeyboardProps) {
  return (
    <section
      className="mt-5 rounded-[1.8rem] border border-line bg-command/92 p-5 shadow-soft"
      aria-label="On-screen typewriter keyboard"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Keyboard size={18} className="text-accent" aria-hidden="true" />
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
                  aria-label={`Type ${letter}`}
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
              aria-label="Backspace"
              className="h-10 rounded-full border border-[#c3b39e] bg-card px-4 font-mono text-xs font-bold text-ink shadow-[0_3px_0_rgba(109,84,58,0.35)] transition hover:-translate-y-0.5 hover:border-accent"
            >
              back
            </button>
            <button
              type="button"
              onClick={() => typeKey("space")}
              aria-label="Space"
              className="h-10 w-32 rounded-full border border-[#c3b39e] bg-card font-mono text-xs font-bold text-ink shadow-[0_3px_0_rgba(109,84,58,0.35)] transition hover:-translate-y-0.5 hover:border-accent sm:w-48"
            >
              space
            </button>
            <button
              type="button"
              onClick={() => typeKey("enter")}
              aria-label="Enter"
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
