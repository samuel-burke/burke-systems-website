// E2E: a visitor sends a request through the contact form. This writes to the database,
// so it only runs against the local test server, never a deployed site.
import { expect, test } from "@playwright/test";
import { query } from "../support/wrangler.ts";

test.skip(
  !!process.env.PLAYWRIGHT_BASE_URL,
  "writes data; local test server only",
);

test("a visitor sends a request and lands on the thanks page @mobile", async ({
  page,
}) => {
  const email = `e2e-${Date.now()}@example.com`;
  await page.goto("/#contact");
  await page.getByLabel("Your name").fill("Dana");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Business name").fill("Dana's Bakery");
  await page
    .getByLabel("What takes up too much of your time?")
    .fill("We copy every order into a spreadsheet.");
  await page
    .getByRole("button", { name: /request early access|send/i })
    .click();

  await expect(page).toHaveURL(/\/thanks\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Thanks, we got it.",
  );
  expect(
    query(`SELECT name, business FROM intake WHERE email = '${email}'`),
  ).toEqual([{ name: "Dana", business: "Dana's Bakery" }]);
});

test("the browser stops an empty form from being sent", async ({ page }) => {
  await page.goto("/#contact");
  await page
    .getByRole("button", { name: /request early access|send/i })
    .click();
  await expect(page).not.toHaveURL(/\/thanks\/?$/);
  const nameMissing = await page
    .getByLabel("Your name")
    .evaluate((el: HTMLInputElement) => el.validity.valueMissing);
  expect(nameMissing).toBe(true);
});
