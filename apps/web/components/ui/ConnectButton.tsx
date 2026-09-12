"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { AnimatePresence, motion } from "motion/react";
import Icon from "./Icon";

export default function WalletButton() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative justify-self-end">
      <ConnectButton.Custom>
        {({ account, chain, openConnectModal, mounted }) => {
          const connected = mounted && account && chain;

          return (
            <button
              type="button"
              onClick={() => {
                if (!connected) {
                  openConnectModal();
                } else {
                  setOpen((v) => !v);
                }
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-paper-card px-3.5 py-1.5 font-mono text-[14px] text-ink transition-colors hover:bg-wood hover:text-cream"
            >
              <span
                className={`inline-block h-2 w-2 rounded-full transition-colors ${
                  connected ? "bg-sage" : "bg-amber"
                }`}
              />
              <span>
                {connected
                  ? `${account.address.slice(0, 6)}…${account.address.slice(-4)}`
                  : "Connect Wallet"}
              </span>
              {connected && (
                <motion.span
                  className="flex"
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <Icon name="expand_more" size={16} />
                </motion.span>
              )}
            </button>
          );
        }}
      </ConnectButton.Custom>

      <AnimatePresence>
        {open && address && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="menu"
              className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-lg border border-line bg-paper-card p-4 shadow-card"
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <div className="font-mono text-[13px] uppercase tracking-[0.08em] text-muted">
                Connected Wallet
              </div>
              <div className="mt-2 break-all rounded-md border border-line bg-paper-raised px-3 py-2 font-mono text-[13px] text-ink">
                {address}
              </div>
              <button
                type="button"
                onClick={() => {
                  void fetch("/api/auth/session", { method: "DELETE" });
                  disconnect();
                  setOpen(false);
                }}
                className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-amber px-3 py-1.5 text-[14px] font-medium text-amber transition-colors hover:bg-amber hover:text-cream"
              >
                <Icon name="logout" size={16} />
                Disconnect
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
