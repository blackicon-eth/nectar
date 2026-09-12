import { NextResponse } from "next/server";
import { getAddress } from "viem";
import { SiweMessage, generateNonce } from "siwe";
import { createAuthNonce } from "@/lib/auth";

export const runtime = "nodejs";

function requestOrigin(request: Request): { domain: string; uri: string } {
  const domain =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    new URL(request.url).host;
  const protocol = request.headers.get("x-forwarded-proto") ?? "https";
  return { domain, uri: `${protocol}://${domain}` };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      address?: string;
      chainId?: number;
    };
    if (!body.address || !/^0x[0-9a-fA-F]{40}$/.test(body.address)) {
      return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
    }
    if (!Number.isInteger(body.chainId)) {
      return NextResponse.json({ error: "Invalid chain ID." }, { status: 400 });
    }

    const address = getAddress(body.address as `0x${string}`);
    const { nonce, expiresAt } = await createAuthNonce(address, body.chainId!);
    const { domain, uri } = requestOrigin(request);
    const message = new SiweMessage({
      domain,
      address,
      statement: "Sign in to Nectar to publish and manage your writing.",
      uri,
      version: "1",
      chainId: body.chainId,
      nonce: nonce || generateNonce(),
      issuedAt: new Date().toISOString(),
      expirationTime: expiresAt.toISOString(),
    });

    return NextResponse.json({ message: message.prepareMessage() });
  } catch {
    return NextResponse.json({ error: "Unable to create sign-in request." }, { status: 500 });
  }
}
