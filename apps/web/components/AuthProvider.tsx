"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { avalancheFuji } from "wagmi/chains";

type AuthStatus = "checking" | "signed-out" | "signed-in";

type AuthContextValue = {
  status: AuthStatus;
  address?: string;
  signing: boolean;
  signIn: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const preHydrationValue: AuthContextValue = {
  status: "checking",
  signing: false,
  signIn: async () => undefined,
};

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <AuthContext.Provider value={preHydrationValue}>
        {children}
      </AuthContext.Provider>
    );
  }

  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}

function AuthSessionProvider({ children }: { children: ReactNode }) {
  const { address: connectedAddress, isConnected } = useAccount();
  const connectedChainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const address = connectedAddress;
  const chainId = connectedChainId;
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [signing, setSigning] = useState(false);
  const previousIdentity = useRef<string | undefined>(undefined);

  useEffect(() => {
    const identity = address ? `${address.toLowerCase()}:${chainId}` : undefined;
    const changed = previousIdentity.current !== undefined && previousIdentity.current !== identity;

    if (changed) {
      setStatus("signed-out");
      void fetch("/api/auth/session", { method: "DELETE" });
    }

    previousIdentity.current = identity;
  }, [address, chainId]);

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
              chainId === avalancheFuji.id &&
              session.chainId === avalancheFuji.id
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
        body: JSON.stringify({ address, chainId: avalancheFuji.id }),
      });
      const nonceData = (await nonceResponse.json()) as {
        message?: string;
        error?: string;
      };
      if (!nonceResponse.ok || !nonceData.message) {
        throw new Error(nonceData.error ?? "Unable to start sign-in.");
      }

       if (
         !walletClient ||
         walletClient.account.address.toLowerCase() !== address.toLowerCase()
       ) {
         throw new Error("The connected wallet is not ready to sign.");
       }
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
