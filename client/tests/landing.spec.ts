import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /manage service requests faster with ai/i,
    }),
  ).toBeVisible();

  await expect(page.locator('a[href="/requester/login"]').first()).toBeVisible();

  await expect(page.locator('a[href="/admin/login"]').first()).toBeVisible();
});
