import { Command } from "lucide-react";

const portfolioRepo = "https://github.com/nishantbhadke/nishant-bhadke-command-portfolio";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 rounded-[2rem] border border-line/80 bg-card/88 px-6 py-5 shadow-soft backdrop-blur-xl">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-command text-accent">
            <Command size={14} />
          </div>
          <p className="text-sm text-muted">
            &copy; {year} Nishant Bhadke. Built with Next.js &amp; deployed on GitHub Pages.
          </p>
        </div>
        <div className="flex gap-4">
          <a
            href={portfolioRepo}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-muted transition hover:text-accent"
          >
            Source Code
          </a>
          <a
            href="https://www.linkedin.com/in/nishant-bhadke-983837185/"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-muted transition hover:text-accent"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
