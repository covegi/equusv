# EquusV V2 — Passport Tree Architecture: Consolidation & Build Plan

Status: design consolidation, no implementation yet. Written 2026-09-02 against the V1 codebase as it stands (main branch, no uncommitted changes at time of writing).

This document has three parts:

1. **Current state (V1)** — what the code actually does today, file by file, verified by reading it (not by memory of the README).
2. **V2 decisions** — the re-architecture agreed on, restated here so this doc is self-contained.
3. **Gap map** — what carries over unchanged, what must be rebuilt, and where V1's aggregate assumptions will resist the tree model, with exact file/line pointers.

---

## Part 1 — Current State (V1)

### 1.1 Subsystem inventory

Three topic-manager/lookup-service pairs, each with its own protocol ID, field layout, and MongoDB collection. No shared code between them — each is a hand-written parallel implementation.

| Subsystem | Topic | Protocol ID | Fields | Mongo collection | State machine |
|---|---|---|---|---|---|
| Identity | `tm_identity` / `ls_identity` | n/a (JSON cert payload, not typed PushDrop fields) | 1 field (JSON blob) | `identity_records` | none — certs are immutable |
| Passport | `tm_horse_passport` / `ls_passport` | `[2, 'equusv identity passport']` | 18 (21 on approval) | `horse_passport_records` | pending → active, spend-and-remint |
| UHRP | `tm_uhrp` / `ls_uhrp` | `[2, 'equusv identity file']` | 9 | `uhrp_records` | none — file tokens are never re-minted, only marked `spent` |

All three follow the same base flow (client/server builds PushDrop fields → `wallet.createAction` → `wallet.signAction` if a signable tx comes back → submit BEEF to `${LARS_URL}/submit` with `X-Topics` header → topic manager validates and admits → lookup service indexes into Mongo).

### 1.2 Identity subsystem

- `token-server/src/routes/certify/horse-owner.ts` and `breeding-organisation.ts` — near-identical routes, each issues a `MasterCertificate` (type constant from `token-server/src/constants.ts`: `CERT_TYPE_HORSE_OWNER`, `CERT_TYPE_BREEDING_ORG`, both base64-encoded strings) via `wallet.createHmac` for the serial number and `cert.sign(wallet)`.
- `token-server/src/routes/identity/publish.ts` — separate route that actually locks the signed cert into a PushDrop-less(?) output and submits to `tm_identity`. Note: this route takes a pre-built `lockingScript` and `tokenAmount` from the request body rather than building the script itself — the client (mobile) constructs the PushDrop lock.
- `backend/src/topic-managers/credentials/EquusVIdentityTopicManager.ts` — admits any output whose single PushDrop field parses as JSON with `type`, `subject`, `certifier`, `signature`. No signature verification happens here — admission is purely structural (JSON shape check).
- Lookup service (`EquusVIdentityLookupServiceFactory.ts`) indexes `subject`, `certifier`, `type`, `serialNumber` — no other fields, since the cert body is one opaque JSON field, not positional fields.

**Relevant to V2 root design**: this is the only subsystem where the on-chain payload is JSON-in-one-field rather than positional PushDrop fields. If the V2 root token also carries identity-only data, this is the nearest existing precedent — worth deciding explicitly whether root uses positional fields (like passport/UHRP) or a JSON envelope (like identity) or introduces a fourth pattern.

### 1.3 Passport subsystem — the aggregate to be replaced

**Field layout** (documented in `token-server/src/utils/passportFields.ts:44-75`, verified in code):

```
0  version              9  location
1  status              10  foodChainStatus ('true' | 'false')
2  id                  11  ueln
3  name                12  chip
4  breed               13  organisation
5  birthDate           14  createdAt
6  sex                 15  submittedAt
7  color               16  issuedAt
8  ownerAtRegistration 17  identityKey
```

Approval adds fields 18–20: `hash`, `signature`, `certifierIdentityKey` — appended after the fact, **not part of the hashed/signed payload** (the hash is computed over fields 0–17 only, via `serializeFields`).

`serializeFields` (`passportFields.ts:4-12`) is a manual length-prefixed byte serializer (4-byte big-endian length + bytes, per field, in index order) used only to produce a deterministic byte string for hashing/signing — it is not the PushDrop encoding itself (PushDrop handles its own field framing separately via `pushdrop.lock(fields, ...)`).

**Critical existing constraint, verbatim from the code comment** (`passportFields.ts:44-54`):
> Every active token on-chain carries a signature over the exact bytes produced by `buildPassportFields` + `serializeFields`. Changing either one makes all existing v2 signatures unverifiable — permanently. ... The mobile app has an identical implementation. The two must stay in sync byte for byte, or signature verification fails with no useful error.

This is a real V1→V2 migration constraint if there are ever active tokens signed under the current scheme before the cutover — confirm with the user whether any exist outside dev/test before designing root/branch field framing (V2 branches will need their own version of this byte-exact server/mobile duplication problem, see §3.4).

**Create flow** (`token-server/src/routes/identity/passport.ts:16-158`, `POST /identity/passport/create`):
1. Validates `horse.id` present and `record.status === 'pending'`.
2. Builds 18 fields, locks with `pushdrop.lock(fields, [2,'equusv identity passport'], horse.id, identityKey, true)` — **`horse.id` is used as the PushDrop `keyID`**, i.e. the horse UUID is already the per-token key derivation input. This is directly reusable as the V2 root-reference mechanism (see §3.3).
3. Looks up existing spendable outputs tagged `horse:{id}` + `status:pending` in the `equusv-passport` basket (`PASSPORT_BASKET` from `token-server/src/constants/baskets.ts`) and, if any exist, spends them as inputs to the new action (so re-submitting a draft consumes the prior pending token) — **this is the exact spend-and-remint pattern V2 wants per-branch.**
4. `createAction` → if `signableTransaction` comes back, manually locates each input by matching `sourceTXID`/`sourceOutputIndex` against the outpoint, builds a `pushdrop.unlock(...)` for each, signs, calls `wallet.signAction`. If no signable tx (single-output/no-spend case), uses `result.tx`/`result.txid` directly.
4. Submits raw BEEF to overlay `/submit` with `X-Topics: ["tm_horse_passport"]`.
5. Returns `{ tx (base64), txid, outputIndex }` to caller — no server-side wallet internalization; the mobile client internalizes it into the owner's wallet itself (per README's Criterion 3 section).

**Approve flow** (`passport.ts:160-354`, `POST /identity/passport/approve`):
1. Validates `record.horse.id`, `record.version === '2'`, `record.status === 'active'`, `record.identityKey` present.
2. Rebuilds fields from the record, re-derives `recordHash = sha256(serializeFields(fields))`, and **requires the caller-supplied `hash` to match exactly** — the server does not trust the client's hash, it recomputes it.
3. Verifies the caller-supplied `signature` against that hash using `ProtoWallet('anyone').verifySignature(...)` with `protocolID: [2,'equusv identity passport']`, `keyID: record.horse.id`, `counterparty: certifierIdentityKey`. **This is the authorization check for a breeding-org-issued state transition** — a real signature-based writer check, not just a role flag. This is the direct precedent for the "some branches need approve-with-signature" half of the V2 engine's authorization leak point (§3.5a).
4. Appends `hash`, `signature`, `certifierIdentityKey` as fields 18–20 (UTF-8, not the raw hex/bytes — worth noting for V2 schema typing, since fields 0–17 are also UTF-8-of-string but semantically different types get flattened the same way).
5. Finds the spendable `status:pending` output for this horse, requires at least one (else 400), locks a new output with `status:active` tag, spends the pending input(s), mints the active output.
6. Submits to overlay, then **best-effort** notifies the owner via `MessageBoxClient` (`MESSAGE_BOXES.active` = `equusv_active`) — wrapped in its own try/catch so a MessageBox failure doesn't fail the whole approval (correct resilience choice, already in place).

**Topic manager** (`backend/src/topic-managers/identity/EquusVPassportTopicManager.ts:19-75`): admits an output if fields 0–10 and field 17 (version, status, id, name, breed, birthDate, sex, color, ownerAtRegistration, location, identityKey) are non-empty. **Fields 11–16 (ueln, chip, organisation, createdAt, submittedAt, issuedAt) are not checked at all** — optional by omission, not by declared schema. No signature verification happens in the topic manager; trust is placed entirely in the server-side check at the approve route. This is a deliberate and reasonable split (structural admission vs. application-level authorization) and V2 should preserve it rather than trying to push signature checks into the topic manager.

**Lookup service** (`backend/src/lookup-services/identity/EquusVPassportLookupServiceFactory.ts`): on admit, decodes all 18 fields positionally into a flat Mongo document (`horse_passport_records`). On spend, **deletes the record outright** (`outputSpent` → `deleteOne`) rather than marking it superseded — so there is no queryable history of prior pending/active states once a token is spent. This is the direct blocker for "history must be viewable and filterable per branch" (§3.4): V1's lookup service throws away exactly the data V2's per-branch history view needs. `lookup()` supports filtering on any of the 14 positional business fields plus... `ownerIdentityKey`, which is **not actually a field in the schema** (the real field is `identityKey`) — this filter branch is dead/broken code, never matches anything.

### 1.4 UHRP subsystem — already doing what V2 wants, informally

`token-server/src/routes/identity/uhrp.ts` (`POST /identity/file/create`):
- Encrypts the uploaded file to the owner's `identityKey` via `ECIES.electrumEncrypt`, uploads via `StorageUploader`, gets back a UHRP URL and a CDN URL.
- Field layout (9 fields, `uhrp.ts:63-73`): `version, id, uhrpUrl, tokenType, mimeType, description, createdAt, parentTxid, cdnUrl`.
- **`parentTxid` is already a literal txid-reference field linking this token to another token.** This is the existing, working precedent for V2's "schemas must declare a field as a txid-reference to another branch" requirement (§3.5b) — it's not a new mechanism, it's generalizing something already shipped once.
- Basket is `equusv-${id}` — a dynamically-named basket per horse ID, which is a different basket-naming strategy than the passport subsystem's single `equusv-passport` basket + tag-based filtering. V2's branch engine needs to pick one convention and apply it uniformly (recommend: passport's tag-based approach, since dynamic basket names don't compose with `tagQueryMode: 'all'` filtering the way tags do).
- No spend-and-remint here — UHRP tokens are created once and never versioned. `outputSpent` in the lookup service just flips `spent: true` rather than deleting, unlike the passport lookup service. Two different subsystems, two different spend-handling conventions, neither one is what V2 branch history needs (which is "keep all versions, queryable").
- `customInstructions: JSON.stringify({ type: '' })` — always an empty string, dead code.

**Topic manager** (`EquusVUHRPTopicManager.ts`): checks fields 0–4 non-empty (version, id, uhrpUrl, tokenType, mimeType). Note the error message says `'ueln cannot be empty'` for field 1 (`uhrp.ts:36`) but the actual field is `id`, not `ueln` — stale error message from an earlier field name, harmless but worth cleaning up if this code path is reused.

### 1.5 Cross-cutting infrastructure (all reusable as-is)

- **Wallet init**: `token-server/src/index.ts:21-28` — `Setup.createWalletClientNoEnv({ chain: 'main', rootKeyHex: EQUUSV_ROOT_KEY })`, single custodial wallet for the whole server, no per-user server-side wallets.
- **Auth**: `createAuthMiddleware({ wallet, allowUnauthenticated: false })` from `@bsv/auth-express-middleware`, applied globally in `index.ts:82`, before every route. BRC-103 mutual auth is a blanket `app.use`, not per-route — V2 routes get this for free with no extra wiring.
- **Overlay submit pattern**: identical `fetch(`${LARS_URL}/submit`, { headers: { 'X-Topics': JSON.stringify([...]) }, body: Buffer.from(finalTx) })` repeated verbatim in `passport.ts`, `uhrp.ts`, `publish.ts`, `admin.ts` — four independent copies of the same 6 lines. V2's generic branch engine should own this once.
- **Two-phase sign pattern**: the `createAction` → check `signableTransaction` → manually match inputs by outpoint → `pushdrop.unlock(...).sign(tx, idx)` → `signAction` sequence is duplicated near-verbatim between `passport.ts` (create and approve) and `admin.ts`. This is the single highest-value piece of shared logic to extract into the branch engine — it's the same ~25 lines three times today, and it will be the same ~25 lines N times per branch type if not extracted.
- **MessageBox**: `token-server/src/utils/messageBox.ts` — thin factory around `MessageBoxClient`, two boxes (`equusv_active`, `equusv_revisions`). Generic enough to reuse for branch-type notifications (e.g. "new journal entry needs vet co-signature") without change.
- **Admin/reclaim route**: `token-server/src/routes/admin.ts` — spends arbitrary basketed outputs back to the server's own P2PKH address. **Hardcoded to `protocolID: [2, 'equusv identity passport']` and `X-Topics: ["tm_horse_passport"]` regardless of which basket is being reclaimed** (`admin.ts:61, 78`) — this only actually works correctly for passport-basket tokens today; if it's ever pointed at a UHRP or future branch basket it will build an unlocking script under the wrong protocol ID and fail. Flag as a bug to fix when branch types multiply, since this route will otherwise silently produce broken reclaims for every non-passport basket.
- **Dead code**: `token-server/src/index.ts:100-167` — a large commented-out MessageBox polling loop (`pollMessages`), superseded by the mobile-driven MessageBox flow described in the README. Safe to delete during the V2 cleanup pass. `token-server/src/types/uhrp.ts` and `uhrp-storage-uploader.ts` also carry substantial commented-out earlier type definitions.

### 1.6 Known V1 defects relevant to V2 design

1. **No idempotency on passport create** (already flagged in README's Known Limitations, confirmed in code): `passport.ts:37-42` looks up spendable pending outputs and spends them if found, which *should* prevent duplicates — but the README notes "the previous token is not always spent" in practice for the revision-resubmit path specifically, which goes through a different flow (MessageBox-only revision, no new on-chain action against the old pending token). The create route's own spend-lookup logic is actually correct for the case it handles; the gap is that revisions don't call this route in the first place. **Directly relevant to V2**: any branch type that can be "returned for correction" needs its resubmit path to go through the same versioning route as a normal edit, or the same duplicate-head bug reappears per-branch, multiplied by however many branch types support revision.
2. **Byte-exact duplicate field builders** across `token-server/src/utils/passportFields.ts` and `mobile/src/utils/passportFields.ts` (confirmed to exist independently, not shared via a package) — the comment in the token-server file states this explicitly. This duplication is what makes hand-writing 30 branch types dangerous today (each new type is a third, fourth, fifth place a field-order bug can silently break signature verification). This is the strongest concrete argument for the schema-driven engine: a single schema definition, consumed by both server and mobile (or codegen'd into both), removes the duplicate-implementation risk entirely rather than just making it more tedious.
3. **Lookup services delete-on-spend** (passport) or **flip-a-flag-on-spend** (UHRP) — neither preserves enough to answer "show me this branch's version history," which V2 explicitly requires. This needs a designed change, not a carry-over (see §3.4).
4. **Dead/stale code**: broken `ownerIdentityKey` filter in passport lookup (§1.3), stale `'ueln cannot be empty'` error text in UHRP topic manager (§1.4), always-empty `customInstructions` in UHRP route (§1.4), hardcoded protocol ID in admin reclaim (§1.5). None of these are urgent, but a V2 rewrite touching these files is the natural point to remove them rather than carry them forward.

---

## Part 2 — V2 Design Decisions (as given, restated for reference)

1. **Aggregate → tree.** V1: one passport token, 18 positional fields. V2: a root token plus independent branch tokens. Real re-architecture, not a refinement.
2. **Root token** = the genesis transaction; its txid is the immutable anchor. `horse.id` (UUID) stays as the internal/public id, maps 1:1 to the root. Root carries identity only, no mutable data. Everything else links to the root.
3. **Branches** = one token per passport section and per activity type, each linking to the root, each versioning independently via spend-and-remint (V1's pending→active pattern, applied per-branch instead of per-passport). A branch change mints a new txid for that branch only; root and UUID never move.
4. **Passport = a view, not a token (Model B).** No on-chain "whole passport" token, no pass-state token. What's shown as "the passport" is a rendered aggregation of active branches under a root. Users don't see the multi-token structure; they can drill into a single branch (e.g. food-chain-status) and see its version history (v1 "included" → v2 "not included", with date + who). History must be viewable and filterable per branch in the view.
5. **Three layers**: (a) Root = identity. (b) Passport = legal sections I–X (grunddata, signalement, härstamning/stambok, owner, food-chain/medication, validation, vaccination, health tests). (c) Journal = SJVFS 2023:19 / JBV activity tokens (vet visit, medication, farrier, physio, dental, disease, transport, lifecycle, training, competition, breeding). "Belongs to the passport" = layer (b) only; journal tokens hang off the root but are not part of the passport view. Vaccination straddles both layers — one token referenced by both views.
6. **Branch engine + declarative schemas.** One generic mechanism for the shared on-chain work (build PushDrop fields, lock with protocol-id + root-ref + owner key, spend-and-remint on version, submit to overlay, two-phase sign). Each type described as a schema: fields, which are required, who may write it, which layer it belongs to. Topic manager, routes, and lookup service all read the schema instead of hardcoding field positions.
7. **Two engine leak points, designed for from the start**:
   - (a) **Authorization/writer** — differs per type. Some (breeding-org-issued) need an approve flow with signature verification like V1's pending→active; others (owner's own journal entries) may not.
   - (b) **Cross-branch references** — some types reference others by txid (medication → ref visit; disease alert-confirmed → ref suspicion txid; lifecycle chain). Schemas must declare a field as a txid-reference to another branch.
8. **Field corrections**: `birthDate` (full date) is correct in code; the v3 overview PDF's "födelseår" (birth year) was wrong — no code change needed, source-of-truth confusion only. Section I Part A point 3 (verbal description: colour, head, legs, body, markings) is *conditional*; the Part B outline diagram is *mandatory* — different obligation levels, must be two separate branch types, not one undifferentiated token. DNA/blood group (point 7) and alternative ID method (point 6) exist as passport fields and are **missing entirely from the current model** — new branch types, no V1 equivalent.

---

## Part 3 — Gap Map: V1 → V2

### 3.1 Carries over almost unchanged

| Piece | V1 location | Notes for V2 |
|---|---|---|
| `createAction` / two-phase `signAction` sequence | `passport.ts` (create + approve), `admin.ts` | Extract into the branch engine's single shared "mint or re-mint" function — currently copy-pasted 3x, will be copy-pasted Nx otherwise |
| `pushdrop.lock` / `pushdrop.unlock` with protocol-id + keyID + counterparty | `passport.ts:44-50, 232-238`, `uhrp.ts:75-81` | Pattern is right; V2 needs one protocol ID convention per branch *type* (or one shared protocol ID with type carried in a field — decide explicitly, see §4) |
| Spend-and-remint via basket + tags, `tagQueryMode: 'all'` | `passport.ts:37-42`, baskets in `token-server/src/constants/baskets.ts` | Directly reusable per-branch: `tags: [tagRoot(rootTxid), tagBranch(branchType), status:...]` |
| Overlay `/submit` with `X-Topics` header | 4 duplicate copies, see §1.5 | Centralize once in the engine |
| BRC-103 auth middleware, applied globally | `token-server/src/index.ts:76-82` | No change needed — new branch routes inherit it automatically by mounting under the same app |
| UHRP encrypt/upload/reference-as-token | `uhrp.ts` in full | Vaccination-record photos, health-test documents etc. reuse this verbatim; UHRP's `parentTxid` field is the working precedent for cross-branch refs (§3.5b) |
| MessageBox for async cross-party notification | `token-server/src/utils/messageBox.ts` | Reusable for any branch type needing counterparty notification (e.g. vet co-sign requests) |
| Custodial wallet / server-funds-and-broadcasts model | `token-server/src/index.ts` | No change — V2 is a token-model re-architecture, not a payment-model change |
| `horse.id` (UUID) as PushDrop `keyID` | `passport.ts:47-48` | This *is* effectively already "the root reference" mechanism — V2 formalizes it as the explicit root-txid link rather than reusing the UUID as a proxy for it (see open question in §4 on whether root ref = UUID, root txid, or both) |
| Signature-based approval, `ProtoWallet('anyone').verifySignature` | `passport.ts:189-205` | This is the concrete template for engine leak point (a) — every branch schema that needs an "approve" writer role reuses this exact check shape, parameterized by protocol ID / keyID / counterparty per schema |

### 3.2 Must be rebuilt

| Piece | Why V1's version doesn't fit |
|---|---|
| Token model / field layout | V1 has one 18-field aggregate; V2 needs N small per-branch field sets, each independently versioned. Not a refactor of `passportFields.ts` — a different data model. |
| Topic manager(s) | V1 hardcodes field positions per subsystem (3 separate classes, one per subsystem). V2 needs either one generic topic manager that reads a schema to know which fields must be non-empty per branch type, or a topic-manager-factory-per-type generated from schemas. Either way, the current pattern of "one handwritten class per token type" (§1.3, §1.4, identity's class too) doesn't scale to ~15+ branch types and must be replaced by something schema-driven. |
| Routes | V1 has one route file per subsystem with hand-written field-building, locking, signing, submitting (`passport.ts`, `uhrp.ts`). V2 needs generic create/version/approve route(s) parameterized by branch-type schema, not a new route file per branch type. |
| Lookup service indexing | V1 decodes fields positionally into a flat per-subsystem Mongo collection, and **deletes or flag-spends on spend** rather than preserving history (§1.3, §1.4). V2 needs indexing that (a) is schema-driven rather than positional-per-type, (b) preserves every version of a branch rather than discarding superseded ones, since "history must be viewable and filterable per branch" is a hard requirement. This likely means one `branch_records` collection (or one per layer) keyed by `(rootRef, branchType, version)` rather than one collection per token type keyed by current state only. |
| Passport aggregation view | V1 has no aggregation step — the passport *is* the single token, read directly. V2's passport view is new: given a root, query all branches under it filtered to layer (b), take the active/current version of each, and render. This is new application logic on both token-server (or a new read-side service) and mobile — it doesn't exist in any form today. |
| Mobile field builder | The duplicate-implementation risk in §1.6.2 gets worse, not better, if V2 hand-writes N branch types on mobile too. Whatever schema mechanism is built server-side should be the single source of truth mobile also reads (shared package, or codegen), not a parallel `passportFields.ts`-style hand port per branch type. |
| Root-token content model | No direct V1 precedent — passport tokens today carry the horse's actual data plus identity; V2's root is identity-only. Closest analog is the identity subsystem's JSON-cert-in-one-field pattern (§1.2), but that's a certificate, not an anchor token — needs its own design decision (see §4). |
| Basket/tag naming convention | V1 has two incompatible conventions today: passport's single basket + tags (`equusv-passport`, `horse:{id}`, `status:...`) vs. UHRP's per-id dynamic basket (`equusv-${id}`). V2 needs one convention applied to every branch type — recommend generalizing the passport convention (`equusv-{layer}`, tags for `root:{txid}`, `branch:{type}`, `status:...`), since it's the one that already supports `tagQueryMode: 'all'` filtering for spend-and-remint lookups. |
| Admin reclaim route | Currently hardcoded to the passport protocol ID (§1.5) — needs to become schema-aware (look up the branch type from the basket/tag, use that type's protocol ID) or it will silently mis-sign reclaims for every non-passport token type going forward. |

### 3.3 Where V1's aggregate assumptions actively resist the tree model

Concrete places to watch, not just abstract risk:

1. **`horse.id` as the PushDrop `keyID` everywhere** (`passport.ts:47, 103, 234, 285`, `admin.ts:62`) — V1 uses the horse UUID as the key derivation input for *every* passport operation. V2 branches need a keyID that identifies the *branch*, not just the horse — otherwise two different branch types for the same horse (e.g. `food-chain-status` and `vaccination`) would derive colliding keys/addresses if `keyID` stayed as bare `horse.id`. The schema needs to define keyID as a composite (e.g. `${horse.id}:${branchType}`) from day one, or every branch type for a horse shares one derivation path, which breaks independent per-branch spend/version tracking.
2. **Topic manager field-position validation is per-class, not data-driven** (all three `identifyAdmissibleOutputs` implementations, §1.3–1.4) — adding a new branch type today means writing a new TypeScript class with hardcoded `decoded.fields[N]` checks. This is the exact pattern the schema-driven engine is meant to eliminate; it's worth explicitly deciding whether V2 keeps "one topic manager per layer" (3-ish classes reading schemas) or moves to "one topic manager for all branch types" (1 class, dispatches on a type field). The former is closer to what LARS's `Configured topic manager tm_X` startup pattern (README) expects; confirm LARS/overlay supports a topic manager that legitimately spans many sub-types under one topic before committing.
3. **Lookup service delete-on-spend is baked into the passport lookup service's `outputSpent`** (`EquusVPassportLookupServiceFactory.ts:63-69`) — this isn't a config flag, it's the literal behavior (`deleteOne`). If V2 reuses any of this file's structure, this line is the one guaranteed to need inversion (mark-superseded instead of delete) for every branch type, everywhere.
4. **The `record.version !== VERSION` check in the approve route** (`passport.ts:168-170`, hardcoded string `'2'`) — a single global token-format version, not a per-branch-type version. V2 branch schemas presumably need their own versioning (schema version, independent from the on-chain branch's history version) — worth distinguishing "schema/format version" from "branch history version" explicitly in the schema shape, since V1 conflates "the type of record layout" with nothing else (there's no separate history-version concept in V1 at all — pending/active *is* the only versioning that exists).
5. **`serializeFields`'s flat byte-serialization is written generically enough to reuse** (`passportFields.ts:4-12` takes `number[][]`, no knowledge of what the fields mean) — this one actually *does* generalize cleanly to branches with no change, since it just length-prefixes whatever field array it's given. Worth calling out as a rare case of V1 code that's already schema-agnostic and can be lifted as-is into the engine.

### 3.4 Branch history requirement vs. current lookup design

This is the single largest gap, called out separately because it's structural, not a detail. V1's two lookup services actively destroy the information V2's "viewable and filterable per branch" history requirement needs:

- Passport lookup: `outputSpent` → `deleteOne` (§1.3) — a spent pending token's data is gone from Mongo the moment it's spent; only the currently-active record is ever queryable.
- UHRP lookup: `outputSpent` → sets `spent: true` but keeps the record — closer to what V2 needs, but UHRP tokens are never re-minted in V1, so this path has never actually been exercised by a versioning flow.

V2 needs, at minimum, a decision on: (a) does the lookup service retain every historical version of a branch permanently, or only back to some retention window; (b) is history queried by walking spent-outpoint chains back from the current head, or by every version being independently indexed with a `supersededBy`/`version` pointer at write time (recommend the latter — it's a direct write at index time versus a chain-walk at read time, and the read time is when the mobile UI needs "show me all prior values of this branch" to be fast).

### 3.5 Engine leak points — concrete precedents already in the codebase

**(a) Authorization/writer.** V1's approve route (`passport.ts:189-205`) is the working template: `ProtoWallet('anyone').verifySignature({ hashToDirectlyVerify, signature, protocolID, keyID, counterparty })`, where `counterparty` is the expected certifier's identity key. A branch schema's "writer" field should be expressive enough to say either "owner-authored, no counterparty check" (most journal entries — the create route today has no equivalent of this check at all, it trusts whoever's authenticated via BRC-103) or "requires counterparty signature from role X" (breeding-org-issued sections, vet-cosigned entries), parameterizing exactly what `passport.ts:189-205` does today for one hardcoded case.

**(b) Cross-branch references.** UHRP's `parentTxid` field (`uhrp.ts:71`, indexed and queryable via `EquusVUHRPLookupServiceFactory.ts:80`) is this mechanism, already shipped, just not generalized or typed as such. A schema's txid-reference field type is "make `parentTxid` a first-class, typed, schema-declared field kind, usable by any branch type, queryable by the referenced txid" rather than "one hardcoded field that happens to exist on the UHRP type only."

---

## Part 4 — Open questions to resolve before writing code

These aren't answered by either the V1 code or the V2 decisions as given — worth deciding explicitly before the schema shape is finalized, since each one changes what the schema needs to express:

1. **Root token content model**: does the root carry a JSON envelope (like `tm_identity`'s cert-in-one-field pattern) or positional fields (like passport/UHRP)? Decision affects whether the topic manager for roots is a fourth new pattern or reuses one of the two existing ones.
2. **KeyID composition**: confirmed as a real gap in §3.3.1 — needs `${horse.id}:${branchType}` or equivalent before any branch engine code is written, since it's foundational to every lock/unlock call.
3. **One topic manager per layer vs. one for everything**: §3.3.2 — affects how LARS is configured (`lars-config`/engine setup) and whether adding a branch type is a schema-only change or also requires a topic-manager redeploy.
4. **History storage strategy**: chain-walk vs. write-time version pointer (§3.4) — affects lookup service schema and mobile query latency.
5. **Basket/tag convention**: generalize passport's convention or design a third one (§3.2 last row) — affects every route and the admin reclaim fix.
6. **Mobile field-schema source of truth**: shared package consumed by both token-server and mobile, or schema defined once server-side and codegen'd/fetched by mobile at build or runtime? Directly addresses the byte-exact-duplication risk in §1.6.2 — needs a decision, not just an intention to "not hand-write 30 types," since the duplication risk is between *codebases*, not just within one.
7. **Vaccination's dual-layer membership** (decision 5, "one token referenced by both passport view and journal"): confirm this means the passport view's aggregation query includes vaccination branches by type regardless of layer tag, i.e. layer is informational/for-filtering rather than a strict partition — otherwise "referenced by both" and "layer is one of three values" are in tension.
