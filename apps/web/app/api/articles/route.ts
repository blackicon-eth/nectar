import { NextResponse } from "next/server";
import {
  ArticleInputSchema,
  listPublishedArticles,
  publishArticle,
  PublishError,
} from "@nectar/domain";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ArticleInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await publishArticle(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof PublishError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const message =
      error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const articles = await listPublishedArticles();
    return NextResponse.json({ articles });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
