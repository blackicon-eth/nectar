import { NextResponse } from "next/server";
import { SiweMessage } from "siwe";
import { consumeAuthNonce, createSession, sessionCookieName } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      signature?: string;
    };
    if (!body.message || !body.signature) {
      return NextResponse.json({ error: "Missing sign-in message or signature." }, { status: 400 });
    }

    const message = new SiweMessage(body.message);
    const domain =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") ?? "https";
    const valid = await message.verify({
      signature: body.signature,
      domain: domain ?? undefined,
      nonce: message.nonce,
      time: new Date().toISOString(),
    });
    if (!valid.success || !domain || message.uri !== `${protocol}://${domain}`) {
      return NextResponse.json({ error: "Invalid sign-in signature." }, { status: 401 });
    }

    const consumed = await consumeAuthNonce(
      message.nonce,
      message.address,
      message.chainId,
    );
    if (!consumed) {
      return NextResponse.json({ error: "Sign-in request expired or was already used." }, { status: 401 });
    }

    const session = await createSession(message.address, message.chainId);
    const response = NextResponse.json({
      authenticated: true,
      address: message.address,
      expiresAt: session.expiresAt.toISOString(),
    });
    response.cookies.set(sessionCookieName(), session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: session.expiresAt,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid sign-in request." }, { status: 401 });
  }
}
