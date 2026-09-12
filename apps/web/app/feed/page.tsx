import ArticleFeed from "@/components/ArticleFeed";

export default function FeedPage() {
  return (
    <main>
      <h1>
        Feed<span className="mark">.</span>
      </h1>
      <p className="tagline">
        Every published article, with its Arkiv metadata and Swarm references.
      </p>
      <ArticleFeed />
      <p style={{ marginTop: 32 }}>
        <a href="/" className="link">
          ← Write an article
        </a>
      </p>
    </main>
  );
}
