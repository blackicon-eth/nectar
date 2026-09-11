import ArticleForm from "@/components/ArticleForm";
import ArticleList from "@/components/ArticleList";

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

      <ArticleForm />
      <ArticleList />
    </main>
  );
}
