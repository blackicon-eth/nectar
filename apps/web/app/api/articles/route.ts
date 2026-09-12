import { NextResponse } from "next/server";
import {
  ArticleInputSchema,
  listPublishedArticles,
  publishArticle,
  PublishError,
  type ArticleImage,
} from "@nectar/domain";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const isMultipart = request.headers
      .get("content-type")
      ?.includes("multipart/form-data");
    const form = isMultipart ? await request.formData() : null;
    const body = form
      ? {
          creator: String(form.get("creator") ?? ""),
          title: String(form.get("title") ?? ""),
          subtitle: String(form.get("subtitle") ?? ""),
          content: String(form.get("content") ?? ""),
          tags: String(form.get("tags") ?? "[]"),
          premium: String(form.get("premium") ?? "false") === "true",
        }
      : await request.json();
    if (form) {
      body.tags = JSON.parse(body.tags);
    }
    const parsed = ArticleInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    let image: ArticleImage | undefined;
    const imageEntry = form?.get("image");
    if (imageEntry instanceof File && imageEntry.size > 0) {
      if (!imageEntry.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Cover image must be an image file." },
          { status: 400 },
        );
      }
      if (imageEntry.size > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { error: "Cover image must be smaller than 5 MB." },
          { status: 400 },
        );
      }
      image = {
        data: new Uint8Array(await imageEntry.arrayBuffer()),
        contentType: imageEntry.type,
      };
    }

    const result = await publishArticle(parsed.data, image);
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
