import { ExpirationTime, jsonToPayload } from "@arkiv-network/sdk";
import { bool, str, u64 } from "@arkiv-network/sdk/attr";
import { eq } from "@arkiv-network/sdk/query";
import { createArkivWalletClient, createArkivPublicClient } from "./client";

export interface ArticleEntityFields {
  creator: string;
  creatorEnsName?: string;
  contributor?: string;
  title: string;
  subtitle: string;
  excerpt: string;
  tags: string[];
  premium: boolean;
  swarmRef: string;
  historyRef?: string;
  publisherPublicKey?: string;
  imageRef?: string;
  contentLength: number;
  status: string;
  publishedAt: Date;
}

export interface CreatedArticleEntity {
  entityKey: string;
  txHash: string;
  expiresAt: bigint;
}

export interface CreateArticleOptions {
  privateKey: string;
  rpcUrl?: string;
  ttlDays: number;
}

export async function createArticleEntity(
  fields: ArticleEntityFields,
  options: CreateArticleOptions,
): Promise<CreatedArticleEntity> {
  const wallet = createArkivWalletClient(options.privateKey, options.rpcUrl);

  const result = await wallet.createEntity({
    payload: jsonToPayload({
      title: fields.title,
      subtitle: fields.subtitle,
      excerpt: fields.excerpt,
      tags: fields.tags,
      creator: fields.creator,
      creatorEnsName: fields.creatorEnsName,
      contributor: fields.contributor,
      premium: fields.premium,
      swarmRef: fields.swarmRef,
      historyRef: fields.historyRef,
      publisherPublicKey: fields.publisherPublicKey,
      imageRef: fields.imageRef,
      contentLength: fields.contentLength,
      status: fields.status,
      publishedAt: fields.publishedAt.toISOString(),
    }),
    contentType: "application/json",
    attributes: {
      project: str("nectar"),
      type: str("article"),
      creator: str(fields.creator),
      title: str(fields.title),
      image_ref: str(fields.imageRef ?? ""),
      premium: bool(fields.premium),
      tags: str(fields.tags.join(",")),
      swarm_ref: str(fields.swarmRef),
      history_ref: str(fields.historyRef ?? ""),
      publisher_public_key: str(fields.publisherPublicKey ?? ""),
      content_length: u64(BigInt(fields.contentLength)),
      status: str(fields.status),
      published_at_ms: u64(BigInt(fields.publishedAt.getTime())),
    },
    expires: ExpirationTime.fromDays(options.ttlDays),
  });

  return {
    entityKey: result.entityKey,
    txHash: result.txHash,
    expiresAt: result.expiresAt,
  };
}

export interface ListedArticle {
  key: string;
  attributes: Record<string, { type: string; value: unknown }>;
  payload: Record<string, unknown> | undefined;
}

export interface ListArticlesOptions {
  rpcUrl?: string;
  creator?: string;
  premium?: boolean;
  limit?: number;
}

export async function listArticles(
  options: ListArticlesOptions = {},
): Promise<ListedArticle[]> {
  const client = createArkivPublicClient(options.rpcUrl);

  const filters = [
    eq("project", str("nectar")),
    eq("type", str("article")),
  ];
  if (options.creator) {
    filters.push(eq("creator", str(options.creator)));
  }
  if (options.premium !== undefined) {
    filters.push(eq("premium", bool(options.premium)));
  }

  const page = await client
    .select({ key: true, attributes: true, payload: true })
    .where(...filters)
    .limit(options.limit ?? 50)
    .fetch();

  return page.entities.map((entity) => {
    let payload: Record<string, unknown> | undefined;
    try {
      payload = entity.toJson() as Record<string, unknown>;
    } catch {
      payload = undefined;
    }
    return {
      key: entity.key,
      attributes: entity.attributes as Record<
        string,
        { type: string; value: unknown }
      >,
      payload,
    };
  });
}
