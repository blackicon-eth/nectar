"use client";

import { useState } from "react";
import { useArticles } from "@/components/ArticlesProvider";
import ArticleCard from "./ArticleCard";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import Icon from "./ui/Icon";
import SectionHeading from "./SectionHeading";

const TOPICS = [
  "All Topics",
  "Apiculture & Bees",
  "Agronomy",
  "Typography & Print",
  "Slow Living",
  "Culinary History",
  "Philosophy",
  "Wilderness",
];

const STEWARDS = [
  { name: "The Autumn Apiary", handle: "pippo.nectar.eth", region: "TUSCANY", bio: "Beekeeper, essayist, and woodworker in Tuscany. Chronicling seasonal swarms and chestnut honey distillations.", articles: "18", subs: "1.4k", icon: "verified", price: "4 APE" },
  { name: "Geometric Botany", handle: "elena.nectar.eth", region: "VIENNA", bio: "Exploring natural math, Fibonacci spirals in sunflower seed matrices, and botanical press engravings.", articles: "42", subs: "2.9k", icon: "park", price: "5 APE" },
  { name: "Root & Timber", handle: "sylvan.nectar.eth", region: "MAINE", bio: "Traditional Japanese joinery, old-growth pine conservation, and reflections on handmade wooden implements.", articles: "27", subs: "910", icon: "carpenter", price: "3 APE" },
];

type Segment = "all" | "public" | "premium";

export default function ExploreView() {
  const { articles, status, reload } = useArticles();
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<Segment>("all");
  const [topic, setTopic] = useState("All Topics");

  const filtered = articles.filter((a) => {
    if (segment === "public" && a.premium) return false;
    if (segment === "premium" && !a.premium) return false;
    if (topic !== "All Topics") {
      const hay = `${a.title} ${a.excerpt} ${a.tags.join(" ")}`.toLowerCase();
      const needle = (topic.toLowerCase().split(" & ")[0] ?? topic).toLowerCase();
      if (!hay.includes(needle)) return false;
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
            <span className="inline-flex items-center gap-1 font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-amber">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" /> Arkiv Graph · Swarm Peer Directory
            </span>
            <h1 className="font-display text-headline-lg mt-1 max-md:text-[32px] max-md:leading-[1.2]">The Botanical Index &amp; Dispatches</h1>
            <p className="text-body-md mt-2 max-w-2xl text-muted">
              Delve into sovereign, cryptographically preserved writing. Curated
              field records, natural philosophies, and tactile memoirs collected
              across the decentralized canopy.
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

          {/* Segment + topics */}
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
            <span className="flex items-center gap-1.5 font-mono text-[13px] text-muted">
              <Icon name="hub" size={16} /> Swarm Node Sync: #77419
            </span>
          </div>

          <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {TOPICS.map((t) => (
              <button
                key={t}
                className={`inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-[14px] font-medium transition ${topic === t ? "bg-wood text-cream" : "bg-paper-raised text-muted hover:bg-[#ece3d0] hover:text-ink"}`}
                onClick={() => setTopic(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured stewards */}
      <section className="mx-auto w-full max-w-[1800px] px-8 pt-10 md:px-8">
        <SectionHeading
          title="Featured Hives & Stewards"
          eyebrow="// verified registries"
          action={
            <a href="#" className="text-label-md text-amber no-underline">
              Browse All Hives →
            </a>
          }
        />
        <div className="grid gap-6 md:grid-cols-3">
          {STEWARDS.map((s) => (
            <div key={s.handle} className="rounded-lg border border-line bg-paper-card p-6 shadow-card">
              <div className="mb-4 flex justify-between">
                <div className="relative">
                  <Avatar size={64} name={s.name} />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-honey text-ink">
                    <Icon name={s.icon} size={12} />
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-paper-raised px-2.5 py-0.5 font-mono text-[13px] text-muted">{s.region}</span>
              </div>
              <h3 className="font-display text-title-lg mb-1">{s.name}</h3>
              <span className="font-mono text-[13px] text-muted">{s.handle}</span>
              <p className="text-body-sm my-3 text-muted">{s.bio}</p>
              <div className="mb-4 flex items-center gap-5 rounded-lg border border-line bg-paper-raised px-4 py-2.5">
                <div>
                  <div className="font-display text-headline-sm font-semibold">{s.articles}</div>
                  <div className="font-mono text-[13px] text-muted">articles</div>
                </div>
                <div className="h-7 w-px bg-line" />
                <div>
                  <div className="font-display text-headline-sm font-semibold">{s.subs}</div>
                  <div className="font-mono text-[13px] text-muted">subscribers</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button block icon="workspace_premium">
                  Subscribe · {s.price}
                </Button>
                <button className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-paper-card px-5 py-2.5 text-[14px] font-semibold tracking-wide text-ink transition hover:bg-paper-raised active:scale-[0.98]" aria-label="Profile">
                  <Icon name="person" size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Article grid */}
      <section className="mx-auto w-full max-w-[1800px] px-8 py-10 md:px-8">
              <SectionHeading title="Recent Articles" eyebrow="// showing curated items" />
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
          {filtered.map((a) => (
            <ArticleCard key={a.key} article={a} />
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-paper-raised p-6">
          <span className="font-mono text-[13px] text-muted">
            Displaying {filtered.length} of {articles.length} · Arkiv Block #19,234,102
          </span>
          <Button variant="outline" icon="history_edu">
            Load More Articles
          </Button>
        </div>
      </section>
    </>
  );
}
