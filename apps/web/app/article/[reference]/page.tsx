import ArticleReader from "@/components/ArticleReader";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  return <ArticleReader reference={reference} />;
}
