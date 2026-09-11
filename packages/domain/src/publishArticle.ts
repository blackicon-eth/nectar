import { getConfig } from "@nectar/config";
import {
  createArticleEntity,
  type ArticleEntityFields,
} from "@nectar/arkiv";
import { uploadContent } from "@nectar/swarm";
import {
  ArticleInputSchema,
  type ArticleInput,
  type PublishResult,
} from "./article";

export class PublishError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "PublishError";
  }
}

export async function publishArticle(
  rawInput: ArticleInput,
): Promise<PublishResult> {
  const input = ArticleInputSchema.parse(rawInput);
  const config = getConfig();

  if (!config.arkiv.privateKey) {
    throw new PublishError(
      "ARKIV_PRIVATE_KEY is not configured. Set it in .env to write article metadata.",
    );
  }
  if (!config.swarm.postageBatchId) {
    throw new PublishError(
      "SWARM_POSTAGE_BATCH_ID is not configured. Set it in .env to store article content.",
    );
  }

  const swarmRef = await uploadContent({
    beeUrl: config.swarm.beeUrl,
    postageBatchId: config.swarm.postageBatchId,
    content: input.content,
    premium: input.premium,
  });

  const fields: ArticleEntityFields = {
    creator: input.creator,
    creatorEnsName: input.creatorEnsName,
    contributor: input.contributor,
    title: input.title,
    excerpt: input.excerpt,
    tags: input.tags,
    premium: input.premium,
    swarmRef,
    status: "published",
    publishedAt: new Date(),
  };

  const entity = await createArticleEntity(fields, {
    privateKey: config.arkiv.privateKey,
    rpcUrl: config.arkiv.rpcUrl,
    ttlDays: config.arkiv.articleTtlDays,
  });

  return {
    title: input.title,
    premium: input.premium,
    swarmRef,
    arkivEntityKey: entity.entityKey,
    arkivTxHash: entity.txHash,
    publishedAt: fields.publishedAt.toISOString(),
  };
}
