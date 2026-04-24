import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nishantbhadke.github.io/nishant-bhadke-command-portfolio";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Nishant Bhadke | .NET Backend Engineer Portfolio",
  description:
    "Command-driven portfolio for Nishant Bhadke — .NET Backend Engineer focused on BFSI platforms, secure APIs, SQL Server, Redis, AWS, and Docker.",
  openGraph: {
    title: "Nishant Bhadke | .NET Backend Engineer Portfolio",
    description: "Command-driven portfolio for backend engineering work across BFSI systems, with a guarded contact composer.",
    url: siteUrl,
    siteName: "Nishant Bhadke Portfolio",
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Nishant Bhadke | .NET Backend Engineer Portfolio",
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
    "theme-color": "#f6efe5"
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
