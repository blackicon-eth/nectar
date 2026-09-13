import { z } from "zod";
import { config as loadDotEnv } from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const EnvSchema = z.object({
  TURSO_DATABASE_URL: z.string().optional(),
  TURSO_AUTH_TOKEN: z.string().optional(),
  ARKIV_PRIVATE_KEY: z.string().optional(),
  ARKIV_RPC_URL: z.string().optional(),
  SWARM_BEE_URL: z.string().url().default("https://api.gateway.ethswarm.org"),
  SWARM_ACT_PUBLISHER_KEY: z.string().optional(),
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
  };
  swarm: {
    beeUrl: string;
    actPublisherKey: string | undefined;
  };
}

function findWorkspaceRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    if (existsSync(resolve(dir, "pnpm-workspace.yaml"))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return process.cwd();
}

function loadEnv(): void {
  const root = findWorkspaceRoot();
  for (const name of [".env", ".env.local"]) {
    const file = resolve(root, name);
    if (existsSync(file)) {
      loadDotEnv({ path: file });
    }
  }
}

let cached: AppConfig | undefined;

export function getConfig(): AppConfig {
  if (!cached) {
    loadEnv();
    const parsed = EnvSchema.parse(process.env);
    cached = {
      turso: {
        url: parsed.TURSO_DATABASE_URL,
        authToken: parsed.TURSO_AUTH_TOKEN,
      },
      arkiv: {
        privateKey: parsed.ARKIV_PRIVATE_KEY,
        rpcUrl: parsed.ARKIV_RPC_URL,
      },
      swarm: {
        beeUrl: parsed.SWARM_BEE_URL,
        actPublisherKey: parsed.SWARM_ACT_PUBLISHER_KEY,
      },
    };
  }

  return cached;
}

export function resetConfig(): void {
  cached = undefined;
}
