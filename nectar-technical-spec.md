# Nectar — Technical Implementation Specification
## ETHRome 2026 Hackathon MVP

---

## 0. Purpose

Nectar is a creator-first publishing platform.

Creators pay a creation fee to obtain a personal namespace/subdomain under `nectar.eth`, publish articles through an editorial workflow, monetize premium content through Avalanche Fuji subscriptions, store canonical content on Swarm, and store queryable article/subscription metadata on Arkiv.

The implementation must optimize for:

- a working end-to-end hackathon demo;
- real integration with ENSv2, Avalanche Fuji, Arkiv, and Swarm;
- simple UX;
- clear separation between operational state and decentralized sources of truth;
- minimal architectural overengineering.

> Do not add unnecessary decentralization layers merely for ideological reasons.

---

## 1. Product Model

Nectar is a network of creator publications.

A creator:

1. connects a wallet and signs in with SIWE;
2. pays a creation fee;
3. Nectar creates an ENSv2 subdomain under `nectar.eth`;
4. can manage contributors;
5. can review contributor submissions;
6. can publish public or premium articles;
7. receives 90% of subscription revenue.

Nectar receives 10% of subscription revenue.

**Example:**

```
nectar.eth
└── pippo.nectar.eth
```

The creator does not need to understand or directly operate ENS. Nectar's backend/relayer manages the ENSv2 transaction.

The ENS name is useful as creator identity and branding. The backend must be able to resolve/retrieve the creator ENS name and store it in Arkiv metadata.

---

## 2. User Roles

### 2.1 Visitor / Reader

Can:

- browse creators;
- search/filter articles;
- view creator pages;
- read public articles;
- see previews of premium articles;
- subscribe to creators;
- manage subscriptions from a dashboard.

### 2.2 Creator

Can:

- create a publication by paying the creation fee;
- manage their publication;
- create and remove contributors;
- review contributor submissions;
- approve/reject submissions;
- publish public/premium articles;
- edit already-published articles;
- export publication metadata and Swarm references.

### 2.3 Contributor

A contributor belongs to a creator publication.

Can:

- create drafts;
- submit drafts for review;
- see submission status;
- revise rejected submissions.

Cannot publish directly.

> The product/UI should call these users **contributors**, not "subordinates".

---

## 3. MVP Scope

The core MVP flow:

```
Creator / Contributor
        |
        v
   Article form
        |
        v
Turso submission state
        |
        v
Contributor submits
        |
        v
   Creator reviews
   |             |
 reject        approve
   |             |
 rejected    publishArticle()
                 |
          +------+------+
          |             |
          v             v
        Swarm         Arkiv
       content       metadata
```

The MVP must demonstrate:

- creator creation;
- contributor management;
- contributor submission;
- creator approval/rejection;
- public article publication to Swarm;
- premium article publication using Swarm ACT;
- article metadata creation in Arkiv;
- article discovery from Arkiv;
- article serving through Nectar;
- cache through Turso;
- creator export/recovery information.

Subscription and access control are part of the broader MVP/demo path and should be implemented sufficiently to demonstrate premium access.

---

## 4. High-Level Architecture

```
                              NECTAR
                                |
                 +--------------+--------------+
                 |                             |
                 v                             v
             Next.js                         Worker
               Web                      Relayer / Jobs
                 |                             |
                 +--------------+--------------+
                                |
        +-----------+-----------+-----------+-----------+
        |           |                       |           |
        v           v                       v           v
      Turso      Avalanche                Arkiv       Swarm
     + Drizzle     Fuji                    DB       Storage
        |           |                       |           |
        |           |                       |      +----+----+
        |           |                       |      |         |
        |           |                       |    Public    ACT
        |           |                       |   content   premium
        |           |                       |
        |           +--> subscriptions -----+
        |
        +--> drafts/submissions/cache/jobs

                              |
                              v
                            ENSv2
                          Sepolia
```

- ENSv2 is primarily used for creator identity/namespace.
- Avalanche Fuji is the source of truth for payment/subscription state.
- Arkiv is a queryable metadata/index layer.
- Swarm is the canonical content storage layer.
- Turso is operational application state and cache, **not** the canonical source of publication content.

---

## 5. Source-of-Truth Rules

| Data | Source of truth |
|---|---|
| Creator ENS identity / namespace | ENSv2 |
| Creation/payment transactions | Avalanche Fuji |
| Subscription/payment state | Avalanche Fuji |
| Article metadata/index | Arkiv |
| Canonical article content | Swarm |
| Contributor workflow | Turso |
| Drafts | Turso |
| Application cache | Turso |
| Background job state | Turso |

Arkiv and Swarm must not depend on Turso for long-term recoverability of published content.

Turso is allowed to cache published content for UX/performance.

---

## 6. Frontend

Use **Next.js**.

### Authentication

Use wallet-based **Sign-In with Ethereum (SIWE)** for authentication. The server
must issue a nonce, verify the signed message, bind the session to the wallet
address and chain ID, and use an HTTP-only session cookie for subsequent API
requests.

Users should be guided through wallet connection and signing without exposing
authentication implementation details in normal UX.

### Discovery

Users can:

- search creators;
- search articles;
- filter articles;
- browse their feed;
- open creator pages.

Article discovery should be driven by Arkiv queries where possible.

### Creator page

**Example:**

```
pippo.nectar.eth

[featured articles]

Search this publication...

Article A
Article B
Article C
```

The page should expose highlighted articles and filtering/search functionality.

### Reader article page

**Public article**
- fetch metadata from Arkiv;
- retrieve content through Nectar;
- display complete content.

**Premium article without active subscription**
- retrieve title/excerpt/preview from Arkiv;
- display only the preview;
- show subscription/payment CTA.

**Premium article with active subscription**
- verify active subscription;
- retrieve/decrypt/serve the content.

### Creator dashboard

Creator can:

- see publication information;
- manage contributors;
- review submissions;
- approve/reject;
- create/edit their own articles;
- see publication status;
- export publication records.

### Contributor dashboard

Contributor can:

- create drafts;
- submit drafts;
- see status;
- revise rejected submissions.

### Subscription dashboard

Users can see:

- creators they subscribe to;
- premium access;
- expiration dates.

---

## 7. Contributor Workflow

Turso owns workflow state.

**Suggested state machine:**

```
draft
  |
  v
pending_review
  |
  +----> rejected
  |          |
  |          v
  |        draft
  |
  v
approved
  |
  v
publishing
  |
  v
published
```

A rejection must not publish anything to Swarm or Arkiv as a published article.

Approval must invoke one domain-level operation:

```
publishArticle(submissionId)
```

That operation is responsible for:

- validating creator approval;
- reading submission data;
- publishing content to Swarm;
- obtaining the Swarm reference;
- creating/updating Arkiv metadata;
- updating Turso status/cache;
- recording job/result state.

Publishing must be idempotent or safely retryable.

---

## 8. Article Model

Articles are either:

- public
- premium

There are no subscription tiers.

**Suggested fields:**

- `id`
- `creatorId`
- `contributorId`
- `title`
- `excerpt`
- `content`
- `tags[]`
- `premium`
- `status`
- `swarmRef`
- `arkivEntityId`
- `publishedAt`
- `updatedAt`

For published articles:

- public content is stored normally on Swarm;
- premium content is encrypted and managed through Swarm ACT.

When an article is edited:

- upload the new version to Swarm;
- update the Arkiv entity's `swarmRef`;
- update Turso metadata/cache;
- do not implement version history for the hackathon.

---

## 9. Swarm Integration

Swarm is the canonical storage system for published article content.

### Public content

```
article content
      |
      v
Swarm upload
      |
      v
   swarmRef
```

### Premium content

Premium content must use **Swarm ACT**.

Conceptually:

```
article
  |
  v
encrypt
  |
  v
Swarm + ACT
  |
  v
swarmRef
```

Nectar manages the access list.

The user should not need to operate a Bee node.

The backend can retrieve content from Swarm and cache it for normal UX.

### Important ACT limitation

ACT revocation is not retroactive.

If a subscriber has already obtained a readable version/reference of premium content, Nectar cannot make that already-retrieved content disappear from the subscriber's possession or from their own Bee/storage environment.

Therefore the security model is:

> ACT controls access to the current protected content/access state; it does not provide retroactive deletion of content already retrieved by a user.

Do not attempt to build an unnecessarily complicated cryptographic system to pretend this limitation does not exist.

---

## 10. Subscription Flow

There are no tiers.

A creator has one premium subscription.

A subscription contains at minimum:

- subscriber
- creator
- expiration

**Suggested flow:**

```
Alice
  |
  | pay subscription
  v
Avalanche Fuji smart contract
  |
  | SubscriptionPaid event
  v
Nectar worker/relayer
  |
  +--> Arkiv subscription entity
  |
  +--> Swarm ACT grant
```

**When the subscription expires:**

```
expiration
    |
    v
background job
    |
    v
ACT revoke
```

The worker must support reconciliation on restart. It must not assume that a scheduled job always executed successfully.

The Avalanche contract remains the authoritative source for whether a payment/subscription occurred.

Arkiv provides a queryable/indexed representation of active subscriptions.

---

## 11. Smart Contract

Network: **Avalanche Fuji testnet**.

Implement with **Foundry/Solidity**.

The contract must:

- receive subscription payments;
- receive creator/publication creation payments if desired by the implementation;
- route subscription revenue according to policy;
- send 90% to creator;
- send 10% to Nectar;
- emit subscription events;
- expose enough state/events for the relayer to reconstruct subscription state.

**Suggested event:**

```solidity
event SubscriptionPaid(
    address indexed subscriber,
    address indexed creator,
    uint256 expiresAt
);
```

The product may also include the creator ENS name in application metadata, but the contract should prefer stable blockchain identifiers such as addresses rather than relying on ENS strings as primary identifiers.

The backend resolves the creator's ENSv2 name and writes it into Arkiv.

**Creation fee:**

- 100% goes to Nectar;
- after payment, the relayer creates the creator's ENSv2 subdomain.

Exact fee amount should be configurable.

---

## 12. ENSv2

Use official ENSv2 beta contracts on **Sepolia**.

Nectar owns/controls the `nectar.eth` namespace.

**After successful creator creation payment:**

```
payment confirmed
      |
      v
Nectar relayer
      |
      v
ENSv2 transaction
      |
      v
<creator>.nectar.eth
```

ENSv2 must perform real work and be part of the actual product flow.

Do not hard-code ENS names in application logic.

The creator's ENS name should be retrieved/resolved by the backend and associated with their publication metadata in Arkiv.

Do not make normal editorial operations depend on an ENS transaction. ENS is for identity/namespace, not for every article or subscription operation.

---

## 13. Arkiv

Arkiv is the queryable metadata/index layer.

Two primary entity categories are required.

### Article entity

**Suggested fields:**

- `creator`
- `creatorEnsName`
- `contributor`
- `title`
- `excerpt`
- `tags`
- `premium`
- `swarmRef`
- `publishedAt`
- `status`

Only published articles should be exposed through the public article index.

Arkiv queries should be as type-safe and structured as the SDK/API allows.

**Required query capabilities:**

- all articles by creator;
- articles by creator + tag;
- latest articles;
- public/premium filtering;
- creator discovery;
- publication search.

### Subscription entity

**Suggested fields:**

- `subscriber`
- `creator`
- `creatorEnsName`
- `expiration`

The entity must represent the relationship:

```
subscriber -> creator -> expiration
```

Arkiv expiration should be used where appropriate.

The subscription entity is an indexed representation, not the authoritative payment source.

---

## 14. Creator Export / Recovery

A creator must be able to export their publication records.

**Frontend action:**

```
Export my publications
```

The backend queries Arkiv for all publication entities belonging to the creator and generates a file such as JSON.

**Example:**

```json
{
  "creator": "pippo.nectar.eth",
  "exportedAt": "2026-09-12T00:00:00Z",
  "publications": [
    {
      "title": "Example",
      "excerpt": "Example excerpt",
      "premium": true,
      "publishedAt": "...",
      "swarmReference": "...",
      "arkivEntityId": "..."
    }
  ]
}
```

The goal is to make the creator able to reconstruct their publication archive independently of Nectar's operational database.

**Conceptual recovery:**

```
Arkiv
  |
  | query creator's publications
  v
swarmRef list
  |
  v
Swarm
  |
  v
canonical content
```

Nectar must not claim that recovery is necessarily free or that Swarm removes all operational/cost barriers. The guarantee is that the publication is not solely trapped inside Nectar's application database.

---

## 15. Turso + Drizzle

Use **Turso** as the application database.

Use **Drizzle ORM**.

**Suggested package:**

```
packages/db/
├── src/
│   ├── schema/
│   │   ├── creators.ts
│   │   ├── contributors.ts
│   │   ├── submissions.ts
│   │   ├── articles.ts
│   │   ├── cache.ts
│   │   └── jobs.ts
│   ├── client.ts
│   └── index.ts
├── drizzle.config.ts
└── package.json
```

### Suggested tables

**creators**
- `id`
- `walletAddress`
- `ensName`
- `ensNode` / relevant ENS identifier
- `createdAt`

**contributors**
- `id`
- `creatorId`
- `walletAddress`
- `displayName`
- `status`
- `createdAt`

**submissions**
- `id`
- `creatorId`
- `contributorId`
- `title`
- `excerpt`
- `content`
- `tags`
- `premium`
- `status`
- `rejectionReason`
- `createdAt`
- `updatedAt`
- `publishedAt`

**articles**
- `id`
- `creatorId`
- `contributorId`
- `title`
- `excerpt`
- `premium`
- `swarmRef`
- `arkivEntityId`
- `publishedAt`
- `updatedAt`

> Do not store the permanent canonical article as a replacement for Swarm. This table is an application index/reference.

**cache**

Can store:

- public article content;
- metadata;
- retrieved Swarm objects;
- timestamps/TTL.

Premium caching must be designed carefully so that it does not accidentally become an uncontrolled permanent plaintext copy.

**jobs**

Required for reliable background work:

- `id`
- `type`
- `payload`
- `status`
- `attempts`
- `runAt`
- `lastError`
- `createdAt`
- `updatedAt`

Use jobs/retries for:

- ENS registration;
- Avalanche event processing;
- Arkiv writes;
- Swarm uploads;
- ACT grants/revokes;
- reconciliation.

---

## 16. Backend / Worker Responsibilities

The backend/worker is the main orchestrator.

### Creator creation
- receive/verify successful creation payment;
- create ENSv2 subdomain;
- persist creator mapping;
- expose creator publication.

### Subscription event processing
- listen for Avalanche contract events;
- validate event;
- resolve creator ENS;
- write subscription entity to Arkiv;
- update Swarm ACT access;
- record job state.

### Article publication
- receive approved submission;
- publish content to Swarm;
- obtain swarmRef;
- create/update Arkiv article entity;
- update Turso article state/cache;
- mark submission/article as published.

### Article retrieval
- query article metadata;
- determine public/premium;
- for premium, verify active subscription;
- serve cached content when safe;
- otherwise retrieve from Swarm;
- cache appropriate content;
- return response.

### Expiration
- detect expired subscriptions;
- revoke current ACT access;
- record completion;
- reconcile missed jobs after restart.

### Editing
- validate creator/contributor permissions;
- create new Swarm content;
- update Arkiv swarmRef;
- update Turso;
- invalidate/update cache.

### Export
- query Arkiv for creator publications;
- generate JSON export;
- include metadata and Swarm references;
- return file to creator.

---

## 17. Worker Separation

The implementation may use multiple worker processes later, but initially keep the architecture simple.

**Suggested deployment:**

```
apps/web
    |
    | HTTP/API
    v
apps/worker
    |
    +--> Avalanche listener
    +--> ENS jobs
    +--> Arkiv jobs
    +--> Swarm jobs
    +--> ACT jobs
    +--> reconciliation/scheduler
```

The codebase should separate domain modules even if deployed as one worker.

---

## 18. Monorepo

Use **pnpm workspaces** and **Turborepo**.

**Suggested structure:**

```
nectar/
├── apps/
│   ├── web/
│   └── worker/
│
├── packages/
│   ├── db/
│   ├── domain/
│   ├── arkiv/
│   ├── swarm/
│   ├── ens/
│   ├── chain/
│   ├── contracts/
│   └── config/
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

- `packages/domain` should contain business-level types and operations independent of UI.
- `packages/db` owns Drizzle schema/client.
- `packages/contracts` contains Foundry code and deployment scripts.

---

## 19. API / Domain Operations

At minimum expose domain operations equivalent to:

```
createCreator()
createContributor()
removeContributor()

createSubmission()
submitSubmission()
approveSubmission()
rejectSubmission()

publishArticle()

updateArticle()

getArticle()
searchArticles()
getCreator()
getCreatorArticles()

subscribe()
getSubscriptions()

exportCreatorPublications()
```

Keep blockchain/Swarm/Arkiv implementation details out of React components.

---

## 20. Security and Trust Boundaries

Do not expose:

- private keys;
- ENS relayer key;
- contract admin keys;
- Swarm credentials;
- Arkiv signing credentials.

User authentication and article provenance messages are signed by the user's
wallet and verified server-side. Relayer, Arkiv, Swarm, and contract
transactions must be signed server-side in the worker/backend.

The verified SIWE wallet address and server-side session must be mapped to a
stable application creator/contributor identity.

**Validate ownership before:**

- managing contributors;
- approving submissions;
- editing articles;
- exporting publication data.

The creator is authoritative over their publication workflow.

Contributor access is scoped to their assigned creator.

Do not rely solely on frontend permission checks.

---

## 21. Caching Strategy

The cache exists for UX/performance.

**Public:**

```
Swarm
  ↓
Nectar worker/API
  ↓
Turso cache
  ↓
reader
```

**Premium:**

```
Swarm/ACT
  ↓
access validation
  ↓
retrieve/decrypt
  ↓
serve
```

Do not make the cache the canonical source of truth.

When a new Swarm reference is written for an edited article, invalidate the previous cache.

---

## 22. Failure and Retry Strategy

Every external write must be retryable.

**Important examples:**

```
Avalanche event received
        ↓
Arkiv write fails
        ↓
job remains pending
        ↓
retry
```

```
Swarm upload succeeds
Arkiv write fails
        ↓
retain swarmRef in job state
        ↓
retry Arkiv
```

```
ENS transaction pending
        ↓
worker restarts
        ↓
reconcile transaction status
```

Operations should be idempotent where possible.

Do not create duplicate Arkiv entities when retrying the same publication event.

---

## 23. MVP Implementation Order

**Phase 1 — Foundation**
- monorepo;
- Next.js;
- worker;
- Turso;
- Drizzle;
- shared domain types;
- environment/config handling.

**Phase 2 — Authentication and creators**
- SIWE nonce/session authentication;
- creator creation flow;
- Avalanche creation payment;
- ENSv2 subdomain creation;
- creator persistence.

**Phase 3 — Contributor workflow**
- contributor CRUD;
- submission form;
- draft/pending/rejected/approved states;
- creator review UI.

**Phase 4 — Swarm**
- public upload;
- premium encryption/ACT;
- retrieval;
- cache.

**Phase 5 — Arkiv**
- article entities;
- queries;
- subscription entities;
- creator/article discovery.

**Phase 6 — Publishing**
- `publishArticle()`;
- approval → Swarm + Arkiv;
- edit/update flow.

**Phase 7 — Subscriptions**
- Avalanche subscription contract;
- 90/10 revenue split;
- event listener;
- Arkiv subscription entity;
- ACT grant/revoke;
- expiry reconciliation.

**Phase 8 — Recovery**
- creator export;
- Arkiv → Swarm reference recovery flow.

**Phase 9 — Polish**
- feed;
- search;
- creator pages;
- subscription dashboard;
- premium UX;
- error states;
- demo-ready UI.

---

## 24. What NOT to Build

For the hackathon, explicitly avoid:

- fully decentralized frontend hosting;
- user-operated Bee nodes;
- complex cross-chain identity systems;
- ENS transactions for ordinary article operations;
- multiple subscription tiers;
- article version history;
- elaborate cryptographic key management beyond ACT;
- retroactive revocation guarantees that Swarm cannot provide;
- making Turso the canonical publication database;
- unnecessary microservices.

The objective is a convincing working product, not a maximal decentralization research project.

---

## 25. Sponsor Integration Narrative

### ENSv2

Real creator namespace/identity.

```
creator → <creator>.nectar.eth
```

ENSv2 is central to creator identity and publication namespace.

### Avalanche

Real payment/subscription system.

- creation fee;
- premium subscriptions;
- 90% creator / 10% Nectar revenue split;
- subscription events.

### Arkiv

Real queryable publication and subscription index.

- article metadata;
- search/discovery;
- subscription records with expiration;
- creator export/recovery records.

### Swarm

Canonical content storage.

- public articles use normal Swarm storage;
- premium articles use ACT;
- creators can recover publication references independently of Nectar's application database.

---

## 26. Core Demo Scenario

The final demo should be able to show:

1. Alice connects her wallet and signs in with SIWE.
2. Alice pays the Nectar creation fee.
3. Nectar creates: `alice.nectar.eth`
4. Alice creates contributor Bob.
5. Bob writes: "Hello Web3" (Public)
6. Bob submits it.
7. Alice reviews it and approves it.
8. Nectar:
   - uploads article to Swarm
   - creates Arkiv article entity
9. A reader discovers Alice's publication.
10. Reader reads the public article.
11. Alice/Bob publishes a premium article.
12. Reader sees:
    - title + excerpt
    - subscription CTA
13. Reader pays on Avalanche.
14. Contract splits:
    - 90% creator
    - 10% Nectar
15. Worker receives `SubscriptionPaid`.
16. Worker:
    - writes Arkiv subscription entity
    - grants Swarm ACT access
17. Reader opens premium article.
18. Nectar verifies access and serves content.
19. Subscription expires.
20. Worker revokes current ACT access.
21. Alice clicks: **Export my publications**
22. Nectar generates: Arkiv metadata + Swarm references.
23. Demonstrate that publication content is not solely stored in Nectar/Turso.

---

## 27. Engineering Principles

- Keep blockchain integration behind typed service modules.
- Keep external protocols out of UI components.
- Treat external writes as asynchronous/retryable.
- Treat Avalanche and Swarm as authoritative for their respective domains.
- Use Arkiv as a queryable index, not a file store.
- Use Turso for workflow, cache, and operational state.
- Keep normal UX centralized and simple.
- Make creator recovery possible without relying on Nectar's internal article database.
- Prefer boring, reliable implementation over theoretical decentralization.
- Optimize for a working live demo on the required testnets.

The implementation should produce a public repository, reproducible local setup, environment variable documentation, database migrations, contract deployment instructions, testnet addresses, and a minimal end-to-end demo script.
