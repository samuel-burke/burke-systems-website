// E2E: the pages a visitor sees, in a real browser. Tests tagged @readonly change nothing,
// so they can also run against a deployed preview or production with PLAYWRIGHT_BASE_URL.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test("homepage shows the offer and every section in the nav @readonly @mobile", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Burke Systems/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  for (const id of ["services", "work", "pricing", "about", "contact"]) {
    await expect(page.locator(`section#${id}`)).toHaveCount(1);
  }
  // Nothing on the page is wider than the screen.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

for (const path of ["/", "/thanks", "/contact-error"]) {
  test(`${path} has no WCAG 2.2 AA issues that axe can detect @readonly`, async ({
    page,
  }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze();
    expect(
      results.violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`,
      ),
    ).toEqual([]);
  });
}

test("the Work section lists each project with a working image and link @readonly @mobile", async ({
  page,
}) => {
  await page.goto("/");
  const work = page.locator("section#work");
  const projects = [
    {
      title: "ShiftView",
      link: "Visit shiftview.app",
      href: "https://shiftview.app",
    },
    {
      title: "Study Squad",
      link: "See the code on GitHub",
      href: "https://github.com/samuel-burke/study-squad-root-app",
    },
  ];
  await expect(work.getByRole("heading", { level: 3 })).toHaveText(
    projects.map((p) => p.title),
  );
  for (const project of projects) {
    const link = work.getByRole("link", { name: project.link });
    await expect(link).toHaveAttribute("href", project.href);
    await expect(link).toHaveAttribute("target", "_blank");
  }
  const images = work.locator("img");
  await expect(images).toHaveCount(projects.length);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveAttribute("alt", /\S/);
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
  }
});

test("an unknown page returns the 404 page @readonly", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Lost the connection." }),
  ).toBeVisible();
});
