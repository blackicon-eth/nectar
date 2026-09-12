"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Article } from "@/lib/articles";
import { fetchArticles } from "@/lib/articles";

type ArticlesState = {
  articles: Article[];
  status: "loading" | "error" | "idle";
  reload: () => Promise<void>;
};

const ArticlesContext = createContext<ArticlesState | undefined>(undefined);

export function useArticles() {
  const ctx = useContext(ArticlesContext);
  if (!ctx) {
    throw new Error("useArticles must be used within an ArticlesProvider");
  }
  return ctx;
}

export default function ArticlesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "idle">("loading");

  const reload = useCallback(async () => {
    setStatus("loading");
    try {
      setArticles(await fetchArticles());
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <ArticlesContext.Provider value={{ articles, status, reload }}>
      {children}
    </ArticlesContext.Provider>
  );
}
