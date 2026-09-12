import ArticleForm from "@/components/ArticleForm";

export default function Home() {
  return (
    <main>
      <h1>
        Nectar<span className="mark">.</span>
      </h1>
      <p className="tagline">
        Creator-first publishing. Content lives on Swarm, metadata is queryable
        on Arkiv.
      </p>

      <p style={{ marginBottom: 24 }}>
        <a href="/feed" className="link">
          View the article feed →
        </a>
      </p>

      <ArticleForm />
    </main>
  );
}
