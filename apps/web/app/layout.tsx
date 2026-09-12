import type { Metadata } from "next";
import { JetBrains_Mono, Newsreader, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import PageTransition from "@/components/PageTransition";
import ArticlesProvider from "@/components/ArticlesProvider";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Nectar",
  description:
    "Creator-first publishing on ENSv2, Avalanche, Arkiv and Swarm.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${sourceSans.variable} ${jetbrains.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body>
        <NavBar />
        <ArticlesProvider>
          <PageTransition>{children}</PageTransition>
        </ArticlesProvider>
        <Footer />
      </body>
    </html>
  );
}
