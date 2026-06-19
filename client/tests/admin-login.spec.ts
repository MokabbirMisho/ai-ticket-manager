import { test, expect } from "@playwright/test";

test("admin can login successfully", async ({ page }) => {
  const adminEmail = process.env.E2E_ADMIN_EMAIL;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    test.skip(
      true,
      "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run admin login E2E.",
    );
    return;
  }

  await page.goto("/admin/login");

  await page.getByTestId("email-input").fill(adminEmail);

  await page.getByTestId("password-input").fill(adminPassword);

  await page.getByTestId("login-button").click();

  await expect(page).toHaveURL(/dashboard/);

  await expect(
    page.getByRole("heading", {
      name: /dashboard/i,
    }),
  ).toBeVisible();
});
