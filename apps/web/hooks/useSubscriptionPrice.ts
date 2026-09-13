"use client";

import type { Address } from "viem";
import { zeroAddress } from "viem";
import { useReadContract } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import {
  SUBSCRIPTIONS_ADDRESS,
  formatUsdc,
  subscriptionsAbi,
} from "@/lib/subscriptions";

export function useSubscriptionPrice(creator?: Address) {
  const query = useReadContract({
    address: SUBSCRIPTIONS_ADDRESS,
    abi: subscriptionsAbi,
    functionName: "priceOf",
    args: [creator ?? zeroAddress],
    chainId: avalancheFuji.id,
    query: { enabled: Boolean(creator) },
  });

  const price = query.data;

  return {
    ...query,
    price,
    formattedPrice: price === undefined ? null : formatUsdc(price),
    hasPrice: price !== undefined && price > 0n,
  };
}
