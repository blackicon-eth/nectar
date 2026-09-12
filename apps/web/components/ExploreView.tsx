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
        <div className="hero-glow" style={{ top: -96, right: -80, width: 384, height: 384, background: "rgba(255,221,181,0.25)" }} />
        <div className="hero-glow" style={{ bottom: -80, left: 40, width: 320, height: 320, background: "rgba(172,210,138,0.2)" }} />
        <div className="container-page relative z-10 flex flex-col gap-6">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-dot" /> Arkiv Graph · Swarm Peer Directory
            </span>
            <h1 className="font-display text-headline-lg mt-1">The Botanical Index &amp; Dispatches</h1>
            <p className="text-body-md mt-2 max-w-2xl text-muted">
              Delve into sovereign, cryptographically preserved writing. Curated
              field records, natural philosophies, and tactile memoirs harvested
              across the decentralized canopy.
            </p>
          </div>

          {/* Search */}
          <div className="card flex items-center gap-3 px-4 py-2.5">
            <Icon name="search" size={24} />
            <input
              className="text-body-lg w-full bg-transparent text-ink outline-none placeholder:text-[#b7a98f]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search creators, publications, essays, or Swarm topics..."
            />
            <span className="chip">⌘K</span>
          </div>

          {/* Segment + topics */}
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <div className="inline-flex gap-1 rounded-full bg-paper-raised p-1">
              {(["all", "public", "premium"] as Segment[]).map((s) => (
                <button
                  key={s}
                  className={`pill${segment === s ? " active" : ""}`}
                  onClick={() => setSegment(s)}
                >
                  {s === "all" ? "All Articles" : s === "public" ? "Public Readings" : "Premium Harvests"}
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
                className={`pill whitespace-nowrap${topic === t ? " active" : ""}`}
                onClick={() => setTopic(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured stewards */}
      <section className="container-page pt-10">
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
            <div key={s.handle} className="card">
              <div className="mb-4 flex justify-between">
                <div className="relative">
                  <Avatar size={64} name={s.name} />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-honey text-ink">
                    <Icon name={s.icon} size={12} />
                  </span>
                </div>
                <span className="chip">{s.region}</span>
              </div>
              <h3 className="font-display text-title-lg mb-1">{s.name}</h3>
              <span className="font-mono text-[13px] text-muted">{s.handle}</span>
              <p className="text-body-sm my-3 text-muted">{s.bio}</p>
              <div className="panel-raised mb-4 flex items-center gap-5 px-4 py-2.5">
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
                <button className="btn btn-outline" aria-label="Profile">
                  <Icon name="person" size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Article grid */}
      <section className="container-page py-10">
        <SectionHeading title="Recent Harvests" eyebrow="// showing curated items" />
        {status === "loading" && <p className="empty">Harvesting the hive…</p>}
        {status === "error" && (
          <div className="empty">
            Could not load articles.{" "}
            <Button size="sm" variant="outline" onClick={reload}>
              Retry
            </Button>
          </div>
        )}
        {status === "idle" && filtered.length === 0 && (
          <div className="empty">
            No articles match. <a href="/write" className="text-amber">Publish one →</a>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <ArticleCard key={a.key} article={a} />
          ))}
        </div>
        <div className="panel-raised mt-10 flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[13px] text-muted">
            Displaying {filtered.length} of {articles.length} · Arkiv Block #19,234,102
          </span>
          <Button variant="outline" icon="history_edu">
            Load More Harvests
          </Button>
        </div>
      </section>
    </>
  );
}
