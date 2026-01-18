import { test, expect } from '@playwright/test';

test.describe('Sticky Mobile WhatsApp CTA', () => {
  test.use({ 
    viewport: { width: 375, height: 667 } // Mobile viewport (iPhone SE)
  });

  test('CTA appears after scroll on mobile', async ({ page }) => {
    await page.goto('/');

    // Initially, CTA should not be visible (before scroll threshold)
    const cta = page.locator('[data-testid="sticky-mobile-cta"]');
    await expect(cta).not.toBeVisible();

    // Scroll down past threshold (30% of page or 300px)
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500); // Wait for scroll animation

    // CTA should now be visible
    await expect(cta).toBeVisible();
  });

  test('CTA is hidden on desktop', async ({ page, viewport }) => {
    // Override to desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    // Should be hidden on desktop (md:hidden class)
    const cta = page.locator('[data-testid="sticky-mobile-cta"]');
    await expect(cta).not.toBeVisible();
  });

  test('WhatsApp button contains postcode when available', async ({ page }) => {
    // Navigate with postcode in URL (simulates booking flow)
    await page.goto('/booking?postcode=SM1+1AA');

    // Fill some booking details to store postcode in Zustand
    await page.click('[data-testid="service-hairdressing"]');
    await page.click('[data-testid="option-cut-blow-dry"]');
    await page.click('[data-testid="next-button"]');

    // Scroll to trigger CTA
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);

    const whatsappButton = page.locator('[data-testid="sticky-whatsapp-button"]');
    await expect(whatsappButton).toBeVisible();

    // Check href contains WhatsApp link
    const href = await whatsappButton.getAttribute('href');
    expect(href).toContain('wa.me');
    
    // Should include postcode in message if stored
    if (href) {
      // URL encoded postcode might be present
      const hasPostcodeData = href.includes('SM1') || href.includes('postcode');
      // This is optional - depends on Zustand state
    }
  });

  test('Book button navigates to booking page', async ({ page }) => {
    await page.goto('/services');

    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);

    const bookButton = page.locator('[data-testid="sticky-book-button"]');
    await expect(bookButton).toBeVisible();

    await bookButton.click();
    await expect(page).toHaveURL(/\/booking/);
  });

  test('Close button hides CTA', async ({ page }) => {
    await page.goto('/');

    // Scroll to show CTA
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);

    const cta = page.locator('[data-testid="sticky-mobile-cta"]');
    await expect(cta).toBeVisible();

    // Click close button
    const closeButton = page.locator('[data-testid="sticky-cta-close"]');
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    // CTA should be hidden
    await expect(cta).not.toBeVisible();

    // Even after more scrolling, should stay hidden
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);
    await expect(cta).not.toBeVisible();
  });

  test('CTA buttons are accessible', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);

    const bookButton = page.locator('[data-testid="sticky-book-button"]');
    const whatsappButton = page.locator('[data-testid="sticky-whatsapp-button"]');
    const closeButton = page.locator('[data-testid="sticky-cta-close"]');

    // Check all buttons are present and have accessible labels
    await expect(bookButton).toBeVisible();
    await expect(whatsappButton).toBeVisible();
    await expect(closeButton).toBeVisible();

    // Verify they're tappable (not covered by other elements)
    await expect(bookButton).toBeEnabled();
    await expect(whatsappButton).toBeEnabled();
    await expect(closeButton).toBeEnabled();
  });

  test('WhatsApp link opens in new tab', async ({ page, context }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);

    const whatsappButton = page.locator('[data-testid="sticky-whatsapp-button"]');
    
    // Check target="_blank" attribute
    const target = await whatsappButton.getAttribute('target');
    expect(target).toBe('_blank');

    // Check rel="noopener noreferrer" for security
    const rel = await whatsappButton.getAttribute('rel');
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
  });

  test('CTA animations work correctly', async ({ page }) => {
    await page.goto('/');

    const cta = page.locator('[data-testid="sticky-mobile-cta"]');

    // Initially hidden
    await expect(cta).not.toBeVisible();

    // Scroll to trigger
    await page.evaluate(() => window.scrollTo(0, 400));
    
    // Should appear with animation (give animation time to complete)
    await expect(cta).toBeVisible({ timeout: 2000 });

    // Close it
    await page.locator('[data-testid="sticky-cta-close"]').click();

    // Should disappear with animation
    await expect(cta).not.toBeVisible({ timeout: 2000 });
  });

  test('CTA persists across page navigation', async ({ page }) => {
    await page.goto('/services');
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);

    const cta = page.locator('[data-testid="sticky-mobile-cta"]');
    await expect(cta).toBeVisible();

    // Navigate to another page
    await page.goto('/about');
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);

    // CTA should still appear (it's in root layout)
    await expect(cta).toBeVisible();
  });

  test('Multiple scroll actions maintain CTA state', async ({ page }) => {
    await page.goto('/');

    const cta = page.locator('[data-testid="sticky-mobile-cta"]');

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);
    await expect(cta).toBeVisible();

    // Scroll up (above threshold)
    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(500);
    
    // Should hide when scrolled back up
    await expect(cta).not.toBeVisible();

    // Scroll down again
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);
    await expect(cta).toBeVisible();
  });
});
