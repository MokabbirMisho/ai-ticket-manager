import { test, expect } from "@playwright/test";
import { skipDataWriteTestsUnlessAllowed } from "./e2eGuards";

skipDataWriteTestsUnlessAllowed();

test("requester can login successfully", async ({ page }) => {
  const email = `requester-${Date.now()}@example.com`;
  const password = "requester123";

  await page.goto("/requester/register");

  await page.getByLabel("Name").fill("Playwright Requester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /register/i }).click();

  await expect(page).toHaveURL(/requester\/dashboard/);

  await page.getByRole("button", { name: /logout/i }).click();

  await page.goto("/requester/login");

  await page.getByTestId("email-input").fill(email);
  await page.getByTestId("password-input").fill(password);

  await page.getByTestId("login-button").click();

  await expect(page).toHaveURL(/requester\/dashboard/);
});
