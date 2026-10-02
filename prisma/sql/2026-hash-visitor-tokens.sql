-- One-time data migration: store visitor tokens as SHA-256 hex digests.
--
-- Run AFTER `npm run db:push` (which adds "tokenExpiresAt") and immediately
-- BEFORE deploying the code that hashes tokens on lookup:
--   npx prisma db execute --file prisma/sql/2026-hash-visitor-tokens.sql --schema prisma/schema.prisma
--
-- Existing cookies keep working: the app hashes the raw cookie value on lookup,
-- which matches the digest written here. Requires PostgreSQL 11+ (sha256()).
-- Idempotent: rows already migrated have "tokenExpiresAt" set and are skipped.

UPDATE "Visitor"
SET token = encode(sha256(convert_to(token, 'UTF8')), 'hex'),
    "tokenExpiresAt" = NOW() + interval '30 days'
WHERE token IS NOT NULL
  AND "tokenExpiresAt" IS NULL;
