export interface SwarmUploadResult {
  // Full reference: 64 hex for public content, 128 hex for encrypted content.
  reference: string;
  // Content address only (first 64 hex). For premium this is the ciphertext
  // address (no decryption key), safe to store in public metadata.
  contentReference: string;
}

export interface UploadContentOptions {
  beeUrl: string;
  content: string | Uint8Array;
  contentType?: string;
  premium: boolean;
}

async function assertOk(res: Response, action: string): Promise<void> {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Swarm ${action} failed (${res.status}): ${body}`);
  }
}

export async function uploadContent(
  options: UploadContentOptions,
): Promise<SwarmUploadResult> {
  const headers: Record<string, string> = {
    "content-type": options.contentType ?? "text/plain",
  };
  if (options.premium) {
    headers["swarm-encrypt"] = "true";
  }

  const res = await fetch(`${options.beeUrl}/bytes`, {
    method: "POST",
    headers,
    body: options.content as any,
  });
  await assertOk(res, "upload");

  const body = (await res.json()) as { reference: string };
  const reference = body.reference;

  return {
    reference,
    contentReference: reference.slice(0, 64),
  };
}

export interface DownloadContentOptions {
  beeUrl: string;
  reference: string;
}

export async function downloadContent(
  options: DownloadContentOptions,
): Promise<Uint8Array> {
  const res = await fetch(`${options.beeUrl}/bytes/${options.reference}`);
  await assertOk(res, "download");
  return new Uint8Array(await res.arrayBuffer());
}
