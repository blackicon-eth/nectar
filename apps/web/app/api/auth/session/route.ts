import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession, revokeSession, sessionCookieName } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const token = (await cookies()).get(sessionCookieName())?.value;
  const session = await getSession(token);
  return NextResponse.json({
    authenticated: Boolean(session),
    address: session?.walletAddress ?? null,
    chainId: session?.chainId ?? null,
  });
}

export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName())?.value;
  await revokeSession(token);
  const response = NextResponse.json({ authenticated: false });
  response.cookies.delete(sessionCookieName());
  return response;
}
