import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /resolve student support requests faster with ai/i,
    }),
  ).toBeVisible();

  await expect(page.locator('a[href="/student/login"]').first()).toBeVisible();

  await expect(page.locator('a[href="/admin/login"]').first()).toBeVisible();
});
