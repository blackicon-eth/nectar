import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getProfile, saveProfile } from "@/lib/profile";
import { getSession, sessionCookieName } from "@/lib/auth";

export const runtime = "nodejs";

async function session() {
  return getSession((await cookies()).get(sessionCookieName())?.value);
}

export async function GET() {
  const currentSession = await session();
  if (!currentSession) return NextResponse.json({ error: "Sign in to view your profile." }, { status: 401 });
  const profile = await getProfile(currentSession.walletAddress);
  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  try {
    const currentSession = await session();
    if (!currentSession) return NextResponse.json({ error: "Sign in to update your profile." }, { status: 401 });

    const body = (await request.json()) as { displayName?: unknown; avatarData?: unknown };
    const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
    const avatarData = typeof body.avatarData === "string" && body.avatarData ? body.avatarData : null;
    if (displayName.length > 80) return NextResponse.json({ error: "Name must be 80 characters or fewer." }, { status: 400 });
    if (avatarData && (!/^data:image\/(png|jpeg|jpg|webp|gif);base64,/.test(avatarData) || avatarData.length > 2_000_000)) {
      return NextResponse.json({ error: "Profile image must be a supported image smaller than 1.5 MB." }, { status: 400 });
    }

    const profile = await saveProfile(currentSession.walletAddress, {
      displayName: displayName || null,
      avatarData,
    });
    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
