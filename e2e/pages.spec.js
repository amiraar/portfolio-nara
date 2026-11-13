import { test, expect } from "@playwright/test";

test("privacy policy switches between English and Indonesian", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.locator("article")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle(/Privacy Policy/);

  await page.getByRole("navigation", { name: "Language" }).getByRole("link", { name: "Bahasa Indonesia" }).click();
  await expect(page).toHaveURL(/\/privacy\?lang=id$/);
  await expect(page.locator("article")).toHaveAttribute("lang", "id");
  await expect(page).toHaveTitle(/Kebijakan Privasi/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});

test("dashboard sends signed-out visitors to the login page", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator("input[type=password]")).toBeVisible();
});

test("pages send the security headers", async ({ request }) => {
  const res = await request.get("/");
  const headers = res.headers();
  expect(headers["content-security-policy"]).toMatch(/script-src[^;]*'nonce-/);
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-powered-by"]).toBeUndefined();
});
