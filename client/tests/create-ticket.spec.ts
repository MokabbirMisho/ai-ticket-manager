import { test, expect } from "@playwright/test";

test("requester can create a ticket", async ({ page }) => {
  const uniqueSubject = `Playwright Test Ticket ${Date.now()}`;
  const email = `requester-ticket-${Date.now()}@example.com`;
  const password = "requester123";

  await page.goto("/requester/register");

  await page.getByLabel("Name").fill("Playwright Requester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /register/i }).click();

  await expect(page).toHaveURL(/requester\/dashboard/);

  await page.goto("/requester/tickets/new");

  await expect(page.getByTestId("ticket-subject")).toBeVisible();
  await expect(page.getByTestId("ticket-description")).toBeVisible();

  await page.getByTestId("ticket-subject").fill(uniqueSubject);
  await page
    .getByTestId("ticket-description")
    .fill("This ticket was created by an automated Playwright E2E test.");

  const createTicketResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/requester/tickets") &&
      response.request().method() === "POST",
  );

  await page.getByRole("button", { name: /submit ticket/i }).click();

  const createTicketResponse = await createTicketResponsePromise;

  expect(createTicketResponse.ok()).toBeTruthy();

  await expect(page).toHaveURL(/requester\/tickets/);

  await expect(page.getByText(uniqueSubject)).toBeVisible();
});
