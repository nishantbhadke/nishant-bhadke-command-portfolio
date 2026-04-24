# Nishant Bhadke — Command Portfolio

> **Interactive, command-driven portfolio** for [Nishant Bhadke](https://www.linkedin.com/in/nishant-bhadke-983837185/) — .NET Backend Engineer focused on BFSI platforms, secure APIs, SQL Server, Redis, AWS, and Docker.

**Live site →** [nishantbhadke.github.io/nishant-bhadke-command-portfolio](https://nishantbhadke.github.io/nishant-bhadke-command-portfolio/)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Command-first navigation** | Type commands like `about`, `projects`, `work`, `skills`, `resume`, or `contact` to navigate without scrolling |
| **Fuzzy search** | `search redis`, `search docker`, `search banking` finds projects, skills, and experience |
| **Guarded contact composer** | Real-time semantic analysis blocks offensive messages before they reach the mail client |
| **On-screen typewriter** | Click-to-type keyboard that feeds directly into the contact message field |
| **Static export** | Fully static Next.js build deployed to GitHub Pages — zero server required |

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router, static export)
- **Language:** TypeScript + React 19
- **Styling:** Tailwind CSS 3
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Fonts:** Inter + JetBrains Mono (Google Fonts)
- **Deployment:** GitHub Pages via GitHub Actions

## 📁 Project Structure

```
├── app/
│   ├── globals.css          # Design tokens, fonts, utilities
│   ├── layout.tsx           # Root layout with SEO, JSON-LD, skip link
│   ├── page.tsx             # Home page entry
│   ├── not-found.tsx        # Custom 404 page
│   ├── sitemap.ts           # Auto-generated sitemap
│   └── robots.ts            # Robots.txt generation
├── components/
│   ├── CommandPortfolio.tsx  # Main orchestrator component
│   ├── CommandInput.tsx      # Command input bar + quick chips
│   ├── CommandHistory.tsx    # Recent commands log
│   ├── SurfacePanel.tsx      # Live surface (About/Projects/Work/Skills/Contact)
│   ├── ProjectDetail.tsx     # Project card with navigation
│   ├── ExperienceTimeline.tsx# Work history timeline
│   ├── TypewriterKeyboard.tsx# On-screen keyboard (lazy-loaded)
│   ├── Footer.tsx            # Site footer
│   └── ui/index.tsx          # Shared primitives (MetricCard, Field, etc.)
├── lib/
│   ├── messageSafety.ts      # Offensive content analysis (TypeScript)
│   └── profile.ts            # Portfolio data (projects, skills, work)
├── tests/
│   └── message-safety.test.mjs
└── .github/workflows/
    └── pages.yml             # GitHub Pages deployment
```

## 🚀 Available Commands

| Command | Action |
|---------|--------|
| `about` | Open the introduction panel |
| `projects` | Open the project showcase |
| `work` | Open the experience timeline |
| `skills` | Show the technical stack |
| `resume` | Download resume PDF |
| `contact` | Open the guarded contact composer |
| `search <term>` | Find projects, skills, or experience by keyword |
| `rbl-bcms` | Focus the BCMS engagement |
| `rbl-radc` | Focus the RADC engagement |
| `clear` | Reset the command log |

## 🏗 Development

### Prerequisites

- Node.js ≥ 20
- npm

### Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build & preview

```bash
npm run build
npm run preview    # serves the static export on port 4174
```

### Quality checks

```bash
npm run typecheck  # TypeScript type checking
npm run lint       # ESLint
npm run test       # Message safety unit tests
npm run check      # All three: typecheck + lint + build
```

## 📦 Deployment

Pushing to `main` triggers the GitHub Actions workflow (`.github/workflows/pages.yml`) which:

1. Installs dependencies
2. Builds the static export with `GITHUB_PAGES=true`
3. Deploys to GitHub Pages

The live site updates automatically within minutes.

## 📄 License

This is a personal portfolio project.
