import type { Metadata } from "next";
import { JetBrains_Mono, Newsreader, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import PageTransition from "@/components/PageTransition";
import ArticlesProvider from "@/components/ArticlesProvider";
import Web3Provider from "@/components/Web3Provider";
import { Toaster } from "sonner";

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
  title: {
    default: "Nectar",
    template: "%s | Nectar",
  },
  applicationName: "Nectar",
  description:
    "Discover and publish independent writing with verifiable provenance onchain.",
  keywords: [
    "Nectar",
    "independent publishing",
    "onchain publishing",
    "decentralized writing",
    "Arkiv",
    "Swarm",
  ],
  openGraph: {
    title: "Nectar | Independent publishing onchain",
    description:
      "Discover and publish independent writing with verifiable provenance onchain.",
    siteName: "Nectar",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Nectar | Independent publishing onchain",
    description:
      "Discover and publish independent writing with verifiable provenance onchain.",
  },
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
        <Web3Provider>
          <div className="flex h-dvh min-h-screen flex-col overflow-hidden">
            <NavBar />
            <main className="min-h-0 flex-1 overflow-y-auto">
              <ArticlesProvider>
                <PageTransition>{children}</PageTransition>
              </ArticlesProvider>
            </main>
            <Footer />
            <Toaster richColors position="top-right" />
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}
