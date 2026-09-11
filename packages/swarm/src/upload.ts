import { createBee } from "./client";

export interface UploadContentOptions {
  beeUrl: string;
  postageBatchId: string;
  content: string;
  premium: boolean;
}

export async function uploadContent(
  options: UploadContentOptions,
): Promise<string> {
  const bee = createBee(options.beeUrl);
  const data = new TextEncoder().encode(options.content);

  const result = await bee.uploadData(
    options.postageBatchId,
    data,
    options.premium ? { encrypt: true } : undefined,
  );

  return result.reference;
}

export interface DownloadContentOptions {
  beeUrl: string;
  reference: string;
}

export async function downloadContent(
  options: DownloadContentOptions,
): Promise<Uint8Array> {
  const bee = createBee(options.beeUrl);
  return await bee.downloadData(options.reference);
}
