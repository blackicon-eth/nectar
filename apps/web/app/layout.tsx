import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nectar",
  description: "Creator-first publishing on ENSv2, Avalanche, Arkiv and Swarm.",
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
