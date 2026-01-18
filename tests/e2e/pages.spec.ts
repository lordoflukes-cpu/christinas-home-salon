import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('should display contact methods', async ({ page }) => {
    await expect(page.getByText(/phone/i).first()).toBeVisible();
    await expect(page.getByText(/email/i).first()).toBeVisible();
  });

  test('should have contact form', async ({ page }) => {
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/message/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button:has-text("Send")');
    
    // Should show validation errors
    await expect(page.getByText(/required|please|enter/i).first()).toBeVisible();
  });

  test('should accept valid form submission', async ({ page }) => {
    // Fill out form
    await page.fill('[id="name"]', 'Jane Test');
    await page.fill('[id="email"]', 'jane@example.com');
    await page.fill('[id="phone"]', '07700 900000');
    await page.selectOption('select', { index: 1 }); // Select first option
    await page.fill('[id="message"]', 'This is a test message for the contact form.');
    
    // Accept privacy policy
    await page.click('label:has-text("privacy")');
    
    // Submit
    await page.click('button:has-text("Send")');
    
    // Should show success message
    await expect(page.getByText(/sent|thank|received/i)).toBeVisible({ timeout: 5000 });
  });

  test('should display opening hours', async ({ page }) => {
    await expect(page.getByText(/monday/i).first()).toBeVisible();
    await expect(page.getByText(/saturday/i).first()).toBeVisible();
  });

  test('should display service area', async ({ page }) => {
    await expect(page.getByText(/service area/i).first()).toBeVisible();
    await expect(page.getByText(/southampton/i).first()).toBeVisible();
  });
});

test.describe('Reviews Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reviews');
  });

  test('should display reviews', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /reviews/i })).toBeVisible();
    // Should have at least one review card
    await expect(page.locator('blockquote').first()).toBeVisible();
  });

  test('should display average rating', async ({ page }) => {
    // Look for star rating or number
    await expect(page.getByText(/\d\.\d/).first()).toBeVisible();
  });

  test('should filter reviews by service', async ({ page }) => {
    // Click filter button
    const hairdressingFilter = page.getByRole('button', { name: /hairdressing/i });
    if (await hairdressingFilter.isVisible()) {
      await hairdressingFilter.click();
      
      // All visible reviews should be hairdressing
      await expect(page.getByText(/hairdressing/i).first()).toBeVisible();
    }
  });

  test('should load more reviews', async ({ page }) => {
    const loadMoreButton = page.getByRole('button', { name: /load more/i });
    if (await loadMoreButton.isVisible()) {
      const initialReviews = await page.locator('blockquote').count();
      await loadMoreButton.click();
      const newCount = await page.locator('blockquote').count();
      expect(newCount).toBeGreaterThan(initialReviews);
    }
  });
});

test.describe('Services Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services');
  });

  test('should display all service categories', async ({ page }) => {
    await expect(page.getByText(/hairdressing/i).first()).toBeVisible();
    await expect(page.getByText(/companionship/i).first()).toBeVisible();
    await expect(page.getByText(/errands/i).first()).toBeVisible();
  });

  test('should display pricing', async ({ page }) => {
    // Look for price format (£XX)
    await expect(page.getByText(/£\d+/).first()).toBeVisible();
  });

  test('should have book now buttons', async ({ page }) => {
    const bookButtons = page.getByRole('link', { name: /book/i });
    expect(await bookButtons.count()).toBeGreaterThan(0);
  });

  test('should display packages section', async ({ page }) => {
    await expect(page.getByText(/package/i).first()).toBeVisible();
  });
});

test.describe('Safety/Boundaries Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/safety');
  });

  test('should display service boundaries', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /boundaries|safety/i })).toBeVisible();
    await expect(page.getByText(/women-only/i).first()).toBeVisible();
  });

  test('should list what is included', async ({ page }) => {
    await expect(page.getByText(/included/i).first()).toBeVisible();
    await expect(page.getByText(/hairdressing/i).first()).toBeVisible();
  });

  test('should list what is not included', async ({ page }) => {
    await expect(page.getByText(/not.*included|don't do/i).first()).toBeVisible();
    await expect(page.getByText(/medical|personal care/i).first()).toBeVisible();
  });

  test('should display safety practices', async ({ page }) => {
    await expect(page.getByText(/DBS/i).first()).toBeVisible();
    await expect(page.getByText(/insured/i).first()).toBeVisible();
  });
});

test.describe('About Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
  });

  test('should display Christina introduction', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /christina/i })).toBeVisible();
  });

  test('should display qualifications', async ({ page }) => {
    await expect(page.getByText(/NVQ|qualifi/i).first()).toBeVisible();
    await expect(page.getByText(/experience/i).first()).toBeVisible();
  });

  test('should display values', async ({ page }) => {
    await expect(page.getByText(/comfort|connection|professional/i).first()).toBeVisible();
  });

  test('should have booking CTA', async ({ page }) => {
    await expect(page.getByRole('link', { name: /book/i }).first()).toBeVisible();
  });
});

test.describe('Policy Pages', () => {
  test('should display terms page', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: /terms/i })).toBeVisible();
    await expect(page.getByText(/introduction/i)).toBeVisible();
  });

  test('should display privacy page', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: /privacy/i })).toBeVisible();
    await expect(page.getByText(/information.*collect/i).first()).toBeVisible();
  });

  test('should display cancellation page', async ({ page }) => {
    await page.goto('/cancellation');
    await expect(page.getByRole('heading', { name: /cancellation/i })).toBeVisible();
    await expect(page.getByText(/48 hours/i).first()).toBeVisible();
  });
});
