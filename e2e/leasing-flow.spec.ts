import { test, expect } from "@playwright/test";

const TEST_LEAD = {
  name: `E2E Test ${Date.now()}`,
  phone: "+971501234567",
  date: "2026-08-15",
  message: "Automated test inquiry",
};

test("MVP leasing flow: dashboard → review → property → submit lead → verify in review", async ({
  page,
}) => {
  // 1. Dashboard loads with at least one property card
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const propertyCard = page.getByTestId("property-card").first();
  await expect(propertyCard).toBeVisible();

  // 2. Click property card → Review page loads
  await propertyCard.click();
  await expect(page.getByRole("heading", { name: "Property Readiness" })).toBeVisible();

  // 3. Publish / Share section exists
  await expect(page.getByTestId("publish-section")).toBeVisible();

  // Save review URL for later navigation
  const reviewUrl = page.url();

  // 4. Open the public property page
  // If published, click "Open" link; if not, click "Preview Property" link
  const openLink =
    (await page.getByRole("link", { name: "Open" }).isVisible().catch(() => false))
      ? page.getByRole("link", { name: "Open" })
      : page.getByRole("link", { name: "Preview Property" });

  const href = await openLink.getAttribute("href");
  expect(href).toContain("/property/");

  // Navigate directly to avoid new-tab behavior
  await page.goto(href!);
  await expect(page.getByTestId("request-viewing-btn")).toBeVisible();

  // 5. Click "Request a Viewing" → modal opens
  await page.getByTestId("request-viewing-btn").click();
  await expect(page.getByTestId("viewing-modal")).toBeVisible();

  // 6. Fill the form
  const modal = page.getByTestId("viewing-modal");
  await modal.getByPlaceholder("e.g. John Smith").fill(TEST_LEAD.name);
  await modal.getByPlaceholder("e.g. +971 50 123 4567").fill(TEST_LEAD.phone);
  await modal.locator('input[type="date"]').fill(TEST_LEAD.date);
  await modal.getByPlaceholder("Any questions or preferences").fill(TEST_LEAD.message);

  // 7. Submit
  await modal.getByRole("button", { name: "Submit Request" }).click();

  // 8. Verify success message
  await expect(page.getByTestId("success-message")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Request received")).toBeVisible();

  // 9. Navigate back to Review page
  await page.goto(reviewUrl);
  await expect(page.getByRole("heading", { name: "Property Readiness" })).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByTestId("leads-section")).toBeVisible({ timeout: 10_000 });

  // 11. Verify the new lead appears
  await expect(page.getByTestId("leads-section").getByText(TEST_LEAD.name)).toBeVisible();
});
