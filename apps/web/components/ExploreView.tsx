"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useArticles } from "@/components/ArticlesProvider";
import { FIXED_TAGS } from "@/lib/tags";
import ArticleCard from "./ArticleCard";
import Button from "./ui/Button";
import Icon from "./ui/Icon";
import SectionHeading from "./SectionHeading";

type Segment = "all" | "public" | "premium";

export default function ExploreView() {
  const { articles, status, reload } = useArticles();
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<Segment>("all");
  const [tag, setTag] = useState("All Tags");

  const filtered = articles.filter((a) => {
    if (segment === "public" && a.premium) return false;
    if (segment === "premium" && !a.premium) return false;
    if (tag !== "All Tags") {
      if (!a.tags.some((articleTag) => articleTag.toLowerCase() === tag.toLowerCase())) {
        return false;
      }
    }
    if (query) {
      const hay = `${a.title} ${a.excerpt} ${a.creator} ${a.tags.join(" ")}`.toLowerCase();
      if (!hay.includes(query.toLowerCase())) return false;
    }
    return true;
  });

  const counts = {
    all: articles.length,
    public: articles.filter((a) => !a.premium).length,
    premium: articles.filter((a) => a.premium).length,
  };

  return (
    <>
      {/* Masthead band */}
      <section className="relative overflow-hidden bg-paper-raised/60 py-10">
        <div className="pointer-events-none absolute rounded-full blur-[64px]" style={{ top: -96, right: -80, width: 384, height: 384, background: "rgba(255,221,181,0.25)" }} />
        <div className="pointer-events-none absolute rounded-full blur-[64px]" style={{ bottom: -80, left: 40, width: 320, height: 320, background: "rgba(172,210,138,0.2)" }} />
        <div className="relative z-10 mx-auto flex w-full max-w-[1800px] flex-col gap-6 px-8 md:px-8">
          <div>
            <h1 className="font-display text-headline-lg max-md:text-[32px] max-md:leading-[1.2]">A Public Index for Independent Writing</h1>
            <p className="text-body-md mt-2 max-w-2xl text-muted">
              Discover essays and dispatches published directly by their authors,
              with provenance that stays attached from publication to reader.
            </p>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 rounded-lg border border-line bg-paper-card px-4 py-2.5 shadow-card">
            <Icon name="search" size={24} />
            <input
              className="text-body-lg w-full bg-transparent text-ink outline-none placeholder:text-[#b7a98f]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search creators, publications, essays, or Swarm topics..."
            />
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-paper-raised px-2.5 py-0.5 font-mono text-[13px] text-muted">⌘K</span>
          </div>

          {/* Segment + tags */}
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <div className="inline-flex gap-1 rounded-full bg-paper-raised p-1">
              {(["all", "public", "premium"] as Segment[]).map((s) => (
                <button
                  key={s}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 text-[14px] font-medium transition ${segment === s ? "bg-wood text-cream" : "bg-paper-raised text-muted hover:bg-[#ece3d0] hover:text-ink"}`}
                  onClick={() => setSegment(s)}
                >
                  {s === "all" ? "All Articles" : s === "public" ? "Public Readings" : "Premium Articles"}
                  <span className="font-mono text-[13px] opacity-70">({counts[s]})</span>
                </button>
              ))}
            </div>
            <div className="flex max-w-full flex-wrap justify-end gap-2">
              {(["All Tags", ...FIXED_TAGS] as const).map((t) => (
              <button
                key={t}
                className={`inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-[14px] font-medium transition ${tag === t ? "bg-wood text-cream" : "bg-paper-raised text-muted hover:bg-[#ece3d0] hover:text-ink"}`}
                onClick={() => setTag(t)}
              >
                {t === "All Tags" ? t : `#${t}`}
              </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Article grid */}
      <section className="mx-auto w-full max-w-[1800px] px-8 py-10 md:px-8">
        <SectionHeading title="Published Articles" />
        {status === "loading" && <p className="rounded-md border border-dashed border-line p-6 text-center text-[15px] text-muted">Loading articles…</p>}
        {status === "error" && (
          <div className="rounded-md border border-dashed border-line p-6 text-center text-[15px] text-muted">
            Could not load articles.{" "}
            <Button size="sm" variant="outline" onClick={reload}>
              Retry
            </Button>
          </div>
        )}
        {status === "idle" && filtered.length === 0 && (
          <div className="rounded-md border border-dashed border-line p-6 text-center text-[15px] text-muted">
            No articles match. <a href="/write" className="text-amber">Publish one →</a>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false} mode="popLayout">
            {filtered.map((a) => (
              <motion.div
                key={a.key}
                className="h-[320px]"
                layout
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.97 }}
                transition={{
                  layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.2 },
                  default: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                }}
              >
                <ArticleCard article={a} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
