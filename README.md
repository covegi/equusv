# 1. Project Overview

## EquusV: Tokenized Horse Journal

A cryptographically verifiable horse journal controlled by the horse owner.

### Background

EU Regulation 2021/963 requires a lifelong physical passport for every horse in the EU. Today's system is paper based and fragmented, making passports difficult to verify and their history difficult to trust. Information recorded on paper can be changed without detection.

The passport requirement itself is EU law and remains in place. The problem is the medium, not the requirement.

### Concept

EquusV is a digital journal for the horse's entire life. The passport forms the root of a token tree, with the horse's identity recorded on chain and anchored to the physical animal through its microchip number and UELN.

Each subsequent event in the horse's life, such as a farrier visit or veterinary visit, is added to the tree as its own token, gradually building a verifiable history.

The owner owns the entire tree. Journal data is timestamped and immutable on chain. Photos and documents are encrypted and stored off chain through UHRP.

The journal is shared with other stakeholders on a conditional basis. For example, the horse owner sends the horse passport to a breeding organization for official issuance and verification. The breeding organization has access to the horse's journal but can only see the information it has issued itself, without gaining access to the rest of the journal.

EquusV complements the physical passport. It does not replace it, since the physical document remains a legal requirement in the EU.

### Market

There are approximately 7 million equids in the EU, including horses, donkeys and mules. Sweden alone has around 355,000 registered horses.

The primary user is the horse owner. Breeding organizations are natural certifiers. Later phases include veterinarians, farriers, insurance companies, slaughterhouses, the Swedish Board of Agriculture and other stakeholders.

# 2. Architecture

EquusV is a monorepo with three applications that together form the core system, plus a marketing frontend that is separate from the application logic.

## Applications

### mobile

React Native / Expo application used by the horse owner. It provides the wallet, onboarding and journal UI.

V1 is currently developed for iOS only.

The app holds the user's keys but no spendable satoshis. It reads token state from the overlay and internalizes tokens into the owner's wallet.

### token-server

Express service with the single funded wallet in the system.

It acts as the certifier, funder and broadcaster for on-chain actions on behalf of the user. It also handles UHRP uploads.

Every route is protected by BRC-103 mutual authentication.

### backend

BSV overlay node run by LARS.

It hosts three topic manager and lookup service pairs. It indexes on-chain tokens and answers discovery queries.

It holds no wallet.

### frontend

Vite / React marketing landing page.

It is currently separate from the application logic. A web GUI is planned for future development.

## The Three Subsystems

Each subsystem consists of one topic manager, one lookup service and one PushDrop token type.

### Identity

`tm_identity / ls_identity`

Self-custodied identity certificates for two roles, horse owner and breeding organization.

### Passport

`tm_horse_passport / ls_passport`

The horse passport token and root of the journal tree. It follows a pending to active lifecycle.

### UHRP

`tm_uhrp / ls_uhrp`

Encrypted photos and documents referenced by a token.

## Core Token Pattern

All three token types follow the same basic flow.

1. The client builds the PushDrop fields and locks them into an output.
2. `createAction` on the token-server wallet funds and signs the transaction.
3. The raw transaction is submitted to the overlay's `/submit` endpoint with an `X-Topics` header identifying the topic.
4. The topic manager validates the required fields and admits the output.
5. The lookup service indexes the output into MongoDB.
6. The mobile client discovers the token by querying the lookup service.

State machine tokens such as the passport additionally spend the previous output and mint a new one on each transition.

## System Flow

### Onboarding and Identity

A new user creates a wallet in the mobile app. A BIP39 mnemonic derives an HD key, which is stored in secure device storage and protected by a PIN.

On first run, the app acquires two identity certificates from token-server, one for the horse owner and one for the breeding organization, and publishes them to the overlay.

From that point, the app resolves identity keys to verified names and roles instead of displaying raw public keys.

### Creating a Passport

The owner enters the horse's official information, including UELN, chip number, name, birth year, sex, breed, colour, owner, issuer and food chain status.

token-server mints the information as a pending passport token and funds the transaction.

The owner then internalizes the output into their own wallet in the passport basket with the tag `status:pending`.

### Adding a Photo

A photo is encrypted to the owner's key and uploaded to the self-hosted UHRP host.

token-server locks the storage reference into a UHRP token and submits it to the overlay.

The mobile app can later discover the token, fetch the encrypted file and decrypt it on-device for display.

### Submitting for Approval

The owner submits the passport to a breeding organization.

The organization reviews the passport in the horse's journal and either approves it or returns it for revision.

Coordination happens peer to peer through MessageBox. The two parties, each represented by a distinct identity key, exchange signed messages to coordinate the shared on-chain object.

### Approval and Activation

When the passport is approved, token-server spends the pending token and mints an active token. The owner is then notified through MessageBox.

The owner internalizes the active token and discovery now shows the passport as active.

The pending to active transition is a real on-chain state change. The old output is spent, a new output is minted and the status changes from `status:pending` to `status:active`.

In the current implementation, the owner receives approvals and revisions by manually refreshing the journal. There is no automatic push notification.

A revision is currently delivered only as a MessageBox message. The pending token remains unchanged on-chain and the revision comment is surfaced in the journal.

Moving revisions to their own on-chain state transition is planned for a later version.

### Ownership and Control

Throughout the system, the owner owns the tokens. They are internalized into the owner's wallet and ownership is expressed on-chain.

The owner does not yet have full control over the transaction lifecycle since funding and broadcasting are handled by token-server.

This is a deliberate V1 design choice and is explained further under Design Decisions.

# 4. Course Requirements Mapping

This section maps the EquusV implementation to each grading criterion. Where the implementation differs from the default approach, a short statement explains the reasoning, as permitted by the rubric.

## Criterion 1: Project Proposal

The approved proposal defines EquusV, originally proposed as EquusCert, as a tokenized horse passport on BSV using overlay services, PushDrop tokens, UHRP storage, identity certificates and peer to peer messaging.

This project implements that scope and extends it into the journal model described in the project overview.

## Criterion 2: User Authentication and Onboarding

### Authentication

Wallet based authentication uses a BIP39 mnemonic to derive an HD key. The key is stored in secure device storage and protected by a PIN.

All server requests use BRC-103 mutual authentication through `@bsv/auth-express-middleware`. Authentication is applied globally to every token-server route.

### Onboarding

The onboarding flow guides the user through the following steps:

1. Create or restore a wallet
2. Enter first and last name
3. Back up the mnemonic
4. Set a PIN
5. Acquire the two role certificates

The mobile client uses `AuthFetch` for authenticated requests.

## Criterion 3: Transaction Creation and Management

### Transaction Creation

On-chain actions use `createAction` on the token-server wallet. This includes identity publishing, passport minting, passport approval and UHRP file token creation.

Tokens are internalized into the owner's wallet using `internalizeAction`.

### State Management with Baskets

The passport basket holds each horse's passport token.

The passport follows a lifecycle using the tags `status:pending` and `status:active`, with the status associated with each horse.

### State Synchronization with Overlay Services

Three topic manager and lookup service pairs index admitted outputs into MongoDB and provide discovery:

- `tm_identity / ls_identity`
- `tm_horse_passport / ls_passport`
- `tm_uhrp / ls_uhrp`

The mobile client synchronizes token state by querying these lookup services.

## Criterion 4: Peer to Peer Messaging and Identity Resolution

### Messaging

See Statement 1.

### Identity Resolution

Identity certificates are self-custodied MasterCertificates published under `tm_identity` and indexed by subject.

The mobile client resolves an identity key to its certificate through `ls_identity`, decrypts the revealed fields and displays the verified name and role.

Raw public keys are never shown to the user. The resolved certificate is displayed in the identity card using live data.

See Statement 2 for the reasoning behind the direction of identity resolution.

### Statement 1: Peer to Peer Messaging

EquusV uses `MessageBoxClient` from `@bsv/message-box-client` rather than PeerServ directly.

The messaging requirement is asynchronous coordination between two parties who may not be online at the same time. A horse owner submits a passport for approval and a breeding organization later approves it or returns it for revision.

Two message boxes carry this flow:

- `equusv_active` allows the breeding organization to notify the owner that an approved active passport token is ready to internalize.
- `equusv_revisions` allows the breeding organization to return a passport with review comments.

Messages are listed, consumed and acknowledged by the recipient.

MessageBoxClient provides the mutually authenticated asynchronous delivery required for this pattern.

The interaction is peer to peer at the application level. Two distinct identity keys exchange signed messages to coordinate a shared on-chain object, with no central party mediating the message content.

### Statement 2: Identity Resolution Direction

EquusV implements identity resolution as key to attribute resolution.

Given an identity key, the app discovers that key's certificate through `ls_identity` and decrypts the revealed fields such as name, role and organization for display.

The reverse direction, attribute to key discovery, is not required by the V1 flows. Every interaction begins with a known identity key, either the user's own key or a counterparty's key established through the passport approval flow.

Resolution therefore always moves from a known key to its attributes.

Attribute based search could be added in a future version with a public directory of participants. It does not add value to the V1 use case because the keys a user interacts with are determined by the workflow.

## Criterion 5: Content Management and UHRP Hosting

### Upload and Download

When a photo is uploaded, it is encrypted to the owner's key using ECIES and uploaded through `StorageUploader`.

The resulting reference is locked into a PushDrop token and submitted to `tm_uhrp`.

When the photo is downloaded, the client discovers the token through `ls_uhrp`, fetches the encrypted file and decrypts it on-device.

### UHRP Hosting

Content is stored on a self-hosted UHRP host at `uhrp.equusv.com` rather than on a third party hosting service.

## Criterion 6: Tokenization and Custom Instructions

### Token Creation with PushDrop

EquusV implements three PushDrop token types:

- Passport token
- UHRP file token
- Identity certificate token

The passport token contains 18 positional fields and implements a full mint, spend and re-mint state machine.

Token identity and state are carried in the decoded PushDrop fields and basket tags.

### Custom Instructions

See Statement 3.

### Statement 3: Custom Instructions

EquusV carries token state and identity in decoded PushDrop fields and basket tags rather than in `customInstructions` metadata.

Each passport token encodes its state in 18 positional PushDrop fields, including version, status, identity key and the horse's attributes.

Its lifecycle is tracked through basket tags that move from `status:pending` to `status:active` as the token is spent and re-minted.

Token identification and filtering throughout the app are driven by these fields and tags. This is where token history and state transitions are tracked.

In EquusV, the role that custom instructions could play is handled by the on-chain PushDrop fields combined with baskets and tags for local indexing.

Keeping state in the token's own fields keeps the source of truth on-chain and verifiable by any party. This is important for a system focused on data integrity across multiple stakeholders.

Custom instructions were therefore not required for the token interactions implemented in EquusV.

## Criterion 7: Payment Handling and Backend Management

### Client Side Payment

See Statement 4.

### Backend Wallet Management

The token-server wallet is the single funded wallet in the system.

It funds and broadcasts every on-chain action on behalf of the user, including identity publishing, passport minting, passport approval and UHRP file token creation.

It also authenticates uploads to the UHRP host.

The wallet is initialized from a server-held root key and performs startup cleanup of stuck actions.

### Statement 4: Payment Model

EquusV V1 uses a custodial payment model.

The token-server wallet funds and broadcasts on-chain actions on behalf of users. The mobile client holds no satoshis.

This is a deliberate V1 design decision.

Custody here applies to payment and transaction broadcasting, not to ownership. Users own their tokens. Passport tokens are internalized into the user's own wallet, meaning the user holds the outputs on-chain.

The token-server provides funding and broadcasting, not custody of the user's assets.

The purpose of EquusV V1 is twofold. It meets the Metanet Academy final project criteria and serves as a proof of concept for a production system for the equine industry.

In that context, requiring end users, hobby riders, breeders and stable owners to acquire satoshis and manage a wallet balance would add onboarding friction to a market that is not yet mature for Web3.

Expecting users to understand wallets, transactions and satoshis is a broader education problem that sits outside the problem EquusV is designed to solve.

EquusV applies BSV to concrete industry problems such as stakeholder coordination, data integrity and identity.

Abstracting away satoshi handling so that the user never sees a balance or payment is therefore the appropriate product choice for V1.

Payment occurs server side. The token-server wallet pays for funded actions, including actions such as `StorageUploader` paying the UHRP host during file uploads.

When the market is ready for self custody, the app can be rebuilt to move funding and broadcasting to the client while keeping the same ownership model.

## Criterion 8: Documentation and Presentation

This README provides the project overview, architecture, setup instructions and course requirements mapping.