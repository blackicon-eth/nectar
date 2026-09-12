"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";

type AuthStatus = "checking" | "signed-out" | "signed-in";

type AuthContextValue = {
  status: AuthStatus;
  address?: string;
  signing: boolean;
  signIn: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { address: connectedAddress, isConnected } = useAccount();
  const connectedChainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const address = walletClient?.account.address ?? connectedAddress;
  const chainId = walletClient?.chain.id ?? connectedChainId;
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) return;
      if (!isConnected || !address) {
        setStatus("signed-out");
        return;
      }

      setStatus("checking");
      fetch("/api/auth/session", { cache: "no-store" })
        .then((response) => response.json())
        .then((session: { authenticated?: boolean; address?: string | null; chainId?: number | null }) => {
          if (!active) return;
          setStatus(
            session.authenticated &&
              session.address?.toLowerCase() === address.toLowerCase() &&
              session.chainId === chainId
              ? "signed-in"
              : "signed-out",
          );
        })
        .catch(() => active && setStatus("signed-out"));
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [address, chainId, isConnected]);

  async function signIn() {
    if (!address) return;
    setSigning(true);
    try {
      const nonceResponse = await fetch("/api/auth/nonce", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address, chainId }),
      });
      const nonceData = (await nonceResponse.json()) as {
        message?: string;
        error?: string;
      };
      if (!nonceResponse.ok || !nonceData.message) {
        throw new Error(nonceData.error ?? "Unable to start sign-in.");
      }

      if (!walletClient) throw new Error("The connected wallet is not ready to sign.");
      const signature = await walletClient.signMessage({
        account: address,
        message: nonceData.message,
      });
      const verifyResponse = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: nonceData.message, signature }),
      });
      if (!verifyResponse.ok) throw new Error("Unable to verify sign-in.");
      setStatus("signed-in");
    } finally {
      setSigning(false);
    }
  }

  const value = useMemo(
    () => ({ status, address, signing, signIn }),
    [address, signIn, signing, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
