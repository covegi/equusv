# EquusV — System Structural Map

Reference document for architectural planning. Written 2026-09-07 against the codebase as it stands. Covers all four workspaces (`mobile`, `token-server`, `backend`, `frontend`), the full passport data flow, every cross-workspace coupling, and every place the code assumes V1's single-aggregate passport model.

Companion doc: [`v2-passport-architecture.md`](./v2-passport-architecture.md) goes deeper on the passport token's field-by-field layout and the V1→V2 branch-model gap analysis. This doc is the wider system map — read this first for orientation, that one for passport-subsystem depth.

---

## 0. Workspace overview

| Workspace | Runtime | Purpose | Talks to |
|---|---|---|---|
| `mobile` | React Native / Expo, iOS dev build | Owner + breeding-org client app: wallet, onboarding, journal UI | `token-server` (HTTP, BRC-103 auth), overlay (`LookupResolver`, direct HTTP), MessageBox host, wallet's own remote storage, UHRP CDN |
| `token-server` | Express, Node (bun) | Single funded custodial wallet; mints/signs/broadcasts on behalf of users; UHRP upload proxy; cert issuer | overlay (`/submit`), MessageBox host, UHRP storage host, wallet's own remote storage |
| `backend` | Express (barely) + LARS-hosted `@bsv/overlay` Engine | Overlay node: 3 topic-manager/lookup-service pairs, indexes admitted outputs into MongoDB | MongoDB (via LARS `hydrateWith: mongo`), MySQL (via LARS's own Knex UTXO storage) — both provisioned in `local-data/docker-compose.yml`, invisible to token-server |
| `frontend` | Vite / React | Marketing landing page | Nothing — confirmed zero references to `@bsv/*`, `TOKEN_SERVER_URL`, `OVERLAY_URL`, or `LARS_URL` anywhere in `frontend/src`. Fully decoupled from the on-chain system. |

`package.json` at repo root wires all four as bun workspaces; `bun run start` → LARS menu → starts `backend` under LARS + ngrok tunnel. `token-server` is started separately (`bun run src/index.ts`). `frontend` and `mobile` are independent dev servers, started separately, no shared build step.

---

## 1. Module map

### 1.1 `mobile/src`

| File | Responsibility |
|---|---|
| `app/_layout.tsx` | Root layout: font loading, `WalletProvider`/`RoleProvider` composition, redirects to `/login` if a stored key exists |
| `app/index.tsx`, `app/login.tsx`, `app/home.tsx`, `app/backup.tsx`, `app/create-profile.tsx`, `app/restore.tsx`, `app/pin/create.tsx`, `app/pin/confirm.tsx` | expo-router route entries, each a thin wrapper around a `screens/*` component |
| `context/WalletContext.tsx` | Holds the loaded `Wallet` instance in React state; no persistence itself |
| `context/RoleContext.tsx` | Holds `activeRole` (`owner` \| `breedingOrg`); populates `availableRoles` from the static `ROLES` constant — **not derived from actual held certificates** |
| `context/PassportModalContext.tsx` | Visibility flag for the passport create/edit modal |
| `context/ActivitiesMenuContext.tsx` | Visibility flag for an activities menu (unused by the passport flow) |
| `config/journalPermissions.ts` | Static map: role → allowed journal category filter labels |
| `constants/baskets.ts` | `PASSPORT_BASKET`, `tagHorse`, `TAG_STATUS_PENDING`, `TAG_STATUS_ACTIVE` — **byte-for-byte required to match `token-server/src/constants/baskets.ts`**, enforced only by a source comment, not code |
| `constants/certificates.ts` | `CERT_TYPE_HORSE_OWNER`/`CERT_TYPE_BREEDING_ORG` (base64 strings) + `ROLES` — **must match `token-server/src/constants.ts`** byte-for-byte, same no-enforcement pattern |
| `constants/breeds.ts`, `constants/sex.ts`, `constants/breeding-organisations.ts` | Static picker option lists (breed names, sex values, one breeding-org record `svenska-fullblod`) |
| `types/horse-passport.ts`, `types/horse-passport-record.ts` | Mirror types of the token-server's own `types/horse-passport*.ts` — independently maintained, not shared/imported from one place |
| `types/cert-data.ts`, `types/breeding-org-card.ts`, `types/breeding-organisations.ts` | UI-facing display types |
| `utils/wallet.ts` | `generateKey`/`storeKey`/`loadWallet`/`restoreWallet` — BIP39 mnemonic → HD key → `Wallet` wired to a **remote** `StorageClient` (`EXPO_PUBLIC_STORAGE_URL`, default `storage.babbage.systems`); key persisted via `expo-secure-store` under `rootKeyHex` |
| `utils/passportFields.ts` | **Byte-for-byte duplicate** of `token-server/src/utils/passportFields.ts` (`buildPassportFields`, `serializeFields`) — independently hand-maintained, no shared package |
| `utils/certificates.ts` | `publishIdentityCertificate`: mobile builds the PushDrop lock for a signed cert (protocol `[1,'identity']`), then calls token-server's `/identity/publish` to fund + broadcast (mobile wallet holds 0 sats) |
| `utils/discoverIdentity.ts` | Queries `ls_identity` via `LookupResolver` directly (bypasses token-server entirely), decodes the cert JSON field, decrypts revealed fields with `ProtoWallet(new PrivateKey(1))` — **note: decrypts with a fixed, non-secret private key (`PrivateKey(1)`), i.e. "anyone" — consistent with the certificate scheme's revealed-fields-are-public design, not a bug, but worth flagging as a hardcoded literal shared with `certificates.ts` publish flow's verifier key** |
| `utils/messageBox.ts` | Thin `MessageBoxClient` factory — duplicate of `token-server/src/utils/messageBox.ts`, same `MESSAGE_BOXES` names (`equusv_active`, `equusv_revisions`), same host, independently maintained |
| `utils/uhrp.ts` | `fetchFromUhrp`: downloads from a **hardcoded CDN URL constant** (`https://nanostore.babbage.systems/cdn`, unused — the actual `cdnUrl` param passed in overrides it) that doesn't match `STORAGE_URL` (`https://uhrp.equusv.com` per `.env.example`) — dead/stale constant; decrypts with `rootKeyHex` from SecureStore via `ECIES.electrumDecrypt`. A second implementation using `StorageDownloader.resolve()` (proper UHRP hash resolution) is commented out below the active one. |
| `hooks/usePhotoPicker.ts` | Camera/gallery picker wrapper (expo-image-picker), permission prompts in Swedish |
| `screens/OwnerScreen.tsx` | **The owner's main screen** — draft list load, active-token discovery (`wallet.listOutputs`), photo discovery (`ls_uhrp` query), `sendToBreedingOrg`, `fetchActivePasses` (MessageBox → `internalizeAction`), `fetchRevisions` (MessageBox → local draft patch), admin/debug helpers (`listInventory`, `requestList`, `clearDevice`) |
| `screens/StartScreen.tsx`, `LoginScreen.tsx`, `CreateProfileScreen.tsx`, `CreatePinScreen.tsx`, `ConfirmPinScreen.tsx`, `BackupScreen.tsx`, `RestoreScreen.tsx` | Onboarding flow screens (create/restore wallet → name → PIN → mnemonic backup), per README §Criterion 2. `RestoreScreen.tsx:119` carries a `// TODO: BankID-recovery` comment — planned but unimplemented alternate recovery path |
| `features/roles/breedingOrg/BreedingOrgScreen.tsx` | **The breeding-org's main screen** — queries `ls_passport` directly for `status:'pending'` outputs, filters by `organisation === BREEDING_ORGS['svenska-fullblod'].name` **client-side** (no server-side org scoping), `handleApprove` (builds fields, signs hash, calls `/identity/passport/approve`), `sendRevision` (MessageBox only, no on-chain action) |
| `features/roles/breedingOrg/BreedingOrgCard.tsx` | List-row presentational card for a pending application |
| `features/identity/CertificateCard.tsx` | Identity-certificate display card — takes a `CertData` prop |
| `components/journal/HorseJournal.tsx` | Modal shell wrapping a single horse's record: category filter pills (role-scoped via `journalPermissions`), delegates edit to `PassportModal`, display to `PassportCard` |
| `components/journal/cards/PassportCard.tsx` | **The live passport display card** — status-colored badge, role-conditional action buttons (owner: edit/delete/send; breedingOrg: approve/revision), revision comment display |
| `components/passport/PassportCard.tsx` | **Dead code** — an earlier/duplicate `PassportCard` (different prop shape: `horseStatus`, `onCertify`, `onRevoke`, `onBroadcast`) with zero import references anywhere in `mobile/src` |
| `components/modal/PassportModal.tsx` | The create/edit form — generates `uuid4()` for new horses, writes the draft to `SecureStore` under `passport-draft-{id}` and appends to a `draftIds` index list; **this is where `horse.id` (the UUID that becomes the PushDrop `keyID` everywhere downstream) is minted** |
| `components/journal/HorseListCard.tsx`, `JournalHeader.tsx`, `Section*.tsx` (Heading/Row/RowInput/RowPicker/RowDatePicker/RowToggle) | List-row and form-field presentational primitives |
| `components/header/header.tsx` | Top bar: role label, hamburger menu trigger, "+" button opening `PassportModal` for a new horse (owner only, via `onHorseCreated` prop presence) |
| `components/navigation/DrawerMeny.tsx` | Slide-out drawer: role switcher, identity-certificate bottom sheet. **Calls `discoverIdentity(publicKey)` (line 70) but the rendered `CertificateCard` uses a hardcoded `CERTS` record (line 340, literal name `'Peter de Michiel'`) instead of the discovered result** — the discovery call's result appears unused for display; the README's claim that "the resolved certificate is displayed in the identity card using live data" does not match this file as it stands. |
| `components/buttons/*` | `PrimaryButton`, `SecondaryButton`, `BackButton`, `CardButton`, `FilterButton` — generic presentational |
| `components/text/Heading.tsx` | Typography primitive |

### 1.2 `token-server/src`

| File | Responsibility |
|---|---|
| `index.ts` | App bootstrap: loads `EQUUSV_ROOT_KEY`, creates the custodial `Wallet` via `Setup.createWalletClientNoEnv`, aborts stuck `nosend` actions on boot, wires CORS + BRC-103 auth middleware globally, mounts every router. Contains ~70 lines of commented-out dead code (an old MessageBox polling loop). |
| `constants.ts` | `CERT_TYPE_HORSE_OWNER`, `CERT_TYPE_BREEDING_ORG` — must mirror `mobile/src/constants/certificates.ts` |
| `constants/baskets.ts` | `PASSPORT_BASKET`, `tagHorse`, tag constants — must mirror `mobile/src/constants/baskets.ts` |
| `utils/passportFields.ts` | `buildPassportFields`/`serializeFields`, canonical field-layout doc comment (18 fields) — must mirror `mobile/src/utils/passportFields.ts` byte-for-byte |
| `utils/messageBox.ts` | `MessageBoxClient` factory, `MESSAGE_BOXES` — must mirror `mobile/src/utils/messageBox.ts` |
| `utils/identityKey.ts` | `GET /utils/identityKey` route factory — exposes the server wallet's own identity key (used by mobile to know the certifier) |
| `types/horse-passport.ts`, `types/horse-passport-record.ts` | Canonical types — mobile's copies are separately maintained, not imported from here |
| `types/uhrp.ts`, `types/uhrp-storage-uploader.ts` | Mostly commented-out/legacy type stubs; `uhrp.ts` is explicitly marked `NOT IN USE` |
| `routes/identity/passport.ts` | `POST /identity/passport/create` (mint/re-mint pending token, spend-and-remint via basket+tags) and `POST /identity/passport/approve` (verify signature via `ProtoWallet`, spend pending → mint active, notify via MessageBox) — the two-phase `createAction`/`signAction` pattern lives here |
| `routes/identity/uhrp.ts` | `POST /identity/file/create` — ECIES-encrypts upload, pushes to `StorageUploader`, locks a 9-field PushDrop token (includes `parentTxid` cross-reference field), submits to `tm_uhrp` |
| `routes/identity/publish.ts` | `POST /identity/publish` — takes a **pre-built** locking script from the mobile client (mobile constructs it since it needs the holder's own keys) and funds/broadcasts it to `tm_identity` |
| `routes/certify/horse-owner.ts`, `routes/certify/breeding-organisation.ts` | Near-identical `MasterCertificate` issuance routes, one per role, using `wallet.createHmac` for the serial number |
| `routes/admin.ts` | `POST /admin/spend` — reclaims basketed outputs back to the server's own address; **hardcoded to `protocolID: [2,'equusv identity passport']` and topic `tm_horse_passport'` regardless of which basket is passed in** |

### 1.3 `backend/src`

| File | Responsibility |
|---|---|
| `index.ts` | A trivial standalone `express` app (`GET /` health check on port 3000) — **not** how the overlay actually runs; LARS reads `deployment-info.json` directly and never executes this file. Effectively dead/vestigial. |
| `mod-passport.ts`, `mod-uhrp.ts`, `mod-identity.ts` | LARS module-shape adapters: each exports a `UniversalExport` function that LARS calls either as a constructor (→ returns the `TopicManager` instance) or as a plain function with a `db` arg (→ returns the lookup-service object). One file per subsystem, referenced by name in `deployment-info.json`. |
| `topic-managers/identity/EquusVPassportTopicManager.ts` | Validates fields 0–10 and 17 non-empty per output (fields 11–16 unchecked); no signature verification here — admission is structural only |
| `topic-managers/identity/EquusVUHRPTopicManager.ts` | Validates fields 0–4 non-empty; stale error message on field 1 (says `'ueln'`, actual field is `id`) |
| `topic-managers/credentials/EquusVIdentityTopicManager.ts` | Validates the single JSON field parses and has `type`/`subject`/`certifier`/`signature` |
| `lookup-services/identity/EquusVPassportLookupServiceFactory.ts` | Decodes all 18 fields positionally into Mongo `horse_passport_records`; **`outputSpent` deletes the record outright** — no history retained; `lookup()` has a dead `ownerIdentityKey` filter branch (real field is `identityKey`, never matches) |
| `lookup-services/identity/EquusVUHRPLookupServiceFactory.ts` | Decodes 9 fields into Mongo `uhrp_records`; `outputSpent` sets `spent: true` (keeps the record, unlike passport) |
| `lookup-services/credentials/EquusVIdentityLookupServiceFactory.ts` | Parses the JSON cert field, indexes `subject`/`certifier`/`type`/`serialNumber` into Mongo `identity_records` |
| `types/identity/passport.ts`, `types/identity/uhrp.ts`, `types/credentials/identity.ts` | Mongo document shape types, one per lookup service, each independently declared (no shared base type) |
| `docs/**/*.md.ts` | Markdown-as-TS-string documentation returned by each topic manager/lookup service's `getDocumentation()` |

Config: `deployment-info.json` (repo root) is the actual LARS/CARS wiring — maps `tm_horse_passport`→`mod-passport.ts`, `tm_uhrp`→`mod-uhrp.ts`, `tm_identity`→`mod-identity.ts`, and the three `ls_*` names to the same three files with `"hydrateWith": "mongo"`.

### 1.4 `frontend/src`

| File | Responsibility |
|---|---|
| `main.tsx`, `App.tsx` | Vite/React entry, mounts `Home` |
| `pages/home/Index.tsx` | Composes `Header` + `HeroSection` + `Activities` + `Footer` |
| `pages/home/HeroSection.tsx`, `Activiities.tsx`, `ActivityCard.tsx` | Landing-page marketing sections; `Activiities.tsx` filename is a typo (extra `i`) but consistently used, harmless |
| `components/header/Header.tsx`, `components/footer/Footer.tsx`, `components/buttons/{Primary,Secondary}Btn.tsx` | Shared marketing-site chrome |
| `types/activity.ts`, `types/global.d.ts` | Local display types |

No BSV SDK, no env var pointing at token-server/overlay, confirmed by grep. Entirely static marketing content.

---

## 2. End-to-end trace: passport creation → mobile display

```
[mobile: owner creates draft]
  components/modal/PassportModal.tsx
    → uuid4() mints horse.id
    → SecureStore: passport-draft-{id}, draftIds index
    (status: 'draft', pure local state — nothing on-chain yet)

[mobile: owner submits — screens/OwnerScreen.tsx#sendToBreedingOrg]
    → sets status:'pending', submittedAt, injects organisation name
    → AuthFetch POST {TOKEN_SERVER_URL}/identity/passport/create
         body: { record, identityKey: wallet.identityKey }

[token-server: routes/identity/passport.ts POST /identity/passport/create]
    → buildPassportFields(record) → 18-field array   [utils/passportFields.ts]
    → wallet.listOutputs({ basket: PASSPORT_BASKET,
                            tags: [tagHorse(id), TAG_STATUS_PENDING] })
         — looks for a prior pending token for this horse (spend-and-remint)
    → pushdrop.lock(fields, [2,'equusv identity passport'], horse.id, identityKey, true)
    → wallet.createAction(...)  → (if signable) manual per-input unlock + wallet.signAction
    → fetch(`${LARS_URL}/submit`, { headers: { 'X-Topics': '["tm_horse_passport"]' },
                                     body: finalTx })
    → returns { tx (base64), txid, outputIndex } to mobile

[backend: LARS Engine.submit() → managers['tm_horse_passport']]
    topic-managers/identity/EquusVPassportTopicManager.ts
    → PushDrop.decode each output, check fields 0-10 & 17 non-empty
    → admits the output → outputsToAdmit: [index]

[backend: Engine notifies ALL registered lookup services, each self-filters by topic]
    lookup-services/identity/EquusVPassportLookupServiceFactory.ts
    → topic === 'tm_horse_passport' → decode 18 fields positionally
    → Mongo.horse_passport_records.insertOne({ ...all 18 fields decoded })

[mobile: back in sendToBreedingOrg, using the create response]
    → wallet.internalizeAction({ tx, outputs: [{ outputIndex,
         protocol: 'basket insertion',
         insertionRemittance: { basket: PASSPORT_BASKET,
             tags: [tagHorse(id), TAG_STATUS_PENDING] } }] })
         — pulls the output into the OWNER's own wallet (remote StorageClient)
    → patches local draft: status:'pending' in SecureStore

[mobile: breeding org side — features/roles/breedingOrg/BreedingOrgScreen.tsx]
    → LookupResolver({ hostOverrides: { ls_passport: [OVERLAY_URL] } })
         .query({ service: 'ls_passport', query: { status: 'pending' } })
         — talks to the overlay DIRECTLY, bypassing token-server entirely
    → decodes 18 fields client-side from returned BEEF outputs
    → filters client-side: organisation === BREEDING_ORGS['svenska-fullblod'].name
    → renders via components/journal/cards/PassportCard.tsx (status:'pending', role:breedingOrg)

[mobile: org approves — BreedingOrgScreen.tsx#handleApprove]
    → buildPassportFields(approved) + serializeFields + Hash.sha256 → recordHash
    → wallet.createSignature({ hashToDirectlySign: hashBytes,
         protocolID: [2,'equusv identity passport'], keyID: horse.id,
         counterparty: 'anyone' })
    → AuthFetch POST {TOKEN_SERVER_URL}/identity/passport/approve
         body: { record: approved, hash, signature, certifierIdentityKey: publicKey }

[token-server: routes/identity/passport.ts POST /identity/passport/approve]
    → rebuilds fields + hash SERVER-SIDE, requires exact match against submitted hash
    → ProtoWallet('anyone').verifySignature({ hashToDirectlyVerify, signature,
         protocolID, keyID: horse.id, counterparty: certifierIdentityKey })
         — this is the actual authorization check; topic manager does none
    → wallet.listOutputs(status:pending) → requires ≥1 spendable
    → appends fields 18-20 (hash, signature, certifierIdentityKey)
    → pushdrop.lock(...) with TAG_STATUS_ACTIVE, spends pending input(s)
    → submits to overlay (same tm_horse_passport / X-Topics pattern)
    → best-effort: MessageBoxClient.sendMessage(recipient: owner's identityKey,
         messageBox: 'equusv_active', body: { tx, txid, outputIndex, horseId, name })

[backend: same topic manager + lookup service path as create]
    → NEW admitted output indexed into Mongo (insertOne — a fresh doc,
      the OLD pending doc's outputSpent → deleteOne removes it, no history kept)

[mobile: owner side — OwnerScreen.tsx#fetchActivePasses, polled on refresh/mount]
    → MessageBoxClient.listMessagesLite({ messageBox: 'equusv_active' })
    → for each: wallet.internalizeAction({ tx, outputs: [{ outputIndex,
         insertionRemittance: { basket: PASSPORT_BASKET,
             tags: [tagHorse(horseId), TAG_STATUS_ACTIVE] } }] })
    → clears local draft/pending SecureStore entries
    → msgBox.acknowledgeMessage(...)

[mobile: display — OwnerScreen.tsx#fetchActive, on mount/refresh]
    → wallet.listOutputs({ basket: PASSPORT_BASKET, tags: [TAG_STATUS_ACTIVE] })
         — reads from the OWNER'S OWN internalized wallet outputs,
           NOT a fresh overlay lookup — this is why display is synchronous
           and doesn't depend on ls_passport being caught up
    → PushDrop.decode each locking script, filters: fields.length>=18,
         field[0]==='2', field[17]===wallet.identityKey, field[1] is a valid status
    → renders via components/journal/cards/PassportCard.tsx
```

**Key structural fact**: mobile display of *your own* passports never re-queries the overlay lookup service — it reads directly from the wallet's own internalized UTXO set (`wallet.listOutputs`). The overlay lookup (`ls_passport`) is used only for *discovering other people's* outputs (the breeding org querying for pending applications from any owner). This is why the create/approve round-trip feels synchronous to the acting user (their own `wallet.listOutputs` reflects `internalizeAction` immediately) while the counterparty's visibility depends on async overlay indexing completing first.

---

## 3. Cross-workspace dependency inventory

### 3.1 Direct calls (mobile → token-server, HTTP, all through `AuthFetch` / BRC-103)

| Mobile call site | token-server route |
|---|---|
| `screens/OwnerScreen.tsx#sendToBreedingOrg` | `POST /identity/passport/create` |
| `screens/OwnerScreen.tsx#requestList` | `POST /admin/spend` |
| `features/roles/breedingOrg/BreedingOrgScreen.tsx#handleApprove` | `POST /identity/passport/approve` |
| `utils/certificates.ts#publishIdentityCertificate` | `POST /identity/publish` |
| (cert acquisition, referenced in README, not traced in this pass) | `POST /certify/horse-owner/signCertificate`, `POST /certify/breeding-organisation/signCertificate` |
| — | `GET /utils/identityKey` (server publishes its own key; mobile reads it, call site not traced in this pass — likely onboarding) |

Photo upload (`token-server`'s `POST /identity/file/create`) has no traced mobile call site in the files read this pass — `hooks/usePhotoPicker.ts` only gets a local URI; the upload call itself wasn't found in `OwnerScreen.tsx` or elsewhere searched. Worth confirming directly if this matters — possible it lives in a component not yet read (e.g. inside `HorseListCard.tsx`'s photo-upload handling, referenced via `onPhotoUploaded` prop in `OwnerScreen.tsx:538`).

### 3.2 Direct calls (mobile → overlay, bypassing token-server)

| Call site | Service | Purpose |
|---|---|---|
| `features/roles/breedingOrg/BreedingOrgScreen.tsx` | `ls_passport` | Discover pending applications for the org |
| `screens/OwnerScreen.tsx` (photo effect) | `ls_uhrp` | Discover a horse's photo token by `{ id, tokenType: 'photo' }` |
| `utils/discoverIdentity.ts`, `components/navigation/DrawerMeny.tsx` | `ls_identity` | Resolve an identity key to its certificate |

All three construct `LookupResolver({ hostOverrides: { <service>: [OVERLAY_URL] } })` directly — token-server plays no role in reads, only in writes (mint/approve/publish) and file upload/auth.

### 3.3 Direct calls (token-server → overlay)

Every mint/approve/publish route ends in the same `fetch(`${LARS_URL}/submit`, { headers: { 'X-Topics': [...] }, body: finalTx })` pattern — four independent copies (`passport.ts` ×2, `uhrp.ts`, `publish.ts`, `admin.ts`).

### 3.4 Shared infrastructure, not code

| Party | Connects to |
|---|---|
| `mobile` wallet | Remote `StorageClient` at `EXPO_PUBLIC_STORAGE_URL` (default `storage.babbage.systems`) — this is where the owner's basket/tag/outpoint bookkeeping actually lives, not on-device and not on token-server |
| `token-server` wallet | Same kind of remote `StorageClient`, via `Setup.createWalletClientNoEnv` with no `storageUrl` override → defaults to `https://storage.babbage.systems` |
| `mobile` + `token-server` | Same `MessageBoxClient` host (`https://messagebox.babbage.systems`), same box names (`equusv_active`, `equusv_revisions`) — two independently-maintained constant files, not shared |
| `backend` (LARS) | MongoDB (lookup indexes) and MySQL (LARS/`@bsv/overlay`'s own Knex UTXO storage) per `local-data/docker-compose.yml` — neither reachable by `mobile` or `token-server` directly |

### 3.5 Env-var seams connecting the workspaces

| Var | Set in | Used by | Points at |
|---|---|---|---|
| `LARS_URL` | `token-server/.env` | token-server's `/submit` calls | The overlay's local port (8080), or the LARS-printed ngrok tunnel in dev |
| `EXPO_PUBLIC_TOKEN_SERVER_URL` | `mobile/.env` | mobile's `AuthFetch` calls | The LAN address of the machine running token-server |
| `EXPO_PUBLIC_OVERLAY_URL` | `mobile/.env` | mobile's `LookupResolver` calls | The LARS-printed ngrok tunnel URL — **same overlay, reached by a different URL than token-server uses (`LARS_URL` is typically `localhost:8080`, this is the public tunnel)**, since the mobile device isn't on the same host |
| `EXPO_PUBLIC_STORAGE_URL` | `mobile/.env` | `utils/wallet.ts` | Wallet storage backend (README says "leave as-is") |
| `EXPO_PUBLIC_EQUUSV_IDENTITY_KEY` | `mobile/.env` | (not traced this pass — presumably compared against token-server's printed key at onboarding) | token-server's own identity key, must match what `GET /utils/identityKey` returns |
| `EXPO_PUBLIC_UHRP_URL` | `mobile/.env` | (not traced this pass) | UHRP host |

---

## 4. Shared assumptions / implicit contracts

These are places where two or more files, in different workspaces, must agree on an exact value with **no shared import and no runtime check** — a mismatch fails silently or with an opaque signature-verification error, not a type error.

| Contract | Side A | Side B | Enforcement |
|---|---|---|---|
| 18-field passport layout, exact index order | `token-server/src/utils/passportFields.ts` | `mobile/src/utils/passportFields.ts` | **None** — a source comment on both files says "must stay in sync," nothing checks it |
| `serializeFields` byte format (4-byte BE length prefix + bytes, per field) | same two files | same two files | **None** — same comment-only convention |
| Passport protocol ID `[2, 'equusv identity passport']` | `token-server/src/routes/identity/passport.ts`, `routes/admin.ts` | `mobile/src/features/roles/breedingOrg/BreedingOrgScreen.tsx` (signature creation) | **None** — literal string duplicated at every call site in both workspaces |
| UHRP protocol ID `[2, 'equusv identity file']` | `token-server/src/routes/identity/uhrp.ts` | (no mobile-side signer found this pass — server-only lock) | N/A, single-sided |
| Identity protocol ID `[1, 'identity']` | `mobile/src/utils/certificates.ts` | `token-server` (implicitly, since it only forwards a pre-built script — never itself constructs or checks this ID) | Loosely enforced — token-server doesn't validate protocol ID at all in `/identity/publish`, it just relays whatever locking script it's given |
| `PASSPORT_BASKET = 'equusv-passport'`, `tagHorse`, `TAG_STATUS_PENDING`/`ACTIVE` | `token-server/src/constants/baskets.ts` | `mobile/src/constants/baskets.ts` | **None** — comment-only, same pattern |
| `CERT_TYPE_HORSE_OWNER`/`CERT_TYPE_BREEDING_ORG` base64 constants | `token-server/src/constants.ts` | `mobile/src/constants/certificates.ts` | **None** — independently computed `Buffer.from(...).toString('base64')` in both places from the same literal string; a typo in one and not the other silently creates two different cert types |
| `MESSAGE_BOXES` names + host | `token-server/src/utils/messageBox.ts` | `mobile/src/utils/messageBox.ts` | **None** — duplicated literals |
| Topic manager field-position validation (fields 0–10, 17 for passport; 0–4 for UHRP) | `backend/src/topic-managers/**` | Whatever wrote the fields (token-server, or mobile for identity) | Structural only — the topic manager checks presence/non-emptiness, never checks the writer's actual field *order* matches what it thinks it's reading. If token-server and mobile's field builders ever drift, the topic manager would still admit a malformed token as long as the misaligned fields happen to be non-empty. |
| `record.version === '2'` gate | `token-server/src/routes/identity/passport.ts:168` | Every field-builder that sets `record.version` | A hardcoded literal, single global format version — no per-field or per-branch versioning exists |
| Breeding-org identity: `organisation === BREEDING_ORGS['svenska-fullblod'].name` | `mobile/src/features/roles/breedingOrg/BreedingOrgScreen.tsx:53` (client-side filter) | `mobile/src/screens/OwnerScreen.tsx:390` (client-side injection on submit) | **Purely client-side string match, both directions** — nothing server-side scopes which org can see which applications; any client that can query `ls_passport` can see all pending outputs regardless of org, the org-name filter is just a display-layer courtesy filter in this one screen |

---

## 5. Places that assume the single-aggregate passport model

(Cross-referenced with, and slightly condensed from, `v2-passport-architecture.md` §3.3 — repeated here because they're structurally part of *this* map's cross-workspace view, not just the backend's.)

1. **`horse.id` doubles as both the record's public identity AND the PushDrop `keyID` for every operation on it** — `components/modal/PassportModal.tsx` mints the UUID once; from then on it's threaded unchanged through `token-server/src/routes/identity/passport.ts` (create + approve), `mobile/.../BreedingOrgScreen.tsx` (signature `keyID`), and `token-server/src/routes/admin.ts` (reclaim unlock `keyID`). Any future per-branch token needs a *different* keyID derivation or every branch for one horse collides.
2. **One 18-field flat record, decoded positionally in four independent places**: `token-server/src/utils/passportFields.ts` (build), `backend/.../EquusVPassportTopicManager.ts` (validate), `backend/.../EquusVPassportLookupServiceFactory.ts` (index), `mobile/src/screens/OwnerScreen.tsx#fetchActive` + `mobile/.../BreedingOrgScreen.tsx` (both re-decode fields positionally client-side, independently of each other and of the server). Five total independent positional decoders for one field layout, across two workspaces.
3. **Status lives as both a PushDrop field (`fields[1]`) and a wallet basket tag (`status:pending`/`status:active`)**, kept in sync manually at every mint site — `token-server/src/routes/identity/passport.ts` sets both in the same `createAction` call; nothing enforces they can't drift (e.g. a future bug could tag `status:active` while writing `'pending'` into field 1).
4. **The passport *is* the token — there's no separate "which sections does this passport have" concept.** `PassportModal.tsx`'s single form collects every field in one save; there's no per-section draft state, no per-section submit, no way today to update `foodChainStatus` without rebuilding and re-signing the entire 18-field record. This is the direct UI-layer expression of the aggregate model the V2 doc's branch-tree redesign replaces.
5. **Lookup service deletes on spend** (`EquusVPassportLookupServiceFactory.ts` `outputSpent` → `deleteOne`) — combined with mobile's `fetchActive` reading only the *current* `wallet.listOutputs()` snapshot, there is no code path anywhere in the system today that can answer "what did this passport look like before the last edit." Both the storage layer and every UI read-path assume "current state only."
6. **Revision has no on-chain representation** — `BreedingOrgScreen.tsx#sendRevision` and `OwnerScreen.tsx#fetchRevisions` communicate a revision purely via MessageBox body (`{ type:'revision', horseId, comment, record }`); the on-chain pending token is untouched. This is a V1-known limitation (README §6) but also a concrete aggregate-model symptom: since the whole record is one token, "send back for correction" has no cheap on-chain expression (it would mean spending and re-minting the *entire* passport just to attach a comment), so it was routed around the chain entirely instead.
7. **`components/passport/PassportCard.tsx` (dead) still has the old-shape assumption baked in** (`horseStatus`, `onCertify`, `onRevoke`, `onBroadcast` props) — evidence of the mental model shifting over the project's history even within mobile's own component tree; safe to delete, but useful as a marker of how the UI's status vocabulary evolved (`onCertify`/`onRevoke`/`onBroadcast` → today's `onSend`/`onApprove`/`onRevision`).

---

## 6. Other discrepancies noticed (not aggregate-model-specific, worth a cleanup pass)

- `token-server/package.json` declares `mongoose: ^9.6.1`; zero imports of it anywhere in `token-server/src`. Dead dependency — token-server has no direct DB connection at all (confirmed separately; see prior conversation turn on synchronous state).
- `mobile/.../DrawerMeny.tsx` calls `discoverIdentity()` but renders a hardcoded `CERTS` object (literal `'Peter de Michiel'`) instead of the discovered result — the identity card shown to the user is not live data, contradicting the README's Criterion 4 claim.
- `mobile/.../utils/uhrp.ts` has an unused hardcoded `STORAGE_BASE` constant pointing at a different host than the one actually used (the `cdnUrl` parameter overrides it) — and a full second implementation commented out below the active one.
- `backend/src/index.ts` is a vestigial standalone Express app that LARS never actually runs (LARS reads `deployment-info.json` directly) — effectively dead code, but present in the repo as if it mattered.
- `token-server/src/routes/admin.ts` hardcodes the passport protocol ID regardless of which basket it's asked to reclaim from (already flagged in the V2 doc, repeated here since it's a cross-workspace-visible route called from `OwnerScreen.tsx#requestList`).
- `mobile/.../screens/OwnerScreen.tsx` has several dev/debug-only functions wired into the drawer menu (`listInventory`, `requestList`, `clearDevice`) that read/spend real wallet state — worth confirming these are meant to ship to production or are debug scaffolding left in place.
