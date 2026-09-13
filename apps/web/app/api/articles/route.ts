import { NextResponse } from "next/server";
import {
  ArticleInputSchema,
  listPublishedArticles,
  publishArticle,
  PublishError,
  type ArticleImage,
} from "@nectar/domain";
import { articleSigningMessage } from "@/lib/articleSigning";
import { recoverMessageAddress } from "viem";
import { cookies } from "next/headers";
import { getSession, sessionCookieName } from "@/lib/auth";
import { getProfiles, getProfile } from "@/lib/profile";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function legacyArticleSigningMessage(input: {
  creatorAddress: string;
  title: string;
  subtitle: string;
  content: string;
  tags: string[];
  premium: boolean;
}): string {
  return `Nectar article publication\n${JSON.stringify({
    creator: "",
    creatorAddress: input.creatorAddress.toLowerCase(),
    title: input.title,
    subtitle: input.subtitle,
    content: input.content,
    tags: input.tags,
    premium: input.premium,
  })}`;
}

function parseSignedArticleMessage(
  message: string,
  fallbackChainId: number,
): { ok: true; fields: SignedFields } | { ok: false; reason: string } {
  const head = "Nectar article publication";
  if (!message.startsWith(head)) {
    return { ok: false, reason: "missing-prefix" };
  }
  const open = message.indexOf("{");
  if (open === -1) {
    return { ok: false, reason: "no-json" };
  }
  let value: Record<string, unknown>;
  try {
    value = JSON.parse(message.slice(open)) as Record<string, unknown>;
  } catch {
    return { ok: false, reason: "invalid-json" };
  }
  if (
    typeof value.title !== "string" ||
    typeof value.subtitle !== "string" ||
    typeof value.content !== "string" ||
    !Array.isArray(value.tags) ||
    !value.tags.every((tag) => typeof tag === "string") ||
    typeof value.premium !== "boolean"
  ) {
    return { ok: false, reason: "field-types" };
  }
  return {
    ok: true,
    fields: {
      chainId: typeof value.chainId === "number" ? value.chainId : fallbackChainId,
      title: value.title,
      subtitle: value.subtitle,
      content: value.content,
      tags: value.tags,
      premium: value.premium,
    },
  };
}

type SignedFields = {
  chainId: number;
  title: string;
  subtitle: string;
  content: string;
  tags: string[];
  premium: boolean;
};

const FUJI_CHAIN_ID = 43113;

export async function POST(request: Request) {
  try {
    const isMultipart = request.headers
      .get("content-type")
      ?.includes("multipart/form-data");
    const form = isMultipart ? await request.formData() : null;
    const body = form
      ? {
          creator: String(form.get("creator") ?? ""),
          creatorAddress: String(form.get("creatorAddress") ?? ""),
          chainId: Number(form.get("chainId") ?? 0),
          signature: String(form.get("signature") ?? ""),
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
    const signedMessage = form
      ? String(form.get("signedMessage") ?? "")
      : typeof body.signedMessage === "string"
        ? body.signedMessage
        : "";
    const submittedChainId = Number(body.chainId ?? 0);
    const signedParse = signedMessage
      ? parseSignedArticleMessage(signedMessage, submittedChainId)
      : null;
    if (signedMessage && !signedParse?.ok) {
      console.error("Invalid signed article message", {
        reason: signedParse?.reason ?? "unknown",
        escaped: JSON.stringify(signedMessage.slice(0, 48)),
      });
      return NextResponse.json(
        {
          error: "Invalid signed article message.",
          reason: signedParse?.reason ?? "unknown",
          preview: signedMessage.slice(0, 160),
          escaped: JSON.stringify(signedMessage.slice(0, 48)),
        },
        { status: 400 },
      );
    }
    const parsed = ArticleInputSchema.safeParse(
      signedParse?.ok ? { ...body, ...signedParse.fields } : body,
    );

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const session = await getSession(
      (await cookies()).get(sessionCookieName())?.value,
    );
    if (
      !session ||
      session.walletAddress !== parsed.data.creatorAddress.toLowerCase() ||
      session.chainId !== FUJI_CHAIN_ID ||
      parsed.data.chainId !== FUJI_CHAIN_ID
    ) {
      return NextResponse.json({ error: "Sign in with this wallet before publishing." }, { status: 401 });
    }

    const expectedAddress = parsed.data.creatorAddress.toLowerCase();
    const signature = parsed.data.signature as `0x${string}`;
    const candidates = [
      ["received", signedMessage],
      ["received-lf", signedMessage.replace(/\r\n/g, "\n")],
      ["reconstructed", articleSigningMessage(parsed.data)],
      ["legacy", legacyArticleSigningMessage(parsed.data)],
    ] as const;
    let matchedFormat: string | undefined;
    const attempts: string[] = [];
    for (const [format, message] of candidates) {
      if (!message) continue;
      try {
        const recovered = await recoverMessageAddress({ message, signature });
        attempts.push(
          `${format}=${recovered.toLowerCase()}(${JSON.stringify(message.slice(0, 40))})`,
        );
        if (recovered.toLowerCase() === expectedAddress) {
          matchedFormat = format;
          break;
        }
      } catch (error) {
        attempts.push(`${format}=error`);
      }
    }
    const validSignature = Boolean(matchedFormat);
    if (!validSignature) {
      console.error("Article signature verification failed", {
        expectedAddress,
        attempts,
      });
    }
    if (!validSignature) {
      return NextResponse.json(
        {
          error: "Article signature does not match the connected wallet.",
          expectedAddress,
          attempts: attempts.join(" | "),
        },
        { status: 401 },
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

    const profile = await getProfile(session.walletAddress);
    const result = await publishArticle(
      {
        ...parsed.data,
        creatorEnsName: profile?.displayName ?? parsed.data.creatorEnsName,
      },
      image,
    );
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
    const profiles = await getProfiles(articles.map((article) => article.creatorAddress));
    return NextResponse.json({
      articles: articles.map((article) => {
        const profile = profiles.get(article.creatorAddress.toLowerCase());
        return {
          ...article,
          profileName: profile?.displayName ?? undefined,
          profileAvatar: profile?.avatarData ?? undefined,
        };
      }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
