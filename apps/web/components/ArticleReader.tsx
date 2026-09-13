"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import type { Article } from "@/lib/articles";
import { fetchArticles, formatDate, readTime } from "@/lib/articles";
import { coverFor } from "@/lib/covers";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import Icon from "./ui/Icon";
import Spinner from "./ui/Spinner";
import { useAuth } from "./AuthProvider";
import SubscriptionModal from "./SubscriptionModal";

type ArticleReaderProps = { reference: string };

export default function ArticleReader({ reference }: ArticleReaderProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [premiumLocked, setPremiumLocked] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const { address, signing, signIn, status } = useAuth();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    let cancelled = false;

    async function loadArticle() {
      try {
        const articles = await fetchArticles();
        const match = articles.find((item) => item.swarmRef === reference);
        if (!match) throw new Error("This article could not be found in the public registry.");
        const creatorCanRead =
          match.premium &&
          address &&
          match.creatorAddress.toLowerCase() === address.toLowerCase();

        if (match.premium && !creatorCanRead && status !== "signed-in") {
          if (!cancelled) {
            setArticle(match);
            setContent(match.excerpt);
            setPremiumLocked(true);
          }
          return;
        }

        const query = match.premium
          ? `?premium=true&historyRef=${encodeURIComponent(match.historyRef ?? "")}&publisherKey=${encodeURIComponent(match.publisherPublicKey ?? "")}`
          : "?premium=false";
        const response = await fetch(`/api/articles/${reference}${query}`);
        if (!response.ok) {
          if (match.premium) {
            if (!cancelled) {
              setArticle(match);
              setContent(match.excerpt);
              setPremiumLocked(true);
            }
            return;
          }
          throw new Error("The article content could not be retrieved from Swarm.");
        }

        const text = await response.text();
        if (!cancelled) {
          setArticle(match);
          setContent(text);
          setPremiumLocked(false);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load this article.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadArticle();
    return () => {
      cancelled = true;
    };
  }, [address, reference, refreshToken, status]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-[1180px] items-center justify-center px-8 py-16">
        <Spinner label="Loading article" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-[760px] flex-col items-center justify-center px-8 py-16 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-paper-raised text-rust">
          <Icon name="cloud_off" size={28} />
        </div>
        <span className="font-mono text-[13px] uppercase tracking-[0.08em] text-amber">Public record unavailable</span>
        <h1 className="font-display text-headline-md mt-2">This article is not readable yet.</h1>
        <p className="text-body-md mt-3 text-muted">{error ?? "The article metadata is incomplete."}</p>
        <Button href="/feed" variant="outline" icon="arrow_back" className="mt-7">
          Return to Feed
        </Button>
      </div>
    );
  }

  const paragraphs = content.split(/\n\s*\n/).filter(Boolean);
  const image = article.imageRef
    ? `/api/images/${article.imageRef}?contentType=${encodeURIComponent(article.imageContentType ?? "")}`
    : article.cover ?? coverFor(article.key);

  return (
    <motion.article
      className="mx-auto w-full max-w-[1440px] px-5 py-5 pb-24 sm:px-8 lg:px-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <header className="grid gap-10 pb-10 pt-2 md:pb-14 md:pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-end lg:gap-16">
        <div className="max-w-[780px]">
          <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[12px] uppercase tracking-[0.1em] text-muted">
            <span className="flex items-center gap-2 text-ink">
              <Avatar size={25} name={article.creator} />
              {article.creatorEnsName || article.creator}
            </span>
            <span className="text-line-strong">•</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span>{readTime(article, content)}</span>
          </div>
          <h1 className="font-display text-[clamp(3.2rem,7vw,6.7rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-ink">
            {article.title}
          </h1>
          <p className="font-display mt-7 max-w-[640px] text-[clamp(1.35rem,2.2vw,2rem)] leading-[1.2] italic text-muted">
            {article.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {(article.tags ?? []).map((tag) => (
              <span key={tag} className="border border-line bg-paper-card px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">#{tag}</span>
            ))}
          </div>
        </div>

        <motion.div
          className="relative mx-auto w-full max-w-[560px] lg:mx-0"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.55, ease: "easeOut" }}
        >
          <div className="absolute -bottom-3 -left-3 h-full w-full border border-honey/60" />
          <div className="relative aspect-[1.25/1] overflow-hidden bg-paper-raised p-2 shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className="h-full w-full object-cover saturate-[0.8]" />
            <div className="absolute bottom-5 left-5 bg-wood px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-cream">
              Swarm record / verified
            </div>
          </div>
        </motion.div>
      </header>

      <div className="grid border-t border-line pt-10 lg:grid-cols-[150px_minmax(0,700px)_minmax(180px,1fr)] lg:gap-12">
        <aside className="mb-8 flex justify-between gap-4 lg:mb-0 lg:block">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Reading note</div>
          <div className="mt-2 font-mono text-[12px] text-ink">01 / {String(paragraphs.length).padStart(2, "0")}</div>
          <div className="mt-4 hidden h-px w-10 bg-honey lg:block" />
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted lg:mt-4">Open access</div>
        </aside>

        <AnimatePresence mode="wait" initial={false}>
          {premiumLocked ? (
            <motion.div
              key="premium-preview"
              className="lg:col-span-1"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <PremiumPreview
                article={article}
                isConnected={isConnected}
                onFuji={chainId === avalancheFuji.id}
                openConnectModal={openConnectModal}
                signIn={signIn}
                signing={signing}
                status={status}
                switchChain={() => switchChain({ chainId: avalancheFuji.id })}
                onSubscribed={() => setRefreshToken((value) => value + 1)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="full-article"
              className="font-body text-[19px] leading-[1.75] text-ink sm:text-[21px]"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {paragraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 16)}`} className={`mb-7 whitespace-pre-wrap last:mb-0 ${index === 0 ? "first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[4.3em] first-letter:font-semibold first-letter:leading-[0.78] first-letter:text-honey" : ""}`}>
                  {paragraph}
                </p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <aside className="mt-10 border-t border-line pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Archive reference</div>
          <div className="mt-2 break-all font-mono text-[11px] leading-relaxed text-ink">{reference}</div>
          <p className="mt-8 text-[14px] leading-relaxed text-muted">This public record is served from the decentralized Swarm archive.</p>
        </aside>
      </div>
    </motion.article>
  );
}

function PremiumPreview({
  article,
  isConnected,
  onFuji,
  openConnectModal,
  signIn,
  signing,
  status,
  switchChain,
  onSubscribed,
}: {
  article: Article;
  isConnected: boolean;
  onFuji: boolean;
  openConnectModal?: () => void;
  signIn: () => Promise<void>;
  signing: boolean;
  status: "checking" | "signed-out" | "signed-in";
  switchChain: () => void;
  onSubscribed: () => void;
}) {
  const checking = status === "checking";
  const signedIn = status === "signed-in";
  const needsWallet = !isConnected;
  const needsNetwork = isConnected && !onFuji;
  const needsSignature = isConnected && onFuji && !signedIn;

  const label = checking
    ? "Checking access"
    : needsWallet
      ? "Connect wallet to continue"
      : needsNetwork
        ? "Switch to Fuji"
        : needsSignature
          ? signing
            ? "Signing in…"
            : "Sign in to continue"
          : "Subscribe to unlock";

  const icon = needsWallet || needsNetwork ? "account_balance_wallet" : needsSignature ? "draw" : "lock_open";

  function handleClick() {
    if (needsWallet) {
      openConnectModal?.();
    } else if (needsNetwork) {
      switchChain();
    } else if (needsSignature) {
      void signIn();
    }
  }

  return (
    <div className="relative">
      <div className="relative max-h-[320px] overflow-hidden font-body text-[19px] leading-[1.75] text-ink sm:text-[21px]">
        <p className="mb-7 whitespace-pre-wrap first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[4.3em] first-letter:font-semibold first-letter:leading-[0.78] first-letter:text-honey">
          {article.excerpt}
        </p>
        <div className="space-y-7 select-none blur-[2.5px] opacity-55" aria-hidden="true">
          <p>{article.excerpt}</p>
          <p>{article.excerpt}</p>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-paper/75 to-paper" />
      </div>

      <div className="relative mt-4 overflow-hidden border border-line-strong bg-paper-card px-6 py-7 shadow-card sm:px-8">
        <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-honey/20 blur-2xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-amber">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              Subscriber archive
            </div>
            <h2 className="font-display mt-2 text-[28px] leading-tight text-ink">Keep reading this story.</h2>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">
              {needsWallet || needsNetwork || needsSignature
                ? "Connect and verify your Fuji wallet to check your subscription."
                : "Your subscription record is not active for this creator yet."}
            </p>
          </div>
          {signedIn ? (
            <SubscriptionModal
              creatorAddress={article.creatorAddress}
              creatorName={article.creatorEnsName || article.creator}
              onSuccess={onSubscribed}
            />
          ) : (
            <Button
              className="shrink-0"
              icon={icon}
              disabled={checking || signing}
              onClick={handleClick}
            >
              {label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
