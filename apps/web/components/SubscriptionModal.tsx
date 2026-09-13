"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import type { Address, Hash } from "viem";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWriteContract,
} from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import {
  SUBSCRIPTIONS_ADDRESS,
  USDC_ADDRESS,
  erc20Abi,
  subscriptionsAbi,
} from "@/lib/subscriptions";
import { useSubscriptionPrice } from "@/hooks/useSubscriptionPrice";
import Button from "./ui/Button";
import Icon from "./ui/Icon";

export default function SubscriptionModal({
  creatorAddress,
  creatorName,
  onSuccess,
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}: {
  creatorAddress: string;
  creatorName: string;
  onSuccess: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [phase, setPhase] = useState<"idle" | "approving" | "paying" | "indexing">("idle");
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: avalancheFuji.id });
  const { writeContractAsync, isPending } = useWriteContract();
  const { price, formattedPrice, isLoading: priceLoading } = useSubscriptionPrice(
    creatorAddress as Address,
  );
  const displayCreator =
    creatorName.startsWith("0x") && creatorName.length > 12
      ? `${creatorName.slice(0, 6)}…${creatorName.slice(-4)}`
      : creatorName;

  async function waitFor(hash: Hash) {
    if (!publicClient) throw new Error("Fuji client is unavailable.");
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") throw new Error("Transaction reverted.");
  }

  async function subscribe() {
    if (!address || !price || chainId !== avalancheFuji.id) return;
    try {
      if (!publicClient) throw new Error("Fuji client is unavailable.");

      let nonce = await publicClient.getTransactionCount({
        address,
        blockTag: "pending",
      });
      const allowance = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address, SUBSCRIPTIONS_ADDRESS],
      });

      if (allowance < price) {
        setPhase("approving");
        const approvalHash = await writeContractAsync({
          address: USDC_ADDRESS,
          abi: erc20Abi,
          functionName: "approve",
          args: [SUBSCRIPTIONS_ADDRESS, price],
          chainId: avalancheFuji.id,
          nonce,
        });
        await waitFor(approvalHash);

        // Refresh after confirmation so a stale wallet nonce cannot be reused.
        nonce = await publicClient.getTransactionCount({
          address,
          blockTag: "pending",
        });
      }

      setPhase("paying");
      const paymentHash = await writeContractAsync({
        address: SUBSCRIPTIONS_ADDRESS,
        abi: subscriptionsAbi,
        functionName: "subscribe",
        args: [creatorAddress as Address],
        chainId: avalancheFuji.id,
        nonce,
      });
      await waitFor(paymentHash);

      setPhase("indexing");
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transactionHash: paymentHash }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Arkiv indexing failed.");

      toast.success("Subscription active", {
        description: `You can now read ${creatorName}'s premium articles for 30 days.`,
      });
      setOpen(false);
      setPhase("idle");
      onSuccess();
    } catch (error) {
      setPhase("idle");
      toast.error("Subscription failed", {
        description: error instanceof Error ? error.message : "The subscription could not be completed.",
      });
    }
  }

  const busy = isPending || phase !== "idle";
  const open = controlledOpen ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <>
      {showTrigger && (
        <Button
          icon="lock_open"
          disabled={priceLoading || !price || chainId !== avalancheFuji.id}
          onClick={() => setOpen(true)}
        >
          Subscribe to unlock
        </Button>
      )}

      <AnimatePresence>
        {open && (
        <motion.div
          key="subscription-modal"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-wood/45 px-5 py-8 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscription-modal-title"
            className="relative min-h-[520px] w-full max-w-3xl overflow-hidden border border-line-strong bg-paper-card p-8 shadow-card sm:p-12"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-honey/25 blur-3xl" />
            <button
              type="button"
              aria-label="Close subscription dialog"
              disabled={busy}
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 text-muted transition-colors hover:text-ink disabled:opacity-40"
            >
              <Icon name="close" size={20} />
            </button>

            <div className="relative">
              <h2 id="subscription-modal-title" className="font-display mt-4 w-full text-[clamp(2rem,6vw,4rem)] leading-[0.92] tracking-[-0.04em] text-ink">
                Read the creator's full archive.
              </h2>
              <p className="mt-6 text-[18px] leading-relaxed text-muted">
                One payment unlocks this creator&apos;s premium stories for the next 30 days.
              </p>

              <div className="mt-10 flex items-center justify-between border-y border-line py-7">
                <span className="font-mono text-[16px] uppercase text-muted">Subscription price</span>
                <span className="font-display text-[38px] leading-none text-ink">
                  {formattedPrice ?? "—"}
                  <span className="ml-2 font-sans text-[14px] text-muted">USDC</span>
                </span>
              </div>

              <Button
                block
                className="mt-12"
                icon="lock_open"
                disabled={busy || !price}
                onClick={() => void subscribe()}
              >
                {phase === "approving"
                  ? "Confirm USDC approval…"
                  : phase === "paying"
                    ? "Confirm payment…"
                    : phase === "indexing"
                      ? "Saving subscription…"
                      : `Pay ${formattedPrice ?? "—"} USDC`}
              </Button>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
