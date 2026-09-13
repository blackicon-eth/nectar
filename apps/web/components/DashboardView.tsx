"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useArticles } from "@/components/ArticlesProvider";
import { useAuth } from "@/components/AuthProvider";
import { formatDate, readTime, short } from "@/lib/articles";
import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import Icon from "./ui/Icon";
import SubscriptionPriceCard from "./SubscriptionPriceCard";
import { useProfile } from "./ProfileProvider";

type Tab = "overview" | "articles" | "subscriptions" | "settings";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "articles", label: "My articles", icon: "auto_stories" },
  { id: "subscriptions", label: "Subscriptions", icon: "sell" },
  { id: "settings", label: "Identity", icon: "fingerprint" },
];

export default function DashboardView() {
  const { articles } = useArticles();
  const { address } = useAuth();
  const { profile } = useProfile();
  const [tab, setTab] = useState<Tab>("overview");
  const [copied, setCopied] = useState<string | null>(null);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  useEffect(() => {
    if (!address) return;
    fetch(`/api/subscriptions?creator=${encodeURIComponent(address)}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load subscribers.");
        const data = (await response.json()) as { subscriberCount?: number };
        setSubscriberCount(data.subscriberCount ?? 0);
      })
      .catch(() => setSubscriberCount(null));
  }, [address]);

  const ownedArticles = useMemo(
    () =>
      address
        ? articles.filter(
          (article) =>
            article.creatorAddress?.toLowerCase() === address.toLowerCase(),
        )
        : [],
    [address, articles],
  );
  const premiumCount = ownedArticles.filter((article) => article.premium).length;
  const totalCharacters = ownedArticles.reduce(
    (total, article) => total + (article.contentLength ?? 0),
    0,
  );
  const latest = ownedArticles[0];
  const creatorName =
    profile?.displayName || latest?.profileName || latest?.creatorEnsName || latest?.creator || (address ? short(address, 6) : "Unknown author");

  async function copyReference(reference: string) {
    await navigator.clipboard?.writeText(reference);
    setCopied(reference);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <div className="w-full pb-12">
      <header className="relative overflow-hidden border-b border-line bg-paper-raised/60 py-10">
        <div className="pointer-events-none absolute -right-20 -top-40 h-80 w-80 rounded-full bg-honey/10 blur-[70px]" />
        <div className="relative z-10 mx-auto flex w-full max-w-[1800px] flex-wrap items-end justify-between gap-6 px-8 md:px-8">
          <div>
            <h1 className="font-display text-headline-lg max-md:text-[32px] max-md:leading-[1.2]">
              Your publication ledger<span className="text-honey">.</span>
            </h1>
            <p className="text-body-md mt-2 max-w-2xl text-muted">
              A clear view of the writing you have signed and published to Nectar.
            </p>
          </div>
          <Button href="/write" icon="add">
            Publish article
          </Button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1800px] px-8 pt-6">
      <section className="mt-7 grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <div className="rounded-lg border border-line bg-paper-card p-6 shadow-card sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-center gap-4">
              <Avatar size={64} name={creatorName} src={profile?.avatarData ?? undefined} />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-title-lg">{creatorName}</h2>
                  <Badge tier="status" icon="verified">Verified signer</Badge>
                </div>
                <div className="mt-1 break-all font-mono text-[12px] text-muted">
                  {address}
                </div>
              </div>
            </div>
          </div>
          <p className="text-body-md mt-7 max-w-2xl text-muted">
            Every publication in this desk is attributed to this wallet and carries
            its own article signature in the Arkiv record.
          </p>
        </div>

        <div className="rounded-lg border border-wood bg-wood p-6 text-cream shadow-card sm:p-7">
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-cream/60">
            Latest publication
          </div>
          {latest ? (
            <>
              <h2 className="font-display mt-4 line-clamp-2 text-title-lg">{latest.title}</h2>
              <div className="mt-3 flex items-center gap-2 font-mono text-[12px] text-cream/65">
                <span>{formatDate(latest.publishedAt)}</span>
                <span>·</span>
                <span>{readTime(latest)}</span>
              </div>
              <a href={`/article/${latest.swarmRef}`} className="mt-6 inline-flex items-center gap-2 font-semibold text-honey hover:text-cream">
                Open article <Icon name="arrow_outward" size={16} />
              </a>
            </>
          ) : (
            <>
              <h2 className="font-display mt-4 text-title-lg">Your first article is waiting.</h2>
              <p className="mt-3 text-body-sm text-cream/65">Start with a signed publication and it will appear here.</p>
              <a href="/write" className="mt-6 inline-flex items-center gap-2 font-semibold text-honey hover:text-cream">
                Open the editor <Icon name="arrow_outward" size={16} />
              </a>
            </>
          )}
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Published articles" value={String(ownedArticles.length)} icon="auto_stories" />
        <Metric label="Public articles" value={String(ownedArticles.length - premiumCount)} icon="public" />
        <Metric label="Premium articles" value={String(premiumCount)} icon="lock" />
        <Metric
          label="Words recorded"
          value={totalCharacters ? totalCharacters.toLocaleString() : "—"}
          icon="notes"
        />
      </section>

      <nav className="mt-9 flex gap-1 overflow-x-auto rounded-md bg-paper-raised p-1" aria-label="Dashboard sections">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-[14px] font-medium transition ${tab === item.id ? "bg-wood text-cream" : "text-muted hover:bg-paper-card hover:text-ink"}`}
          >
            <Icon name={item.icon} size={16} />
            {item.label}
            {item.id === "articles" && <span className="font-mono text-[12px] opacity-70">{ownedArticles.length}</span>}
          </button>
        ))}
      </nav>

      {tab === "overview" && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-lg border border-line bg-paper-card p-6 shadow-card">
            <SectionHeading title="Publication activity" />
            {latest ? (
              <div className="mt-6 flex items-start gap-4 border-t border-line pt-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-honey/20 text-honey">
                  <Icon name="draw" size={20} />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-ink">Latest article published</p>
                  <p className="mt-1 text-body-sm text-muted">{latest.title} · {formatDate(latest.publishedAt)}</p>
                </div>
              </div>
            ) : (
              <EmptyState title="No publication activity yet" body="Your signed article history will appear here." href="/write" />
            )}
          </div>
          <div className="rounded-lg border border-line bg-paper-card p-6 shadow-card">
            <SectionHeading title="Your readership" />
            <div className="mt-6 flex items-end justify-between gap-4 border-b border-line pb-5">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">Active subscribers</div>
                <div className="font-display mt-2 text-[48px] leading-none text-ink">
                  {subscriberCount === null ? "—" : subscriberCount}
                </div>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-honey/20 text-honey">
                <Icon name="group" size={21} />
              </span>
            </div>
            <p className="text-body-sm mt-5 leading-relaxed text-muted">
              Readers with an active 30-day subscription to your premium archive.
            </p>
          </div>
        </div>
      )}

      {tab === "articles" && (
        <section className="mt-5 overflow-hidden rounded-lg border border-line bg-paper-card shadow-card">
          {ownedArticles.length === 0 ? (
            <div className="p-8">
              <EmptyState title="Nothing published from this wallet" body="Write and sign your first article to populate the ledger." href="/write" />
            </div>
          ) : (
            <div className="divide-y divide-line">
              {ownedArticles.map((article) => (
                <div key={article.key} className="flex flex-wrap items-center justify-between gap-4 p-5 transition hover:bg-paper-raised/50 sm:px-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <a href={`/article/${article.swarmRef}`} className="truncate font-display text-[20px] font-semibold hover:text-honey">
                        {article.title}
                      </a>
                      <Badge tier={article.premium ? "premium" : "public"} icon={article.premium ? "lock" : "public"}>
                        {article.premium ? "Premium" : "Public"}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[12px] text-muted">
                      <span>{formatDate(article.publishedAt)}</span>
                      <span>{readTime(article)}</span>
                      <span>Swarm {short(article.swarmRef, 5)}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button href={`/article/${article.swarmRef}`} variant="outline" size="sm" icon="open_in_new">Read</Button>
                    <Button variant="ghost" size="sm" icon={copied === article.swarmRef ? "check" : "content_copy"} onClick={() => void copyReference(article.swarmRef)}>
                      {copied === article.swarmRef ? "Copied" : "Reference"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "subscriptions" && (
        <section className="mt-5 w-full">
          <SubscriptionPriceCard />
        </section>
      )}

      {tab === "settings" && (
        <section className="mt-5 w-full rounded-lg border border-line bg-paper-card p-6 shadow-card sm:p-7">
          <ProfileEditor address={address} />
        </section>
      )}
      </div>
    </div>
  );
}

function ProfileEditor({ address }: { address?: string }) {
  const { profile, saveProfile, status } = useProfile();
  const [displayName, setDisplayName] = useState("");
  const [avatarData, setAvatarData] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.displayName ?? "");
    setAvatarData(profile?.avatarData ?? null);
  }, [profile]);

  async function chooseAvatar(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 1_500_000) {
      toast.error("Image not saved", { description: "Choose an image smaller than 1.5 MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarData(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await saveProfile({ displayName, avatarData });
      toast.success("Profile saved", { description: "Your creator identity is updated." });
    } catch (error) {
      toast.error("Profile could not be saved", { description: error instanceof Error ? error.message : "Try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SectionHeading title="Identity and provenance" />
      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5">
          <div>
            <label htmlFor="profile-name" className="text-label-md text-ink">Display name</label>
            <p className="text-body-sm mt-1 text-muted">This name appears beside your articles and on your creator page.</p>
            <input
              id="profile-name"
              value={displayName}
              maxLength={80}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Your name or publication name"
              className="text-body-md mt-3 w-full rounded-md border border-line bg-paper-raised px-4 py-3 text-ink outline-none transition focus:border-honey focus:bg-paper-card"
              disabled={saving || status === "loading"}
            />
          </div>
          <div className="rounded-md border border-line bg-paper-raised p-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">Connected wallet</div>
            <div className="mt-2 break-all font-mono text-[13px] text-ink">{address}</div>
            <p className="text-body-sm mt-3 leading-relaxed text-muted">Your wallet remains the permanent signing identity for published articles.</p>
          </div>
        </div>
        <div className="flex flex-col rounded-lg border border-line bg-paper-raised p-5">
          <div className="text-label-md text-ink">Profile picture</div>
          <div className="flex min-h-[180px] flex-1 items-center justify-center">
            <label htmlFor="profile-avatar" className="group relative block cursor-pointer rounded-full">
              <Avatar size={180} name={displayName || address} src={avatarData ?? undefined} />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-wood/65 text-cream opacity-0 transition-opacity group-hover:opacity-100">
                <Icon name="edit" size={20} />
              </span>
            </label>
            <input id="profile-avatar" className="sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={saving} onChange={(event) => void chooseAvatar(event.target.files?.[0])} />
          </div>
        </div>
        <Button type="submit" icon="save" disabled={saving || status === "loading"} className="lg:col-span-2 justify-self-start">
          {saving ? "Saving profile…" : "Save profile"}
        </Button>
      </form>
    </>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-lg border border-line bg-paper-card p-5 shadow-card">
      <div className="flex items-center justify-between gap-3 text-label-md text-muted">
        {label}
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-raised text-ink"><Icon name={icon} size={17} /></span>
      </div>
      <div className="font-display mt-4 text-headline-md">{value}</div>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="font-display text-title-lg">{title}</h2>
  );
}

function StatusRow({ label, value, warning = false }: { label: string; value: string; warning?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
      <span className="text-body-sm text-muted">{label}</span>
      <span className={`inline-flex items-center gap-2 font-mono text-[12px] ${warning ? "text-rust" : "text-sage"}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${warning ? "bg-rust" : "bg-sage"}`} />
        {value}
      </span>
    </div>
  );
}

function EmptyState({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <div className="rounded-md border border-dashed border-line-strong bg-paper-raised/50 p-7 text-center">
      <Icon name="auto_stories" size={24} />
      <h3 className="font-display mt-3 text-title-lg">{title}</h3>
      <p className="text-body-sm mt-2 text-muted">{body}</p>
      <Button href={href} variant="outline" size="sm" icon="add" className="mt-5">Start writing</Button>
    </div>
  );
}
