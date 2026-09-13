"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthProvider";

export type UserProfile = {
  walletAddress: string;
  displayName: string | null;
  avatarData: string | null;
};

type ProfileContextValue = {
  profile: UserProfile | null;
  status: "loading" | "error" | "idle";
  saveProfile: (values: { displayName: string; avatarData: string | null }) => Promise<UserProfile>;
  reloadProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within a ProfileProvider");
  return context;
}

export default function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { status: authStatus } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "idle">("idle");
  const requestId = useRef(0);

  const reloadProfile = useCallback(async () => {
    const currentRequest = ++requestId.current;
    if (authStatus !== "signed-in") {
      setProfile(null);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    try {
      const response = await fetch("/api/profile", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load profile.");
      const data = (await response.json()) as { profile?: UserProfile | null };
      if (requestId.current !== currentRequest) return;
      setProfile(data.profile ?? null);
      setStatus("idle");
    } catch {
      if (requestId.current === currentRequest) setStatus("error");
    }
  }, [authStatus]);

  useEffect(() => {
    void reloadProfile();
  }, [reloadProfile]);

  const saveProfile = useCallback(async (values: { displayName: string; avatarData: string | null }) => {
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = (await response.json()) as { profile?: UserProfile; error?: string };
    if (!response.ok || !data.profile) throw new Error(data.error ?? "Unable to save profile.");
    setProfile(data.profile);
    return data.profile;
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, status, saveProfile, reloadProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
