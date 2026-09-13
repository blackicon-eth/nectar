"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useArticles } from "@/components/ArticlesProvider";
import { useAuth } from "@/components/AuthProvider";
import { short } from "@/lib/articles";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import Icon from "./ui/Icon";
import Spinner from "./ui/Spinner";

type Subscription = {
  key: string;
  creator: string;
  expiresAt: string;
};

export default function SubscriptionsView() {
  const { status: authStatus } = useAuth();
  const { articles } = useArticles();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    if (authStatus !== "signed-in") {
      setSubscriptions([]);
      setStatus("idle");
      return;
    }

    let active = true;
    setStatus("loading");
    fetch("/api/subscriptions", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as { subscriptions?: Subscription[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Unable to load subscriptions.");
        if (active) setSubscriptions(data.subscriptions ?? []);
      })
      .then(() => active && setStatus("idle"))
      .catch(() => active && setStatus("error"));

    return () => {
      active = false;
    };
  }, [authStatus]);

  const creatorCount = new Set(subscriptions.map((subscription) => subscription.creator.toLowerCase())).size;

  return (
    <div className="w-full pb-16">
      <header className="relative overflow-hidden border-b border-line bg-paper-raised/60 py-10">
        <div className="pointer-events-none absolute -right-20 -top-40 h-80 w-80 rounded-full bg-honey/10 blur-[70px]" />
        <div className="relative z-10 mx-auto w-full max-w-[1800px] px-8 md:px-8">
          <div className="max-w-3xl">
          <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-muted">Reader&apos;s shelf</div>
          <h1 className="font-display mt-2 text-headline-lg max-md:text-[32px] max-md:leading-[1.2]">
            The voices you keep close<span className="text-honey">.</span>
          </h1>
          <p className="text-body-md mt-2 max-w-2xl text-muted">
            Your active patronage, gathered in one quiet place. Return to the writers whose work deserves your attention.
          </p>
          {authStatus === "signed-in" && (
            <div className="relative z-10 mt-5 flex items-center gap-3 font-mono text-[12px] text-muted">
              <span className="h-2 w-2 rounded-full bg-sage" />
              {creatorCount} {creatorCount === 1 ? "creator" : "creators"} supported
            </div>
          )}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1800px] px-8">
      {authStatus === "checking" && <StatePanel><Spinner label="Checking your reader session" /></StatePanel>}
      {authStatus === "signed-in" && status === "loading" && <StatePanel><Spinner label="Loading your subscriptions" /></StatePanel>}
      {authStatus === "signed-in" && status === "error" && (
        <StatePanel>
          <Icon name="cloud_off" size={26} />
          <h2 className="font-display mt-4 text-headline-sm">The shelf is temporarily unavailable.</h2>
          <p className="text-body-md mt-2 text-muted">Arkiv could not be reached. Try again in a moment.</p>
        </StatePanel>
      )}
      {authStatus === "signed-in" && status === "idle" && subscriptions.length === 0 && (
        <StatePanel>
          <Icon name="auto_stories" size={26} />
          <h2 className="font-display mt-4 text-headline-sm">No subscriptions yet.</h2>
          <p className="text-body-md mt-2 max-w-md text-muted">When you subscribe to a creator, their work will settle here.</p>
          <Button href="/explore" variant="outline" className="mt-5" icon="arrow_outward">Explore the index</Button>
        </StatePanel>
      )}
      {authStatus === "signed-in" && status === "idle" && subscriptions.length > 0 && (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {subscriptions.map((subscription, index) => {
            const creatorArticles = articles.filter((article) => article.creatorAddress?.toLowerCase() === subscription.creator.toLowerCase());
            const latest = creatorArticles[0];
            const creatorName = latest?.profileName || latest?.creatorEnsName || latest?.creator || short(subscription.creator, 6);
            return (
              <motion.article
                key={subscription.key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                className="group rounded-lg border border-line bg-paper-card shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <Link href={`/creator/${subscription.creator}`} className="block p-6 no-underline sm:p-7">
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex min-w-0 items-center gap-4">
                    <Avatar size={56} name={creatorName} src={latest?.profileAvatar} />
                      <div className="min-w-0">
                        <h2 className="truncate font-display text-headline-sm">{creatorName}</h2>
                        <div className="mt-1 truncate font-mono text-[12px] text-muted">{short(subscription.creator, 8)}</div>
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.08em] text-sage">Active</span>
                  </div>
                  <div className="mt-7 border-t border-line pt-4">
                    {latest ? (
                      <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">Latest from this desk</div>
                        <div className="mt-1 truncate font-display text-[20px] font-semibold group-hover:text-honey">{latest.title}</div>
                      </div>
                      <Icon name="arrow_outward" size={19} className="shrink-0 text-muted transition group-hover:text-honey" />
                      </div>
                    ) : (
                      <div className="text-body-sm text-muted">Their latest writing will appear here.</div>
                    )}
                  </div>
                  <div className="mt-5 font-mono text-[11px] text-muted">
                    Access through {new Date(subscription.expiresAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}

function StatePanel({ children }: { children: React.ReactNode }) {
  return <section className="mt-10 flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-line bg-paper-raised/40 p-8 text-center">{children}</section>;
}
