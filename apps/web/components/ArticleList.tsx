"use client";

import { useCallback, useEffect, useState } from "react";

interface Article {
  key: string;
  title: string;
  premium: boolean;
  creator: string;
}

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/articles");
      const data = await response.json();
      setArticles(data.articles as Article[]);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <div className="section-title">
        Published on Arkiv{" "}
        <button type="button" onClick={load} style={{ marginLeft: 8, padding: "6px 12px" }}>
          Refresh
        </button>
      </div>

      {status === "loading" && <p className="empty">Loading…</p>}
      {status === "error" && (
        <p className="empty">
          Could not load articles. The Arkiv read path needs no key, but the
          public RPC may be rate-limited.
        </p>
      )}

      {status === "idle" && articles.length === 0 && (
        <p className="empty">No articles yet. Publish one above.</p>
      )}

      <ul className="list">
        {articles.map((article) => (
          <li key={article.key}>
            <div>
              <strong>{article.title}</strong>
              <div className="mono" style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                {article.creator}
              </div>
            </div>
            <span className={`badge ${article.premium ? "premium" : "public"}`}>
              {article.premium ? "premium" : "public"}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
