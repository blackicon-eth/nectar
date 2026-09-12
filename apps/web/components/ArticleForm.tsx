"use client";

import { useState } from "react";
import { short } from "@/lib/articles";
import { FIXED_TAGS } from "@/lib/tags";
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
  const [tags, setTags] = useState<string[]>([]);
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="relative mx-auto w-full max-w-[1050px] px-8 py-6 pb-10 md:pl-16 md:pr-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-8 top-10 hidden w-4 md:block"
      >
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-honey shadow-[0_0_0_4px_rgba(232,163,61,0.14)]" />
        <span className="absolute bottom-3 left-1/2 top-5 w-px -translate-x-1/2 bg-gradient-to-b from-honey/70 via-line to-honey/20" />
        <span className="absolute bottom-0 left-0 h-px w-4 bg-honey/50" />
        <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border border-honey bg-paper" />
      </div>
      {/* Action bar */}
      <header className="flex items-center justify-between gap-4 py-4">
        <div className="inline-flex items-center gap-3 rounded-full bg-paper-raised px-4 py-2.5 shadow-card">
          <Avatar size={28} name={creator} />
          <span className="text-body-sm text-muted">Writing as</span>
          <span className="font-mono text-[13px] font-semibold">@{creator}</span>
        </div>
        <Button
          type="submit"
          form="write-form"
          icon="cloud_upload"
          disabled={loading}
          className="h-[48px]"
        >
          {loading ? "Broadcasting…" : "Publish Article"}
        </Button>
      </header>

      <form
        id="write-form"
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-2"
      >
        {/* Title */}
        <textarea
          className="font-display text-headline-lg w-full resize-none bg-transparent text-ink outline-none placeholder:text-[#b7a98f] max-md:text-[32px] max-md:leading-[1.2]"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title of your article..."
          required
        />
        {/* Excerpt */}
        <textarea
          className="font-display text-headline-sm w-full resize-none bg-transparent italic text-muted outline-none placeholder:text-[#c9bb9f]"
          rows={1}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="A short excerpt or summary for the feed and reader previews..."
        />

        {/* Tags */}
        <div>
          <span className="text-label-md text-muted">Tags</span>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {FIXED_TAGS.map((t) => {
              const active = tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setTags((prev) =>
                      active ? prev.filter((x) => x !== t) : [...prev, t],
                    )
                  }
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 text-[14px] font-medium transition ${active ? "bg-wood text-cream" : "bg-paper-raised text-muted hover:bg-[#ece3d0] hover:text-ink"}`}
                >
                  #{t}
                </button>
              );
            })}
          </div>
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
        <section className="rounded-lg border border-line bg-paper-raised p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber/20 text-amber">
                <Icon name="lock" size={22} fill />
              </span>
              <div>
                <h3 className="font-display text-title-lg flex items-center gap-2">
                  Access Control &amp; Monetization
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-soft px-2.5 py-0.5 font-mono text-[13px] font-semibold text-amber">ACT Protocol</span>
                </h3>
                <p className="text-body-sm mt-2 max-w-lg text-muted">
                  Premium content is encrypted on Swarm and gated via ACT (Access
                  Control Token). Only active subscribers with a valid subscription can read the article.
                </p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                className="peer sr-only"
                type="checkbox"
                checked={premium}
                onChange={(e) => setPremium(e.target.checked)}
              />
              <span className="relative h-8 w-14 rounded-full bg-line-strong transition-colors after:absolute after:left-1 after:top-1 after:h-6 after:w-6 after:rounded-full after:bg-paper-card after:transition-transform peer-checked:bg-honey peer-checked:after:translate-x-6" />
            </label>
          </div>
        </section>
      </form>

      {error && <div className="mt-4 rounded-md border border-rust bg-paper-raised p-4 text-[14px] text-rust [overflow-wrap:anywhere]">{error}</div>}

      {result && (
        <section className="mt-6 rounded-lg border border-line bg-paper-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-amber">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-sage" />
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
            <div className="flex items-center justify-between gap-4 border-b border-line px-0 py-2.5 font-mono text-[13px]"><span className="text-muted">Swarm Reference</span><span className="break-all text-right font-semibold text-ink">{short(result.swarmRef, 10)}</span></div>
            {result.historyReference && <div className="flex items-center justify-between gap-4 border-b border-line px-0 py-2.5 font-mono text-[13px]"><span className="text-muted">History Ref</span><span className="break-all text-right font-semibold text-ink">{short(result.historyReference, 10)}</span></div>}
            {result.publisherPublicKey && <div className="flex items-center justify-between gap-4 border-b border-line px-0 py-2.5 font-mono text-[13px]"><span className="text-muted">Publisher Key</span><span className="break-all text-right font-semibold text-ink">{short(result.publisherPublicKey, 10)}</span></div>}
            <div className="flex items-center justify-between gap-4 border-b border-line px-0 py-2.5 font-mono text-[13px]"><span className="text-muted">Arkiv Entity</span><span className="break-all text-right font-semibold text-ink">{short(result.arkivEntityKey, 10)}</span></div>
            <div className="flex items-center justify-between gap-4 px-0 py-2.5 font-mono text-[13px]"><span className="text-muted">Arkiv Tx</span><span className="break-all text-right font-semibold text-ink">{short(result.arkivTxHash, 8)}</span></div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" icon="link">Copy Gateway Link</Button>
            <a className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-honey px-5 py-2.5 text-[14px] font-semibold tracking-wide text-ink shadow-card transition active:scale-[0.98] hover:bg-honey-deep" href={`/api/articles/${result.swarmRef}?premium=${result.premium}`}>
              View Published Article <Icon name="arrow_forward" size={16} />
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
