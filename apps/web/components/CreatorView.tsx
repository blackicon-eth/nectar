"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useArticles } from "@/components/ArticlesProvider";
import { short } from "@/lib/articles";
import { FIXED_TAGS } from "@/lib/tags";
import ArticleCard from "./ArticleCard";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import CreatorSubscribeButton from "./CreatorSubscribeButton";
import Icon from "./ui/Icon";
import Spinner from "./ui/Spinner";

export default function CreatorView({ identifier }: { identifier: string }) {
  const { articles, status } = useArticles();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [segment, setSegment] = useState<"all" | "public" | "premium">("all");
  const [tag, setTag] = useState("All Tags");
  const creatorArticles = useMemo(
    () => articles.filter((article) =>
      article.creatorAddress?.toLowerCase() === identifier.toLowerCase() ||
      article.creator?.toLowerCase() === identifier.toLowerCase(),
    ),
    [articles, identifier],
  );
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const filteredArticles = useMemo(
    () => creatorArticles.filter((article) => {
      if (segment === "public" && article.premium) return false;
      if (segment === "premium" && !article.premium) return false;
      if (tag !== "All Tags" && !article.tags.some((articleTag) => articleTag.toLowerCase() === tag.toLowerCase())) return false;
      if (debouncedQuery) {
        const haystack = `${article.title} ${article.subtitle} ${article.excerpt} ${article.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(debouncedQuery.toLowerCase())) return false;
      }
      return true;
    }),
    [creatorArticles, debouncedQuery, segment, tag],
  );
  const counts = {
    all: creatorArticles.length,
    public: creatorArticles.filter((article) => !article.premium).length,
    premium: creatorArticles.filter((article) => article.premium).length,
  };
  const profile = creatorArticles[0];
  const creatorName = profile?.profileName || profile?.creatorEnsName || profile?.creator || short(identifier, 8);

  if (status === "loading") {
    return <div className="mx-auto flex min-h-[420px] w-full max-w-[1800px] items-center justify-center px-8"><Spinner label="Loading creator" /></div>;
  }

  return (
    <div className="w-full pb-16">
      <header className="relative overflow-hidden border-b border-line bg-paper-raised/60 py-10">
        <div className="pointer-events-none absolute -left-24 -top-32 h-80 w-80 rounded-full bg-honey/10 blur-[70px]" />
        <div className="relative z-10 mx-auto -my-10 w-full max-w-[1800px] px-8 py-10">
          <div className="flex items-center gap-5 pr-64 max-md:pr-0">
            <Avatar size={84} name={creatorName} src={profile?.profileAvatar} />
            <div>
              <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-muted">Creator profile</div>
              <h1 className="font-display mt-2 text-headline-lg max-md:text-[32px] max-md:leading-[1.2]">{creatorName}</h1>
              <div className="mt-2 font-mono text-[12px] text-muted">{identifier.startsWith("0x") ? short(identifier, 10) : identifier}</div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-8 flex h-full flex-col items-end justify-between py-10 max-md:static max-md:mt-5 max-md:h-auto max-md:items-start max-md:gap-4 max-md:py-0">
            <CreatorSubscribeButton
              creatorAddress={profile?.creatorAddress || identifier}
              creatorName={creatorName}
            />
            <div className="flex items-center gap-5 font-mono text-[12px] text-muted">
              <span><strong className="text-ink">{creatorArticles.length}</strong> {creatorArticles.length === 1 ? "article" : "articles"}</span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                Verified signer
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1800px] px-8 pt-10">
        {status === "error" && (
          <section className="rounded-lg border border-dashed border-line bg-paper-raised/40 p-8 text-center">
            <Icon name="cloud_off" size={26} />
            <h2 className="font-display mt-4 text-headline-sm">This creator is temporarily unavailable.</h2>
            <p className="text-body-md mt-2 text-muted">The publication index could not be reached.</p>
          </section>
        )}
        {status === "idle" && creatorArticles.length === 0 && (
          <section className="rounded-lg border border-dashed border-line bg-paper-raised/40 p-8 text-center">
            <Icon name="auto_stories" size={26} />
            <h2 className="font-display mt-4 text-headline-sm">No articles found.</h2>
            <p className="text-body-md mt-2 text-muted">This creator has not published to Nectar yet.</p>
            <Button href="/explore" variant="outline" className="mt-5" icon="arrow_back">Back to explore</Button>
          </section>
        )}
        {creatorArticles.length > 0 && (
          <>
            <div className="flex items-end justify-between gap-5 border-b border-line pb-4">
              <div>
                <div className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">The archive</div>
                <h2 className="font-display mt-2 text-headline-md">Published articles</h2>
              </div>
              <span className="font-mono text-[12px] text-muted">{creatorArticles.length} recorded</span>
            </div>
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-lg border border-line bg-paper-card px-4 py-2.5 shadow-card">
                <Icon name="search" size={22} />
                <input
                  className="text-body-md w-full bg-transparent text-ink outline-none placeholder:text-[#b7a98f]"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search this creator’s articles..."
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex gap-1 rounded-full bg-paper-raised p-1">
                  {(["all", "public", "premium"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 text-[14px] font-medium transition ${segment === item ? "bg-wood text-cream" : "bg-paper-raised text-muted hover:bg-[#ece3d0] hover:text-ink"}`}
                      onClick={() => setSegment(item)}
                    >
                      {item === "all" ? "All Articles" : item === "public" ? "Public Readings" : "Premium Articles"}
                      <span className="font-mono text-[13px] opacity-70">({counts[item]})</span>
                    </button>
                  ))}
                </div>
                <div className="flex max-w-full flex-wrap justify-end gap-2">
                  {(["All Tags", ...FIXED_TAGS] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-[14px] font-medium transition ${tag === item ? "bg-wood text-cream" : "bg-paper-raised text-muted hover:bg-[#ece3d0] hover:text-ink"}`}
                      onClick={() => setTag(item)}
                    >
                      {item === "All Tags" ? item : `#${item}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {filteredArticles.length === 0 && (
              <div className="mt-6 rounded-md border border-dashed border-line p-6 text-center text-[15px] text-muted">
                No articles match these filters.
              </div>
            )}
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence initial={false} mode="popLayout">
                {filteredArticles.map((article, index) => (
                  <motion.div
                    key={article.key}
                    layout
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.97 }}
                    transition={{
                      layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                      opacity: { duration: 0.2 },
                      default: { delay: index * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                    }}
                    className="h-[300px]"
                  >
                      <ArticleCard article={article} showCreator={false} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
