import { test, expect } from "@playwright/test";

test("student can login successfully", async ({ page }) => {
  await page.goto("/student/login");

  await page.getByTestId("email-input").fill("student@example.com");

  await page.getByTestId("password-input").fill("student123");

  await page.getByTestId("login-button").click();

  await expect(page).toHaveURL(/student\/dashboard/);
});
