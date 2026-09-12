import { getConfig } from "@nectar/config";
import { downloadActContent, downloadContent } from "@nectar/swarm";

export class ContentUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentUnavailableError";
  }
}

export interface GetArticleContentOptions {
  // The reference stored in Arkiv metadata. Public: plain content address
  // (64 hex). Premium: the ACT-encrypted reference (128 hex).
  reference: string;
  premium: boolean;
  // ACT fields, required when premium.
  historyReference?: string;
  publisherPublicKey?: string;
}

/**
 * Fetch and decrypt (for premium) article content from Swarm.
 *
 * Public: reference is the plain content address.
 * Premium: reference is the ACT-encrypted reference; Nectar resolves it with
 * the publisher key (SWARM_ACT_PUBLISHER_KEY) and downloads the content.
 *
 * NOTE: premium access control is enforced by the caller via the Arkiv
 * subscription entity (subscriber -> creator -> expiration). This function
 * only performs the Swarm retrieval.
 */
export async function getArticleContent(
  options: GetArticleContentOptions,
): Promise<string> {
  const config = getConfig();

  if (options.premium) {
    if (!config.swarm.actPublisherKey) {
      throw new ContentUnavailableError(
        "SWARM_ACT_PUBLISHER_KEY is not configured; cannot decrypt premium content.",
      );
    }
    if (!options.historyReference || !options.publisherPublicKey) {
      throw new ContentUnavailableError(
        "Premium content is missing its ACT references.",
      );
    }

    const data = await downloadActContent({
      beeUrl: config.swarm.beeUrl,
      encryptedReference: options.reference,
      historyReference: options.historyReference,
      publisherPublicKey: options.publisherPublicKey,
      readerPrivateKeys: [config.swarm.actPublisherKey],
    });

    return new TextDecoder().decode(data);
  }

  const data = await downloadContent({
    beeUrl: config.swarm.beeUrl,
    reference: options.reference,
  });

  return new TextDecoder().decode(data);
}
