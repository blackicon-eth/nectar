import { formatUnits, parseUnits } from "viem";

// Deployed NectarSubscriptions registry on Avalanche Fuji.
// Override with NEXT_PUBLIC_NECTAR_SUBSCRIPTIONS_ADDRESS for a fresh deploy.
export const SUBSCRIPTIONS_ADDRESS = (process.env
  .NEXT_PUBLIC_NECTAR_SUBSCRIPTIONS_ADDRESS ??
  "0x57d208210336D6b372A521c3662fe2ca49B7F25c") as `0x${string}`;

export const USDC_ADDRESS =
  "0x5425890298aed601595a70AB815c96711a31Bc65" as `0x${string}`;

export const USDC_DECIMALS = 6;

export const subscriptionsAbi = [
  {
    type: "function",
    name: "priceOf",
    stateMutability: "view",
    inputs: [{ name: "creator", type: "address" }],
    outputs: [{ name: "price", type: "uint256" }],
  },
  {
    type: "function",
    name: "setPrice",
    stateMutability: "nonpayable",
    inputs: [{ name: "price", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "subscribe",
    stateMutability: "nonpayable",
    inputs: [{ name: "creator", type: "address" }],
    outputs: [],
  },
] as const;

export const erc20Abi = [
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export function parseUsdc(input: string): bigint | undefined {
  try {
    return parseUnits(input, USDC_DECIMALS);
  } catch {
    return undefined;
  }
}

export function formatUsdc(raw: bigint): string {
  return formatUnits(raw, USDC_DECIMALS);
}
