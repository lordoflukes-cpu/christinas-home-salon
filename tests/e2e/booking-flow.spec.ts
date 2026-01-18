import { test, expect, type Page } from '@playwright/test';

test.describe('Booking Flow - Happy Path', () => {
  test('complete in-area booking with deposit', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/Christina/);

    // Use postcode checker widget
    await page.fill('[data-testid="postcode-input"]', 'SM1 1AA');
    await page.click('[data-testid="postcode-search-button"]');
    
    // Should show "serviceable" result
    await expect(page.locator('[data-testid="postcode-result"]')).toBeVisible();
    
    // Click "Book Now"
    await page.click('[data-testid="book-now-button"]');
    
    // Should navigate to booking page with prefilled postcode
    await expect(page).toHaveURL(/\/booking/);
    await expect(page.url()).toContain('postcode=SM1');

    // Step 1: Select service
    await page.click('[data-testid="service-hairdressing"]');
    await page.click('[data-testid="option-cut-blow-dry"]');
    await page.click('[data-testid="next-button"]');

    // Step 2: Options
    await page.click('[data-testid="option-cut-blow-dry"]');
    await page.click('[data-testid="next-button"]');

    // Step 3: Location
    const postcodeInput = page.locator('[data-testid="postcode-input"]');
    await expect(postcodeInput).toHaveValue(/SM1/i);
    
    await page.fill('[data-testid="address-input"]', '123 Test Street');
    await page.click('[data-testid="next-button"]');

    // Step 4: Date & Time
    // Select first available date button
    await page.locator('[data-testid="date-picker"] button:not([disabled])').first().click();
    
    // Select time slot
    await page.locator('[data-testid="time-slot"][data-time="14:00"]').click();
    await page.click('[data-testid="wizard-next"]');

    // Step 5: Client Details
    await page.fill('[data-testid="client-name"]', 'Jane Test Smith');
    await page.fill('[data-testid="client-email"]', 'jane.test@example.com');
    await page.fill('[data-testid="client-phone"]', '07700900123');
    
    // Accept consents
    await page.check('[data-testid="consent-contact"]');
    await page.check('[data-testid="consent-boundaries"]');
    await page.check('[data-testid="consent-cancellation"]');
    
    // Submit booking
    await page.click('[data-testid="wizard-submit"]');

    // Wait for confirmation page
    await page.waitForURL(/\/booking/, { timeout: 10000 });
    
    // Verify booking confirmation displayed
    await expect(page.locator('text=Booking Confirmed')).toBeVisible();
    
    // Check booking reference appears
    const bookingRefElement = page.locator('[data-testid="booking-reference"]');
    await expect(bookingRefElement).toBeVisible();
    const bookingRef = await bookingRefElement.textContent();
    expect(bookingRef).toMatch(/CHS-\d{8}-[A-Z0-9]{4}/);

    // Verify booking reference stored in sessionStorage
    const storedRef = await page.evaluate(() => sessionStorage.getItem('bookingReference'));
    expect(storedRef).toBeTruthy();

    // Check deposit notice is displayed (for new client)
    const depositNotice = page.locator('[data-testid="deposit-notice"]');
    await expect(depositNotice).toBeVisible();
    await expect(depositNotice).toContainText('Deposit Required');
    await expect(depositNotice).toContainText('£');

    // Verify "Add to Calendar" button exists and is clickable
    const calendarButton = page.locator('[data-testid="add-to-calendar"]');
    await expect(calendarButton).toBeVisible();
    await expect(calendarButton).toBeEnabled();

    // Test ICS download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      calendarButton.click(),
    ]);

    // Verify downloaded file
    expect(download.suggestedFilename()).toMatch(/\.ics$/);
    
    // Read downloaded file content
    const path = await download.path();
    if (path) {
      const fs = await import('fs/promises');
      const content = await fs.readFile(path, 'utf-8');
      
      // Verify ICS content
      expect(content).toContain('BEGIN:VCALENDAR');
      expect(content).toContain('END:VCALENDAR');
      expect(content).toContain(bookingRef!);
    }

    // Verify WhatsApp link contains booking reference
    const whatsappLink = page.locator('[data-testid="whatsapp-link"]');
    await expect(whatsappLink).toBeVisible();
    const href = await whatsappLink.getAttribute('href');
    expect(href).toContain('wa.me');
    expect(href).toContain(encodeURIComponent(bookingRef!));
  });

  test('booking without deposit (returning client, non-colour)', async ({ page }) => {
    await page.goto('/booking');

    // Complete minimal booking flow
    await page.click('[data-testid="service-hairdressing"]');
    await page.click('[data-testid="option-cut-blow-dry"]');
    await page.click('[data-testid="next-button"]');

    // Skip add-ons
    await page.click('[data-testid="next-button"]');

    // Location
    await page.fill('[data-testid="postcode-input"]', 'SM1 1AA');
    await page.fill('[data-testid="address-input"]', '123 Test Street');
    await page.click('[data-testid="next-button"]');

    // Date & Time
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    await page.fill('[data-testid="date-picker"]', futureDate.toISOString().split('T')[0]);
    await page.click('[data-testid="time-10-00"]');
    await page.click('[data-testid="next-button"]');

    // Client details - returning client
    await page.fill('[data-testid="client-name"]', 'Sarah Regular');
    await page.fill('[data-testid="client-email"]', 'sarah@example.com');
    await page.fill('[data-testid="client-phone"]', '07700900456');
    
    // NOT a new client (no deposit required)
    await page.uncheck('[data-testid="new-client-checkbox"]');
    
    await page.check('[data-testid="consent-boundaries"]');
    await page.check('[data-testid="consent-cancellation"]');
    await page.check('[data-testid="consent-women-only"]');
    
    await page.click('[data-testid="submit-booking"]');

    // Verify confirmation
    await expect(page.locator('text=Booking Confirmed')).toBeVisible();
    
    // Verify NO deposit notice
    const depositNotice = page.locator('[data-testid="deposit-notice"]');
    await expect(depositNotice).not.toBeVisible();
  });

  test('displays travel fee for paid tier postcode', async ({ page }) => {
    await page.goto('/booking');

    // Select service
    await page.click('[data-testid="service-hairdressing"]');
    await page.click('[data-testid="option-cut-blow-dry"]');
    await page.click('[data-testid="next-button"]');
    await page.click('[data-testid="next-button"]'); // Skip add-ons

    // Enter postcode in paid travel tier (e.g., 6-10 miles)
    await page.fill('[data-testid="postcode-input"]', 'KT3 4AA');
    await page.fill('[data-testid="address-input"]', '456 Far Street');
    
    // Should display travel fee
    await expect(page.locator('text=/travel.*£5/i')).toBeVisible();
    
    await page.click('[data-testid="next-button"]');

    // Complete booking
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    await page.fill('[data-testid="date-picker"]', futureDate.toISOString().split('T')[0]);
    await page.click('[data-testid="time-14-00"]');
    await page.click('[data-testid="next-button"]');

    await page.fill('[data-testid="client-name"]', 'Test Travel Fee');
    await page.fill('[data-testid="client-email"]', 'travel@example.com');
    await page.fill('[data-testid="client-phone"]', '07700900789');
    await page.check('[data-testid="consent-boundaries"]');
    await page.check('[data-testid="consent-cancellation"]');
    await page.check('[data-testid="consent-women-only"]');
    
    await page.click('[data-testid="submit-booking"]');

    // Verify confirmation shows travel fee
    await expect(page.locator('text=Travel fee')).toBeVisible();
    await expect(page.locator('text=/£5/i')).toBeVisible();
  });
});
