import { test, expect } from '@playwright/test';

test.describe('Out-of-Area Enquiry Flow', () => {
  test('homepage postcode checker shows enquiry-only for out-of-area', async ({ page }) => {
    await page.goto('/');

    // Use postcode widget with out-of-area postcode
    await page.fill('[data-testid="postcode-input"]', 'AB10 1AA'); // Aberdeen
    await page.click('[data-testid="postcode-search-button"]');

    // Should show "Outside service area" or "Enquiry only"
    const result = page.locator('[data-testid="postcode-result"]');
    await expect(result).toBeVisible();
    await expect(result).toContainText(/enquiry|outside/i);

    // Should show "Send Enquiry" button instead of "Book Now"
    const enquiryButton = page.locator('[data-testid="send-enquiry-button"]');
    await expect(enquiryButton).toBeVisible();
    
    // Book Now should not be visible
    const bookButton = page.locator('[data-testid="book-now-button"]');
    await expect(bookButton).not.toBeVisible();

    // Click "Send Enquiry"
    await enquiryButton.click();

    // Should navigate to contact page with query params
    await expect(page).toHaveURL(/\/contact\?type=enquiry/);
    await expect(page.url()).toContain('postcode=AB10');
  });

  test('enquiry form prefills from URL params', async ({ page }) => {
    // Navigate directly to enquiry URL with params
    await page.goto('/contact?type=enquiry&postcode=SW1A+1AA&service=Cut+%26+Blow+Dry');

    // Verify enquiry form is shown
    await expect(page.locator('text=Submit an Enquiry')).toBeVisible();

    // Verify postcode is prefilled
    const postcodeInput = page.locator('[data-testid="enquiry-postcode"]');
    await expect(postcodeInput).toHaveValue(/SW1A/i);

    // Verify service is prefilled
    const serviceInput = page.locator('[data-testid="enquiry-service"]');
    await expect(serviceInput).toHaveValue(/Cut.*Blow/i);
  });

  test('complete enquiry submission', async ({ page }) => {
    await page.goto('/contact?type=enquiry&postcode=AB10+1AA');

    // Fill enquiry form
    await page.fill('[data-testid="enquiry-name"]', 'John Enquiry');
    await page.fill('[data-testid="enquiry-email"]', 'john.enquiry@example.com');
    await page.fill('[data-testid="enquiry-phone"]', '07700900999');
    
    // Postcode should be prefilled
    const postcodeInput = page.locator('[data-testid="enquiry-postcode"]');
    await expect(postcodeInput).toHaveValue(/AB10/i);

    await page.fill('[data-testid="enquiry-message"]', 'I am interested in booking a hair appointment but I live in Aberdeen. Can you accommodate?');

    // Submit enquiry
    await page.click('[data-testid="submit-enquiry"]');

    // Wait for success message
    await expect(page.locator('text=Enquiry Received')).toBeVisible({ timeout: 10000 });

    // Verify enquiry reference displayed
    const enquiryRef = page.locator('[data-testid="enquiry-reference"]');
    await expect(enquiryRef).toBeVisible();
    const refText = await enquiryRef.textContent();
    expect(refText).toMatch(/ENQ-\d{8}-[A-Z0-9]{4}/);

    // Verify confirmation message
    await expect(page.locator('text=/confirm availability/i')).toBeVisible();
  });

  test('booking wizard redirects to enquiry for out-of-area postcode', async ({ page }) => {
    await page.goto('/booking');

    // Complete booking flow with out-of-area postcode
    await page.click('[data-testid="service-hairdressing"]');
    await page.click('[data-testid="option-cut-blow-dry"]');
    await page.click('[data-testid="next-button"]');
    await page.click('[data-testid="next-button"]'); // Skip add-ons

    // Enter out-of-area postcode
    await page.fill('[data-testid="postcode-input"]', 'M1 1AA'); // Manchester
    await page.fill('[data-testid="address-input"]', '789 Distant Road');
    await page.click('[data-testid="next-button"]');

    // Complete date/time
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    await page.fill('[data-testid="date-picker"]', futureDate.toISOString().split('T')[0]);
    await page.click('[data-testid="time-14-00"]');
    await page.click('[data-testid="next-button"]');

    // Fill client details
    await page.fill('[data-testid="client-name"]', 'Far Away Client');
    await page.fill('[data-testid="client-email"]', 'faraway@example.com');
    await page.fill('[data-testid="client-phone"]', '07700900111');
    await page.check('[data-testid="consent-boundaries"]');
    await page.check('[data-testid="consent-cancellation"]');
    await page.check('[data-testid="consent-women-only"]');

    // Submit - should be redirected to enquiry
    await page.click('[data-testid="submit-booking"]');

    // Should redirect to enquiry form
    await page.waitForURL(/\/contact\?type=enquiry/, { timeout: 10000 });
    await expect(page.url()).toContain('postcode=M1');
  });

  test('enquiry validation errors', async ({ page }) => {
    await page.goto('/contact?type=enquiry');

    // Try to submit without filling required fields
    await page.click('[data-testid="submit-enquiry"]');

    // Should show validation errors
    await expect(page.locator('text=/name required/i')).toBeVisible();
    await expect(page.locator('text=/email required/i')).toBeVisible();

    // Fill name but invalid email
    await page.fill('[data-testid="enquiry-name"]', 'Test Name');
    await page.fill('[data-testid="enquiry-email"]', 'not-an-email');
    await page.fill('[data-testid="enquiry-phone"]', '07700');
    await page.fill('[data-testid="enquiry-postcode"]', 'AB10 1AA');
    await page.fill('[data-testid="enquiry-message"]', 'Too short'); // Less than 20 chars

    await page.click('[data-testid="submit-enquiry"]');

    // Should show validation errors
    await expect(page.locator('text=/valid email/i')).toBeVisible();
    await expect(page.locator('text=/at least 20/i')).toBeVisible();
  });
});
