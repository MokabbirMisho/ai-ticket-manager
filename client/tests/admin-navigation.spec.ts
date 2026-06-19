import { test, expect } from "@playwright/test";

test("admin can navigate through admin portal", async ({ page }) => {
  const adminEmail = process.env.E2E_ADMIN_EMAIL;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    test.skip(
      true,
      "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run admin navigation E2E.",
    );
    return;
  }

  // Login
  await page.goto("/admin/login");

  await page.getByTestId("email-input").fill(adminEmail);
  await page.getByTestId("password-input").fill(adminPassword);
  await page.getByTestId("login-button").click();

  await expect(page).toHaveURL(/dashboard/);

  // Dashboard
  await expect(page).toHaveURL(/dashboard/);

  // Tickets
  await page.getByRole("link", { name: /tickets/i }).click();
  await expect(page).toHaveURL(/tickets/);

  // Users
  await page.getByRole("link", { name: /users/i }).click();
  await expect(page).toHaveURL(/users/);

  // Requesters
  await page.getByRole("link", { name: /requesters/i }).click();
  await expect(page).toHaveURL(/requesters/);

  // Knowledge Base
  await page.getByRole("link", { name: /knowledge/i }).click();
  await expect(page).toHaveURL(/knowledge/);
});
