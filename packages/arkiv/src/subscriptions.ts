import { ExpirationTime, jsonToPayload } from "@arkiv-network/sdk";
import { str, u64 } from "@arkiv-network/sdk/attr";
import { eq } from "@arkiv-network/sdk/query";
import { createArkivPublicClient, createArkivWalletClient } from "./client";

export interface SubscriptionEntityFields {
  subscriber: string;
  creator: string;
  expiresAt: Date;
  paymentTxHash: string;
  amount: bigint;
}

export interface CreateSubscriptionOptions {
  privateKey: string;
  rpcUrl?: string;
}

export async function createSubscriptionEntity(
  fields: SubscriptionEntityFields,
  options: CreateSubscriptionOptions,
): Promise<{ entityKey: string; txHash: string }> {
  const wallet = createArkivWalletClient(options.privateKey, options.rpcUrl);
  const result = await wallet.createEntity({
    payload: jsonToPayload({
      subscriber: fields.subscriber,
      creator: fields.creator,
      expiresAt: fields.expiresAt.toISOString(),
      paymentTxHash: fields.paymentTxHash,
      amount: fields.amount.toString(),
    }),
    contentType: "application/json",
    attributes: {
      project: str("nectar"),
      type: str("subscription"),
      subscriber: str(fields.subscriber.toLowerCase()),
      creator: str(fields.creator.toLowerCase()),
      expires_at_ms: u64(BigInt(fields.expiresAt.getTime())),
      payment_tx_hash: str(fields.paymentTxHash),
      amount: u64(fields.amount),
    },
    expires: ExpirationTime.atDate(fields.expiresAt),
  });

  return { entityKey: result.entityKey, txHash: result.txHash };
}

export async function hasActiveSubscription(
  subscriber: string,
  creator: string,
  options: { rpcUrl?: string } = {},
): Promise<boolean> {
  const client = createArkivPublicClient(options.rpcUrl);
  const page = await client
    .select({ key: true, attributes: true })
    .where(
      eq("project", str("nectar")),
      eq("type", str("subscription")),
      eq("subscriber", str(subscriber.toLowerCase())),
      eq("creator", str(creator.toLowerCase())),
    )
    .limit(50)
    .fetch();

  const now = BigInt(Date.now());
  return page.entities.some((entity) => {
    const value = entity.attributes.expires_at_ms?.value;
    return (typeof value === "bigint" ? value : BigInt(String(value ?? 0))) > now;
  });
}
