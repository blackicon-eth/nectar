import { eq } from "drizzle-orm";
import { getDb } from "./client";
import { cache } from "./schema";

const premiumKey = (contentReference: string): string =>
  `premium:${contentReference}`;

export async function setPremiumReference(
  url: string,
  authToken: string | undefined,
  contentReference: string,
  fullReference: string,
): Promise<void> {
  const db = getDb(url, authToken);
  await db
    .insert(cache)
    .values({ key: premiumKey(contentReference), value: fullReference })
    .onConflictDoUpdate({
      target: cache.key,
      set: { value: fullReference },
    });
}

export async function getPremiumReference(
  url: string,
  authToken: string | undefined,
  contentReference: string,
): Promise<string | undefined> {
  const db = getDb(url, authToken);
  const rows = await db
    .select()
    .from(cache)
    .where(eq(cache.key, premiumKey(contentReference)))
    .limit(1);
  return rows[0]?.value ?? undefined;
}
