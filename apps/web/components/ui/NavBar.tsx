"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const LINKS = [
  { href: "/", label: "Feed" },
  { href: "/explore", label: "Explore" },
  { href: "/write", label: "Write" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="container-page flex items-center justify-between gap-6 py-3.5">
        <Link href="/" aria-label="Nectar home">
          <Logo height={26} />
        </Link>
        <div className="flex items-center gap-6">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[15px] font-medium transition-colors ${
                pathname === link.href
                  ? "text-ink"
                  : "text-muted hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-card px-3.5 py-1.5 font-mono text-[13px] text-ink transition-colors hover:bg-wood hover:text-cream"
            href="#connect"
          >
            <span className="status-pip" />
            <span>pippo.nectar.eth</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
