"use client";

import { useArticles } from "@/components/ArticlesProvider";
import ArticleCard from "./ArticleCard";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import Icon from "./ui/Icon";
import TopicPill from "./ui/TopicPill";

const TOPICS = [
  { label: "Featured Harvests", icon: "auto_awesome", active: true },
  { label: "Top Naturalists", icon: "psychology" },
  { label: "Philosophy", icon: "menu_book" },
  { label: "Longform Essays", icon: "ink_pen" },
];

const TRENDING = [
  { name: "pippo.nectar.eth", subs: "1,420 subscribers" },
  { name: "elena.nectar.eth", subs: "2,890 subscribers" },
  { name: "sylvan.nectar.eth", subs: "912 subscribers" },
];

export default function FeedView() {
  const { articles, status, reload } = useArticles();

  const [featured, ...rest] = articles;
  const secondary = rest.slice(0, 4);

  return (
    <>
      {/* Masthead */}
      <section className="relative overflow-hidden bg-paper-raised/60 py-10">
        <div className="pointer-events-none absolute rounded-full blur-[64px]" style={{ top: -128, left: -128, width: 384, height: 384, background: "rgba(232,163,61,0.10)" }} />
        <div className="pointer-events-none absolute rounded-full blur-[64px]" style={{ top: 48, right: 0, width: 480, height: 480, background: "rgba(255,184,115,0.18)" }} />
        <div className="relative z-10 mx-auto flex w-full max-w-[1800px] flex-wrap items-end justify-between gap-6 px-8 md:px-8">
          <div className="max-w-3xl">
            <h1 className="font-display text-display mt-1 max-w-3xl max-md:text-[40px] max-md:leading-[1.15]">
              Words distilled from <em className="font-normal not-italic text-amber">patience</em> and craft.
            </h1>
            <p className="text-body-lg mt-2 max-w-2xl text-muted">
              A sanctuary for independent essayists, naturalists, and thinkers.
              Free public readings preserved alongside gilded premium harvests,
              immutably recorded.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <TopicPill key={t.label} label={t.label} icon={t.icon} active={t.active} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feed grid */}
      <section className="mx-auto w-full max-w-[1800px] px-8 py-10 md:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            {status === "loading" && <p className="rounded-md border border-dashed border-line p-6 text-center text-[15px] text-muted">Harvesting the hive…</p>}
            {status === "error" && (
              <div className="rounded-md border border-dashed border-line p-6 text-center text-[15px] text-muted">
                Could not load articles.{" "}
                <Button size="sm" variant="outline" onClick={reload}>
                  Retry
                </Button>
              </div>
            )}
            {status === "idle" && articles.length === 0 && (
              <div className="rounded-md border border-dashed border-line p-6 text-center text-[15px] text-muted">
                No articles yet.{" "}
                <a href="/write" className="text-amber">
                  Publish the first one →
                </a>
              </div>
            )}

            {featured && (
              <ArticleCard article={featured} variant="featured" />
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {secondary.map((a) => (
                <ArticleCard key={a.key} article={a} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6 pb-20">
            <div className="rounded-lg border border-line bg-paper-card p-6 shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display text-title-lg flex items-center gap-1.5">
                  <Icon name="hive" size={20} fill /> Curator&apos;s Hive
                </h3>
                <span className="font-mono text-[13px] text-muted">This week</span>
              </div>
              <div className="flex flex-col">
                {articles.slice(0, 3).map((a, i) => (
                  <a
                    key={a.key}
                    href={`/api/articles/${a.swarmRef}`}
                    className="py-3 no-underline"
                    style={{ borderTop: i === 0 ? "none" : "1px solid var(--color-line)" }}
                  >
                    <div className="font-mono text-[12px] text-muted">
                      <span className="font-semibold text-amber">0{i + 1}</span> by @{a.creator}
                    </div>
                    <div className="font-display mt-1 text-[18px] font-semibold">{a.title}</div>
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-line bg-paper-card p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-title-lg flex items-center gap-1.5">
                  <Icon name="trending_up" size={20} /> Trending Hives
                </h3>
                <a href="/explore" className="font-mono text-[13px] text-amber no-underline">
                  View all
                </a>
              </div>
              <div className="flex flex-col gap-4">
                {TRENDING.map((t) => (
                  <div key={t.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar size={38} name={t.name} />
                      <div>
                        <div className="font-mono text-[13px] font-semibold">{t.name}</div>
                        <div className="text-body-sm text-muted">{t.subs}</div>
                      </div>
                    </div>
                    <button className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-paper-raised px-4 py-1.5 text-[14px] font-medium text-muted transition hover:bg-[#ece3d0] hover:text-ink">Follow</button>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
