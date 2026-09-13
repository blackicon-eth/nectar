import CreatorView from "@/components/CreatorView";

export const dynamic = "force-dynamic";

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ identifier: string }>;
}) {
  const { identifier } = await params;
  return <CreatorView identifier={decodeURIComponent(identifier)} />;
}
