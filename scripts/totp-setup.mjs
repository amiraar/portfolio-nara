/**
 * scripts/totp-setup.mjs — Generate the owner's TOTP secret.
 *
 * Usage:  node scripts/totp-setup.mjs [account-label]
 *
 * 1. Add the printed URI to an authenticator app (most apps accept it pasted
 *    or rendered as a QR code), or type the secret in manually.
 * 2. Set OWNER_TOTP_SECRET to the printed secret in .env and in the hosting
 *    provider's environment variables.
 * 3. Confirm a login with the 6-digit code before relying on it in production.
 *
 * The secret is printed to this terminal only — never commit it.
 *
 * lib/totp.js uses ES module syntax in a package without "type": "module";
 * Node loads it via module-syntax detection and prints a MODULE_TYPELESS_PACKAGE_JSON
 * warning, which is harmless. Tested on Node 26.
 */

import { generateTotpSecret } from "../lib/totp.js";

const label = process.argv[2] ?? "owner";
const issuer = "Nara Dashboard";
const secret = generateTotpSecret();
const uri =
  `otpauth://totp/${encodeURIComponent(`${issuer}:${label}`)}` +
  `?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

console.log(`OWNER_TOTP_SECRET=${secret}`);
console.log(`otpauth URI: ${uri}`);
