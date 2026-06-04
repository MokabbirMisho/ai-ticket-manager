import { test, expect } from "@playwright/test";

test("admin can login successfully", async ({ page }) => {
  await page.goto("/admin/login");

  await page.getByTestId("email-input").fill("admin@example.com");

  await page.getByTestId("password-input").fill("admin123");

  await page.getByTestId("login-button").click();

  await expect(page).toHaveURL(/dashboard/);

  await expect(
    page.getByRole("heading", {
      name: /dashboard/i,
    }),
  ).toBeVisible();
});
