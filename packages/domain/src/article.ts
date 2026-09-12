import { z } from "zod";

export const MIN_ARTICLE_CHARS = 1000;

export const ArticleStatus = {
  draft: "draft",
  pending_review: "pending_review",
  rejected: "rejected",
  approved: "approved",
  publishing: "publishing",
  published: "published",
} as const;

export type ArticleStatus = (typeof ArticleStatus)[keyof typeof ArticleStatus];

export const ArticleInputSchema = z.object({
  creator: z.string().max(255).optional().default(""),
  creatorAddress: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  signature: z.string().regex(/^0x[0-9a-fA-F]{130}$/),
  creatorEnsName: z.string().max(255).optional(),
  contributor: z.string().max(64).optional(),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(500).optional().default(""),
  content: z.string().min(MIN_ARTICLE_CHARS),
  imageRef: z.string().max(255).optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).default([]),
  premium: z.boolean().default(false),
});

export type ArticleInput = z.infer<typeof ArticleInputSchema>;

export function excerptFromContent(content: string, maxLength = 240): string {
  const excerpt = content.replace(/\s+/g, " ").trim();
  if (excerpt.length <= maxLength) return excerpt;
  return `${excerpt.slice(0, maxLength - 1).trimEnd()}…`;
}

export interface PublishResult {
  title: string;
  premium: boolean;
  swarmRef: string;
  historyReference?: string;
  publisherPublicKey?: string;
  arkivEntityKey: string;
  arkivTxHash: string;
  publishedAt: string;
}
