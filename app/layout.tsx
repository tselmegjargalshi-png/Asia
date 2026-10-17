import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/space-grotesk";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASIA — Money, Reimagined",
  description:
    "ASIA is a fictional premium digital bank: a cinematic, interactive concept experience. Not a real financial institution.",
  applicationName: "ASIA",
  openGraph: {
    title: "ASIA — Money, Reimagined",
    description: "A new perspective on money, designed for the way Asia moves. A fictional concept brand.",
    type: "website",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#070304",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-webgl="pending">
      <body>{children}</body>
    </html>
  );
}
