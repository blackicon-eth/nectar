"use client";

import type { ReactNode } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { AnimatePresence, motion } from "motion/react";
import { useAccount } from "wagmi";
import Button from "./ui/Button";
import Icon from "./ui/Icon";

type WalletGateProps = {
  children: ReactNode;
  title: string;
  description: string;
};

export default function WalletGate({
  children,
  title,
  description,
}: WalletGateProps) {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isConnected ? (
        <motion.div
          key="protected-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          key="wallet-prompt"
          className="mx-auto flex min-h-[58vh] w-full max-w-[760px] flex-col items-center justify-center px-8 py-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-paper-raised text-honey shadow-card">
            <Icon name="account_balance_wallet" size={28} />
          </div>
          <span className="font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-amber">
            Wallet required
          </span>
          <h1 className="font-display text-headline-lg mt-2 max-md:text-[32px] max-md:leading-[1.2]">
            {title}
          </h1>
          <p className="text-body-md mt-3 max-w-lg text-muted">{description}</p>
          <Button
            className="mt-7"
            icon="account_balance_wallet"
            onClick={() => openConnectModal?.()}
          >
            Connect Wallet
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
