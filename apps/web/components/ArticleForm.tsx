"use client";

import { useState } from "react";
import { short } from "@/lib/articles";
import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import Icon from "./ui/Icon";

interface PublishResult {
  title: string;
  premium: boolean;
  actProtected: boolean;
  swarmRef: string;
  historyReference?: string;
  publisherPublicKey?: string;
  arkivEntityKey: string;
  arkivTxHash: string;
  publishedAt: string;
}

export default function ArticleForm() {
  const [creator, setCreator] = useState("pippo.nectar.eth");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function addTag() {
    const t = tagInput.trim().replace(/^#/, "");
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creator, title, excerpt, content, tags, premium }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Publish failed");
      setResult(data as PublishResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page max-w-[760px] py-6 pb-10">
      {/* Action bar */}
      <header className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <a href="/" className="pill" aria-label="Back">
            <Icon name="arrow_back" size={18} />
          </a>
          <span className="flex items-center gap-2 font-mono text-[12px] text-muted">
            <span className="status-pip animate-pulse" />
            Saved to local cache · just now
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost">Save draft</Button>
          <Button type="submit" form="write-form" icon="cloud_upload" disabled={loading}>
            {loading ? "Broadcasting…" : "Publish Article"}
          </Button>
        </div>
      </header>

      {/* Identity pill */}
      <div className="inline-flex items-center gap-3 rounded-full bg-paper-raised px-4 py-2.5 shadow-card">
        <Avatar size={28} name={creator} />
        <span className="text-body-sm text-muted">Writing as</span>
        <span className="font-mono text-[12px] font-semibold">@{creator}</span>
        <span className="badge status" style={{ background: "var(--color-sage-soft)", color: "#3f5a26" }}>
          <Icon name="check" size={12} /> Swarm Ready
        </span>
      </div>

      <form
        id="write-form"
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-4"
      >
        {/* Title */}
        <textarea
          className="font-display text-headline-lg w-full resize-none bg-transparent text-ink outline-none placeholder:text-[#b7a98f]"
          rows={2}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title of your harvest..."
          required
        />
        {/* Excerpt */}
        <textarea
          className="font-display text-headline-sm w-full resize-none bg-transparent italic text-muted outline-none placeholder:text-[#c9bb9f]"
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="A short excerpt or summary for the feed and reader previews..."
        />

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((t) => (
            <span key={t} className="chip">
              #{t}
              <button
                type="button"
                className="flex border-0 bg-transparent p-0 text-inherit"
                onClick={() => setTags(tags.filter((x) => x !== t))}
              >
                <Icon name="close" size={13} />
              </button>
            </span>
          ))}
          <input
            className="w-32 rounded-full bg-paper-raised px-3 py-1 font-mono text-[12px] text-ink outline-none"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="+ add tag…"
          />
        </div>

        {/* Content */}
        <textarea
          className="text-body-lg w-full resize-y bg-transparent leading-relaxed text-ink outline-none"
          rows={12}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="The full article body, stored on Swarm..."
          required
        />

        {/* Access control */}
        <section className="panel-raised">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber/20 text-amber">
                <Icon name="lock" size={22} fill />
              </span>
              <div>
                <h3 className="font-display text-title-lg flex items-center gap-2">
                  Access Control &amp; Monetization
                  <span className="badge act">ACT Protocol</span>
                </h3>
                <p className="text-body-sm mt-2 max-w-lg text-muted">
                  Premium content is encrypted on Swarm and gated via ACT (Access
                  Control Token). Only active subscribers with a valid token can decrypt.
                </p>
              </div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={premium}
                onChange={(e) => setPremium(e.target.checked)}
              />
              <span className="track" />
            </label>
          </div>
          {premium && (
            <div className="panel-raised mt-4 bg-paper-low/80">
              <div className="flex items-center gap-3">
                <Icon name="loyalty" size={20} />
                <div>
                  <span className="text-label-md">Subscription Tier Included</span>
                  <div className="text-body-sm text-muted">
                    Included in your monthly subscription.
                  </div>
                </div>
                <span className="chip ml-auto">Tier: Patron Alpha</span>
              </div>
            </div>
          )}
        </section>
      </form>

      {error && <div className="result error">{error}</div>}

      {result && (
        <section className="card mt-6">
          <div className="flex items-center justify-between">
            <span className="eyebrow">
              <span className="eyebrow-dot" style={{ background: "var(--color-sage)" }} />
              Publication Receipt · On-Chain Provenance
            </span>
            <Badge tier={result.premium ? "premium" : "public"} icon={result.premium ? "lock" : "lock_open_right"}>
              {result.premium ? "Premium Gated" : "Public"}
            </Badge>
          </div>
          <h4 className="font-display text-headline-sm my-4">{result.title}</h4>
          <p className="text-body-sm text-muted">
            Manifest finalized, decentralized pin established across storage nodes.
          </p>
          <div className="mt-4">
            <div className="kv"><span className="k">Swarm Reference</span><span className="v">{short(result.swarmRef, 10)}</span></div>
            {result.historyReference && <div className="kv"><span className="k">History Ref</span><span className="v">{short(result.historyReference, 10)}</span></div>}
            {result.publisherPublicKey && <div className="kv"><span className="k">Publisher Key</span><span className="v">{short(result.publisherPublicKey, 10)}</span></div>}
            <div className="kv"><span className="k">Arkiv Entity</span><span className="v">{short(result.arkivEntityKey, 10)}</span></div>
            <div className="kv"><span className="k">Arkiv Tx</span><span className="v">{short(result.arkivTxHash, 8)}</span></div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" icon="link">Copy Gateway Link</Button>
            <a className="btn btn-primary" href={`/api/articles/${result.swarmRef}?premium=${result.premium}`}>
              View Published Article <Icon name="arrow_forward" size={16} />
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
