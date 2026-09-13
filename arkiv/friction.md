# Arkiv Friction Log

Short and honest: Arkiv was smooth to build on. We used the TypeScript SDK (`@arkiv-network/sdk`, 0.8.x) on Tiramisu, and it took very little effort to get entities written and queried.

---

## What worked well

- The `llms.txt` entry point gave us the links we needed for AI-assisted integration. We went from zero to writing/querying entities without digging through scattered docs.
- Typed attributes vs payload was easy to reason about once we understood the split.
- The viem-style client API (`createPublicClient` / `createWalletClient`) felt familiar and was fast to pick up.
- `ExpirationTime.permanent()` and `atDate()` made the article/subscription lifetime distinction trivial to express.

---

## One point of friction: expiry vs deletion

It was not immediately clear that an entity's expiration date does **not** delete the entity from Arkiv — it removes it from query results and indexing, while the entity still exists and can be renewed.

That distinction matters for how an app should behave:

- If expiry meant destruction, we'd treat a missing entity as "data is gone forever."
- Because it means de-indexing, we treat "not returned by a query" as the signal, while the record remains recoverable through the archival layer.

The one trap this creates is that an expired entity is **not renewable**: `getEntity()` throws and every write is rejected once the expiry block passes, so you must extend the lifetime *before* expiry, not after.

This is a docs/clarity issue more than a bug — a one-line callout ("expiring an entity de-indexes it; it is not destroyed, but it also cannot be extended once expired") would have removed the ambiguity on the first read.

**Suggestion:** state the delete-vs-deindex distinction explicitly in the entity lifecycle docs, ideally next to the expiration examples.

---

## Evidence

- [`packages/arkiv/src/articles.ts`](../packages/arkiv/src/articles.ts) — permanent article entities
- [`packages/arkiv/src/subscriptions.ts`](../packages/arkiv/src/subscriptions.ts) — expiring subscription entities
