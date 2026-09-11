# Nectar

Creator-first publishing platform. Creators pay a fee for an ENSv2 subdomain
under `nectar.eth`, publish articles through an editorial workflow, monetize
premium content through Avalanche Fuji subscriptions, store canonical content
on Swarm, and keep queryable article/subscription metadata on Arkiv.

This repo is the ETHRome 2026 hackathon MVP.

## Stack

| Concern | Technology |
| --- | --- |
| Frontend + API | Next.js (App Router) |
| Auth (planned) | Privy |
| Canonical content | Swarm (public + ACT-encrypted premium) |
| Queryable metadata | Arkiv (Tiramisu testnet) |
| Payments / subscriptions | Avalanche Fuji (Foundry) — Track A |
| Identity / namespace | ENSv2 (Sepolia) |
| Operational state / cache | Turso + Drizzle |
| Monorepo | pnpm workspaces + Turborepo |

## Structure

```
nectar/
├── apps/
│   └── web/             # Next.js frontend + API routes
├── packages/
│   ├── config/          # env config (zod)
│   ├── domain/          # business types + operations (publishArticle)
│   ├── arkiv/           # Arkiv SDK wrapper (article entities, queries)
│   ├── swarm/           # bee-js wrapper (public + encrypted upload)
│   └── db/              # Turso + Drizzle schema (workflow/cache/jobs)
├── packages/contracts/  # (planned) Foundry contracts for Fuji
└── apps/worker/         # (planned) relayer/jobs
```

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in the values below
pnpm dev                     # runs apps/web at http://localhost:3000
```

### Required environment

- `ARKIV_PRIVATE_KEY` — the wallet that signs Arkiv entity writes (server-side
  only). Get test GLM from https://hub.arkiv.network/faucet.
- `SWARM_POSTAGE_BATCH_ID` — a postage batch id. During the event, Swarm hands
  out gift codes that cover storage for the weekend.
- `SWARM_BEE_URL` — a Bee node API. Default `http://localhost:1633`.

`TURSO_*` is optional for this vertical slice and becomes required once the
editorial workflow and cache land.

### Checks

```bash
pnpm typecheck
pnpm build
```

## Current vertical slice

`POST /api/articles` takes an article (title, excerpt, content, tags, premium
flag) and:

1. uploads the content to Swarm (encrypted when `premium` is set);
2. writes an Arkiv entity with the article metadata + Swarm reference.

`GET /api/articles` reads published article metadata back from Arkiv.

The premium path uses Swarm's encrypted upload (a 128-character reference that
bundles the content address with the decryption key). Full ACT grantee-list
management (grant/revoke on subscription events) lands with the Avalanche
subscription flow in a later phase.

## Roadmap

- Phase 2 — Privy auth, creator creation fee, ENSv2 subdomain creation.
- Phase 3 — contributor workflow (draft → review → approve/reject).
- Phase 7 — Avalanche Fuji subscription contract (90/10 split), ACT grant/revoke,
  expiry reconciliation.
- Phase 8 — creator export/recovery from Arkiv + Swarm references.
