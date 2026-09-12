"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { Article } from "@/lib/articles";
import { fetchArticles, formatDate, readTime } from "@/lib/articles";
import { coverFor } from "@/lib/covers";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import Icon from "./ui/Icon";
import Spinner from "./ui/Spinner";

type ArticleReaderProps = { reference: string };

export default function ArticleReader({ reference }: ArticleReaderProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadArticle() {
      try {
        const articles = await fetchArticles();
        const match = articles.find((item) => item.swarmRef === reference);
        if (!match) throw new Error("This article could not be found in the public registry.");
        if (match.premium) throw new Error("This article is reserved for subscribers.");

        const response = await fetch(`/api/articles/${reference}?premium=false`);
        if (!response.ok) throw new Error("The article content could not be retrieved from Swarm.");

        const text = await response.text();
        if (!cancelled) {
          setArticle(match);
          setContent(text);
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
  }, [reference]);

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
  const image = article.cover ?? coverFor(article.key);

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
            {article.excerpt}
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

        <div className="font-body text-[19px] leading-[1.75] text-ink sm:text-[21px]">
          {paragraphs.map((paragraph, index) => (
            <p key={`${index}-${paragraph.slice(0, 16)}`} className={`mb-7 whitespace-pre-wrap last:mb-0 ${index === 0 ? "first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[4.3em] first-letter:font-semibold first-letter:leading-[0.78] first-letter:text-honey" : ""}`}>
              {paragraph}
            </p>
          ))}
        </div>

        <aside className="mt-10 border-t border-line pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Archive reference</div>
          <div className="mt-2 break-all font-mono text-[11px] leading-relaxed text-ink">{reference}</div>
          <div className="mt-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-sage">
            <Icon name="verified" size={15} />
            Retrieval complete
          </div>
          <p className="mt-8 text-[14px] leading-relaxed text-muted">This public record is served from the decentralized Swarm archive.</p>
        </aside>
      </div>
    </motion.article>
  );
}
