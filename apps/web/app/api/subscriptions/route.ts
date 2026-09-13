import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { avalancheFuji } from "viem/chains";
import { createPublicClient, http, parseEventLogs } from "viem";
import { getConfig } from "@nectar/config";
import { countActiveSubscribers, createSubscriptionEntity, listActiveSubscriptions } from "@nectar/arkiv";
import { getSession, sessionCookieName } from "@/lib/auth";
import { SUBSCRIPTIONS_ADDRESS } from "@/lib/subscriptions";

export const runtime = "nodejs";

const subscriptionEventsAbi = [
  {
    type: "event",
    name: "SubscriptionPaid",
    inputs: [
      { indexed: true, name: "subscriber", type: "address" },
      { indexed: true, name: "creator", type: "address" },
      { indexed: false, name: "expiresAt", type: "uint256" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
  },
] as const;

const fujiClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(
    process.env.NEXT_PUBLIC_FUJI_RPC_URL ??
      "https://api.avax-test.network/ext/bc/C/rpc",
  ),
});

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { transactionHash?: string };
    const transactionHash = body.transactionHash;
    if (!transactionHash || !/^0x[0-9a-fA-F]{64}$/.test(transactionHash)) {
      return NextResponse.json({ error: "Invalid transaction hash." }, { status: 400 });
    }

    const session = await getSession(
      (await cookies()).get(sessionCookieName())?.value,
    );
    if (!session) {
      return NextResponse.json({ error: "Sign in before subscribing." }, { status: 401 });
    }

    const receipt = await fujiClient.getTransactionReceipt({
      hash: transactionHash as `0x${string}`,
    });
    if (receipt.status !== "success" || receipt.to?.toLowerCase() !== SUBSCRIPTIONS_ADDRESS.toLowerCase()) {
      return NextResponse.json({ error: "Subscription transaction was not successful." }, { status: 400 });
    }

    const [event] = parseEventLogs({
      abi: subscriptionEventsAbi,
      eventName: "SubscriptionPaid",
      logs: receipt.logs,
    });
    if (!event) {
      return NextResponse.json({ error: "Subscription payment event was not found." }, { status: 400 });
    }

    const { subscriber, creator, expiresAt, amount } = event.args;
    if (subscriber.toLowerCase() !== session.walletAddress.toLowerCase()) {
      return NextResponse.json({ error: "Payment wallet does not match the signed-in wallet." }, { status: 403 });
    }

    const config = getConfig();
    if (!config.arkiv.privateKey) {
      return NextResponse.json({ error: "Arkiv indexing is not configured." }, { status: 503 });
    }

    const entity = await createSubscriptionEntity(
      {
        subscriber,
        creator,
        expiresAt: new Date(Number(expiresAt) * 1000),
        paymentTxHash: transactionHash,
        amount,
      },
      {
        privateKey: config.arkiv.privateKey,
        rpcUrl: config.arkiv.rpcUrl,
      },
    );

    return NextResponse.json({
      indexed: true,
      entityKey: entity.entityKey,
      expiresAt: new Date(Number(expiresAt) * 1000).toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to index subscription.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession(
      (await cookies()).get(sessionCookieName())?.value,
    );
    if (!session) {
      return NextResponse.json({ error: "Sign in to view your subscriptions." }, { status: 401 });
    }

    const creator = new URL(request.url).searchParams.get("creator");
    if (creator) {
      if (!/^0x[0-9a-fA-F]{40}$/.test(creator)) {
        return NextResponse.json({ error: "Invalid creator address." }, { status: 400 });
      }
      const config = getConfig();
      const subscriberCount = await countActiveSubscribers(creator, { rpcUrl: config.arkiv.rpcUrl });
      return NextResponse.json({ subscriberCount });
    }

    const config = getConfig();
    const subscriptions = await listActiveSubscriptions(session.walletAddress, {
      rpcUrl: config.arkiv.rpcUrl,
    });

    return NextResponse.json({
      subscriptions: subscriptions.map(({ key, creator, expiresAt }) => ({
        key,
        creator,
        expiresAt: expiresAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Unable to load subscriptions", error);
    const message = error instanceof Error ? error.message : "Unable to load subscriptions.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
