"use client";

import { useState } from "react";
import { useArticles } from "@/components/ArticlesProvider";
import { formatDate, readTime, short } from "@/lib/articles";
import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import Icon from "./ui/Icon";

type Tab = "overview" | "articles" | "reviews" | "contributors" | "settings";

const TABS: { id: Tab; label: string; count?: number }[] = [
  { id: "overview", label: "Overview" },
  { id: "articles", label: "My Articles" },
  { id: "reviews", label: "Review Submissions", count: 3 },
  { id: "contributors", label: "Contributors", count: 4 },
  { id: "settings", label: "Settings" },
];

const METRICS = [
  { label: "Patron Base", value: "1,428", delta: "+14%", note: "this harvest cycle", icon: "group", tint: "var(--color-amber-soft)" },
  { label: "Monthly Flow", value: "8.4 AVAX", note: "~$260 USD accrued via patronage", icon: "toll", tint: "#ffe6c2" },
];

export default function DashboardView() {
  const { articles } = useArticles();
  const [tab, setTab] = useState<Tab>("articles");

  const premiumCount = articles.filter((a) => a.premium).length;
  const publicCount = articles.length - premiumCount;

  return (
    <div className="container-page py-6 pb-10">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Curator Desk · Protocol Epoch 14
          </span>
          <h1 className="font-display text-headline-lg mt-1">
            Editorial Ledger<span className="text-honey">.</span>
          </h1>
          <p className="text-body-md mt-2 max-w-2xl text-muted">
            On-chain publication management, Swarm storage redundancy, and
            decentralized peer review for independent publishers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" icon="archive">
            Export Publications
          </Button>
          <a className="btn btn-primary" href="/write">
            <Icon name="add" size={18} /> New Parchment
          </a>
        </div>
      </div>

      {/* Summary bento */}
      <div className="mb-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar size={64} name="The Autumn Apiary" />
              <div>
                <h2 className="font-display text-title-lg flex items-center gap-2">
                  The Autumn Apiary
                  <Badge tier="status" icon="verified">Autonomous Pub</Badge>
                </h2>
                <div className="font-mono text-[13px] text-muted">
                  curated by <span className="text-amber">@pippo.nectar.eth</span>
                  <span className="mx-1.5">·</span> Subnet: Casentino-09
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[13px] text-muted">ARKIV ROOT GRAPH</div>
              <span className="chip mt-1">arkiv://0x9b4a…c82f</span>
            </div>
          </div>
          <p className="text-body-md mt-6 max-w-xl italic text-muted">
            “An archival catalog dedicated to seasonal apiology, traditional straw
            skeps, and the wild nectar flows of Tuscany.”
          </p>
        </div>
        <div className="card">
          <div className="font-mono text-[13px] uppercase tracking-[0.08em] text-muted">
            Harvest Yield (7 Days)
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-display text-headline-md">2.41 AVAX</span>
            <span className="text-body-sm text-sage">
              <Icon name="trending_up" size={14} /> +18.2%
            </span>
          </div>
          <svg viewBox="0 0 200 60" className="mt-2 h-14 w-full text-honey" fill="none" preserveAspectRatio="none">
            <path d="M0,48 Q30,42 50,30 T100,38 T150,14 T200,8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M0,48 Q30,42 50,30 T100,38 T150,14 T200,8 L200,60 L0,60 Z" fill="url(#honeyFade)" opacity="0.25" />
            <defs>
              <linearGradient id="honeyFade" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#E8A33D" />
                <stop offset="100%" stopColor="#FAF5EC" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex justify-between font-mono text-[13px] text-muted">
            <span>Staking Pool: Skep-Vault</span>
            <span className="text-ink">99.8% Uptime</span>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m) => (
          <div key={m.label} className="card">
            <div className="mb-2 flex justify-between">
              <span className="text-label-md text-muted">{m.label}</span>
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: m.tint }}
              >
                <Icon name={m.icon} size={18} />
              </span>
            </div>
            <div className="font-display text-headline-lg">{m.value}</div>
            <div className="text-body-sm mt-1 text-muted">
              {m.delta && (
                <span className="text-sage">
                  <Icon name="arrow_upward" size={14} /> {m.delta}{" "}
                </span>
              )}
              {m.note}
            </div>
          </div>
        ))}
        <div className="card">
          <div className="mb-2 flex justify-between">
            <span className="text-label-md text-muted">Published Works</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-raised">
              <Icon name="auto_stories" size={18} />
            </span>
          </div>
          <div className="font-display text-headline-lg">{articles.length}</div>
          <div className="text-body-sm mt-1 flex gap-1.5 text-muted">
            <span className="chip" style={{ background: "rgba(232,163,61,0.2)", color: "var(--color-amber)" }}>
              {premiumCount} Gated
            </span>
            <span className="chip">{publicCount} Public</span>
          </div>
        </div>
        <div className="card">
          <div className="mb-2 flex justify-between">
            <span className="text-label-md text-muted">Swarm Node Health</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-soft">
              <Icon name="hub" size={18} />
            </span>
          </div>
          <div className="font-display text-headline-lg flex items-baseline gap-2">
            100% <span className="font-mono text-[13px] text-sage">Pinned</span>
          </div>
          <div className="text-body-sm mt-1 flex items-center gap-1.5 text-muted">
            <span className="status-pip" /> ACT Postage Batches Valid
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-md bg-paper-raised p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`pill rounded-md${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.count !== undefined && <span className="chip">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "articles" && (
        <div className="card overflow-hidden p-0">
          <table className="ledger w-full">
            <thead>
              <tr>
                <th>Manuscript Title</th>
                <th>Access Tier</th>
                <th>Protocol Status</th>
                <th className="text-right">Reads</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty border-0">
                    No manuscripts yet.{" "}
                    <a href="/write" className="text-amber">Write one →</a>
                  </td>
                </tr>
              )}
              {articles.map((a) => (
                <tr key={a.key}>
                  <td>
                    <div className="font-display text-[18px] font-semibold">{a.title}</div>
                    <div className="font-mono text-[13px] text-muted">
                      bzz://{short(a.swarmRef, 4)} · {readTime(a)}
                    </div>
                  </td>
                  <td>
                    <Badge tier={a.premium ? "premium" : "public"} icon={a.premium ? "lock" : "public"}>
                      {a.premium ? "Premium" : "Public"}
                    </Badge>
                  </td>
                  <td>
                    <Badge tier="status" status="published" icon="check_circle">
                      Published
                    </Badge>
                  </td>
                  <td className="font-mono text-right">—</td>
                  <td className="text-body-sm text-muted">{formatDate(a.publishedAt)}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button className="btn btn-ghost btn-sm">Edit</button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => navigator.clipboard?.writeText(a.swarmRef)}
                      >
                        <Icon name="query_stats" size={14} /> Analytics
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="panel-raised flex flex-wrap items-center justify-between gap-2 rounded-none">
            <span className="font-mono text-[13px] text-muted">
              Showing {articles.length} of {articles.length} manuscripts
            </span>
            <div className="flex gap-2">
              <button className="btn btn-outline btn-sm" disabled>Previous</button>
              <button className="btn btn-outline btn-sm">Next</button>
            </div>
          </div>
        </div>
      )}

      {tab === "overview" && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="card">
            <span className="eyebrow">Storage Postage Batch</span>
            <div className="font-display text-headline-sm my-3">Batch ID: #88219-F</div>
            <p className="text-body-sm text-muted">
              Batch depth: 22. Estimated pin longevity: 142 days until next top-up
              via Avalanche contract.
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper-raised">
              <div className="h-full w-[78%] bg-honey" />
            </div>
          </div>
          <div className="card">
            <span className="eyebrow" style={{ color: "var(--color-sage)" }}>
              ENS Reverse Resolution
            </span>
            <div className="font-display text-headline-sm my-3">theautumnapiary.eth</div>
            <p className="text-body-sm text-muted">
              Direct contenthash mapped to latest Swarm manifest. Resolves across
              all Web3 gateways.
            </p>
            <span className="chip mt-3" style={{ background: "var(--color-sage-soft)", color: "#3f5a26" }}>
              Valid · DNS synced
            </span>
          </div>
          <div className="card">
            <span className="eyebrow">Patron Split Ratio</span>
            <div className="font-display text-headline-sm my-3">85% / 15%</div>
            <p className="text-body-sm text-muted">
              85% to core publication vault, 15% earmarked for guest
              peer-reviewers and translators.
            </p>
            <span className="chip mt-3">Multisig: 0x228…9a41</span>
          </div>
        </div>
      )}

      {tab === "reviews" && (
        <div className="card">
          <h3 className="font-display text-title-lg mt-0">Community Submissions (3)</h3>
          <p className="text-body-sm text-muted">
            Manuscripts submitted by verified guild authors awaiting editorial seal.
          </p>
        </div>
      )}

      {tab === "contributors" && (
        <div className="card">
          <h3 className="font-display text-title-lg mt-0">Publication Contributors (4)</h3>
          <p className="text-body-sm text-muted">
            Authors and peer curators with co-signing privileges via multisig.
          </p>
        </div>
      )}

      {tab === "settings" && (
        <div className="card max-w-2xl">
          <h3 className="font-display text-title-lg mt-0">
            Decentralized Publication Settings
          </h3>
          <p className="text-body-sm text-muted">
            Configure your sovereign distribution parameters, auto-archive
            frequencies, and gated subscription fees.
          </p>
          <div className="field mt-4">
            <label>Publication Subdomain &amp; ENS Alias</label>
            <input defaultValue="theautumnapiary.nectar.eth" />
          </div>
          <div className="field">
            <label>Default Patron Pass Cost (Monthly)</label>
            <input defaultValue="0.25" className="max-w-[140px]" />
          </div>
          <Button>Save Protocol Parameters</Button>
        </div>
      )}
    </div>
  );
}
