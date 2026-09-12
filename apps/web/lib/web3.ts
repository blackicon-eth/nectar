import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { avalanche, avalancheFuji } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Nectar",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  chains: [avalanche, avalancheFuji],
  ssr: false,
});
