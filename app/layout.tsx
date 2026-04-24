import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nishantbhadke.github.io/nishant-bhadke-command-portfolio";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Nishant Bhadke | Backend Engineer Portfolio",
  description:
    "A command-driven portfolio for Nishant Bhadke, a backend engineer building BFSI APIs, SQL-heavy workflows, Redis performance improvements, and maker-checker systems.",
  openGraph: {
    title: "Nishant Bhadke | Backend Engineer Portfolio",
    description: "Command-driven portfolio for backend engineering work across BFSI systems.",
    url: siteUrl,
    siteName: "Nishant Bhadke Portfolio",
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Nishant Bhadke | Backend Engineer Portfolio",
    description: "Command-driven portfolio for backend engineering work across BFSI systems."
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: siteUrl
  },
  other: {
    "theme-color": "#0b0b09"
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Nishant Bhadke",
  jobTitle: ".NET Backend Engineer",
  url: siteUrl,
  sameAs: ["https://www.linkedin.com/in/nishant-bhadke-983837185/"],
  worksFor: { "@type": "Organization", name: "Winjit Technologies" },
  knowsAbout: [".NET Core", "SQL Server", "Redis", "AWS", "Docker", "BFSI"],
  address: { "@type": "PostalAddress", addressLocality: "Nashik", addressCountry: "IN" }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
