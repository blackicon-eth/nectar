import { ExpirationTime, jsonToPayload } from "@arkiv-network/sdk";
import { bool, str, u64 } from "@arkiv-network/sdk/attr";
import { eq } from "@arkiv-network/sdk/query";
import { createArkivWalletClient, createArkivPublicClient } from "./client";

export interface ArticleEntityFields {
  creator: string;
  creatorAddress: string;
  chainId: number;
  signature: string;
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
  imageContentType?: string;
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

export interface PatchArticleFields {
  payload?: Record<string, unknown>;
  creator?: string;
  creatorAddress?: string;
  signature?: string;
  creatorEnsName?: string;
  contributor?: string;
  title?: string;
  subtitle?: string;
  excerpt?: string;
  tags?: string[];
  premium?: boolean;
  swarmRef?: string;
  historyRef?: string;
  publisherPublicKey?: string;
  imageRef?: string;
  imageContentType?: string;
  contentLength?: number;
  status?: string;
  publishedAt?: Date;
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
      creatorAddress: fields.creatorAddress,
      chainId: fields.chainId,
      signature: fields.signature,
      creatorEnsName: fields.creatorEnsName,
      contributor: fields.contributor,
      premium: fields.premium,
      swarmRef: fields.swarmRef,
      historyRef: fields.historyRef,
      publisherPublicKey: fields.publisherPublicKey,
      imageRef: fields.imageRef,
      imageContentType: fields.imageContentType,
      contentLength: fields.contentLength,
      status: fields.status,
      publishedAt: fields.publishedAt.toISOString(),
    }),
    contentType: "application/json",
    attributes: {
      project: str("nectar"),
      type: str("article"),
      creator: str(fields.creator),
      creator_address: str(fields.creatorAddress),
      chain_id: u64(BigInt(fields.chainId)),
      title: str(fields.title),
      image_ref: str(fields.imageRef ?? ""),
      image_content_type: str(fields.imageContentType ?? ""),
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

export async function patchArticleEntity(
  entityKey: string,
  fields: PatchArticleFields,
  options: CreateArticleOptions,
): Promise<{ entityKey: string; txHash: string }> {
  const wallet = createArkivWalletClient(options.privateKey, options.rpcUrl);
  const set: Record<string, string | boolean | bigint> = {};

  if (fields.creator !== undefined) set.creator = fields.creator;
  if (fields.creatorAddress !== undefined) {
    set.creator_address = fields.creatorAddress;
  }
  if (fields.creatorEnsName !== undefined) {
    set.creatorEnsName = fields.creatorEnsName;
  }
  if (fields.contributor !== undefined) set.contributor = fields.contributor;
  if (fields.title !== undefined) set.title = fields.title;
  if (fields.subtitle !== undefined) set.subtitle = fields.subtitle;
  if (fields.excerpt !== undefined) set.excerpt = fields.excerpt;
  if (fields.tags !== undefined) set.tags = fields.tags.join(",");
  if (fields.premium !== undefined) set.premium = fields.premium;
  if (fields.swarmRef !== undefined) set.swarm_ref = fields.swarmRef;
  if (fields.historyRef !== undefined) set.history_ref = fields.historyRef;
  if (fields.publisherPublicKey !== undefined) {
    set.publisher_public_key = fields.publisherPublicKey;
  }
  if (fields.imageRef !== undefined) set.image_ref = fields.imageRef;
  if (fields.imageContentType !== undefined) {
    set.image_content_type = fields.imageContentType;
  }
  if (fields.contentLength !== undefined) {
    set.content_length = BigInt(fields.contentLength);
  }
  if (fields.status !== undefined) set.status = fields.status;
  if (fields.publishedAt !== undefined) {
    set.published_at_ms = BigInt(fields.publishedAt.getTime());
  }

  const result = await wallet.patchEntity({
    entityKey: entityKey as `0x${string}`,
    set,
    ...(fields.payload
      ? {
          payload: jsonToPayload(fields.payload),
          contentType: "application/json",
        }
      : {}),
  });

  return {
    entityKey: result.entityKey,
    txHash: result.txHash,
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
