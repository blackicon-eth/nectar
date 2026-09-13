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
expires: ExpirationTime.atDate(fields.expiresAt);
```

and:

```ts
if (expiresAt.getTime() <= now) return [];
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

Current live subscription evidence is not expired yet because it has a 30-days life cycle:

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

## Known limitations

- The Arkiv endpoint requires an API key and may be rate-limited.
- Article creation also depends on Swarm availability; premium creation additionally
  depends on the ACT publisher key.
- Subscription indexing requires a successful Avalanche Fuji receipt before Arkiv creation.
- No saved natural-expiration before/after recording is available.
