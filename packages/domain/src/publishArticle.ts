import { getConfig } from "@nectar/config";
import {
  createArticleEntity,
  type ArticleEntityFields,
} from "@nectar/arkiv";
import { publishActContent, uploadContent } from "@nectar/swarm";
import {
  ArticleInputSchema,
  excerptFromContent,
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

export interface ArticleImage {
  data: Uint8Array;
  contentType: string;
}

export async function publishArticle(
  rawInput: ArticleInput,
  image?: ArticleImage,
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
  let imageRef: string | undefined;
  let imageContentType: string | undefined;

  if (image) {
    const uploadedImage = await uploadContent({
      beeUrl: config.swarm.beeUrl,
      content: image.data,
      contentType: image.contentType,
      premium: false,
    });
    imageRef = uploadedImage.reference;
    imageContentType = image.contentType;
  }

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
      contentType: "text/plain",
      premium: false,
    });
    swarmRef = upload.reference;
  }

  const fields: ArticleEntityFields = {
    creator: input.creator || input.creatorAddress,
    creatorAddress: input.creatorAddress,
    signature: input.signature,
    creatorEnsName: input.creatorEnsName,
    contributor: input.contributor,
    title: input.title,
    subtitle: input.subtitle,
    excerpt: excerptFromContent(input.content),
    tags: input.tags,
    premium: input.premium,
    swarmRef,
    historyRef,
    publisherPublicKey,
    imageRef,
    imageContentType,
    contentLength: input.content.length,
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
    historyReference: historyRef,
    publisherPublicKey,
    arkivEntityKey: entity.entityKey,
    arkivTxHash: entity.txHash,
    publishedAt: fields.publishedAt.toISOString(),
  };
}
