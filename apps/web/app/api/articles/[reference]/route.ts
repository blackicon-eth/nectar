import { NextResponse } from "next/server";
import {
  getArticleContent,
  ContentUnavailableError,
  listPublishedArticles,
} from "@nectar/domain";
import { hasActiveSubscription } from "@nectar/arkiv";
import { getConfig } from "@nectar/config";
import { cookies } from "next/headers";
import { getSession, sessionCookieName } from "@/lib/auth";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ reference: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { reference } = await context.params;
  const url = new URL(request.url);
  const premium = url.searchParams.get("premium") === "true";
  const historyReference = url.searchParams.get("historyRef") ?? undefined;
  const publisherPublicKey =
    url.searchParams.get("publisherKey") ?? undefined;

  try {
    if (premium) {
      const article = (await listPublishedArticles()).find(
        (item) => item.swarmRef === reference,
      );
      const session = await getSession(
        (await cookies()).get(sessionCookieName())?.value,
      );

      const isCreator = Boolean(
        article &&
          session &&
          session.walletAddress.toLowerCase() ===
            article.creatorAddress.toLowerCase(),
      );
      const hasSubscription =
        article && session && !isCreator
          ? await hasActiveSubscription(
              session.walletAddress,
              article.creatorAddress,
              { rpcUrl: getConfig().arkiv.rpcUrl },
            )
          : false;

      if (!article || !session || (!isCreator && !hasSubscription)) {
        return NextResponse.json(
          { error: "Premium access is not active for this wallet." },
          { status: 403 },
        );
      }
    }

    const content = await getArticleContent({
      reference,
      premium,
      historyReference,
      publisherPublicKey,
    });
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
