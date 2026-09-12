"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FIXED_TAGS } from "@/lib/tags";
import { useArticles } from "./ArticlesProvider";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import Icon from "./ui/Icon";

export default function ArticleForm() {
  const router = useRouter();
  const { reload } = useArticles();
  const [creator, setCreator] = useState("pippo.nectar.eth");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creator, title, excerpt, content, tags, premium }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Publish failed");
      toast.success("Published", { description: "Article is live." });
      try {
        await reload();
      } catch {
        // The publication succeeded; a later context refresh can recover the list.
      }
      router.push(`/article/${data.swarmRef}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Publish failed";
      setError(message);
      toast.error("Publish failed", { description: message });
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
          disabled={loading}
          required
        />
        {/* Excerpt */}
        <textarea
          className="font-display text-headline-sm w-full resize-none bg-transparent italic text-muted outline-none placeholder:text-[#c9bb9f]"
          rows={1}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="A short excerpt or summary for the feed and reader previews..."
          disabled={loading}
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
                  disabled={loading}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 text-[14px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${active ? "bg-wood text-cream" : "bg-paper-raised text-muted hover:bg-[#ece3d0] hover:text-ink"}`}
                >
                  #{t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <textarea
          className="text-body-lg w-full resize-none bg-transparent leading-relaxed text-ink outline-none"
          rows={12}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="The full article body, stored on Swarm..."
          disabled={loading}
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
            <label className={`relative inline-flex items-center ${loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
              <input
                className="peer sr-only"
                type="checkbox"
                checked={premium}
                onChange={(e) => setPremium(e.target.checked)}
                disabled={loading}
              />
              <span className="relative h-8 w-14 rounded-full bg-line-strong transition-colors after:absolute after:left-1 after:top-1 after:h-6 after:w-6 after:rounded-full after:bg-paper-card after:transition-transform peer-checked:bg-honey peer-checked:after:translate-x-6" />
            </label>
          </div>
        </section>
      </form>

      {error && <div className="mt-4 rounded-md border border-rust bg-paper-raised p-4 text-[14px] text-rust [overflow-wrap:anywhere]">{error}</div>}

    </div>
  );
}
