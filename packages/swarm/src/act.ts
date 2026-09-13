import { downloadContent, uploadContent } from "./upload";

// @snaha/swarm-id bundles a browser-oriented HTTP client that reads `self`
// (falling back to `window`) at import time. Shim `self` in Node runtimes
// before the dynamic imports below resolve the module.
const nodeGlobals = globalThis as unknown as Record<string, unknown>;
if (typeof nodeGlobals.self === "undefined") {
  nodeGlobals.self = globalThis;
}

export interface ActPublishResult {
  encryptedReference: string;
  historyReference: string;
  granteeListReference: string;
  publisherPubKey: string;
  actReference: string;
}

export interface PublishActContentOptions {
  beeUrl: string;
  content: string;
  publisherPrivateKey: string;
  granteePublicKeys?: string[];
}

/**
 * Publish premium content as an ACT-protected upload.
 *
 * 1. Uploads the content encrypted (swarm-encrypt) to obtain the encrypted
 *    content reference.
 * 2. Wraps that reference in an ACT (Access Control Transaction) so only
 *    grantees (and the publisher) can recover the reference and decrypt.
 */
export async function publishActContent(
  options: PublishActContentOptions,
): Promise<ActPublishResult> {
  const {
    createActForContent,
    hexToUint8Array,
    parseCompressedPublicKey,
    publicKeyFromPrivate,
  } = await import("@snaha/swarm-id");

  const upload = await uploadContent({
    beeUrl: options.beeUrl,
    content: options.content,
    premium: true,
  });

  const target = { mode: "subsidised" as const, gatewayUrl: options.beeUrl };
  const publisherPrivateKey = hexToUint8Array(options.publisherPrivateKey);
  const contentReference = hexToUint8Array(upload.reference);
  const publisherPublicKey = publicKeyFromPrivate(publisherPrivateKey);
  const granteePublicKeys = [
    publisherPublicKey,
    ...(options.granteePublicKeys ?? []).map((key) =>
      parseCompressedPublicKey(key),
    ),
  ];

  return createActForContent(
    target,
    contentReference,
    publisherPrivateKey,
    granteePublicKeys,
  );
}

export interface DownloadActContentOptions {
  beeUrl: string;
  encryptedReference: string;
  historyReference: string;
  publisherPublicKey: string;
  readerPrivateKeys: string[];
}

/**
 * Resolve and download ACT-protected premium content.
 *
 * The reader must hold a private key the ACT names (a grantee, or the
 * publisher itself). Returns the decrypted article bytes.
 */
export async function downloadActContent(
  options: DownloadActContentOptions,
): Promise<Uint8Array> {
  const { Bee } = await import("@ethersphere/bee-js");
  const { decryptActReference, hexToUint8Array } = await import(
    "@snaha/swarm-id"
  );

  const bee = new Bee(options.beeUrl);

  const contentReference = await decryptActReference(
    bee,
    options.encryptedReference,
    options.historyReference,
    options.publisherPublicKey,
    options.readerPrivateKeys.map((key) => hexToUint8Array(key)),
  );

  return downloadContent({ beeUrl: options.beeUrl, reference: contentReference });
}
