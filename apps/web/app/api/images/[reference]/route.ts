import { NextResponse } from "next/server";
import { getConfig } from "@nectar/config";
import { downloadContent } from "@nectar/swarm";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ reference: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { reference } = await context.params;
  const requestedType = new URL(request.url).searchParams.get("contentType");
  const contentType = requestedType?.startsWith("image/")
    ? requestedType
    : "application/octet-stream";

  try {
    const config = getConfig();
    const image = await downloadContent({
      beeUrl: config.swarm.beeUrl,
      reference,
    });

    return new NextResponse(Buffer.from(image), {
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
        "content-type": contentType,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image unavailable";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
