<p align="center">
  <img src="apps/web/public/logo.png" alt="Nectar" width="180">
  <p align="center">A creator-first publishing platform for public and premium writing.</p>
</p>

---

Nectar lets creators publish articles, store canonical content on decentralized storage, index publication metadata, and monetize premium work through stablecoin subscriptions.

## Tech Stack

- **Frontend and API:** Next.js App Router, React, TypeScript
- **Authentication:** Wallet-based SIWE
- **Content storage:** Swarm
- **Queryable metadata:** Arkiv Tiramisu testnet
- **Payments:** Avalanche Fuji, USDC, Foundry smart contracts
- **Application data:** Turso and Drizzle
- **Monorepo:** pnpm workspaces and Turborepo

## Sponsor Technologies

Nectar uses three sponsor technologies as core parts of the product:

| Sponsor                                | How Nectar uses it                                                             | Implementation                             |
| -------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------ |
| [Arkiv](#arkiv)                        | Queryable article and subscription metadata, including expiring access records | [`packages/arkiv`](packages/arkiv)         |
| [Swarm](#swarm)                        | Canonical public content and encrypted premium content                         | [`packages/swarm`](packages/swarm)         |
| [Team1 / Avalanche](#team1--avalanche) | Fuji USDC subscriptions with an on-chain 90/10 creator/platform split          | [`packages/contracts`](packages/contracts) |

### Arkiv

Arkiv stores the metadata Nectar needs to discover articles and verify subscription access. Articles use typed attributes for creator, publication, premium status, and tags. Subscription entities include expiration timestamps, allowing access to expire naturally through Arkiv queries.

Implementation:

- [`packages/arkiv/src/articles.ts`](packages/arkiv/src/articles.ts)
- [`packages/arkiv/src/subscriptions.ts`](packages/arkiv/src/subscriptions.ts)
- [`apps/web/app/api/articles/route.ts`](apps/web/app/api/articles/route.ts)
- [`apps/web/app/api/subscriptions/route.ts`](apps/web/app/api/subscriptions/route.ts)

### Swarm

Swarm is Nectar's canonical content layer. Public articles are uploaded to Swarm and retrieved by content reference. Premium articles use encrypted Swarm content, while Arkiv stores the metadata needed to discover and gate them.

Implementation:

- [`packages/swarm`](packages/swarm)
- [`packages/domain/src/publishArticle.ts`](packages/domain/src/publishArticle.ts)
- [`packages/domain/src/getArticleContent.ts`](packages/domain/src/getArticleContent.ts)
- [`apps/web/app/api/images/[reference]/route.ts`](apps/web/app/api/images/%5Breference%5D/route.ts)

### Team1 / Avalanche

Nectar uses Avalanche Fuji to process creator subscriptions with USDC. The smart contract splits subscription revenue between the creator and Nectar, and the web application verifies the transaction before indexing the subscription in Arkiv.

Deployed Fuji contract: [`0x57d208210336D6b372A521c3662fe2ca49B7F25c`](https://testnet.snowtrace.io/address/0x57d208210336D6b372A521c3662fe2ca49B7F25c)

Implementation:

- [`packages/contracts/src/NectarSubscriptions.sol`](packages/contracts/src/NectarSubscriptions.sol)
- [`packages/contracts/test/NectarSubscriptions.t.sol`](packages/contracts/test/NectarSubscriptions.t.sol)
- [`apps/web/components/SubscriptionModal.tsx`](apps/web/components/SubscriptionModal.tsx)
- [`apps/web/app/api/subscriptions/route.ts`](apps/web/app/api/subscriptions/route.ts)

## Project Structure

```text
apps/web/             Next.js frontend and API routes
packages/arkiv/       Arkiv client and metadata queries
packages/contracts/   Foundry subscription contract
packages/db/          Turso and Drizzle schemas
packages/domain/      Publishing and article operations
packages/swarm/       Swarm upload and retrieval helpers
```

## Getting Started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Run checks with:

```bash
pnpm typecheck
pnpm build
```

## License

This project is licensed under the [MIT License](LICENSE).

## Author

Built by [Blackicon](https://www.github.com/blackicon-eth) at **ETHRome 2026**.
