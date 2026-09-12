import { getConfig } from "@nectar/config";
import { getPremiumReference } from "@nectar/db";
import { downloadContent } from "@nectar/swarm";

export class ContentUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentUnavailableError";
  }
}

export interface GetArticleContentOptions {
  // The 64-hex content/ciphertext reference stored in Arkiv metadata.
  reference: string;
  premium: boolean;
}

/**
 * Fetch and decrypt (for premium) article content from Swarm.
 *
 * Public: reference is the plain content address.
 * Premium: the reference is the ciphertext address; the full 128-hex
 * reference (which carries the decryption key) is fetched from Turso.
 *
 * NOTE: premium access control is enforced by the caller via the Arkiv
 * subscription entity (subscriber -> creator -> expiration). This function
 * only performs the Swarm retrieval.
 */
export async function getArticleContent(
  options: GetArticleContentOptions,
): Promise<string> {
  const config = getConfig();

  let reference = options.reference;

  if (options.premium) {
    if (!config.turso.url || !config.turso.authToken) {
      throw new ContentUnavailableError(
        "Turso is not configured; cannot resolve premium content.",
      );
    }
    const fullReference = await getPremiumReference(
      config.turso.url,
      config.turso.authToken,
      options.reference,
    );
    if (!fullReference) {
      throw new ContentUnavailableError("Premium content reference not found.");
    }
    reference = fullReference;
  }

  const data = await downloadContent({
    beeUrl: config.swarm.beeUrl,
    reference,
  });

  return new TextDecoder().decode(data);
}
