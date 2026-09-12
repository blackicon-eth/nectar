export interface Article {
  key: string;
  title: string;
  excerpt: string;
  tags: string[];
  creator: string;
  creatorEnsName?: string;
  contributor?: string;
  premium: boolean;
  actProtected: boolean;
  status: string;
  publishedAt: string;
  swarmRef: string;
  historyRef?: string;
  publisherPublicKey?: string;
  cover?: string;
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

export function readTime(article: Article): string {
  const words = `${article.title} ${article.excerpt}`.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min`;
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
