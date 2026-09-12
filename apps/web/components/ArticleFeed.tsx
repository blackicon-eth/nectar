"use client";

import { useCallback, useEffect, useState } from "react";

export interface FeedArticle {
  key: string;
  title: string;
  excerpt: string;
  tags: string[];
  creator: string;
  creatorEnsName?: string;
  contributor?: string;
  premium: boolean;
  actProtected: boolean;
  status: string;
  publishedAt: string;
  swarmRef: string;
  historyRef?: string;
  publisherPublicKey?: string;
}

function short(value: string, n = 14): string {
  if (!value) return "";
  return value.length <= n * 2 + 1
    ? value
    : `${value.slice(0, n)}…${value.slice(-n)}`;
}

export default function ArticleFeed() {
  const [articles, setArticles] = useState<FeedArticle[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const response = await fetch("/api/articles");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setArticles(data.articles as FeedArticle[]);
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="section-title">
        Articles on Arkiv{" "}
        <button
          type="button"
          onClick={load}
          className="ghost"
          style={{ marginLeft: 12 }}
        >
          Refresh
        </button>
      </div>

      {status === "loading" && <p className="empty">Loading…</p>}
      {status === "error" && (
        <p className="empty">
          Could not load articles: {error}. The Arkiv public read path may be
          rate-limited.
        </p>
      )}

      {status === "idle" && articles.length === 0 && (
        <p className="empty">No articles yet. Publish one from the home page.</p>
      )}

      <ul className="feed">
        {articles.map((article) => (
          <li key={article.key} className="feed-card">
            <div className="feed-head">
              <strong>{article.title}</strong>
              <span className="badges">
                <span
                  className={`badge ${article.premium ? "premium" : "public"}`}
                >
                  {article.premium ? "premium" : "public"}
                </span>
                {article.actProtected && (
                  <span className="badge act">ACT</span>
                )}
              </span>
            </div>

            {article.excerpt && <p className="excerpt">{article.excerpt}</p>}

            <div className="meta">
              <span>
                by <strong>{article.creator}</strong>
                {article.creatorEnsName ? ` (${article.creatorEnsName})` : ""}
              </span>
              <span>
                {article.publishedAt
                  ? new Date(article.publishedAt).toLocaleString()
                  : ""}
              </span>
            </div>

            {article.tags.length > 0 && (
              <div className="tags">
                {article.tags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="refs">
              <div>
                <span className="label">swarm</span>{" "}
                <span className="mono">{short(article.swarmRef)}</span>
              </div>
              {article.historyRef && (
                <div>
                  <span className="label">history</span>{" "}
                  <span className="mono">{short(article.historyRef)}</span>
                </div>
              )}
              {article.publisherPublicKey && (
                <div>
                  <span className="label">publisher</span>{" "}
                  <span className="mono">
                    {short(article.publisherPublicKey, 10)}
                  </span>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
