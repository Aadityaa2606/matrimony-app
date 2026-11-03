# Kalyana Varan Matrimony

Tamil/English matrimony app: members sign up, pay the yearly fee, register a profile, wait for admin approval, then browse matches and chat (2-message limit until the other side replies). Admins moderate from `/admin`.

Stack: Next.js 16 (App Router), TypeScript, Prisma 5 + Supabase Postgres, NextAuth v5, Stream Chat, Razorpay, Cloudflare R2, Tailwind v4, Vitest.

## Setup

1. `npm install`, then `cp .env.example .env` and fill it in (each key is commented there).
2. **Supabase**: `DATABASE_URL` = transaction pooler (port 6543, `?pgbouncer=true`); `DIRECT_URL` = session pooler (port 5432), used for migrations.
3. **R2**: create a bucket with public access (or a custom domain) and put that URL in `R2_PUBLIC_URL`. `next.config` only allows that image host when it is set.
4. **Razorpay** (test keys first): enable **auto-capture** in the dashboard (the verify step treats a valid checkout signature as paid). Add a webhook to `https://<host>/api/payment/webhook` with events `payment.captured`, `order.paid`, `payment.failed`, and put its secret in `RAZORPAY_WEBHOOK_SECRET`. A missing `RAZORPAY_*` secret makes payments fail closed (500 "misconfigured").
5. Migrate and seed:
   ```bash
   npx prisma migrate deploy
   SUPERADMIN_USERNAME=admin SUPERADMIN_PASSWORD=... npm run db:seed
   npm run stream:setup   # once per Stream app: locks client-side message/channel writes
   ```
   `npm run db:seed` only upserts the super admin (cost-12 bcrypt) and touches nothing else. For local demo data run `SEED_DEMO=1 npm run db:seed`: it wipes users/profiles/payments, adds 20 fake members (password `password123`), and refuses unless `DATABASE_URL` points at localhost/127.0.0.1.
6. `npm run dev`, `npm test`.

## Operations

- **Uptime monitor**: point it at `/api/health` (runs `SELECT 1`; the pings also keep the free Supabase project from pausing).
- **Hosting**: Vercel Hobby is non-commercial. Upgrade to Pro before taking real payments.

## Backups

`.github/workflows/db-backup.yml` runs daily at 02:00 IST (and on demand): `pg_dump`, AES-256 `gpg` encryption, uploaded as an artifact kept 30 days. Repo secrets: `BACKUP_DATABASE_URL` (Supabase **session pooler** URL, port 5432) and `BACKUP_PASSPHRASE`.

Restore: download the artifact, then

```bash
gpg --decrypt kv-<timestamp>.dump.gpg > backup.dump
pg_restore --no-owner -d "$TARGET_URL" backup.dump
```

## Owner checklist (not verifiable locally)

- Real R2 photo upload.
- Razorpay test-mode checkout (card 4111 1111 1111 1111) and webhook delivery.
- Backup workflow run: set the two repo secrets, push the branch, run it via "Run workflow".
