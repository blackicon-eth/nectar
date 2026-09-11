import { z } from "zod";

const EnvSchema = z.object({
  TURSO_DATABASE_URL: z.string().optional(),
  TURSO_AUTH_TOKEN: z.string().optional(),
  ARKIV_PRIVATE_KEY: z.string().optional(),
  ARKIV_RPC_URL: z.string().optional(),
  ARKIV_ARTICLE_TTL_DAYS: z.coerce.number().int().positive().default(90),
  SWARM_BEE_URL: z.string().url().default("http://localhost:1633"),
  SWARM_BEE_DEBUG_URL: z.string().url().default("http://localhost:1635"),
  SWARM_POSTAGE_BATCH_ID: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export interface AppConfig {
  turso: {
    url: string | undefined;
    authToken: string | undefined;
  };
  arkiv: {
    privateKey: string | undefined;
    rpcUrl: string | undefined;
    articleTtlDays: number;
  };
  swarm: {
    beeUrl: string;
    beeDebugUrl: string;
    postageBatchId: string | undefined;
  };
}

let cached: AppConfig | undefined;

export function getConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  if (cached) {
    return cached;
  }

  const parsed = EnvSchema.parse(env);

  cached = {
    turso: {
      url: parsed.TURSO_DATABASE_URL,
      authToken: parsed.TURSO_AUTH_TOKEN,
    },
    arkiv: {
      privateKey: parsed.ARKIV_PRIVATE_KEY,
      rpcUrl: parsed.ARKIV_RPC_URL,
      articleTtlDays: parsed.ARKIV_ARTICLE_TTL_DAYS,
    },
    swarm: {
      beeUrl: parsed.SWARM_BEE_URL,
      beeDebugUrl: parsed.SWARM_BEE_DEBUG_URL,
      postageBatchId: parsed.SWARM_POSTAGE_BATCH_ID,
    },
  };

  return cached;
}

export function resetConfig(): void {
  cached = undefined;
}
