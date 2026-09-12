export const MIN_ARTICLE_CHARS = 1000;

export interface Article {
  key: string;
  title: string;
  subtitle: string;
  excerpt: string;
  tags: string[];
  creator: string;
  creatorAddress: string;
  signature: string;
  creatorEnsName?: string;
  contributor?: string;
  premium: boolean;
  status: string;
  publishedAt: string;
  swarmRef: string;
  historyRef?: string;
  publisherPublicKey?: string;
  imageRef?: string;
  imageContentType?: string;
  cover?: string;
  contentLength?: number;
}

export async function fetchArticles(): Promise<Article[]> {
  const res = await fetch("/api/articles", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = (await res.json()) as { articles: Article[] };
  return data.articles ?? [];
}

export function short(value: string, n = 8): string {
  if (!value) return "";
  return value.length <= n * 2 + 1
    ? value
    : `${value.slice(0, n)}…${value.slice(-n)}`;
}

export function readTime(article: Article, content?: string): string {
  const characterCount =
    content?.length ||
    article.contentLength ||
    `${article.title} ${article.excerpt}`.trim().length;
  return `${Math.max(1, Math.ceil(characterCount / 1000))} min read`;
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
