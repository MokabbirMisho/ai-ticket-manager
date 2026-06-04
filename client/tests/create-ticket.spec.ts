import { test, expect } from "@playwright/test";

test("student can create a ticket", async ({ page }) => {
  const uniqueSubject = `Playwright Test Ticket ${Date.now()}`;

  await page.goto("/student/login");

  await page.getByTestId("email-input").fill("student@example.com");
  await page.getByTestId("password-input").fill("student123");
  await page.getByTestId("login-button").click();

  await expect(page).toHaveURL(/student\/dashboard/);

  await page.goto("/student/tickets/new");

  await expect(page.getByTestId("ticket-subject")).toBeVisible();
  await expect(page.getByTestId("ticket-description")).toBeVisible();

  await page.getByTestId("ticket-subject").fill(uniqueSubject);
  await page
    .getByTestId("ticket-description")
    .fill("This ticket was created by an automated Playwright E2E test.");

  const createTicketResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/student/tickets") &&
      response.request().method() === "POST",
  );

  await page.getByRole("button", { name: /submit ticket/i }).click();

  const createTicketResponse = await createTicketResponsePromise;

  expect(createTicketResponse.ok()).toBeTruthy();

  await expect(page).toHaveURL(/student\/tickets/);

  await expect(page.getByText(uniqueSubject)).toBeVisible();
});
