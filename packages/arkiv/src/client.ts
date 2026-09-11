import {
  createPublicClient,
  createWalletClient,
  type PublicArkivClient,
  type WalletArkivClient,
} from "@arkiv-network/sdk";
import { tiramisu } from "@arkiv-network/sdk/chains";
import { http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export function createArkivPublicClient(
  rpcUrl?: string,
): PublicArkivClient {
  return createPublicClient({
    chain: tiramisu,
    transport: rpcUrl ? http(rpcUrl) : http(),
  });
}

export function createArkivWalletClient(
  privateKey: string,
  rpcUrl?: string,
): WalletArkivClient {
  return createWalletClient({
    chain: tiramisu,
    transport: rpcUrl ? http(rpcUrl) : http(),
    account: privateKeyToAccount(privateKey as `0x${string}`),
  });
}
