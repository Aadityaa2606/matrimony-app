# Kalyana Varan Matrimony Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the prototype into a payable, moderated, Tamil-first matrimony app with real Razorpay payments, an admin panel, server-enforced chat rules, Supabase plus R2 storage, and the "A1 · Garland" look.

**Architecture:** All business rules live in small pure modules in `lib/` (lifecycle, matching, chat rules, permissions, phone, profile, razorpay signatures), unit-tested with Vitest. Route handlers and admin server actions are thin wrappers over those modules plus Prisma. Every member API calls one gate (`requireActiveMember`), and every admin page or action calls one gate (`requireStaff`). Chat messages are sent only through our API using the Stream server client; members' Stream tokens are read-only for messages.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Prisma 5 on Supabase Postgres, NextAuth v5 Credentials (JWT), Stream Chat (`stream-chat` server and client), Tailwind v4, Vitest, `aws4fetch` (R2), `sharp` (resize), Razorpay REST and Checkout.js (no SDK).

**Spec:** `docs/superpowers/specs/2026-11-03-kalyana-varan-revamp-design.md`. Read it before any task. This plan refers to it as "the spec".

## Global Constraints

- Brand: wordmark **Kalyana Varan** / **கல்யாண வரன்**, always with **Matrimony** / **மேட்ரிமோனி** as a smaller line. "Sangam" must not appear anywhere.
- Palette: background `#fcf8f0`, primary maroon `#8e1b2c`, gold accent `#c9a24a`, success green `#3f7a4f`. Gold is used for accents only, never a large fill.
- Fonts: Noto Serif Tamil (headings), Noto Sans Tamil (body), via `next/font/google`, used for both languages.
- Language: Tamil is the default. An EN/த pill appears on every member-facing screen. The choice is stored in the `lang` cookie (`ta`|`en`, one year). Every member-facing string comes from the dictionary in `lib/i18n/dict.ts`, never hard-coded.
- Admin panel: English only, plain Tailwind, no decoration and no i18n.
- Tap targets ≥ 48px, one primary button per screen, a label on every icon. Must work at 360px width without horizontal scroll.
- Membership: amount from env `MEMBERSHIP_AMOUNT_PAISE` (default `50000` = ₹500); a year is 365 days (`YEAR_MS`).
- Support phone from env `NEXT_PUBLIC_SUPPORT_PHONE`, rendered as a `tel:` link.
- Phone numbers are stored as `+91XXXXXXXXXX` and always passed through `normalizePhone` before lookup or storage.
- Passwords: minimum 8 characters, bcrypt cost 12 (as today).
- No SMS, email or OTP anywhere. No new paid services.
- Runtime: Node (Vercel). No edge runtime, no Vercel-only APIs.
- No Razorpay or AWS SDK packages. Use `fetch` and `node:crypto` for Razorpay and `aws4fetch` for R2. New dependencies allowed: `aws4fetch`, `sharp` (made direct), and dev `vitest`. Nothing else without a reason in the task.
- `EXPIRED` is **derived** (`status === ACTIVE && expiresAt <= now`) and never stored, so expiry works without a cron job.

## Review Focus

1. **Same number typed differently at sign-up and sign-in** (`98765 43210`, `+91 98765-43210`, `09876543210`) must reach the same account, and a duplicate sign-up must be refused. The test goes in Task 3 (`normalizePhone` cases).
2. **Razorpay webhook and the checkout callback both arriving for the same payment, in either order or concurrently**, must add exactly one year and one status change. The test goes in Task 7 (`capturePayment` decision is pure, plus the manual double-replay step).
3. **A member whose year runs out while the app is open** (sitting in a chat at the exact `expiresAt`) must be refused on the next request, not at next login. The test goes in Task 2 (`effectiveStatus` at `now === expiresAt` is `EXPIRED`) and Task 9 (send refused when the sender's effective status isn't `ACTIVE`).
4. **Double-tapping send on the 2nd starter message** must not let a 3rd message through. The test goes in Task 9 (`checkSend` sequence) and is enforced by a conditional update in the route.
5. **A staff session calling member APIs, or a member session opening `/admin`**, must be refused. The test goes in Task 15 (`sessionKind` and `can`).

---

## Phase A: Foundation and server logic

### Task 1: Schema reset for Supabase, test runner, OTP removal

**Files:**
- Modify: `prisma/schema.prisma`, `prisma/seed.ts`, `package.json`, `lib/auth.ts` (strip only what references removed models)
- Delete: `prisma/migrations/*` (all), `app/api/otp/`, `app/api/auth/check-phone/`, `app/api/auth/create-account/`, `app/api/auth/reset-password/`, `app/api/payment/complete/`, `app/(auth)/verify-phone/`, `app/(auth)/set-password/`, `app/(auth)/reset-password/`
- Create: `prisma/migrations/<timestamp>_init/migration.sql`, `vitest.config.ts`, `.env.example`

**Interfaces:**
- Produces: the Prisma models and enums below. Every later task uses these exact names.

- [ ] **Step 1: Replace the schema**

  The datasource gets `directUrl = env("DIRECT_URL")`. Keep `Gender`, `Profile`, `Favorite` and `Dismissed` unchanged. Delete `PhoneOtp` and `PhoneVerification`. Then:

```prisma
enum UserStatus { PENDING_PAYMENT PENDING_PROFILE PENDING_REVIEW ACTIVE REJECTED SUSPENDED }

model User {
  id           String     @id @default(cuid())
  phoneNumber  String     @unique
  passwordHash String
  displayName  String
  status       UserStatus @default(PENDING_PAYMENT)
  approvedAt   DateTime?
  expiresAt    DateTime?
  profile      Profile?
  payments     Payment[]
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

enum PaymentMethod { RAZORPAY MANUAL }
enum PaymentStatus { CREATED PAID FAILED }

model Payment {
  id                String        @id @default(cuid())
  userId            String
  user              User          @relation(fields: [userId], references: [id])
  amountPaise       Int
  method            PaymentMethod
  status            PaymentStatus @default(CREATED)
  razorpayOrderId   String?       @unique
  razorpayPaymentId String?       @unique
  markedById        String?       // Staff.id for MANUAL
  failureReason     String?
  createdAt         DateTime      @default(now())
  paidAt            DateTime?
}

model Block {
  id        String   @id @default(cuid())
  blockerId String
  blockedId String
  createdAt DateTime @default(now())
  @@unique([blockerId, blockedId])
}

model ChatThread {
  channelId    String  @id
  starterId    String?
  starterCount Int     @default(0)
  unlocked     Boolean @default(false)
}

enum StaffRole { VIEWER ADMIN SUPER_ADMIN }

model Staff {
  id           String    @id @default(cuid())
  username     String    @unique
  passwordHash String
  role         StaffRole
  active       Boolean   @default(true)
  createdAt    DateTime  @default(now())
}

model ActivityLog {
  id           String   @id @default(cuid())
  staffId      String
  action       String
  targetUserId String?
  details      Json?
  createdAt    DateTime @default(now())
}

model ErrorLog {
  id        String   @id @default(cuid())
  context   String
  message   String
  details   Json?
  createdAt DateTime @default(now())
}
```

- [ ] **Step 2: Generate a fresh init migration without needing a database**

  Run: `rm -rf prisma/migrations && mkdir -p prisma/migrations/20261103000000_init && npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/20261103000000_init/migration.sql && printf 'provider = "postgresql"\n' > prisma/migrations/migration_lock.toml && npx prisma validate`
  Expected: "The schema at prisma/schema.prisma is valid".

- [ ] **Step 3: Delete the OTP and stub routes and pages listed under Files.** Also remove the `/verify-phone` links from `app/(auth)/sign-in/page.tsx`. Task 11 rebuilds that page; for now, remove the two links.

- [ ] **Step 4: Update `prisma/seed.ts`**
  - Demo members get `status: ACTIVE`, `approvedAt: now`, `expiresAt: now + 365 days`, and a PAID `MANUAL` payment of `50000`, with a balanced split of brides and grooms.
  - Upsert one `SUPER_ADMIN` staff from env `SUPERADMIN_USERNAME` / `SUPERADMIN_PASSWORD`, skipping it with a log line if either is missing.

- [ ] **Step 5: Add Vitest and direct dependencies**

  Run: `npm i aws4fetch sharp && npm i -D vitest`

  - Add the script `"test": "vitest run"`.
  - `vitest.config.ts`: `environment: "node"`, `resolve.alias: { "@": path.resolve(__dirname) }`, `include: ["lib/**/*.test.ts"]`.

- [ ] **Step 6: Write `.env.example`** with every key and a one-line comment each:
  - `DATABASE_URL` (Supabase transaction pooler, port 6543, `?pgbouncer=true`) and `DIRECT_URL` (session pooler, 5432)
  - `AUTH_SECRET`, `NEXTAUTH_URL`
  - `NEXT_PUBLIC_STREAM_API_KEY`, `STREAM_API_SECRET`
  - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `MEMBERSHIP_AMOUNT_PAISE=50000`
  - `R2_ENDPOINT` (`https://<account>.r2.cloudflarestorage.com`), `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`
  - `NEXT_PUBLIC_SUPPORT_PHONE`
  - `SUPERADMIN_USERNAME`, `SUPERADMIN_PASSWORD`

- [ ] **Step 7: Verify.** Run `npx prisma generate && npx tsc --noEmit`. The only errors allowed are in files that later tasks rewrite: `app/api/profile/route.ts` (status names), the `register`/`dashboard`/`payment` pages and `app/api/profiles/*`. List them in the commit message. `npx vitest run` should exit with "No test files found", which is fine for now.

- [ ] **Step 8: Commit** `feat: fresh Supabase schema, vitest, remove OTP`

---

### Task 2: Lifecycle rules

**Files:**
- Create: `lib/lifecycle.ts`, `lib/lifecycle.test.ts`

**Interfaces:**
- Consumes: `UserStatus` from `@prisma/client`.
- Produces:
```ts
export const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
export type EffectiveStatus = UserStatus | "EXPIRED";
export type LifecycleUser = { status: UserStatus; expiresAt: Date | null; hasProfile: boolean; hasPaid: boolean };
export type Change = { status: UserStatus; expiresAt?: Date | null; approvedAt?: Date };
export class TransitionError extends Error {}
export function effectiveStatus(u: { status: UserStatus; expiresAt: Date | null }, now: Date): EffectiveStatus;
export function landingPath(s: EffectiveStatus): string;
export function afterPayment(u: LifecycleUser, now: Date): Change;
export function afterProfileSaved(u: LifecycleUser): Change;
export function approve(u: LifecycleUser, now: Date): Change;   // throws TransitionError
export function reject(u: LifecycleUser): Change;               // throws TransitionError
export function suspend(u: LifecycleUser): Change;              // throws TransitionError
export function unsuspend(u: LifecycleUser): Change;            // throws TransitionError
```

Rules, from the spec's "user lifecycle" section:

| fn | allowed from | result |
|---|---|---|
| `afterPayment` | `PENDING_PAYMENT` | `hasProfile ? PENDING_REVIEW : PENDING_PROFILE` |
| | `ACTIVE` (incl. effectively expired) | stays `ACTIVE`, `expiresAt = max(now, expiresAt) + YEAR_MS` |
| | anything else | unchanged status (payment is just recorded) |
| `afterProfileSaved` | `PENDING_PROFILE` | `PENDING_REVIEW`; every other status is unchanged |
| `approve` | `PENDING_REVIEW`, `REJECTED`, and requires `hasPaid && hasProfile` | `ACTIVE`, `approvedAt = now`, `expiresAt = now + YEAR_MS` |
| `reject` | `PENDING_PROFILE`, `PENDING_REVIEW` | `REJECTED` |
| `suspend` | `ACTIVE` | `SUSPENDED`, `expiresAt` untouched |
| `unsuspend` | `SUSPENDED` | `ACTIVE`, `expiresAt` untouched (so it becomes `EXPIRED` if past) |

`landingPath` maps as follows:

| Status | Path |
|---|---|
| `PENDING_PAYMENT` | `/payment` |
| `PENDING_PROFILE` | `/register` |
| `PENDING_REVIEW` | `/review` |
| `ACTIVE` | `/home` |
| `EXPIRED` | `/payment` |
| `REJECTED` | `/account-status` |
| `SUSPENDED` | `/account-status` |

- [ ] **Step 1: Write failing tests** in `lib/lifecycle.test.ts` using `const now = new Date("2026-11-03T00:00:00Z")`:
  - `effectiveStatus({status:"ACTIVE", expiresAt: now}, now)` → `"EXPIRED"`. With `expiresAt = now+1ms` → `"ACTIVE"`. `{status:"SUSPENDED", expiresAt: past}` → `"SUSPENDED"`.
  - `afterPayment` from `PENDING_PAYMENT`: with `hasProfile:false` → `PENDING_PROFILE`, with `hasProfile:true` → `PENDING_REVIEW`.
  - Early renewal: `ACTIVE` with `expiresAt = now + 5 days` → `expiresAt = now + 5 days + YEAR_MS`.
  - Late renewal: `ACTIVE` with `expiresAt = now − 30 days` → `expiresAt = now + YEAR_MS`.
  - `approve` with `hasPaid:false` throws `TransitionError`. `approve` from `REJECTED` (paid, has profile) → `ACTIVE`, `expiresAt = now + YEAR_MS`, `approvedAt = now`. `approve` from `ACTIVE` throws.
  - `reject` from `ACTIVE` throws. `unsuspend` keeps `expiresAt`.
  - `landingPath("EXPIRED") === "/payment"` and `landingPath("REJECTED") === "/account-status"`.

- [ ] **Step 2: Run** `npx vitest run lib/lifecycle.test.ts`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement `lib/lifecycle.ts`** per the table.
- [ ] **Step 4: Run** `npx vitest run lib/lifecycle.test.ts`. Expected: all pass.
- [ ] **Step 5: Commit** `feat: membership lifecycle rules`

---

### Task 3: Phone normalisation and member auth

**Files:**
- Create: `lib/phone.ts`, `lib/phone.test.ts`, `types/next-auth.d.ts`, `app/api/auth/register/route.ts`, `app/api/account/password/route.ts`
- Modify: `lib/auth.ts`

**Interfaces:**
- Produces:
  - `normalizePhone(input: string): string | null`
  - The NextAuth Credentials provider `id: "member"` (fields `phone`, `password`)
  - JWT/session fields `session.user.id: string` and `session.user.kind: "member" | "staff"`, plus `session.user.role?: StaffRole`, which Task 15 adds alongside the `"staff"` provider
  - `POST /api/auth/register` `{name, phone, password}` → `201 {ok:true}` | `400 {error}` | `409 {error:"exists"}`
  - `POST /api/account/password` `{currentPassword, newPassword}` → `200` | `400` | `401`

- [ ] **Step 1: Failing tests** for `normalizePhone`:
  - `"9876543210"`, `"98765 43210"`, `"+91 98765-43210"`, `"919876543210"` and `"09876543210"` all → `"+919876543210"`
  - `"12345"`, `"5876543210"` (doesn't start with 6–9), `""` and `"+1 9876543210"` → `null`
- [ ] **Step 2: Run** `npx vitest run lib/phone.test.ts` → FAIL.
- [ ] **Step 3: Implement.** Strip spaces, dashes and parentheses. Drop a leading `+91`, `91` (only when 12 digits) or `0` (only when 11 digits). The remainder must match `/^[6-9]\d{9}$/`.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Rewrite `lib/auth.ts`**
  - The provider id is `"member"` and `authorize` looks up `normalizePhone(phone)`.
  - The `jwt` callback copies `id` and `kind:"member"`, and `session` exposes them.
  - `types/next-auth.d.ts` augments `Session["user"]` and `JWT` with `id`, `kind` and `role?`.
- [ ] **Step 6: Register route**
  - Validate: name trimmed 1–60 characters, `normalizePhone` not null, password ≥ 8.
  - Return 409 if the phone exists.
  - Create the user (status defaults to `PENDING_PAYMENT`).
  - The client signs in afterwards with `signIn("member")` (Task 11).
- [ ] **Step 7: Password route.** It needs a member session. bcrypt-compare the current password, require the new one to be ≥ 8, then save.
- [ ] **Step 8: Verify** with `npx vitest run && npx tsc --noEmit` (the Task 1 allow-list still applies).
- [ ] **Step 9: Commit** `feat: phone+password member auth without OTP`

---

### Task 4: Member gate and status routing

**Files:**
- Create: `lib/member.ts`, `components/MainShell.tsx`
- Modify: `app/(protected)/(main)/layout.tsx` (becomes a server component), `app/(protected)/dashboard/page.tsx` (becomes a server redirect), `app/api/user/status/route.ts`, `app/page.tsx`

**Interfaces:**
- Consumes: `effectiveStatus` and `landingPath` (Task 2), and `session.user.kind` (Task 3).
- Produces:
```ts
export type Member = { id: string; status: EffectiveStatus; expiresAt: Date | null; gender: Gender | null; profile: Profile | null; displayName: string };
export async function getMember(): Promise<Member | null>;              // null unless session.kind === "member" and the user exists
export async function requireActiveMember(): Promise<Member | NextResponse>; // 401 if no member, 403 {error:"inactive", status} unless status === "ACTIVE"
export function activeMemberWhere(now: Date): Prisma.UserWhereInput;   // { status: "ACTIVE", expiresAt: { gt: now } }
```
  Route usage pattern: `const m = await requireActiveMember(); if (m instanceof NextResponse) return m;`

- [ ] **Step 1: Implement `lib/member.ts`.**
- [ ] **Step 2: Server-side routing**
  - The `(main)` layout calls `getMember()` and `redirect(member ? landingPath(member.status) : "/sign-in")` unless the status is `ACTIVE`.
  - The current client nav moves into `components/MainShell.tsx` (`"use client"`), which receives `expiresAt: string | null` as a prop. Task 13 uses it for the banner.
  - `dashboard/page.tsx` becomes `redirect(landingPath(...))`.
  - `app/page.tsx` sends signed-in members to `/dashboard` and everyone else to `/welcome`.
- [ ] **Step 3: Status route.** `/api/user/status` returns `{status: EffectiveStatus, expiresAt}`.
- [ ] **Step 4: Verify** with `npx tsc --noEmit` (allow-list shrinking), then `npm run dev`:
  - A seeded ACTIVE member reaches `/home`.
  - After running `UPDATE "User" SET "expiresAt" = now() - interval '1 day'` on that member, a reload of `/home` lands on `/payment`.
- [ ] **Step 5: Commit** `feat: server-side member gate and status routing`

---

### Task 5: Simple matching, blocks filtering, and the profile APIs

**Files:**
- Create: `lib/matching.ts`, `lib/matching.test.ts`, `lib/blocks.ts`
- Modify: `app/api/profiles/route.ts`, `app/api/profiles/[id]/route.ts`, `app/api/favorites/route.ts`, `app/api/dismissed/route.ts`

**Interfaces:**
- Consumes: `requireActiveMember` and `activeMemberWhere` (Task 4).
- Produces:
```ts
export function ageOn(dob: Date, now: Date): number;
export type MatchFields = { community: string; location: string; dateOfBirth: Date; createdAt: Date };
export function matchScore(viewer: MatchFields, c: MatchFields, now: Date): number; // +3 community, +2 location (trim, case-insensitive equality), +1 if |age diff| <= 5
export function rankMatches<T extends MatchFields>(viewer: MatchFields, cs: T[], now: Date): T[]; // score desc, then createdAt desc
export async function blockedUserIds(userId: string): Promise<string[]>; // both directions
```

- [ ] **Step 1: Failing tests**
  - `ageOn(1998-11-04, 2026-11-03)` → `27` and `ageOn(1998-11-03, 2026-11-03)` → `28`.
  - Same community `"Mudaliar "` vs `"mudaliar"` plus same location plus a 3-year gap → `6`.
  - Nothing in common with an 8-year gap → `0`.
  - `rankMatches` puts a score-3 profile before a newer score-0 profile, and two score-0 profiles come out newest first.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Feed route** (`GET /api/profiles`)
  - Use `requireActiveMember`.
  - The `where` clause: `user: activeMemberWhere(now)`, `gender` = the opposite of `m.profile.gender`, `userId notIn [m.id, ...blockedUserIds]`, and `id notIn` favourited or dismissed.
  - Then apply `rankMatches`.
  - Response shape unchanged. Mark it with `// ponytail: ranks in memory; fine to ~10k actives, move score into SQL beyond that`.
- [ ] **Step 6: The other three routes**
  - `[id]`, favourites and dismissed use `requireActiveMember`.
  - `[id]` returns 404 when the target isn't active, is the same gender, or is blocked either way.
  - The favourites GET filters out inactive and blocked users.
- [ ] **Step 7: Verify** with `npx vitest run && npx tsc --noEmit`. Then, in dev, a seeded bride sees only grooms.
- [ ] **Step 8: Commit** `feat: simple opposite-gender matching with block filtering`

---

### Task 6: R2 photo storage and profile input

**Files:**
- Create: `lib/storage.ts`, `lib/storage.test.ts`, `lib/profile.ts`, `lib/profile.test.ts`
- Modify: `app/api/profile/upload/route.ts`, `app/api/profile/route.ts`, `next.config.ts`

**Interfaces:**
- Consumes: `getMember` (Task 4) and `afterProfileSaved` (Task 2).
- Produces:
```ts
export function checkImage(type: string, size: number): string | null; // error message or null; jpeg/png/webp, <= 5 MB
export async function storeImage(file: File, prefix: string): Promise<string>; // returns public URL; throws Error(checkImage msg) on invalid
export type ProfileData = { fullName: string; gender: Gender; dateOfBirth: Date; height: string; education: string; profession: string; salary: string | null; location: string; community: string; subCaste: string | null; hasHoroscope: boolean; parentContact: string; profilePhoto: string; additionalPhotos: string[] };
export function parseProfileInput(body: unknown, now: Date): { ok: true; data: ProfileData } | { ok: false; error: string };
export async function saveProfile(userId: string, data: ProfileData): Promise<void>; // upsert + afterProfileSaved transition, one transaction
```

- [ ] **Step 1: Failing tests**
  - `checkImage("image/gif", 10)` → error, `checkImage("image/png", 5*1024*1024 + 1)` → error, `checkImage("image/webp", 1000)` → `null`.
  - `parseProfileInput` passes on a complete valid body.
  - It fails on a missing `profilePhoto`, on `gender:"MALE"`, on a DOB making the age 17 at `now` (minimum age 18, my call), and on more than 5 `additionalPhotos`.
  - Trimmed empty `salary` → `null`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.**
  - `storeImage`:
    - Resize: `sharp(buf).rotate().resize({ width: 1080, height: 1080, fit: "inside", withoutEnlargement: true }).webp({ quality: 75 })`.
    - Upload: key `${prefix}/${crypto.randomUUID()}.webp`, sent as `new AwsClient({accessKeyId, secretAccessKey, service:"s3", region:"auto"}).fetch(`${R2_ENDPOINT}/${R2_BUCKET}/${key}`, {method:"PUT", body, headers:{"content-type":"image/webp"}})`.
    - Throw on a non-2xx response, and return `${R2_PUBLIC_URL}/${key}`.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Wire up the routes**
  - The upload route accepts any member session (members in registration aren't ACTIVE yet), calls `storeImage(file, "members/" + m.id)` and returns 400 on a validation error.
  - The profile POST accepts a member in `PENDING_PROFILE`, `PENDING_REVIEW` or `ACTIVE`, then calls `parseProfileInput` and `saveProfile`. Member edits go live immediately (the spec says so).
  - In `next.config.ts`, add the `R2_PUBLIC_URL` hostname to `images.remotePatterns`.
- [ ] **Step 6: Verify** with `npx vitest run && npx tsc --noEmit`. In dev with real R2 keys, uploading a 4 MB JPEG should return a URL whose object is under 300 KB (`curl -sI <url> | grep -i content-length`).
- [ ] **Step 7: Commit** `feat: R2 photo storage with resize; shared profile validation`

---

### Task 7: Razorpay payments

**Files:**
- Create: `lib/razorpay.ts`, `lib/razorpay.test.ts`, `lib/payments.ts`, `lib/errors.ts`, `app/api/payment/order/route.ts`, `app/api/payment/verify/route.ts`, `app/api/payment/webhook/route.ts`

**Interfaces:**
- Consumes: `afterPayment` (Task 2) and `getMember` (Task 4).
- Produces:
```ts
// lib/razorpay.ts
export function membershipAmountPaise(): number; // Number(env.MEMBERSHIP_AMOUNT_PAISE ?? 50000)
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string, secret: string): boolean; // HMAC-SHA256 hex of `${orderId}|${paymentId}`
export function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean; // HMAC-SHA256 hex of rawBody
export async function createOrder(amountPaise: number, receipt: string): Promise<{ id: string; amount: number }>; // POST https://api.razorpay.com/v1/orders, Basic auth key_id:key_secret, currency "INR"
// lib/payments.ts
export type CaptureOutcome = "captured" | "already" | "unknown_order";
export function captureDecision(p: { status: PaymentStatus } | null): CaptureOutcome; // null→unknown_order, PAID→already, else captured
export async function capturePayment(orderId: string, paymentId: string, now: Date): Promise<CaptureOutcome>;
export async function recordManualPayment(userId: string, staffId: string, now: Date): Promise<void>;
// lib/errors.ts
export async function logError(context: string, err: unknown, details?: Record<string, unknown>): Promise<void>; // never throws
```
- Routes:
  - `POST /api/payment/order` → `{orderId, amount, keyId}`
  - `POST /api/payment/verify` `{razorpay_order_id, razorpay_payment_id, razorpay_signature}` → `{ok:true, next: landingPath}`
  - `POST /api/payment/webhook` → `200` always after the signature check passes, `400` on a bad signature

- [ ] **Step 1: Failing tests**
  - Both verifiers return `true` for a signature computed in the test with `createHmac` and `false` for a different secret.
  - They return `false` (not throw) for a 3-character signature, because the length differs before `timingSafeEqual`.
  - `captureDecision(null)` → `"unknown_order"`, `{status:"PAID"}` → `"already"`, `{status:"CREATED"}` → `"captured"`, `{status:"FAILED"}` → `"captured"` (a retry after failure succeeds).
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** `lib/razorpay.ts` and `captureDecision`. **Step 4: Run** → PASS.
- [ ] **Step 5: `capturePayment`**
  - Inside `prisma.$transaction`, run `updateMany({ where: { razorpayOrderId: orderId, status: { not: "PAID" } }, data: { status: "PAID", razorpayPaymentId: paymentId, paidAt: now } })`.
  - If the count is 0, return `captureDecision(existing)` for the existing row.
  - Otherwise load the user (with `hasProfile` and `hasPaid: true`), apply `afterPayment`, update the user and return `"captured"`.
  - The conditional update makes concurrent webhook and verify calls safe.
- [ ] **Step 6: `recordManualPayment`** creates a `MANUAL` + `PAID` payment with `markedById` and applies `afterPayment` in one transaction.
- [ ] **Step 7: Routes**
  - **order:** the member must have effective status `PENDING_PAYMENT`, `ACTIVE` or `EXPIRED`, otherwise 403. Create the Razorpay order with receipt = the user id truncated to 40 characters, then save a `CREATED` Payment.
  - **verify:** check the signature with `RAZORPAY_KEY_SECRET` (400 on failure), then call `capturePayment` and return the new landing path.
  - **webhook:**
    - Read `await req.text()`, check the signature from the `x-razorpay-signature` header with `RAZORPAY_WEBHOOK_SECRET`, then parse.
    - `payment.captured` and `order.paid` → `capturePayment(entity.order_id, entity.id)`.
    - `payment.failed` → set Payment `FAILED` with `failureReason = entity.error_description` where it's `CREATED`, and call `logError("payment.failed", …)`.
    - Any exception → `logError("payment.webhook", …)` and return 200 so Razorpay doesn't retry storms.
- [ ] **Step 8: Manual double-replay check** (Review Focus 2)
  - Create a CREATED Payment row for a seeded `PENDING_PAYMENT` user, with `razorpayOrderId:"order_test1"`.
  - Build the body `{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_test1","order_id":"order_test1"}}}}`.
  - Sign it with `node -e` and `createHmac`, then POST it twice to `/api/payment/webhook`.
  - Expected: both 200, the user goes to `PENDING_PROFILE` once, and there's one PAID payment.
  - Then do the same for an ACTIVE user and confirm `expiresAt` moved by exactly 365 days.
- [ ] **Step 9: Verify** with `npx vitest run && npx tsc --noEmit`.
- [ ] **Step 10: Commit** `feat: Razorpay order, verify and webhook with idempotent capture`

---

### Task 8: Health endpoint

**Files:**
- Create: `app/api/health/route.ts`

- [ ] **Step 1: Implement `GET`.** `await prisma.$queryRaw\`SELECT 1\`` → `200 {ok:true, db:"up"}`, or catch → `503 {ok:false, db:"down"}`. Set `export const dynamic = "force-dynamic"` and send no data beyond this. No auth.
- [ ] **Step 2: Verify.** With `npm run dev`, `curl -s localhost:3000/api/health` → `{"ok":true,"db":"up"}`. With a bad `DATABASE_URL` it returns status 503.
- [ ] **Step 3: Commit** `feat: health endpoint that touches the DB`

---

### Task 9: Server-enforced chat, two-message rule, blocking API

**Files:**
- Create: `lib/chat-rules.ts`, `lib/chat-rules.test.ts`, `lib/stream.ts`, `app/api/chat/message/route.ts`, `app/api/chat/state/route.ts`, `app/api/blocks/route.ts`, `scripts/stream-setup.ts`
- Modify: `app/api/chat/token/route.ts`, `app/api/chat/channel/route.ts`, `package.json` (script `"stream:setup": "npx ts-node --compiler-options '{\"module\":\"CommonJS\"}' scripts/stream-setup.ts"`)

**Interfaces:**
- Consumes: `requireActiveMember`, `activeMemberWhere` and `blockedUserIds` (Tasks 4 and 5).
- Produces:
```ts
// lib/chat-rules.ts
export const STARTER_LIMIT = 2;
export type ThreadState = { starterId: string | null; starterCount: number; unlocked: boolean };
export function checkSend(t: ThreadState, senderId: string): { ok: true; next: ThreadState } | { ok: false; reason: "await_reply" };
export type SendBlock = "blocked_by_you" | "blocked_you" | "other_inactive" | "await_reply";
export function channelMembers(channelId: string): [string, string] | null; // "a_b" → [a,b]
export function channelIdFor(a: string, b: string): string;                // sorted, joined by "_"
// lib/stream.ts
export function streamServer(): StreamChat; // StreamChat.getInstance(key, secret)
```
- Routes:
  - `POST /api/chat/message` `{channelId, text}` → `200 {ok:true}` | `403 {error: SendBlock | "inactive"}` | `409 {error:"retry"}`
  - `GET /api/chat/state?channelId=` → `{canSend: boolean, reason: SendBlock | null, otherUserId, iBlocked: boolean}`
  - `GET|POST|DELETE /api/blocks`. POST and DELETE take `{userId}`; GET returns `[{userId, name, photo}]`.

- [ ] **Step 1: Failing tests** for `checkSend`
  - On an empty thread, A sends → ok with `{starterId:A, starterCount:1}`. A again → count 2. A a third time → `{ok:false, reason:"await_reply"}`.
  - Then B → ok and `unlocked:true`. Then A → ok, and stays ok for 10 more sends.
  - B being the first reply after a single A message also unlocks.
  - `channelMembers("x")` → `null`, and `channelIdFor("b","a") === "a_b"`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Message route**, in order:
  1. `requireActiveMember`.
  2. `channelMembers` must include `m.id`.
  3. The other user must match `activeMemberWhere`, else `other_inactive`.
  4. A block either way gives `blocked_by_you` or `blocked_you`.
  5. Text trimmed must be 1–2000 characters.
  6. Load or create the `ChatThread` and run `checkSend`.
  7. Persist with `updateMany({ where: { channelId, starterCount: old.starterCount, unlocked: old.unlocked, starterId: old.starterId }, data: next })`. A count of 0 returns 409 `retry` (Review Focus 4).
  8. Call `streamServer().channel("messaging", channelId).sendMessage({ text, user_id: m.id })`.
  9. If Stream throws, restore the old thread state and `logError("chat.send", …)`, then return 500.
- [ ] **Step 6: State route.** Same checks, no write. Reason priority: `blocked_by_you`, then `blocked_you`, then `other_inactive`, then `await_reply`.
- [ ] **Step 7: Blocks route.** POST is an idempotent `upsert` and refuses to block yourself. DELETE uses `deleteMany`. GET lists my blocks joined to name and photo.
- [ ] **Step 8: Token and channel routes**
  - **token:** `requireActiveMember`, so inactive members get 403 and their chats are hidden. That's the spec's "hidden" choice for expired members.
  - **channel:** `requireActiveMember`, target active and of the opposite gender, not blocked either way. Use `channelIdFor` and create the channel with `streamServer()`, as today.
- [ ] **Step 9: Lock down client sends** in `scripts/stream-setup.ts`
  - Read `streamServer().getChannelType("messaging")`.
  - Remove from the `grants` of roles `user` and `channel_member` every permission id starting with `create-message`, `update-message`, `upload-attachment` or `create-reaction`.
  - Write them back with `updateChannelType("messaging", { grants })` and print before and after.
  - Run it with `npm run stream:setup`.
  - **Verify:** a one-off node snippet that connects as a seeded member with a token from `/api/chat/token` and calls `channel.sendMessage` must reject with a permission error, and `POST /api/chat/message` for the same channel must succeed. Paste both outputs into the commit body. If the grant ids differ from these prefixes, check Stream's "Permissions v2" docs and adjust. The requirement is that a member token can't create messages.
- [ ] **Step 10: Verify** with `npx vitest run && npx tsc --noEmit`.
- [ ] **Step 11: Commit** `feat: server-enforced chat sends, two-message rule, blocking`

---

## Phase B: Member UI (A1 · Garland, Tamil first)

UI tasks have no unit tests. Each one is verified by `npx tsc --noEmit && npm run lint && npm run build`, plus a manual pass in dev at 360px width in **both** languages: no overflow, buttons ≥ 48px, and long Tamil strings wrap rather than clip (Review Focus 1 belongs to Task 3, but the overflow check applies here). The mockup is `.superpowers/brainstorm/*/content/visual-style-v2.html` (option A1); copy its SVG paths for the decoration.

### Task 10: Design system, fonts, i18n

**Files:**
- Create: `lib/i18n/dict.ts`, `lib/i18n/server.ts`, `components/LanguageProvider.tsx`, `components/LangToggle.tsx`, `components/Brand.tsx`, `components/Garland.tsx`, `components/OutsideScreen.tsx`
- Modify: `app/globals.css`, `app/layout.tsx`, `components/providers.tsx`

**Interfaces:**
- Produces:
```ts
// lib/i18n/dict.ts
export const en = { /* flat keys, e.g. "welcome.cta": "Get started" */ } as const;
export type DictKey = keyof typeof en;
export const ta: Record<DictKey, string> = { /* … */ }; // the type forces key parity, so no test is needed
export type Lang = "ta" | "en";
// lib/i18n/server.ts
export async function getLang(): Promise<Lang>; // cookies().get("lang")?.value === "en" ? "en" : "ta"
// components/LanguageProvider.tsx
export function useT(): { lang: Lang; setLang(l: Lang): void; t(k: DictKey, vars?: Record<string, string | number>): string }; // replaces {name} placeholders
// components
<Brand size="lg" | "sm" />                 // wordmark in current lang + smaller Matrimony line
<Garland variant="full" | "thin" />        // full: thoranam + jasmine side strands; thin: thoranam line only. aria-hidden, pointer-events none
<LangToggle />                             // pill showing "EN" when lang=ta and "த" when lang=en; sets cookie lang (max-age 31536000) and router.refresh()
<OutsideScreen>{children}</OutsideScreen>  // ivory bg, Garland full, top bar (Brand sm + LangToggle), centred column max-w-md
```

- [ ] **Step 1: Tokens.** Replace the `:root` values in `globals.css` with the palette above, keeping the existing token names so current classes keep working. Change `--primary-dark` to `#6d1421` and `--accent` to `#c9a24a`. Update the `rgba` shadows to maroon. Remove `.otp-input`.
- [ ] **Step 2: Fonts and layout**
  - In `layout.tsx`, swap the fonts for `Noto_Sans_Tamil` (400/500/600/700, subsets `["tamil","latin"]`, var `--font-sans`) and `Noto_Serif_Tamil` (600/700, var `--font-serif`).
  - Set `<html lang={await getLang()}>` and pass `initialLang` to `Providers` and then `LanguageProvider`.
  - Metadata title: "Kalyana Varan Matrimony".
- [ ] **Step 3: Components.** Build the components and seed the dictionary with `brand.*`, `common.*` (back, next, call us, sign out) and `lang.*`.
- [ ] **Step 4: Verify** with `npx tsc --noEmit && npm run build`. Temporarily render `<OutsideScreen>` on `/welcome` and confirm the look matches mockup A1 and that the toggle flips the language and survives a reload.
- [ ] **Step 5: Commit** `feat: A1 Garland design tokens, Tamil fonts, i18n`

### Task 11: Outside screens

**Files:**
- Modify: `app/(auth)/welcome/page.tsx`, `app/(auth)/sign-in/page.tsx`, `app/(protected)/payment/page.tsx`, `app/(protected)/review/page.tsx`
- Create: `app/(auth)/features/page.tsx`, `app/(auth)/sign-up/page.tsx`, `app/(protected)/account-status/page.tsx`

**Interfaces:**
- Consumes: `OutsideScreen`, `useT` (Task 10), `/api/auth/register` (Task 3), `/api/payment/order` and `/api/payment/verify` (Task 7), `/api/user/status` (Task 4).

- [ ] **Step 1: Welcome.** `OutsideScreen`, then `Brand lg`, the tagline, the gold divider ornament, the trust chips ("100% safe", "Verified profiles"), a primary "Get started" button → `/features` and a secondary "Sign in" → `/sign-in`.
- [ ] **Step 2: Features carousel**
  - 4 slides: verified profiles, safe private chat, the Tamil community, and "₹{amount} for one year".
  - `page.tsx` is a server component that passes `amount = membershipAmountPaise() / 100` to a client carousel component, so the price has a single source (env).
  - Use native CSS `scroll-snap` with dot indicators, plus "Skip" and "Next". The last slide's primary button → `/sign-up`.
  - You draft the copy in both languages.
- [ ] **Step 3: Sign-up.** Name, phone (`inputMode="tel"`, a visible `+91` prefix) and password with a show toggle. POST to register, then `signIn("member", {phone, password, redirect:false})`, then `router.push("/dashboard")`. On a 409, show "already registered → sign in".
- [ ] **Step 4: Sign-in.** Phone and password via `signIn("member")`. Under the form: "Forgot password? Call us on {NEXT_PUBLIC_SUPPORT_PHONE}" as a `tel:` link, plus a link to `/sign-up`.
- [ ] **Step 5: Payment**
  - Load `https://checkout.razorpay.com/v1/checkout.js` with `next/script`.
  - The button POSTs to order, then opens `new window.Razorpay({ key, order_id, amount, currency:"INR", name:"Kalyana Varan Matrimony", handler })`. The handler POSTs to verify, then `router.push(next)`.
  - Read the status: show renewal copy when it's `EXPIRED` or `ACTIVE` (early renewal from the banner), and first-time copy otherwise.
  - On failure or dismissal, show a retry button and the support number.
- [ ] **Step 6: Review and account status**
  - Review: "under review" copy and the support number.
  - Account status: reads the status and shows the not-approved copy (`REJECTED`) or suspended copy (`SUSPENDED`), with the support number and a sign-out button.
  - Any other status redirects to `/dashboard`.
- [ ] **Step 7: Verify** with a build, then walk welcome → features → sign-up → payment in dev using Razorpay **test keys** and test card `4111 1111 1111 1111`. You should land on `/register`. Repeat the walk in English.
- [ ] **Step 8: Commit** `feat: welcome, carousel, sign-up/in, Razorpay payment, status screens`

### Task 12: Registration form

**Files:**
- Modify: `app/(protected)/register/page.tsx`

- [ ] **Step 1: Restyle and translate** the existing 4-step form inside `OutsideScreen`, keeping the per-step validation and the progress bar.
  - Every label, placeholder, option and error comes from the dictionary.
  - Gender options read மணமகள் / Bride and மணமகன் / Groom.
  - Uploads go through `/api/profile/upload`, which now goes to R2.
  - On success, `router.push("/dashboard")`, which lands on `/review`.
- [ ] **Step 2: Verify** with a build, then complete the form in dev in Tamil. The user should land on `/review` and the photos should load from the R2 URL.
- [ ] **Step 3: Commit** `feat: Tamil-first registration form`

### Task 13: Main app screens

**Files:**
- Modify: `components/MainShell.tsx`, `app/(protected)/(main)/home/page.tsx`, `favorites/page.tsx`, `profile/[id]/page.tsx`, `settings/page.tsx`, `edit-profile/page.tsx`

**Interfaces:**
- Consumes: `/api/blocks` (Task 9) and `/api/account/password` (Task 3).

- [ ] **Step 1: MainShell**
  - `Garland thin` at the top and `LangToggle` in the header.
  - Bottom nav with icon plus text label; the active tab gets a gold underline.
  - Expiry banner: when `expiresAt − now ≤ 7 days`, show "{n} days left — Renew" with a button → `/payment`.
- [ ] **Step 2: Home, favourites and profile detail.** Restyle the cards to the mockup: white, `rounded-[18px]`, soft shadow, a green verified badge. Translate everything.
- [ ] **Step 3: Settings**
  - Membership valid until {date} and a Renew button.
  - The language switch.
  - A change-password form.
  - A blocked-people list with an Unblock button for each (DELETE `/api/blocks`).
  - Sign out.
- [ ] **Step 4: Edit profile.** Restyle and translate it; saving goes live immediately.
- [ ] **Step 5: Verify** with a build. In dev at 360px in both languages: block and unblock round-trip from Settings, and the banner shows after setting `expiresAt` to now + 3 days in the database.
- [ ] **Step 6: Commit** `feat: restyled main app, settings with password, blocks, renewal banner`

### Task 14: Chat screens

**Files:**
- Modify: `app/(protected)/(main)/chats/page.tsx`, `app/(protected)/(main)/chats/[channelId]/page.tsx`

**Interfaces:**
- Consumes: `POST /api/chat/message`, `GET /api/chat/state` and `POST /api/blocks` (Task 9).

- [ ] **Step 1: Sending**
  - Replace `channel.sendMessage` with `fetch("/api/chat/message")`, and delete the client-side `consecutiveOwnMessages` rule.
  - Fetch `/api/chat/state` on load and after every send or `message.new` event.
  - When `canSend` is false, replace the input with a notice per reason:
    - `await_reply`: "You can send more once they reply."
    - `blocked_you`: "This person has blocked you."
    - `blocked_by_you`: "You blocked this person." with an Unblock button.
    - `other_inactive`: "This member is no longer active."
- [ ] **Step 2: Block action** in the chat header menu. A confirm dialog built in-page (not `window.confirm`) POSTs to `/api/blocks`, then refreshes the state.
- [ ] **Step 3: Deleted messages.** Render a message with `message.type === "deleted"` as the italic `t("chat.removedByAdmin")`.
- [ ] **Step 4: Restyle and translate** both screens.
- [ ] **Step 5: Verify** with a build. With two seeded members in two browsers:
  - The starter is stopped after 2 messages and unlocked after a reply.
  - Block shows "blocked you" on the other side.
  - Double-tapping send on message 2 never yields a 3rd.
- [ ] **Step 6: Commit** `feat: chat UI on server send API with block and limits`

---

## Phase C: Admin panel (English, plain)

### Task 15: Staff auth, permissions, activity log

**Files:**
- Create: `lib/permissions.ts`, `lib/permissions.test.ts`, `lib/staff.ts`, `app/admin/login/page.tsx`, `app/admin/(panel)/layout.tsx`
- Modify: `lib/auth.ts`, `lib/member.ts` (only to call `sessionKind`)

**Interfaces:**
- Produces:
```ts
// lib/permissions.ts
export type Permission = "view" | "moderate" | "manage_staff" | "view_logs";
export function can(role: StaffRole, p: Permission): boolean; // VIEWER: view; ADMIN: view, moderate; SUPER_ADMIN: all
export function sessionKind(s: { user?: { kind?: string } } | null): "member" | "staff" | null;
// lib/staff.ts
export type StaffUser = { id: string; username: string; role: StaffRole };
export async function requireStaff(p: Permission): Promise<StaffUser>; // no staff session → redirect("/admin/login"); inactive staff → redirect("/admin/login"); lacks p → redirect("/admin?denied=1")
export async function logActivity(staffId: string, action: string, targetUserId?: string, details?: Record<string, unknown>): Promise<void>;
```
- NextAuth: a second Credentials provider, `id: "staff"` (username and password, active staff only). JWT gets `kind:"staff"` and `role`.

- [ ] **Step 1: Failing tests**
  - `can("VIEWER","moderate") === false`, `can("ADMIN","moderate") === true`, `can("ADMIN","manage_staff") === false`, `can("SUPER_ADMIN","view_logs") === true`.
  - `sessionKind(null) === null` and `sessionKind({user:{kind:"staff"}}) === "staff"`. An unknown kind returns `null`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Wire it in**
  - `getMember` returns `null` unless `sessionKind === "member"`, and `requireStaff` redirects unless it's `"staff"`. Re-read `Staff.active` on every `requireStaff` call so deactivation takes effect immediately.
  - The login page is a plain form calling `signIn("staff")`.
  - The panel layout has a left nav (Home, Waitlist, Users, Create user, Chats, Blocks, Payments, plus Staff, Activity and Errors for super admins only) and shows the username, role and sign out.
- [ ] **Step 6: Verify** with `npx vitest run && npm run build`. In dev:
  - The seeded super admin logs in.
  - A member session visiting `/admin` is redirected to `/admin/login`.
  - A staff session calling `/api/profiles` gets 401.
- [ ] **Step 7: Commit** `feat: staff auth, roles, activity log`

### Task 16: Admin home, waitlist, users and user actions

**Files:**
- Create: `app/admin/(panel)/page.tsx`, `waitlist/page.tsx`, `users/page.tsx`, `users/[id]/page.tsx`, `app/admin/actions.ts`, `app/admin/_components/ProfileFields.tsx`

**Interfaces:**
- Consumes: the lifecycle functions (Task 2), `saveProfile`/`parseProfileInput`/`storeImage` (Task 6), `recordManualPayment` (Task 7), `normalizePhone` (Task 3), and `requireStaff`/`logActivity` (Task 15).
- Produces (server actions in `app/admin/actions.ts`, each returning `Promise<{ error?: string }>`):
  - `approveUser(userId)`, `rejectUser(userId)`, `suspendUser(userId)`, `unsuspendUser(userId)`
  - `markPaid(userId)`, `setExpiry(userId, isoDate)`, `resetMemberPassword(userId, newPassword)`
  - `saveMemberProfile(userId, formData)` and `createMember(formData)`
  - Every action calls `requireStaff("moderate")` first, converts `TransitionError` to `{error}`, calls `logActivity` with action names equal to the function names, and calls `revalidatePath`.

- [ ] **Step 1: Home.** Counts:
  - waitlist (`PENDING_REVIEW`)
  - active (`activeMemberWhere`)
  - expiring within 7 days
  - expired (`ACTIVE` with `expiresAt ≤ now`)
  - rejected and suspended
  - PAID payments this calendar month, as a count and ₹ total
- [ ] **Step 2: Waitlist.** A `PENDING_REVIEW` table sorted by `updatedAt asc`, with each row linking to the user page.
- [ ] **Step 3: Users.** A `?q=` search (name contains, case-insensitive, or phone contains digits) and a `?status=` filter that includes `EXPIRED` as a derived filter. Paginate at 50.
- [ ] **Step 4: User page**
  - Photos, all fields, effective status, `expiresAt` and a payment history list.
  - Forms for each action (shown only when `can(role,"moderate")`) and the editable `ProfileFields` form.
  - Photo inputs upload via `storeImage(file, "members/" + userId)` inside the action.
  - `saveMemberProfile` uses `saveProfile`, so a `PENDING_PROFILE` user with now-complete details moves to `PENDING_REVIEW`.
- [ ] **Step 5: Verify** with a build. In dev as ADMIN:
  - Approve a waitlisted user, who then reaches `/home`.
  - Disapprove another, who sees `/account-status`.
  - Mark paid on a `PENDING_PAYMENT` user with a complete profile, who goes to `PENDING_REVIEW`.
  - Set expiry to yesterday, after which the user lands on `/payment`.
  - Logged in as VIEWER, the action forms aren't rendered and calling an action directly returns a redirect.
- [ ] **Step 6: Commit** `feat: admin home, waitlist, users and moderation actions`

### Task 17: Create walk-in user

**Files:**
- Create: `app/admin/(panel)/users/new/page.tsx`

- [ ] **Step 1: Build the form** using `ProfileFields` plus name, phone, an initial password and a "Mark as paid" checkbox, submitted to `createMember`.
  - `createMember` creates the user and `saveProfile`.
  - If "Mark as paid" is ticked, it calls `recordManualPayment`, so a complete profile ends up at `PENDING_REVIEW`.
  - If the phone already exists, it returns `{error}`.
  - On success, redirect to the user page so staff can approve.
- [ ] **Step 2: Verify.** Create a walk-in with the paid box ticked: they should land on the waitlist, then approve them and sign in as them with the given password. Create one without the box: they should be `PENDING_PAYMENT`, and that member can sign in and pay in the app.
- [ ] **Step 3: Commit** `feat: admin walk-in user creation`

### Task 18: Chats, blocks and payments pages

**Files:**
- Create: `app/admin/(panel)/chats/page.tsx`, `chats/[channelId]/page.tsx`, `blocks/page.tsx`, `payments/page.tsx`
- Modify: `app/admin/actions.ts` (add `deleteChatMessage(messageId: string, channelId: string)`)

- [ ] **Step 1: Chats list** (`requireStaff("view")`). It takes `?userId=` (with a user search box) and uses `streamServer().queryChannels({ type: "messaging", members: { $in: [userId] } }, { last_message_at: -1 }, { limit: 50 })`. Show the other person's name from the DB, the last message and the time.
- [ ] **Step 2: Chat detail.** `channel.query({ messages: { limit: 300 } })` in a plain list. Each message has a Delete button (moderate only) that calls `deleteChatMessage`, which calls `streamServer().deleteMessage(messageId)` (soft delete) and `logActivity`. Deleted messages show "removed by admin".
- [ ] **Step 3: Blocks.** A table of blocker → blocked with dates, plus a "blocked count" column per blocked user, sorted by that count descending.
- [ ] **Step 4: Payments.** All payments: user, ₹ amount, method, status, Razorpay ids, `markedById` resolved to a username, and created/paid times, filterable by status.
- [ ] **Step 5: Verify** with a build. As VIEWER you can read a chat but see no Delete. As ADMIN, delete a message and the member's chat shows "removed by admin" (Task 14).
- [ ] **Step 6: Commit** `feat: admin chats, blocks, payments`

### Task 19: Super admin pages

**Files:**
- Create: `app/admin/(panel)/staff/page.tsx`, `activity/page.tsx`, `errors/page.tsx`
- Modify: `app/admin/actions.ts` (add `createStaff(formData)`, `setStaffActive(staffId, active)`, `setStaffRole(staffId, role)`, `resetStaffPassword(staffId, pw)`, all `requireStaff("manage_staff")`)

- [ ] **Step 1: Staff.** List and create staff (username, password ≥ 8, role), activate or deactivate, change role, reset password. A super admin can't deactivate or demote themselves.
- [ ] **Step 2: Activity.** The latest 200 `ActivityLog` rows with the staff username, filterable by staff and action (`requireStaff("view_logs")`).
- [ ] **Step 3: Errors.** Two tables (`view_logs`): `FAILED` payments with `failureReason`, and the latest 200 `ErrorLog` rows with expandable details.
- [ ] **Step 4: Verify** with a build. As ADMIN, `/admin/staff` redirects with `denied`. As SUPER_ADMIN, create a VIEWER and log in as them.
- [ ] **Step 5: Commit** `feat: super admin staff, activity and error pages`

---

## Phase D: Operations

### Task 20: Backups, README, final verification

**Files:**
- Create: `.github/workflows/db-backup.yml`
- Modify: `README.md`

- [ ] **Step 1: Workflow**
  - Triggers: `schedule: - cron: "30 20 * * *"` (02:00 IST) and `workflow_dispatch`.
  - Runner and client: `ubuntu-latest`. Install the PGDG apt repo and `postgresql-client-17`. Before writing, confirm the Supabase major version with `select version()` and match it.
  - Dump: `pg_dump "$BACKUP_DATABASE_URL" --no-owner --no-privileges -Fc -f backup.dump`.
  - Encrypt: `gpg --batch --yes --pinentry-mode loopback --passphrase "$BACKUP_PASSPHRASE" --symmetric --cipher-algo AES256 -o "kv-$(date -u +%Y%m%dT%H%MZ).dump.gpg" backup.dump`.
  - Upload: `actions/upload-artifact@v4` with `retention-days: 30`.
  - Secrets: `BACKUP_DATABASE_URL` (the Supabase **session pooler** URL) and `BACKUP_PASSPHRASE`.
- [ ] **Step 2: README.** Cover:
  - The Kalyana Varan Matrimony overview and stack.
  - Setup from `.env.example`: Supabase pooler URLs, R2 bucket with public access, Razorpay test keys and a webhook pointing at `/api/payment/webhook` with events `payment.captured`, `order.paid` and `payment.failed`.
  - `npx prisma migrate deploy`, `npm run db:seed` and `npm run stream:setup`.
  - The uptime monitor pointed at `/api/health`.
  - Restore: download the artifact, run `gpg --decrypt`, then `pg_restore --no-owner -d "$TARGET_URL"`.
  - The Vercel Hobby non-commercial note.
- [ ] **Step 3: Final verification.** Run `npx vitest run && npx tsc --noEmit && npm run lint && npm run build` and expect all green. Then `grep -ri sangam app components lib README.md` should return nothing.
- [ ] **Step 4: Manual end-to-end in dev**, in Tamil then English:
  - A new member goes sign-up → pay (test card) → register → waitlist.
  - An admin approves them.
  - The member chats with a seeded member: 2-message limit, reply unlock, block, admin deletes a message.
  - Setting expiry to yesterday hides the profile and chats; renewing restores them immediately.
- [ ] **Step 5: Run the backup workflow manually** after pushing the branch. It needs the repo secrets set, so this is the owner's step if the secrets aren't available. The run should succeed and produce a `.dump.gpg` artifact.
- [ ] **Step 6: Commit** `chore: daily encrypted DB backups, README`
