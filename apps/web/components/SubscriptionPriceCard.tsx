"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import {
  SUBSCRIPTIONS_ADDRESS,
  parseUsdc,
  subscriptionsAbi,
} from "@/lib/subscriptions";
import { useSubscriptionPrice } from "@/hooks/useSubscriptionPrice";
import Button from "./ui/Button";
import Icon from "./ui/Icon";

export default function SubscriptionPriceCard() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { writeContractAsync, isPending } = useWriteContract();
  const [priceInput, setPriceInput] = useState("");
  const [transactionHash, setTransactionHash] = useState<`0x${string}`>();

  const isFuji = chainId === avalancheFuji.id;

  const {
    formattedPrice: currentPrice,
    hasPrice,
    isLoading: priceLoading,
    refetch: refetchPrice,
  } = useSubscriptionPrice(address);
  const {
    isLoading: isConfirming,
    isSuccess: transactionConfirmed,
    isError: transactionFailed,
    error: transactionError,
  } = useWaitForTransactionReceipt({
    chainId: avalancheFuji.id,
    hash: transactionHash,
    query: { enabled: Boolean(transactionHash) },
  });

  useEffect(() => {
    if (transactionConfirmed) {
      void refetchPrice();
      toast.success("Price updated", {
        description: "Your premium subscription price is now active.",
      });
      setPriceInput("");
      setTransactionHash(undefined);
    }
  }, [refetchPrice, transactionConfirmed]);

  useEffect(() => {
    if (transactionFailed) {
      toast.error("Price update failed", {
        description: transactionError?.message ?? "The transaction was not confirmed.",
      });
      setTransactionHash(undefined);
    }
  }, [transactionError, transactionFailed]);

  async function handleSetPrice(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;

    if (!isFuji) {
      toast.error("Wrong network", {
        description: "Switch to Avalanche Fuji to set your price.",
      });
      return;
    }

    const raw = parseUsdc(priceInput);
    if (raw === undefined || raw <= 0n) {
      toast.error("Invalid price", {
        description: "Enter a positive USDC amount.",
      });
      return;
    }

    try {
      const hash = await writeContractAsync({
        address: SUBSCRIPTIONS_ADDRESS,
        abi: subscriptionsAbi,
        functionName: "setPrice",
        args: [raw],
        chainId: avalancheFuji.id,
      });
      setTransactionHash(hash);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      toast.error("Could not set price", { description: message });
    }
  }

  return (
    <div className="rounded-lg border border-line bg-paper-card p-6 shadow-card sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-title-lg">Premium subscription</h3>
          <p className="text-body-sm mt-1 text-muted">
            Readers pay this amount to access your premium articles for 30 days.
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-honey/20 text-honey">
          <Icon name="sell" size={20} />
        </span>
      </div>

      <div className="mt-6 rounded-md border border-line bg-paper-raised p-4">
        <form
          onSubmit={handleSetPrice}
          className="grid w-full grid-cols-1 sm:grid-cols-2"
        >
          <div className="flex min-w-0 flex-col items-start gap-1 p-2 sm:pr-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
              Current price
            </span>
            {priceLoading ? (
              <span className="font-mono text-[13px] text-muted">Loading…</span>
            ) : hasPrice ? (
              <span className="font-display text-title-lg text-ink">
                {currentPrice}
                <span className="ml-1 font-sans text-body-sm font-normal text-muted">
                  USDC / 30 days
                </span>
              </span>
            ) : (
              <span className="font-mono text-[13px] font-semibold text-rust">
                Not set
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 border-t border-line p-2 sm:border-l sm:border-t-0 sm:pl-5">
            <label
              htmlFor="subscription-price"
              className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted"
            >
              Set price
            </label>
            <div className="relative flex min-w-0 flex-1 items-center">
              <input
                id="subscription-price"
                type="text"
                inputMode="decimal"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder={hasPrice ? currentPrice ?? "" : "e.g. 5"}
                className="min-w-0 flex-1 rounded-full border border-line bg-paper-card px-3.5 py-2 pr-12 font-mono text-[14px] text-ink outline-none transition focus:border-honey"
              />
              <span className="pointer-events-none absolute right-3.5 font-mono text-[12px] text-muted">
                USDC
              </span>
            </div>
            {isFuji ? (
              <Button type="submit" icon="sell" disabled={isPending || isConfirming || !priceInput}>
                {isPending ? "Signing…" : isConfirming ? "Confirming…" : "Set price"}
              </Button>
            ) : (
              <Button
                type="button"
                icon="swap_horiz"
                onClick={() => switchChain({ chainId: avalancheFuji.id })}
              >
                Switch to Fuji
              </Button>
            )}
          </div>
        </form>
      </div>

      <p className="mt-3 text-body-sm text-muted">
        Nectar keeps 10% of each payment; the rest goes straight to your wallet.
      </p>
    </div>
  );
}
