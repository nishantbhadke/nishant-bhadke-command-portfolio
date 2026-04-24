import { Command } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper text-ink">
      <div className="mx-auto max-w-lg px-6 text-center">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-command text-accent">
          <Command size={28} />
        </div>
        <h1 className="mt-6 font-display text-5xl tracking-[-0.04em]">404</h1>
        <p className="mt-4 text-lg leading-8 text-muted">
          This page does not exist. The command line on the home page can navigate
          the entire portfolio.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-bold text-card transition hover:brightness-95"
        >
          Back to portfolio
        </Link>
      </div>
    </main>
  );
}
