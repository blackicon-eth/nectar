# Nectar Arkiv Schema

Arkiv is Nectar's public, queryable metadata layer. Canonical article bytes live on Swarm, and subscription/payment state originates on Avalanche Fuji. Arkiv stores the records needed for discovery and access checks.

## Common Attributes

Every Nectar entity includes:

| Attribute | Type | Purpose |
| --- | --- | --- |
| `project` | `string` | Namespace for Nectar records. Always `nectar`. |
| `type` | `string` | Entity type: `article` or `subscription`. |

Queries always include both attributes so article and subscription records remain isolated:

```ts
eq("project", str("nectar")),
eq("type", str("article"))
```

## Article Entity

Article entities are permanent. Swarm stores the canonical article content; Arkiv stores the discoverable metadata and its content references.

### Queryable Attributes

| Attribute | Type | Purpose |
| --- | --- | --- |
| `creator` | `string` | Creator identifier used for publication filtering. |
| `creator_address` | `string` | Wallet address that owns the publication. |
| `chain_id` | `u64` | Chain used for the signed publication. |
| `title` | `string` | Article title. |
| `premium` | `bool` | Whether the article requires subscription access. |
| `tags` | `string` | Comma-separated article tags. |
| `swarm_ref` | `string` | Swarm content reference. |
| `history_ref` | `string` | Swarm ACT history reference when applicable. |
| `publisher_public_key` | `string` | Public key associated with encrypted content. |
| `image_ref` | `string` | Optional Swarm cover image reference. |
| `image_content_type` | `string` | Optional cover image MIME type. |
| `content_length` | `u64` | Article content length in characters. |
| `status` | `string` | Publication status, currently `published`. |
| `published_at_ms` | `u64` | Publication timestamp in milliseconds. |

### Payload

The JSON payload contains the full article metadata used to render cards and reader pages:

```json
{
  "title": "...",
  "subtitle": "...",
  "excerpt": "...",
  "tags": ["Culture", "Technology"],
  "creator": "...",
  "creatorAddress": "0x...",
  "chainId": 43113,
  "signature": "0x...",
  "creatorEnsName": "...",
  "contributor": "0x...",
  "premium": false,
  "swarmRef": "...",
  "historyRef": "...",
  "publisherPublicKey": "...",
  "imageRef": "...",
  "imageContentType": "image/jpeg",
  "contentLength": 1234,
  "status": "published",
  "publishedAt": "2026-09-13T00:00:00.000Z"
}
```

The payload is for rendering and recovery. Query filters use attributes, not payload fields.

### Article Queries

List public and premium articles:

```ts
where(
  eq("project", str("nectar")),
  eq("type", str("article")),
)
```

List articles for one creator:

```ts
where(
  eq("project", str("nectar")),
  eq("type", str("article")),
  eq("creator", str(creator)),
)
```

List premium articles:

```ts
where(
  eq("project", str("nectar")),
  eq("type", str("article")),
  eq("premium", bool(true)),
)
```

## Subscription Entity

Subscription entities represent a completed Fuji payment and are created after the subscription transaction receipt is verified. Their Arkiv lifetime is the subscription lifetime, so expired entities disappear from active queries without a delete job.

### Queryable Attributes

| Attribute | Type | Purpose |
| --- | --- | --- |
| `subscriber` | `string` | Lowercase subscriber wallet address. |
| `creator` | `string` | Lowercase creator wallet address. |
| `expires_at_ms` | `u64` | Subscription expiration timestamp. |
| `payment_tx_hash` | `string` | Fuji payment transaction hash. |
| `amount` | `u64` | Subscription amount in USDC base units. |

### Payload

```json
{
  "subscriber": "0x...",
  "creator": "0x...",
  "expiresAt": "2026-10-13T00:00:00.000Z",
  "paymentTxHash": "0x...",
  "amount": "1000000"
}
```

### Subscription Queries

Check whether a subscriber has access to a creator:

```ts
where(
  eq("project", str("nectar")),
  eq("type", str("subscription")),
  eq("subscriber", str(subscriber.toLowerCase())),
  eq("creator", str(creator.toLowerCase())),
)
```

The application then checks `expires_at_ms > Date.now()`.

List a reader's active subscriptions:

```ts
where(
  eq("project", str("nectar")),
  eq("type", str("subscription")),
  eq("subscriber", str(subscriber.toLowerCase())),
)
```

The response is filtered by expiration before it is shown to the reader.

## Source-of-Truth Boundaries

| Data | Source of truth |
| --- | --- |
| Article bytes | Swarm |
| Article discovery metadata | Arkiv |
| Subscription payment | Avalanche Fuji |
| Subscription access index | Arkiv, derived from the verified Fuji receipt |
| Creator profile metadata | Turso |

Arkiv is public and not a confidentiality layer. Secrets must not be stored in entity attributes or payloads. Encrypted content should remain unreadable without the appropriate Swarm access grant.

## Implementation

- Article entities: [`packages/arkiv/src/articles.ts`](../packages/arkiv/src/articles.ts)
- Subscription entities: [`packages/arkiv/src/subscriptions.ts`](../packages/arkiv/src/subscriptions.ts)
- Article publication: [`packages/domain/src/publishArticle.ts`](../packages/domain/src/publishArticle.ts)
- Article API: [`apps/web/app/api/articles/route.ts`](../apps/web/app/api/articles/route.ts)
- Subscription API: [`apps/web/app/api/subscriptions/route.ts`](../apps/web/app/api/subscriptions/route.ts)
