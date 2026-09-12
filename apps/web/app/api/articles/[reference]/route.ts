import { NextResponse } from "next/server";
import {
  getArticleContent,
  ContentUnavailableError,
} from "@nectar/domain";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ reference: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { reference } = await context.params;
  const url = new URL(request.url);
  const premium = url.searchParams.get("premium") === "true";

  try {
    const content = await getArticleContent({ reference, premium });
    return new NextResponse(content, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    if (error instanceof ContentUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    const message =
      error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
