import { describe, it, expect } from "vitest";
import {
  base32Decode,
  base32Encode,
  generateTotpSecret,
  totpAt,
  verifyTotp,
} from "../lib/totp.js";

// RFC 6238 Appendix B: SHA-1 seed is the ASCII string "12345678901234567890".
const RFC_SECRET_BASE32 = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"; // gitleaks:allow (public RFC test vector)

// RFC 6238 Appendix B lists 8-digit SHA-1 codes; a 6-digit code is the same
// truncated value mod 10^6, i.e. the last six digits.
const RFC_VECTORS = [
  [59, "94287082"],
  [1111111109, "07081804"],
  [1111111111, "14050471"],
  [1234567890, "89005924"],
  [2000000000, "69279037"],
  [20000000000, "65353130"],
];

describe("base32", () => {
  it("decodes the RFC 6238 seed", () => {
    expect(base32Decode(RFC_SECRET_BASE32).toString("ascii")).toBe("12345678901234567890");
  });

  it("round-trips arbitrary bytes", () => {
    const bytes = Buffer.from([0, 1, 2, 250, 251, 252, 253, 254, 255, 7, 99]);
    expect(base32Decode(base32Encode(bytes))).toEqual(bytes);
  });

  it("generates a 160-bit secret", () => {
    expect(base32Decode(generateTotpSecret())).toHaveLength(20);
  });
});

describe("totpAt — RFC 6238 test vectors", () => {
  const key = base32Decode(RFC_SECRET_BASE32);
  for (const [unixSec, eightDigits] of RFC_VECTORS) {
    it(`T=${unixSec} → ${eightDigits.slice(-6)}`, () => {
      expect(totpAt(key, Math.floor(unixSec / 30))).toBe(eightDigits.slice(-6));
    });
  }
});

describe("verifyTotp", () => {
  const nowMs = 1111111111 * 1000; // step 37037037, code 050471

  it("accepts the current code and returns its step", () => {
    expect(verifyTotp("050471", RFC_SECRET_BASE32, nowMs)).toBe(37037037);
  });

  it("accepts the previous and next step (clock drift)", () => {
    const key = base32Decode(RFC_SECRET_BASE32);
    expect(verifyTotp(totpAt(key, 37037036), RFC_SECRET_BASE32, nowMs)).toBe(37037036);
    expect(verifyTotp(totpAt(key, 37037038), RFC_SECRET_BASE32, nowMs)).toBe(37037038);
  });

  it("rejects a code two steps away", () => {
    const key = base32Decode(RFC_SECRET_BASE32);
    expect(verifyTotp(totpAt(key, 37037035), RFC_SECRET_BASE32, nowMs)).toBeNull();
  });

  it("rejects wrong, malformed and non-string codes", () => {
    expect(verifyTotp("000000", RFC_SECRET_BASE32, nowMs)).toBeNull();
    expect(verifyTotp("12345", RFC_SECRET_BASE32, nowMs)).toBeNull();
    expect(verifyTotp("abcdef", RFC_SECRET_BASE32, nowMs)).toBeNull();
    expect(verifyTotp(undefined, RFC_SECRET_BASE32, nowMs)).toBeNull();
    expect(verifyTotp(50471, RFC_SECRET_BASE32, nowMs)).toBeNull();
  });
});
