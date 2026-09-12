import { getConfig } from "@nectar/config";
import {
  createArticleEntity,
  type ArticleEntityFields,
} from "@nectar/arkiv";
import { publishActContent, uploadContent } from "@nectar/swarm";
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

  let swarmRef: string;
  let historyRef: string | undefined;
  let publisherPublicKey: string | undefined;

  if (input.premium) {
    if (!config.swarm.actPublisherKey) {
      throw new PublishError(
        "SWARM_ACT_PUBLISHER_KEY is not configured. Set it in .env to publish premium (ACT) articles.",
      );
    }

    const act = await publishActContent({
      beeUrl: config.swarm.beeUrl,
      content: input.content,
      publisherPrivateKey: config.swarm.actPublisherKey,
    });

    swarmRef = act.encryptedReference;
    historyRef = act.historyReference;
    publisherPublicKey = act.publisherPubKey;
  } else {
    const upload = await uploadContent({
      beeUrl: config.swarm.beeUrl,
      content: input.content,
      premium: false,
    });
    swarmRef = upload.reference;
  }

  const fields: ArticleEntityFields = {
    creator: input.creator,
    creatorEnsName: input.creatorEnsName,
    contributor: input.contributor,
    title: input.title,
    excerpt: input.excerpt,
    tags: input.tags,
    premium: input.premium,
    actProtected: input.premium,
    swarmRef,
    historyRef,
    publisherPublicKey,
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
    actProtected: input.premium,
    swarmRef,
    historyReference: historyRef,
    publisherPublicKey,
    arkivEntityKey: entity.entityKey,
    arkivTxHash: entity.txHash,
    publishedAt: fields.publishedAt.toISOString(),
  };
}
