import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";

// Same font pairing as the mobile app (see apps/mobile/src/theme/typography.ts)
// so the site and the product feel like one brand.
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const SITE_URL = "https://traktion.vercel.app";
const DESCRIPTION =
  "Traktion is a full-stack fitness app: workout tracking with automatic PR detection, free-text macro logging, and opt-in social sharing. Built solo with React Native, Node.js, and PostgreSQL.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Traktion — Workout, Nutrition & Progress Tracker",
    template: "%s — Traktion",
  },
  description: DESCRIPTION,
  keywords: [
    "Traktion",
    "workout tracker",
    "fitness app",
    "React Native",
    "Expo",
    "Node.js",
    "PostgreSQL",
    "Prisma",
    "portfolio project",
  ],
  authors: [{ name: "Besnik Ajdini" }],
  creator: "Besnik Ajdini",
  openGraph: {
    title: "Traktion — Workout, Nutrition & Progress Tracker",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Traktion",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Traktion — Workout, Nutrition & Progress Tracker",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#05070A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable}`} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
