import { test, expect } from "@playwright/test";

test("admin can navigate through admin portal", async ({ page }) => {
  // Login
  await page.goto("/admin/login");

  await page.getByTestId("email-input").fill("admin@example.com");
  await page.getByTestId("password-input").fill("admin123");
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

  // Students
  await page.getByRole("link", { name: /students/i }).click();
  await expect(page).toHaveURL(/students/);

  // Knowledge Base
  await page.getByRole("link", { name: /knowledge/i }).click();
  await expect(page).toHaveURL(/knowledge/);
});
