import Link from "next/link";
import type { Article } from "@/lib/articles";
import { formatDate, readTime, short } from "@/lib/articles";
import { coverFor } from "@/lib/covers";
import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";

export default function ArticleCard({
  article,
  variant = "compact",
  cover,
}: {
  article: Article;
  variant?: "featured" | "compact" | "horizontal";
  cover?: string;
}) {
  const accessBadge = article.premium ? (
    <Badge tier="premium" icon="lock">
      Premium Harvest
    </Badge>
  ) : (
    <Badge tier="public" icon="lock_open_right">
      Public Reading
    </Badge>
  );

  const tags = article.tags ?? [];
  const image = cover ?? article.cover ?? coverFor(article.key);
  const serveUrl = `/api/articles/${article.swarmRef}${
    article.premium
      ? `?premium=true&historyRef=${article.historyRef ?? ""}&publisherKey=${article.publisherPublicKey ?? ""}`
      : "?premium=false"
  }`;

  if (variant === "featured") {
    return (
      <article className="flex flex-col gap-2 overflow-hidden rounded-lg border border-line bg-paper-card p-0 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover md:flex-row">
        <div className="relative min-h-[220px] flex-[0_0_42%] overflow-hidden bg-paper-raised md:min-h-[280px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={article.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute left-4 top-4">{accessBadge}</div>
        </div>
        <div className="flex flex-1 flex-col justify-between gap-4 p-6">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-mono text-[13px] font-semibold">
                <Avatar size={28} name={article.creator} />
                {article.creatorEnsName || article.creator}
              </span>
              <span className="font-mono text-[13px] text-muted">
                {readTime(article)} · {formatDate(article.publishedAt)}
              </span>
            </div>
            <Link href={serveUrl}>
              <h2 className="font-display text-headline-lg max-md:text-[32px] max-md:leading-[1.2]">{article.title}</h2>
            </Link>
            <p className="excerpt mt-1">{article.excerpt}</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 rounded-sm bg-paper-raised px-2.5 py-0.5 font-mono text-[13px] text-muted">
                  #{t}
                </span>
              ))}
            </div>
              <a className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-honey px-3.5 py-1.5 text-[13px] font-semibold tracking-wide text-ink shadow-card transition active:scale-[0.98] hover:bg-honey-deep" href={serveUrl}>
              {article.premium ? "Read Harvest" : "Read"}
            </a>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className="flex flex-col gap-2 rounded-lg border border-line bg-paper-card p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover md:flex-row md:items-center md:gap-6">
        <div className="h-[100px] flex-[0_0_160px] overflow-hidden rounded-md bg-paper-raised">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={article.title} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            {accessBadge}
            <span className="font-mono text-[13px] text-muted">
              {readTime(article)} · {formatDate(article.publishedAt)}
            </span>
          </div>
          <h3 className="font-display text-headline-sm">{article.title}</h3>
          <p className="line-clamp-2 text-[15px] leading-relaxed text-muted">{article.excerpt}</p>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 font-mono text-[13px] font-semibold">
              <Avatar size={22} name={article.creator} />
              {article.creatorEnsName || article.creator}
            </span>
            <div className="flex gap-1.5">
              {tags.slice(0, 2).map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 rounded-sm bg-paper-raised px-2.5 py-0.5 font-mono text-[13px] text-muted">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col gap-2 rounded-lg border border-line bg-paper-card p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-center justify-between gap-2">
        {accessBadge}
        <span className="font-mono text-[13px] text-muted">{readTime(article)}</span>
      </div>
      <Link href={serveUrl}>
        <h3 className="font-display text-headline-sm">{article.title}</h3>
      </Link>
      <p className="line-clamp-3 text-[15px] leading-relaxed text-muted">{article.excerpt}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.slice(0, 3).map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5 rounded-sm bg-paper-raised px-2.5 py-0.5 font-mono text-[13px] text-muted">
            #{t}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-line pt-3">
        <span className="flex items-center gap-1.5">
          <Avatar size={20} name={article.creator} />
          <span className="font-mono text-[13px] text-muted">
            {article.creatorEnsName || article.creator}
          </span>
        </span>
        <span className="font-mono text-[13px] text-muted">
          {formatDate(article.publishedAt)}
        </span>
      </div>
      {article.historyRef && (
        <div className="font-mono text-[12px] text-muted">
          swarm {short(article.swarmRef, 6)}
        </div>
      )}
    </article>
  );
}
