import { getConfig } from "@nectar/config";
import { listArticles } from "@nectar/arkiv";

export interface ArticleSummary {
  key: string;
  title: string;
  subtitle: string;
  excerpt: string;
  tags: string[];
  creator: string;
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
  contentLength?: number;
}

export async function listPublishedArticles(): Promise<ArticleSummary[]> {
  const config = getConfig();
  const entities = await listArticles({ rpcUrl: config.arkiv.rpcUrl });

  return entities.map((entity) => {
    const attr = (name: string): unknown => entity.attributes[name]?.value;
    const payload = entity.payload ?? {};

    const strValue = (value: unknown): string =>
      typeof value === "string" ? value : "";
    const boolValue = (value: unknown): boolean => value === true;
    const numberValue = (value: unknown): number | undefined => {
      if (typeof value === "number") return value;
      if (typeof value === "bigint") return Number(value);
      if (typeof value === "string" && value) return Number(value);
      return undefined;
    };
    const strArray = (value: unknown): string[] =>
      typeof value === "string"
        ? value.split(",").map((t) => t.trim()).filter(Boolean)
        : Array.isArray(value)
          ? value.filter((t): t is string => typeof t === "string")
          : [];

    return {
      key: entity.key,
      title: strValue(payload.title ?? attr("title")),
      subtitle: strValue(payload.subtitle ?? ""),
      excerpt: strValue(payload.excerpt ?? ""),
      tags: strArray(payload.tags ?? attr("tags")),
      creator: strValue(payload.creator ?? attr("creator")),
      creatorEnsName: strValue(payload.creatorEnsName) || undefined,
      contributor: strValue(payload.contributor) || undefined,
      premium: boolValue(payload.premium ?? attr("premium")),
      status: strValue(payload.status ?? attr("status")),
      publishedAt: strValue(
        payload.publishedAt ?? attr("publishedAt") ?? "",
      ),
      swarmRef: strValue(payload.swarmRef ?? attr("swarm_ref")),
      historyRef: strValue(payload.historyRef) || undefined,
      publisherPublicKey: strValue(payload.publisherPublicKey) || undefined,
      imageRef: strValue(payload.imageRef ?? attr("image_ref")) || undefined,
      imageContentType:
        strValue(payload.imageContentType ?? attr("image_content_type")) ||
        undefined,
      contentLength: numberValue(
        payload.contentLength ?? attr("content_length"),
      ),
    };
  });
}
