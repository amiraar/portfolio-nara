/**
 * lib/totp.js — Time-based one-time passwords (RFC 6238) for the owner login.
 *
 * HMAC-SHA1, 6 digits, 30-second steps: the defaults every authenticator app
 * (Google Authenticator, 1Password, Authy, ...) uses for an otpauth:// URI.
 * Built on node:crypto only, so the login path has no extra dependency.
 */

import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP_SEC = 30;
const DIGITS = 6;

/**
 * Decode an RFC 4648 base32 string (padding, spaces and case ignored).
 * @param {string} input
 * @returns {Buffer}
 */
export function base32Decode(input) {
  const clean = input.replace(/[\s=]/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) throw new Error("Invalid base32 character");
    // Only the low `bits` (< 13) bits are ever read; mask to avoid 32-bit overflow.
    value = ((value << 5) | index) & 0xffff;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/**
 * Encode bytes as unpadded RFC 4648 base32.
 * @param {Buffer} buffer
 * @returns {string}
 */
export function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = ((value << 8) | byte) & 0xffff;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

/**
 * New random secret (160 bits, the RFC 4226 recommended length), base32-encoded.
 * @returns {string}
 */
export function generateTotpSecret() {
  return base32Encode(randomBytes(20));
}

/**
 * Compute the code for one time step (RFC 4226 HOTP with counter = step).
 * @param {Buffer} key
 * @param {number} step
 * @returns {string}
 */
export function totpAt(key, step) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const hmac = createHmac("sha1", key).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3];
  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
}

/**
 * Check a submitted code against the current step and one step either side
 * (tolerates clock drift and codes typed near a step boundary).
 *
 * Returns the matched step so the caller can reject reuse of the same code
 * (RFC 6238 §5.2), or null when the code is wrong.
 *
 * @param {unknown} code
 * @param {string} base32Secret
 * @param {number} [nowMs]
 * @returns {number | null}
 */
export function verifyTotp(code, base32Secret, nowMs = Date.now()) {
  if (typeof code !== "string" || !/^\d{6}$/.test(code.trim())) return null;
  const submitted = Buffer.from(code.trim());
  const key = base32Decode(base32Secret);
  const current = Math.floor(nowMs / 1000 / STEP_SEC);

  let matched = null;
  // Check every candidate (no early return) so timing does not reveal which matched.
  for (const step of [current - 1, current, current + 1]) {
    if (timingSafeEqual(Buffer.from(totpAt(key, step)), submitted)) matched = step;
  }
  return matched;
}
