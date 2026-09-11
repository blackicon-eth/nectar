"use client";

import { useState } from "react";

interface PublishResult {
  title: string;
  premium: boolean;
  swarmRef: string;
  arkivEntityKey: string;
  arkivTxHash: string;
  publishedAt: string;
}

export default function ArticleForm() {
  const [creator, setCreator] = useState("demo-creator");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creator,
          title,
          excerpt,
          content,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          premium,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Publish failed");
      }
      setResult(data as PublishResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="row">
        <div className="field">
          <label htmlFor="creator">Creator handle</label>
          <input
            id="creator"
            value={creator}
            onChange={(event) => setCreator(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="excerpt">Excerpt</label>
        <input
          id="excerpt"
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          placeholder="A short summary for the article index"
        />
      </div>

      <div className="field">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          rows={8}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="The full article body, stored on Swarm"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="tags">Tags (comma separated)</label>
        <input
          id="tags"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="web3, ens, swarm"
        />
      </div>

      <label className="check">
        <input
          type="checkbox"
          checked={premium}
          onChange={(event) => setPremium(event.target.checked)}
        />
        Premium (encrypted on Swarm via ACT)
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Publishing…" : "Publish article"}
      </button>

      {error && <div className="result error">{error}</div>}

      {result && (
        <div className="result">
          <div>
            <span className="label">Title:</span> {result.title}
          </div>
          <div>
            <span className="label">Premium:</span>{" "}
            {result.premium ? "yes" : "no"}
          </div>
          <div>
            <span className="label">Swarm ref:</span>{" "}
            <span className="mono">{result.swarmRef}</span>
          </div>
          <div>
            <span className="label">Arkiv entity:</span>{" "}
            <span className="mono">{result.arkivEntityKey}</span>
          </div>
          <div>
            <span className="label">Arkiv tx:</span>{" "}
            <span className="mono">{result.arkivTxHash}</span>
          </div>
        </div>
      )}
    </form>
  );
}
