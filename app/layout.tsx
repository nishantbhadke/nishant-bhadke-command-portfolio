import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nishantbhadke.github.io/nishant-bhadke-command-portfolio";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Nishant Bhadke | Claude-Inspired Portfolio",
  description:
    "Claude-inspired narrative portfolio for Nishant Bhadke, a .NET Backend Engineer focused on BFSI platforms, secure APIs, SQL Server, Redis, AWS, and Docker.",
  openGraph: {
    title: "Nishant Bhadke | Claude-Inspired Portfolio",
    description: "Narrative portfolio for backend engineering work across BFSI systems, with guarded contact composition.",
    url: siteUrl,
    siteName: "Nishant Bhadke Portfolio V2",
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
