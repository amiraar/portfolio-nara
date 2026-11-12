import { test, expect } from "@playwright/test";

const SECTIONS = ["about", "experience", "projects", "skills", "education", "certificates"];

test.beforeEach(async ({ page }) => {
  // No database in e2e: an empty response makes every section use the code defaults.
  await page.route("**/api/portfolio", (route) => route.fulfill({ json: { content: {} } }));
});

async function hasHorizontalScroll(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
}

test("home renders every section without errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto("/");
  for (const id of SECTIONS) await expect(page.locator(`#${id}`)).toBeAttached();
  await expect(page.locator("h1")).toBeVisible();
  expect(errors).toEqual([]);
});

test("no horizontal scroll from 360px to 1440px", async ({ page }) => {
  await page.goto("/");
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await hasHorizontalScroll(page), `${width}px`).toBe(false);
  }
});

test("nav jumps to a section", async ({ page, isMobile }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation").first();
  if (isMobile) {
    const toggle = nav.getByRole("button", { name: "Toggle menu" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const menu = page.locator("#mobile-menu");
    for (const label of ["About", "Experience", "Projects", "Skills", "Education", "Certificates"]) {
      await expect(menu.getByRole("button", { name: label })).toBeVisible();
    }
    await menu.getByRole("button", { name: "Projects" }).click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  } else {
    await nav.getByRole("button", { name: "Projects", exact: true }).click();
  }
  await expect(page.locator("#projects h2")).toBeInViewport();
});

test("every project card opens its details, and every screenshot loads", async ({ page }) => {
  test.setTimeout(120_000); // opens every project in turn
  await page.goto("/");
  const cards = page.locator("#projects article");
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const name = (await card.locator("h3").textContent()).trim();
    await card.scrollIntoViewIfNeeded();
    await card.click({ position: { x: 24, y: 24 } });

    const dialog = page.getByRole("dialog");
    await expect(dialog, name).toBeVisible();
    await expect(dialog).toContainText(name);
    const images = dialog.locator("img");
    for (let j = 0; j < (await images.count()); j++) {
      const img = images.nth(j);
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() => img.evaluate((el) => el.complete && el.naturalWidth > 0), { message: `${name}: ${await img.getAttribute("src")}` })
        .toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }
});

test("a project card opens with the keyboard", async ({ page }) => {
  await page.goto("/");
  const card = page.locator("#projects article").first();
  await card.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("graduation photo viewer steps through photos", async ({ page }) => {
  await page.goto("/");
  await page.locator("#education").getByRole("button", { name: /^View photo:/ }).first().click();
  const viewer = page.locator("dialog[open]");
  await expect(viewer).toContainText("1 / 3");
  await page.keyboard.press("ArrowRight");
  await expect(viewer).toContainText("2 / 3");
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
});

test("certificate viewer opens and closes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^View certificate:/ }).first().click();
  await expect(page.locator("dialog[open]")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
});

test("theme choice survives a reload", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  const toLight = page.getByRole("button", { name: "Switch to light mode" });
  if (await toLight.isVisible()) await toLight.click();
  await expect(html).toHaveClass(/light/);
  await page.reload();
  await expect(html).toHaveClass(/light/);
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(html).toHaveClass(/dark/);
});

test("chat form needs consent and shows server errors", async ({ page }) => {
  await page.route("**/api/visitor", (route) => route.fulfill({ status: 500, json: { error: "Service unavailable" } }));
  await page.goto("/");
  await page.getByRole("button", { name: "Open chat" }).click();

  const submit = page.locator("form button[type=submit]");
  await page.getByPlaceholder("Your name").fill("E2E Visitor");
  await page.getByPlaceholder("Your email").fill("visitor@example.com");
  await expect(submit).toBeDisabled();
  await page.getByRole("checkbox").check();
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByText("Service unavailable")).toBeVisible();
});
