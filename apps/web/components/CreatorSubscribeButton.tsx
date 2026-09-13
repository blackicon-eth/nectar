"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWalletClient } from "wagmi";
import { useAuth } from "@/components/AuthProvider";
import Button from "./ui/Button";
import SubscriptionModal from "./SubscriptionModal";

export default function CreatorSubscribeButton({
  creatorAddress,
  creatorName,
}: {
  creatorAddress: string;
  creatorName: string;
}) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { status, signIn, signing } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [subscriptionState, setSubscriptionState] = useState<"unknown" | "active" | "inactive">("unknown");
  const autoSignInAttempt = useRef<string | undefined>(undefined);
  const validCreator = /^0x[0-9a-fA-F]{40}$/.test(creatorAddress);

  useEffect(() => {
    if (status !== "signed-in") {
      setSubscriptionState("inactive");
      return;
    }

    let active = true;
    setSubscriptionState("unknown");
    fetch("/api/subscriptions", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to check subscription status.");
        const data = (await response.json()) as { subscriptions?: { creator: string }[] };
        if (active) {
          setSubscriptionState(
            data.subscriptions?.some((subscription) => subscription.creator.toLowerCase() === creatorAddress.toLowerCase())
              ? "active"
              : "inactive",
          );
        }
      })
      .catch(() => active && setSubscriptionState("inactive"));

    return () => {
      active = false;
    };
  }, [creatorAddress, status]);

  useEffect(() => {
    const identity = address?.toLowerCase();
    if (
      identity &&
      walletClient?.account.address.toLowerCase() === identity &&
      status === "signed-out" &&
      !signing &&
      autoSignInAttempt.current !== identity
    ) {
      autoSignInAttempt.current = identity;
      void signIn().catch(() => undefined);
    }
  }, [address, signIn, signing, status, walletClient]);

  if (!validCreator || address?.toLowerCase() === creatorAddress.toLowerCase()) {
    return null;
  }

  if (subscriptionState === "active") {
    return (
      <div className="inline-flex items-center gap-2 border border-sage/35 bg-sage/10 px-4 py-2 font-mono text-[12px] text-sage">
        <span className="h-1.5 w-1.5 rounded-full bg-sage" />
        You support this creator
      </div>
    );
  }

  async function begin(openConnectModal: () => void) {
    if (!address) {
      openConnectModal();
      return;
    }
    if (status === "signed-in") {
      setModalOpen(true);
      return;
    }

    try {
      setSubscriptionState("unknown");
      await signIn();
      setModalOpen(true);
    } catch (error) {
      toast.error("Sign-in failed", {
        description: error instanceof Error ? error.message : "Unable to verify your wallet.",
      });
    }
  }

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        const checkingSubscription = status === "signed-in" && subscriptionState === "unknown";
        return (
          <>
            <Button
              icon={!connected ? "account_balance_wallet" : status === "signed-in" ? "lock_open" : "draw"}
              disabled={signing || checkingSubscription}
              onClick={() => void begin(openConnectModal)}
            >
              {!connected ? "Connect wallet" : signing ? "Signing in…" : checkingSubscription ? "Checking access…" : status === "signed-in" ? "Subscribe" : "Sign in to subscribe"}
            </Button>
            <SubscriptionModal
              creatorAddress={creatorAddress}
              creatorName={creatorName}
              onSuccess={() => {
                setModalOpen(false);
                setSubscriptionState("active");
              }}
              open={modalOpen}
              onOpenChange={setModalOpen}
              showTrigger={false}
            />
          </>
        );
      }}
    </ConnectButton.Custom>
  );
}
