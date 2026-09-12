"use client";

import { useCallback, useEffect, useState } from "react";
import type { Article } from "@/lib/articles";
import { fetchArticles } from "@/lib/articles";
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
  const [articles, setArticles] = useState<Article[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "idle">("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setArticles(await fetchArticles());
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const [featured, ...rest] = articles;
  const secondary = rest.slice(0, 4);

  return (
    <>
      {/* Masthead */}
      <section className="relative overflow-hidden bg-paper-raised/60 py-10">
        <div className="hero-glow" style={{ top: -128, left: -128, width: 384, height: 384, background: "rgba(232,163,61,0.10)" }} />
        <div className="hero-glow" style={{ top: 48, right: 0, width: 480, height: 480, background: "rgba(255,184,115,0.18)" }} />
        <div className="container-page relative z-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Dispatch · Volume IX · Autumn Equinox
            </span>
            <h1 className="font-display text-display mt-1 max-w-3xl">
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
          <div className="panel-raised max-w-xs self-end">
            <div className="flex items-center justify-between font-mono text-[12px] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="status-pip" /> Swarm Storage
              </span>
              <span className="font-semibold text-amber">99.98% Synced</span>
            </div>
            <p className="text-body-sm my-3 text-muted">
              Every manuscript is hashed to the immutable hive and resolved via
              decentralized naming.
            </p>
            <div className="flex items-center justify-between font-mono text-[12px] text-amber">
              <span>Explore Architecture</span>
              <Icon name="arrow_forward" size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* Feed grid */}
      <section className="container-page py-10">
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            {status === "loading" && <p className="empty">Harvesting the hive…</p>}
            {status === "error" && (
              <div className="empty">
                Could not load articles.{" "}
                <Button size="sm" variant="outline" onClick={load}>
                  Retry
                </Button>
              </div>
            )}
            {status === "idle" && articles.length === 0 && (
              <div className="empty">
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
          <aside className="flex flex-col gap-6">
            <div className="card">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display text-title-lg flex items-center gap-1.5">
                  <Icon name="hive" size={20} fill /> Curator&apos;s Hive
                </h3>
                <span className="font-mono text-[12px] text-muted">This week</span>
              </div>
              <div className="flex flex-col">
                {articles.slice(0, 3).map((a, i) => (
                  <a
                    key={a.key}
                    href={`/api/articles/${a.swarmRef}`}
                    className="py-3 no-underline"
                    style={{ borderTop: i === 0 ? "none" : "1px solid var(--color-line)" }}
                  >
                    <div className="font-mono text-[11px] text-muted">
                      <span className="font-semibold text-amber">0{i + 1}</span> by @{a.creator}
                    </div>
                    <div className="font-display mt-1 text-[17px] font-semibold">{a.title}</div>
                  </a>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-title-lg flex items-center gap-1.5">
                  <Icon name="trending_up" size={20} /> Trending Hives
                </h3>
                <a href="/explore" className="font-mono text-[12px] text-amber no-underline">
                  View all
                </a>
              </div>
              <div className="flex flex-col gap-4">
                {TRENDING.map((t) => (
                  <div key={t.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar size={38} name={t.name} />
                      <div>
                        <div className="font-mono text-[12px] font-semibold">{t.name}</div>
                        <div className="text-body-sm text-muted">{t.subs}</div>
                      </div>
                    </div>
                    <button className="pill">Follow</button>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="card"
              style={{
                background: "linear-gradient(135deg, #ffddb5 0%, #ffb873 100%)",
                borderColor: "var(--color-amber)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-card/80">
                  <Icon name="workspace_premium" size={24} />
                </span>
                <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.15em]">
                  Patron Privilege
                </span>
              </div>
              <h4 className="font-display text-title-lg my-3">Gilded ACT Token Gate</h4>
              <p className="text-body-sm text-[#5f3c00]">
                Unlock the entire archive of private harvests. Content keys are
                decrypted straight from Swarm storage via your on-chain patron badge.
              </p>
              <div className="mt-4">
                <Button block variant="dark" icon="arrow_outward">
                  Claim Patron Pass
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
