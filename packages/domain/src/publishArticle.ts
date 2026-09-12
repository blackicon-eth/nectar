import { getConfig } from "@nectar/config";
import {
  createArticleEntity,
  type ArticleEntityFields,
} from "@nectar/arkiv";
import { setPremiumReference } from "@nectar/db";
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

  const upload = await uploadContent({
    beeUrl: config.swarm.beeUrl,
    content: input.content,
    premium: input.premium,
  });

  if (input.premium && (!config.turso.url || !config.turso.authToken)) {
    throw new PublishError(
      "Premium articles require Turso (TURSO_DATABASE_URL / TURSO_AUTH_TOKEN) to store the content decryption key.",
    );
  }

  if (input.premium) {
    await setPremiumReference(
      config.turso.url!,
      config.turso.authToken,
      upload.contentReference,
      upload.reference,
    );
  }

  const fields: ArticleEntityFields = {
    creator: input.creator,
    creatorEnsName: input.creatorEnsName,
    contributor: input.contributor,
    title: input.title,
    excerpt: input.excerpt,
    tags: input.tags,
    premium: input.premium,
    swarmRef: upload.contentReference,
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
    swarmRef: upload.contentReference,
    premiumReference: input.premium ? upload.reference : undefined,
    arkivEntityKey: entity.entityKey,
    arkivTxHash: entity.txHash,
    publishedAt: fields.publishedAt.toISOString(),
  };
}
