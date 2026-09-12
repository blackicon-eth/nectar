import { z } from "zod";

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
  creator: z.string().min(1).max(64),
  creatorEnsName: z.string().max(255).optional(),
  contributor: z.string().max(64).optional(),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional().default(""),
  content: z.string().min(1),
  tags: z.array(z.string().min(1).max(50)).max(10).default([]),
  premium: z.boolean().default(false),
});

export type ArticleInput = z.infer<typeof ArticleInputSchema>;

export interface PublishResult {
  title: string;
  premium: boolean;
  actProtected: boolean;
  swarmRef: string;
  historyReference?: string;
  publisherPublicKey?: string;
  arkivEntityKey: string;
  arkivTxHash: string;
  publishedAt: string;
}
