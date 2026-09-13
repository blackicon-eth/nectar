"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import Logo from "./Logo";
import WalletButton from "./ConnectButton";

const LINKS = [
  { href: "/", label: "Feed" },
  { href: "/explore", label: "Explore" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/write", label: "Write" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-6 px-8 py-3 md:px-12">
        <Link
          href="/"
          aria-label="Nectar home"
          className="justify-self-start"
        >
          <Logo height={40} />
        </Link>

        <div className="flex items-center gap-1 justify-self-center">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-4 py-1.5 text-[17px] font-medium transition-colors ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-full bg-paper-raised shadow-card"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="justify-self-end">
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}
