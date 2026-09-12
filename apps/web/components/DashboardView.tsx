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
  { label: "Patron Base", value: "1,428", delta: "+14%", note: "this publishing cycle", icon: "group", tint: "var(--color-amber-soft)" },
  { label: "Monthly Flow", value: "8.4 AVAX", note: "~$260 USD accrued via patronage", icon: "toll", tint: "#ffe6c2" },
];

export default function DashboardView() {
  const { articles } = useArticles();
  const [tab, setTab] = useState<Tab>("articles");

  const premiumCount = articles.filter((a) => a.premium).length;
  const publicCount = articles.length - premiumCount;

  return (
    <div className="mx-auto w-full max-w-[1800px] px-8 py-6 pb-10 md:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-amber">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" /> Curator Desk · Protocol Epoch 14
          </span>
          <h1 className="font-display text-headline-lg mt-1 max-md:text-[32px] max-md:leading-[1.2]">
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
          <a className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-honey px-5 py-2.5 text-[14px] font-semibold tracking-wide text-ink shadow-card transition active:scale-[0.98] hover:bg-honey-deep" href="/write">
            <Icon name="add" size={18} /> New Parchment
          </a>
        </div>
      </div>

      {/* Summary bento */}
      <div className="mb-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-line bg-paper-card p-6 shadow-card">
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
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-sm bg-paper-raised px-2.5 py-0.5 font-mono text-[13px] text-muted">arkiv://0x9b4a…c82f</span>
            </div>
          </div>
          <p className="text-body-md mt-6 max-w-xl italic text-muted">
            “An archival catalog dedicated to seasonal apiology, traditional straw
            skeps, and the wild nectar flows of Tuscany.”
          </p>
        </div>
        <div className="rounded-lg border border-line bg-paper-card p-6 shadow-card">
          <div className="font-mono text-[13px] uppercase tracking-[0.08em] text-muted">
            Article Yield (7 Days)
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
          <div key={m.label} className="rounded-lg border border-line bg-paper-card p-6 shadow-card">
            <div className="mb-2 flex justify-between">
              <span className="text-label-md text-muted">{m.label}</span>
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: m.tint }}
              >
                <Icon name={m.icon} size={18} />
              </span>
            </div>
            <div className="font-display text-headline-lg max-md:text-[32px] max-md:leading-[1.2]">{m.value}</div>
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
        <div className="rounded-lg border border-line bg-paper-card p-6 shadow-card">
          <div className="mb-2 flex justify-between">
            <span className="text-label-md text-muted">Published Works</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-raised">
              <Icon name="auto_stories" size={18} />
            </span>
          </div>
          <div className="font-display text-headline-lg max-md:text-[32px] max-md:leading-[1.2]">{articles.length}</div>
          <div className="text-body-sm mt-1 flex gap-1.5 text-muted">
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-amber/20 px-2.5 py-0.5 font-mono text-[13px] text-amber">
              {premiumCount} Gated
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-paper-raised px-2.5 py-0.5 font-mono text-[13px] text-muted">{publicCount} Public</span>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-paper-card p-6 shadow-card">
          <div className="mb-2 flex justify-between">
            <span className="text-label-md text-muted">Swarm Node Health</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-soft">
              <Icon name="hub" size={18} />
            </span>
          </div>
          <div className="font-display text-headline-lg flex items-baseline gap-2 max-md:text-[32px] max-md:leading-[1.2]">
            100% <span className="font-mono text-[13px] text-sage">Pinned</span>
          </div>
          <div className="text-body-sm mt-1 flex items-center gap-1.5 text-muted">
            <span className="inline-block h-2 w-2 rounded-full bg-sage" /> ACT Postage Batches Valid
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-md bg-paper-raised p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-md px-4 py-1.5 text-[14px] font-medium transition ${tab === t.id ? "bg-wood text-cream" : "bg-paper-raised text-muted hover:bg-[#ece3d0] hover:text-ink"}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.count !== undefined && <span className="inline-flex items-center gap-1.5 rounded-sm bg-paper-raised px-2.5 py-0.5 font-mono text-[13px] text-muted">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "articles" && (
        <div className="overflow-hidden rounded-lg border border-line bg-paper-card shadow-card">
          <table className="w-full">
            <thead>
              <tr>
                <th className="bg-paper-raised px-4 py-3 text-left font-mono text-[13px] font-semibold text-muted">Manuscript Title</th>
                <th className="bg-paper-raised px-4 py-3 text-left font-mono text-[13px] font-semibold text-muted">Access Tier</th>
                <th className="bg-paper-raised px-4 py-3 text-left font-mono text-[13px] font-semibold text-muted">Protocol Status</th>
                <th className="bg-paper-raised px-4 py-3 text-right font-mono text-[13px] font-semibold text-muted">Reads</th>
                <th className="bg-paper-raised px-4 py-3 text-left font-mono text-[13px] font-semibold text-muted">Date</th>
                <th className="bg-paper-raised px-4 py-3 text-right font-mono text-[13px] font-semibold text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 && (
                <tr>
                  <td colSpan={6} className="rounded-md border-0 border-dashed border-line p-6 text-center text-[15px] text-muted">
                    No manuscripts yet.{" "}
                    <a href="/write" className="text-amber">Write one →</a>
                  </td>
                </tr>
              )}
              {articles.map((a) => (
                  <tr key={a.key} className="hover:bg-paper-raised/50">
                   <td className="border-t border-line px-4 py-3.5 align-middle">
                    <div className="font-display text-[18px] font-semibold">{a.title}</div>
                    <div className="font-mono text-[13px] text-muted">
                      bzz://{short(a.swarmRef, 4)} · {readTime(a)}
                    </div>
                  </td>
                   <td className="border-t border-line px-4 py-3.5 align-middle">
                    <Badge tier={a.premium ? "premium" : "public"} icon={a.premium ? "lock" : "public"}>
                      {a.premium ? "Premium" : "Public"}
                    </Badge>
                  </td>
                   <td className="border-t border-line px-4 py-3.5 align-middle">
                    <Badge tier="status" status="published" icon="check_circle">
                      Published
                    </Badge>
                  </td>
                   <td className="border-t border-line px-4 py-3.5 align-middle font-mono text-right">—</td>
                   <td className="border-t border-line px-4 py-3.5 align-middle text-body-sm text-muted">{formatDate(a.publishedAt)}</td>
                   <td className="border-t border-line px-4 py-3.5 align-middle text-right">
                    <div className="flex justify-end gap-2">
                       <button className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-transparent px-3.5 py-1.5 text-[13px] font-semibold tracking-wide text-ink transition active:scale-[0.98] hover:bg-paper-raised">Edit</button>
                      <button
                         className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-paper-card px-3.5 py-1.5 text-[13px] font-semibold tracking-wide text-ink transition active:scale-[0.98] hover:bg-paper-raised"
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
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-none border border-line bg-paper-raised p-6">
            <span className="font-mono text-[13px] text-muted">
              Showing {articles.length} of {articles.length} manuscripts
            </span>
            <div className="flex gap-2">
               <button className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-paper-card px-3.5 py-1.5 text-[13px] font-semibold tracking-wide text-ink transition active:scale-[0.98] hover:bg-paper-raised disabled:cursor-not-allowed disabled:opacity-55" disabled>Previous</button>
               <button className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-paper-card px-3.5 py-1.5 text-[13px] font-semibold tracking-wide text-ink transition active:scale-[0.98] hover:bg-paper-raised">Next</button>
            </div>
          </div>
        </div>
      )}

      {tab === "overview" && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-line bg-paper-card p-6 shadow-card">
            <span className="inline-flex items-center gap-1 font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-amber">Storage Postage Batch</span>
            <div className="font-display text-headline-sm my-3">Batch ID: #88219-F</div>
            <p className="text-body-sm text-muted">
              Batch depth: 22. Estimated pin longevity: 142 days until next top-up
              via Avalanche contract.
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper-raised">
              <div className="h-full w-[78%] bg-honey" />
            </div>
          </div>
          <div className="rounded-lg border border-line bg-paper-card p-6 shadow-card">
            <span className="inline-flex items-center gap-1 font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-sage">
              ENS Reverse Resolution
            </span>
            <div className="font-display text-headline-sm my-3">theautumnapiary.eth</div>
            <p className="text-body-sm text-muted">
              Direct contenthash mapped to latest Swarm manifest. Resolves across
              all Web3 gateways.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-sm bg-sage-soft px-2.5 py-0.5 font-mono text-[13px] text-[#3f5a26]">
              Valid · DNS synced
            </span>
          </div>
          <div className="rounded-lg border border-line bg-paper-card p-6 shadow-card">
            <span className="inline-flex items-center gap-1 font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-amber">Patron Split Ratio</span>
            <div className="font-display text-headline-sm my-3">85% / 15%</div>
            <p className="text-body-sm text-muted">
              85% to core publication vault, 15% earmarked for guest
              peer-reviewers and translators.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-sm bg-paper-raised px-2.5 py-0.5 font-mono text-[13px] text-muted">Multisig: 0x228…9a41</span>
          </div>
        </div>
      )}

      {tab === "reviews" && (
        <div className="rounded-lg border border-line bg-paper-card p-6 shadow-card">
          <h3 className="font-display text-title-lg mt-0">Community Submissions (3)</h3>
          <p className="text-body-sm text-muted">
            Manuscripts submitted by verified guild authors awaiting editorial seal.
          </p>
        </div>
      )}

      {tab === "contributors" && (
        <div className="rounded-lg border border-line bg-paper-card p-6 shadow-card">
          <h3 className="font-display text-title-lg mt-0">Publication Contributors (4)</h3>
          <p className="text-body-sm text-muted">
            Authors and peer curators with co-signing privileges via multisig.
          </p>
        </div>
      )}

      {tab === "settings" && (
        <div className="max-w-2xl rounded-lg border border-line bg-paper-card p-6 shadow-card">
          <h3 className="font-display text-title-lg mt-0">
            Decentralized Publication Settings
          </h3>
          <p className="text-body-sm text-muted">
            Configure your sovereign distribution parameters, auto-archive
            frequencies, and gated subscription fees.
          </p>
          <div className="mb-4 mt-4 flex flex-col gap-1.5">
            <label className="text-[14px] font-semibold tracking-[0.02em] text-ink">Publication Subdomain &amp; ENS Alias</label>
            <input className="rounded-sm border border-line-strong bg-paper px-3 py-2.5 text-[16px] text-ink transition focus:border-honey focus:bg-paper-card focus:outline-none placeholder:text-[#b7a98f]" defaultValue="theautumnapiary.nectar.eth" />
          </div>
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-[14px] font-semibold tracking-[0.02em] text-ink">Default Patron Pass Cost (Monthly)</label>
            <input defaultValue="0.25" className="max-w-[140px] rounded-sm border border-line-strong bg-paper px-3 py-2.5 text-[16px] text-ink transition focus:border-honey focus:bg-paper-card focus:outline-none placeholder:text-[#b7a98f]" />
          </div>
          <Button>Save Protocol Parameters</Button>
        </div>
      )}
    </div>
  );
}
