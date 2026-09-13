# Arkiv Mission Evidence

Repository commit: `29ae17c` (`Use libsql web client for serverless build`)

Nectar uses Arkiv Tiramisu for public article and subscription metadata. Swarm stores
article bytes, and Avalanche Fuji is the payment source of truth. The complete schema
and source-of-truth boundaries are documented in [`schema.md`](./schema.md).

## Reproduce the Arkiv read path

1. Install dependencies and configure the application:

   ```sh
   pnpm install
   cp .env.example .env.local
   ```

2. Set these values in `.env.local`:

   ```text
   ARKIV_RPC_URL=https://rpc.tiramisu.db-chain.testnet.arkiv.network/<your-api-key>
   ```

   Article reads require `ARKIV_RPC_URL`. Article writes additionally require
   `ARKIV_PRIVATE_KEY`; premium writes require `SWARM_ACT_PUBLISHER_KEY`.

3. Start the web app and query the article feed:

   ```sh
   pnpm dev
   curl -s http://localhost:3000/api/articles
   ```

   The API route calls `listPublishedArticles()`, which calls the Arkiv query in
   `packages/arkiv/src/articles.ts`.

Exact read-path files:

- [`apps/web/app/api/articles/route.ts`](../apps/web/app/api/articles/route.ts)
- [`packages/domain/src/listArticles.ts`](../packages/domain/src/listArticles.ts)
- [`packages/arkiv/src/articles.ts`](../packages/arkiv/src/articles.ts)
- [`packages/arkiv/src/client.ts`](../packages/arkiv/src/client.ts)

The query is scoped by `project = "nectar"` and `type = "article"`. The response
contains Arkiv entity keys, typed attributes, and decoded payload metadata.

## Mission: Decommission

**Status: partial evidence only.** The current article discovery/read path is Arkiv-backed,
but the repository does not contain a separate pre-migration implementation. The initial
commit `5a3e38f` already used `@nectar/arkiv` from `packages/domain/src/listArticles.ts`,
so it cannot honestly be presented as a before-Arkiv migration snapshot.

Current implementation:

- Current read path: [`apps/web/app/api/articles/route.ts`](../apps/web/app/api/articles/route.ts)
- Arkiv query adapter: [`packages/domain/src/listArticles.ts`](../packages/domain/src/listArticles.ts)
- Entity query: [`packages/arkiv/src/articles.ts`](../packages/arkiv/src/articles.ts)
- Initial repository reference: [`5a3e38f`](https://github.com/blackicon-eth/nectar/tree/5a3e38f)

To inspect the historical/current difference:

```sh
git show 5a3e38f:packages/domain/src/listArticles.ts
git show 29ae17c:packages/domain/src/listArticles.ts
git diff 5a3e38f..29ae17c -- packages/domain/src/listArticles.ts apps/web/app/api/articles/route.ts packages/arkiv
```

Live Tiramisu article evidence was recorded separately with entity keys and creation
transactions. Representative records:

```text
0xe2ea6171ad190339936e78d8bb47bf2c39d1b07a1c7589555222ff7a6d0fe042
creation tx 0x0d5b716b8cc89d0f826b9cc4ff8cd989d186886ebd5fd0540aa97caf2626aca3
creator 0x55a458f46e319F99e4983c70B179b316507F0d86

0xad6c190fa1648cf29ae5c1848f2a1b14f64b0a9ce81c4d70e53421234340d588
creation tx 0x6cb873a2f2274294191dd96970f8043ff0f5300854466f9f8a5b649f1d9ac69f
creator 0xf2E19F606a775c02D785d4c2f4b7BCbb2Dfc21F2
```

## Mission: Built to expire

**Status: implemented in the production path; natural-expiration replay is not currently
saved as a fixture.**

Subscription entities are created with a real expiration date and no delete call:

- Creation: [`packages/arkiv/src/subscriptions.ts`](../packages/arkiv/src/subscriptions.ts)
- Active-access query: [`packages/arkiv/src/subscriptions.ts`](../packages/arkiv/src/subscriptions.ts)
- Premium read gate: [`apps/web/app/api/articles/%5Breference%5D/route.ts`](../apps/web/app/api/articles/%5Breference%5D/route.ts)
- Subscription indexing after Fuji receipt verification: [`apps/web/app/api/subscriptions/route.ts`](../apps/web/app/api/subscriptions/route.ts)
- Lifecycle explanation: [`friction.md`](./friction.md)

The important lines are:

```ts
expires: ExpirationTime.atDate(fields.expiresAt)
```

and:

```ts
if (expiresAt.getTime() <= now) return []
```

The read path therefore changes from accessible to inaccessible when Arkiv stops returning
the expired entity; the app never calls `deleteEntity`.

Reproduce the code path with a real Fuji subscription:

```sh
pnpm dev
curl -s http://localhost:3000/api/subscriptions \
  -H 'content-type: application/json' \
  --data '{"transactionHash":"<verified-fuji-payment-tx>"}'
```

The UI flow that produces the verified payment is in
[`apps/web/components/SubscriptionModal.tsx`](../apps/web/components/SubscriptionModal.tsx).
The deployed Fuji registry is documented in the root
[`README.md`](../README.md).

Current live subscription evidence is not expired yet:

```text
Arkiv entity 0x154ded3273f41c5543f8d38e3aef8b9979636ab932a6349c436e1ebfb81db782
Arkiv creation tx 0x2979dada0613d14b5c46b0220e9caa324e96ecd4c2e00c89dc92e65a5cfa6c26
creator 0x55a458f46e319F99e4983c70B179b316507F0d86
expires 2026-10-13

Arkiv entity 0x881f077ae81a44d010d6d2663cdbce090a35959e87a4f6fb2cff7c6d3830dc40
Arkiv creation tx 0xcf9fd14eba90163bcaff7196ed00bcff9742fa8843a2ec2fa80e17a755bb8361
creator 0xf2E19F606a775c02D785d4c2f4b7BCbb2Dfc21F2
expires 2026-10-13
```

The corresponding saved Fuji payment receipts are recorded in the entities as
`payment_tx_hash`. No expired entity receipt or before/after natural-expiration recording
is checked into this repository, so judges should treat the live records as active-state
evidence, not as an already-completed expiry replay.

## Mission: Live wire

**Status: not implemented.** Nectar's current Arkiv client uses HTTP transport through
Viem's `http()` transport:

- [`packages/arkiv/src/client.ts`](../packages/arkiv/src/client.ts)
- [`packages/arkiv/src/articles.ts`](../packages/arkiv/src/articles.ts)
- [`packages/arkiv/src/subscriptions.ts`](../packages/arkiv/src/subscriptions.ts)

There is no application WebSocket client, subscription listener, two-client update demo,
or reconnection implementation in the repository. The `watchEntityEvents` API from the
SDK is not used by Nectar. This mission should not be claimed from the current codebase.

## Video timestamps

No video file or timestamp manifest is committed in this repository. Video timestamps are
therefore intentionally not fabricated here. Before submission, add exact `MM:SS` links for
any recorded demo, or state that no video was provided.

## Known limitations

- The Arkiv endpoint requires an API key and may be rate-limited.
- Article creation also depends on Swarm availability; premium creation additionally
  depends on the ACT publisher key.
- Subscription indexing requires a successful Avalanche Fuji receipt before Arkiv creation.
- No pre-Arkiv migration commit is available in git history.
- No saved natural-expiration before/after recording is available.
- No WebSocket/live-update implementation is available.
