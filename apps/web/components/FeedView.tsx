"use client";

import Link from "next/link";
import { useArticles } from "@/components/ArticlesProvider";
import { short } from "@/lib/articles";
import ArticleCard from "./ArticleCard";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import Icon from "./ui/Icon";
import Spinner from "./ui/Spinner";

export default function FeedView() {
  const { articles, status, reload } = useArticles();
  const [featured, ...rest] = articles;
  const hives = Array.from(
    articles.reduce((map, article) => {
      const key = article.creatorAddress.toLowerCase();
      const current = map.get(key);
      map.set(key, {
        name: article.profileName || article.creatorEnsName || short(article.creator, 6),
        avatar: article.profileAvatar,
        count: (current?.count ?? 0) + 1,
      });
      return map;
    }, new Map<string, { name: string; avatar?: string; count: number }>()),
  ).slice(0, 3);

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
              Free public readings preserved alongside gilded premium articles,
              immutably recorded.
            </p>
          </div>
        </div>
      </section>

      {/* Feed grid */}
      <section className="mx-auto w-full max-w-[1800px] px-8 py-10 md:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
          {featured && (
            <div className="col-span-full font-mono text-[14px] uppercase tracking-[0.12em] text-muted">
              Suggested articles
            </div>
          )}
          <div className="flex flex-col gap-6">
            {status === "loading" && (
              <div className="flex min-h-[220px] items-center justify-center rounded-md border border-dashed border-line bg-paper-card/50 p-6">
                <Spinner label="Loading articles" />
              </div>
            )}
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

            {featured && <ArticleCard article={featured} variant="featured" />}

            <div className="grid gap-6 md:grid-cols-2">
              {rest.map((a) => (
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
                    className="group py-3 no-underline"
                    style={{ borderTop: i === 0 ? "none" : "1px solid var(--color-line)" }}
                  >
                    <div className="flex items-center gap-2 font-mono text-[12px] text-muted">
                      <span className="font-semibold text-amber">0{i + 1}</span>
                      <Avatar size={18} name={a.profileName || a.creatorEnsName || a.creator} src={a.profileAvatar} />
                      <span className="truncate">{a.profileName || a.creatorEnsName || `${a.creator.slice(0, 10)}...${a.creator.slice(30)}`}</span>
                    </div>
                    <div className="font-display mt-1 text-[18px] font-semibold transition-colors group-hover:text-honey">{a.title}</div>
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-line bg-paper-card p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-title-lg flex items-center gap-1.5">
                  <Icon name="trending_up" size={20} /> Trending Creators
                </h3>
              </div>
              <div className="flex flex-col gap-4">
                {hives.map(([key, hive]) => (
                  <Link
                    key={key}
                    href={`/creator/${key}`}
                    className="group flex items-center gap-2.5 rounded-md py-1 no-underline transition-colors hover:bg-paper-raised"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar size={38} name={hive.name} src={hive.avatar} />
                      <div>
                        <div className="font-mono text-[13px] font-semibold transition-colors group-hover:text-honey">{hive.name}</div>
                        <div className="text-body-sm text-muted">{hive.count} {hive.count === 1 ? "article" : "articles"}</div>
                      </div>
                    </div>
                  </Link>
                ))}
                {hives.length === 0 && <div className="text-body-sm text-muted">Creator activity will appear here.</div>}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
