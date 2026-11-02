import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BizBrain AI — Understand your business",
    template: "%s | BizBrain AI",
  },
  description:
    "Explore evidence-grounded business insights in the BizBrain AI demo. A fictional workspace with revenue, inventory, and order investigations.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
