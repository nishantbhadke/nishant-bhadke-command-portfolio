import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nishantbhadke.github.io/nishant-bhadke-command-portfolio";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Nishant Bhadke | Command Portfolio",
  description:
    "Interactive command-driven portfolio for Nishant Bhadke, .NET Backend Engineer focused on BFSI platforms, APIs, SQL Server, Redis, AWS, and Docker.",
  openGraph: {
    title: "Nishant Bhadke | Command Portfolio",
    description: "Command-driven portfolio for backend engineering work across BFSI systems.",
    url: siteUrl,
    siteName: "Nishant Bhadke Command Portfolio",
    locale: "en_IN",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
