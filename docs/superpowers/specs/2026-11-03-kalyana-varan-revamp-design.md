# Kalyana Varan Matrimony revamp: design

Date: 2026-11-03
Status: draft for approval

## Intent

Kalyana Varan Matrimony is a Tamil matrimony web app (mobile-first). Families and individuals,
many of them older or not very comfortable with phones, pay ₹500 for one year
of access, a human admin vets each profile, and approved members browse matches
and chat.

The revamp turns the current prototype into something the owner can actually run:

- The UI looks plain. It should feel rich, traditional and trustworthy, but stay simple to use.
- Payment is a stub. It should take real money through Razorpay.
- Approval is a manual DB edit. It should be an admin panel that 3 staff use daily.
- SMS OTP would cost money on every signup. Remove it and spend nothing on external
  messaging services.
- Users need to be able to block someone from chat.

Nothing is live. All current data is dummy, and the new database starts empty.

## Goals

1. Restyle every user-facing screen in the agreed look ("A1 · Garland", below), Tamil by default.
2. New signup order: welcome → features carousel → create account → pay → profile details → waitlist → approval.
3. Real Razorpay payment, verified server-side, for ₹500 per year of access, with renewal.
4. Remove OTP entirely. Phone and password only. Forgotten passwords are reset by staff.
5. Admin panel with three roles, covering moderation, users, chats, payments and blocks.
6. Blocking inside chat.
7. Move to Supabase Postgres (fresh) and Cloudflare R2 for photos, with our own
   encrypted daily backups.

## Non-goals

- No SMS, email or WhatsApp sending of any kind (cost).
- No refund handling in the app. Refunds are done manually outside it, and there's no ledger.
- No auto-renew or recurring billing. Each year is a fresh one-time payment.
- No admin panel styling effort. It should be plain, functional and in English.
- No data migration from the current DB.
- No complex matching (no scoring engine, no preference settings, no horoscope
  matching), and no new profile fields beyond what's listed here. Simple matching is
  described below.

## Anti-goals (failure even if it "works")

- Decoration that distracts or makes screens feel busy. It must stay faint.
- Anything that confuses a first-time, low-literacy or elderly user: hidden gestures,
  tiny icons without labels, more than one main action per screen.
- A user reaching the active app, or appearing in others' matches, without being
  approved and inside a paid, unexpired year.
- Marking someone paid based on a client-side callback alone.
- Any recurring cost being introduced without the owner choosing it.

## Constraints

- Existing stack stays: Next.js 16 App Router, TypeScript, Prisma 5, NextAuth v5
  (Credentials + JWT), Stream Chat (`stream-chat` client with custom UI, not
  `stream-chat-react` components), Tailwind v4.
- **Database:** Supabase Postgres, free plan, used only as a plain Postgres database
  through Prisma. We don't use Supabase Auth, Storage or its client library. The limits:
  - 500 MB of database storage. Going over makes it read-only, but our data is text
    only and well under that.
  - The project pauses after 7 days with no activity. The uptime monitor prevents this
    (see the health section).
  - No automatic backups on the free plan. We add our own (see "Backups").

  Use Supabase's pooled connection for the app (transaction pooler, port 6543,
  `?pgbouncer=true`) as `DATABASE_URL`, and the session or direct connection as
  `DIRECT_URL` for Prisma migrations (`directUrl` in the schema). Start from a clean
  migration history if that's simpler. Nothing needs preserving.
- **Photos:** Cloudflare R2 free plan (10 GB storage, free downloads). Uploading to
  `public/uploads` on local disk must go; it doesn't survive serverless hosting.
  Resize and compress uploads to roughly ≤200 KB each.
- **Hosting:** Vercel, on the free Hobby plan for now. The owner will upgrade to Pro
  later; Hobby's terms forbid commercial use, and the owner knows this. Node runtime.
  Plain Node-compatible code (e.g. `sharp` for resizing) is fine. Don't target the
  Cloudflare Workers or edge runtime.
- Indian phone numbers, stored as `+91XXXXXXXXXX` (the current format).

## Decided: look and feel

The reference mockup is `.superpowers/brainstorm/*/content/visual-style-v2.html`, option A1.

- **Palette:** ivory background (`#fcf8f0`), deep maroon for the primary action and headings
  (`#8e1b2c`), gold for accents (`#c9a24a`: dividers, borders, icons, the active-tab
  underline). Gold should be used a little more than in the mockup, but always as an
  accent and never as a large fill. Use soft green only for "verified" or success states.
- **Decoration ("Garland"):** a faint mango-leaf thoranam across the top and jasmine
  strands down the sides, plus a small gold divider ornament under titles.
  - Full decoration on "outside" screens: welcome, features carousel, sign-in and
    create account, payment, waitlist, disapproved, renew.
  - Inside the app (matches, favourites, chats, profile, settings): only a thin
    thoranam line at the top.
- **Modern but simple:** generous spacing, soft shadows, rounded cards, no heavy
  frames, one main button per screen, large tap targets (≥48px), large readable text,
  and labels on every icon.
- **Language:** Tamil is the default. An EN pill sits in the top corner of every
  user-facing screen and toggles Tamil/English. The choice is remembered on that
  device (cookie or localStorage is fine). Every user-facing string exists in both
  languages. Fonts are Noto Serif Tamil for headings and Noto Sans Tamil for body,
  used for English too.
- **Brand (owner's decision):** the main wordmark is **Kalyana Varan** (Tamil:
  **கல்யாண வரன்**), always paired with "Matrimony" (Tamil: **மேட்ரிமோனி**) as a smaller
  line under or beside it, so it's clear this is a matrimony app. The full name is
  "Kalyana Varan Matrimony". Replace every "Sangam" or "Matrimony"-only title in the
  app, the metadata and the README.

## Decided: user lifecycle

States (replacing the current enum):

| State | Meaning | Where the user lands |
|---|---|---|
| `PENDING_PAYMENT` | Account created, not paid | Payment screen |
| `PENDING_PROFILE` | Paid, details not complete | Profile form |
| `PENDING_REVIEW` | Paid and details complete; on the waitlist | Waitlist screen |
| `ACTIVE` | Approved and inside a paid year | Main app |
| `REJECTED` | Admin disapproved | "Not approved, please call us" screen |
| `EXPIRED` | Year ran out | Renew screen |
| `SUSPENDED` | Admin pulled an active user | "Account suspended, please call us" screen |

Rules:

- The year of access starts on the **approval date**, not the payment date, and lasts 365 days.
- **Renewal:** an `EXPIRED` user pays ₹500 and goes straight back to `ACTIVE` for a
  new year. There's no re-approval.
- **Expiry:** the profile disappears from everyone's matches, favourites and profile
  views, and their chats lock (read-only or hidden; the builder decides, as long as
  no new messages can be sent either way). This must work without a cron job, e.g.
  by treating `expiresAt < now` as expired when reading. A cron job is optional.
- From 7 days before expiry, show an in-app banner with a renew button.
- **Access must be enforced on the server** for every main-app page and API
  (feed, profile detail, favourites, chat token, chat channel), not just by the
  client-side `/dashboard` redirect. Today the `(main)` layout and `/api/profiles`
  only check that someone is signed in, which is a known gap to close.
- Admins can edit any user's details at any time, in any state.
- **Members' own edits** (`/edit-profile`, photos included) go live immediately with
  no re-approval. This is the owner's decision.
- **Matches show only the opposite gender** (bride ↔ groom), on top of the existing
  exclusions. *My call:* the current feed doesn't filter by gender.
- **Renewal timing:** *my call.* An `ACTIVE` member who pays early gets 365 days added
  to their current `expiresAt`, so nothing is lost. An `EXPIRED` member's new year
  starts on the payment date. Staff "mark paid" follows the same rules.
- **Suspension:** *my call.* The year keeps running during a suspension. The profile is
  hidden and chats are locked, the same as on expiry. Unsuspending restores `ACTIVE`
  with the same `expiresAt`, or `EXPIRED` if that date has already passed.
- **Allowed admin moves:** *my call.*
  - Approval requires a recorded payment.
  - Marking paid a `PENDING_PAYMENT` user whose profile is already complete moves
    them straight to `PENDING_REVIEW`; otherwise they move to `PENDING_PROFILE`.
  - A `REJECTED` user can be approved later, and their year starts on that approval date.
  - Disapproving is possible from `PENDING_PROFILE` or `PENDING_REVIEW`.
  - The server enforces these moves as an explicit transition table, covered by tests.

## Decided: signup and payment flow

1. **Welcome screen:** "Get started" and "Sign in".
2. **Features carousel:** 3–4 swipeable slides covering verified profiles, safe
   private chat, the Tamil community and ₹500/year. There's a Skip button and the last
   slide has "Get started". The slide copy is the builder's to draft in both languages.
3. **Create account:** name, phone and password (minimum 8 characters, as now). There's
   no OTP, and the user is signed in immediately and sent to payment. The admin review
   step is what catches someone using a number that isn't theirs.
4. **Payment:** ₹500 through Razorpay Checkout (standard web checkout).
   - Create a Razorpay order on the server, open Checkout on the client, then verify
     the payment signature on the server before advancing the status.
   - Also handle the Razorpay webhook (`payment.captured` / `order.paid`),
     signature-verified and idempotent, so a payment still counts if the user closes
     the tab before the client callback runs.
   - Record each payment (amount, Razorpay IDs, method `RAZORPAY` or `MANUAL`, who
     marked a manual one, and when).
   - Leaving halfway is fine: signing in again lands them back on payment.
   - The amount comes from config (env), not hard-coded in several places.
5. **Profile details:** the existing 4-step form (personal → professional → community
   → photos), restyled and translated, with photos going to R2. The fields are unchanged.
6. **Waitlist screen:** "Your profile is under review" plus the support phone number.
7. **After admin action:** `ACTIVE` goes into the app, and `REJECTED` sees the "not
   approved, please call [number]" screen.

**Forgot password:** the sign-in screen shows "Forgot password? Call us on
[number]", and staff reset it in the admin panel. Signed-in users can also change their own
password in Settings (current password plus new password). Remove the OTP routes, the
pages (`verify-phone`, `reset-password`, the OTP part of `set-password`) and the
`PhoneOtp` / `PhoneVerification` models.

The support phone number comes from config (env).

## Decided: admin panel

Plain, functional and in English, at `/admin`. It looks only as good as it needs to in order to be usable.

**Auth:** staff accounts are separate from member accounts, with username and password
and their own login at `/admin/login`. The super admin creates and manages staff
accounts. An initial super admin is created via the seed script or an env variable.
Member and staff sessions must not grant each other access.

**Roles:**

| | Viewer | Admin | Super admin |
|---|---|---|---|
| View everything (users, profiles, photos, chats, payments, blocks) | ✓ | ✓ | ✓ |
| Approve or disapprove, edit any profile, create users | | ✓ | ✓ |
| Mark paid (manual), change expiry date, suspend or unsuspend | | ✓ | ✓ |
| Reset member passwords | | ✓ | ✓ |
| Delete chat messages | | ✓ | ✓ |
| Manage staff accounts | | | ✓ |
| Activity log, failed payments, app errors | | | ✓ |

**Screens:**

- **Home:** counts for waitlist, active, expiring in the next 7 days, expired,
  rejected and suspended, plus payments this month (count and ₹ total).
- **Waitlist:** `PENDING_REVIEW` users, oldest first. Open one to see the details and
  photos, edit them, then approve (sets `ACTIVE` and starts the year) or disapprove.
- **Users:** search by name or phone and filter by status. Open a user to edit
  everything (including photos), reset their password, mark them paid, change their expiry,
  suspend or unsuspend, or approve or disapprove.
- **Create user (walk-in):** one page with account fields (name, phone, a password
  the staff member gives the person) plus the full profile form and photo upload,
  and an optional "mark as paid" tick.
  - Case A: a walk-in pays via a Razorpay payment link sent outside the app. Staff
    create the user, tick "paid", fill the details, then approve.
  - Case B: the member signs up and pays in-app, then stops. Staff open them from
    Users and fill in the details.
- **Chats:** pick a user, list their conversations, open one and read it. Admins can
  delete individual messages, which then show "removed by admin" to both people. This
  uses the Stream server client. Message history lives in Stream, not in our DB.
- **Blocks:** list who blocked whom and when, so repeat-blocked users stand out.
- **Payments:** every payment with user, amount, method (Razorpay or manual), Razorpay
  IDs, who marked it, and when.
- **Super admin only:**
  - **Activity log:** every staff write action (who, what, which user, when).
  - **Failed payments:** failed or unverified Razorpay attempts and webhook errors.
  - **App errors:** recent server errors captured by the app (a simple DB table is
    fine). Detailed logs stay in the hosting dashboard.

## Decided: simple matching

The owner asked for simple matching. The exact weights are *my call*:

- **Who appears:** only `ACTIVE`, unexpired, opposite-gender members, excluding
  yourself, anyone you've dismissed or favourited (as today), and anyone in a block
  with you in either direction.
- **Order:** by a small score, highest first, with ties broken newest first:
  - +3 for the same community (caste), case-insensitive exact match.
  - +2 for the same location, case-insensitive exact match.
  - +1 if the age difference is 5 years or less.
- All of this is computed in the query or in a few lines of code. There's no stored
  score, no preference settings, and nothing for the member to configure.

## Decided: health endpoint (keeps Supabase from pausing)

- Add `GET /api/health`. It runs `SELECT 1` against the database and returns
  `200 {"ok":true,"db":"up"}`, or `503` if the database can't be reached.
- The owner's uptime monitor (added later) will hit this every few minutes. That both
  alerts on outages and keeps the Supabase free project from pausing after 7 idle
  days. Supabase's free plan doesn't charge for running hours, so frequent pings cost
  nothing.
- No authentication, and the response contains no data beyond up or down.

## Decided: backups (GitHub Action)

Supabase free has no automatic backups. This copies the owner's existing pattern
from another project:

- A scheduled GitHub Actions workflow runs **daily** (*my call*) and can also be
  triggered manually.
- It runs `pg_dump` against the database, using a `postgresql-client` version that
  matches the Supabase server's Postgres major version. It encrypts the dump with
  `gpg --symmetric` (AES-256) using a passphrase stored as a repo secret, and uploads
  it as a workflow artifact with `retention-days: 30`.
- Connect through Supabase's **session pooler** URL, not the direct host. The direct
  connection is IPv6-only on the free plan, and GitHub-hosted runners don't have IPv6.
- Repo secrets: `BACKUP_DATABASE_URL` and `BACKUP_PASSPHRASE`.
- The README gets a short "restore from backup" section: download the artifact,
  `gpg --decrypt`, then `psql` or `pg_restore` into a database.
- The daily run also counts as database activity, which is a second guard against the
  7-day pause.

## Decided: starting a chat (two-message rule)

- Any `ACTIVE` member can open a chat with any `ACTIVE` member they can see
  (not blocked, opposite gender).
- Whoever starts the chat can send **at most 2 messages** until the other person replies.
- Once the other person sends any message, the limit is lifted for both people for good.
- In the UI, after the starter's 2nd message, the message box is replaced with a
  notice (Tamil and English): "You can send more once they reply."
- This **must be enforced on the server**, not just hidden in the UI. Today the client
  sends straight to Stream with a user token, so a modified client could get around a
  UI-only limit. Approaches include routing sends through our API with the Stream
  server client, or Stream's pre-send hook; the builder decides. The same server-side
  enforcement point should also block sends for expired, suspended and blocked users.

## Decided: blocking

- In a chat, there's a "Block" action with a confirmation.
- After blocking, neither person can send messages to the other. They disappear from
  each other's matches, favourites and profile views.
- **The blocked person is told:** their chat with that person shows "This person has
  blocked you" in place of the message box.
- The blocker sees the chat as blocked and can unblock from Settings, which has a list
  of blocked people.
- Blocks are recorded in our DB, which is the source of truth for feed filtering and
  the admin Blocks screen. Enforcement in chat can use Stream's features (e.g.
  freezing the channel or banning within the channel) as long as the server enforces it
  and it doesn't rely on the client alone.

## Left to the builder

- i18n mechanism (a simple dictionary is fine; no need for a heavy library).
- SVG artwork for the thoranam and jasmine, based on the mockup.
- Carousel slide copy (Tamil and English).
- Exact schema shape (payments, staff, blocks, activity and error tables) and the
  route structure for admin.
- Image resizing approach and R2 key layout.
- Whether expired chats are hidden or read-only.
- How member and staff sessions are separated (e.g. a second NextAuth provider with a
  role on the token, or a separate cookie).
- Tests: add focused checks where logic can break: status transitions and gating,
  payment signature and webhook verification, role permissions, block filtering, and
  the two-message rule.

## Config the owner must provide

`DATABASE_URL` and `DIRECT_URL` (Supabase), the backup secrets in GitHub
(`BACKUP_DATABASE_URL`, `BACKUP_PASSPHRASE`), the R2 bucket and keys, the Razorpay key ID, secret and webhook
secret, the Stream key and secret (existing), the support phone number, the membership
amount (default ₹500), and the initial super admin credentials.
