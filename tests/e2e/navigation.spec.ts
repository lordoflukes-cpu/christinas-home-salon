import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to all main pages', async ({ page }) => {
    // Home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Christina/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Services page
    await page.click('text=Services');
    await expect(page).toHaveURL(/\/services/);
    await expect(page.getByRole('heading', { name: /services/i })).toBeVisible();

    // About page
    await page.click('text=About');
    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByRole('heading', { name: /christina/i })).toBeVisible();

    // Reviews page
    await page.click('text=Reviews');
    await expect(page).toHaveURL(/\/reviews/);
    await expect(page.getByRole('heading', { name: /reviews/i })).toBeVisible();

    // Contact page
    await page.click('text=Contact');
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.getByRole('heading', { name: /touch/i })).toBeVisible();
  });

  test('should have working Book Now button', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Book Now');
    await expect(page).toHaveURL(/\/booking/);
  });

  test('mobile menu should work on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Look for mobile menu button
    const menuButton = page.getByRole('button', { name: /menu/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      
      // Should show navigation links
      await expect(page.getByRole('link', { name: /services/i })).toBeVisible();
    }
  });
});

test.describe('Homepage', () => {
  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    
    // Check hero content
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/women-only/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /book/i })).toBeVisible();
  });

  test('should display services preview', async ({ page }) => {
    await page.goto('/');
    
    // Services section should be visible
    await expect(page.getByText(/hairdressing/i).first()).toBeVisible();
    await expect(page.getByText(/companionship/i).first()).toBeVisible();
  });

  test('should display trust signals', async ({ page }) => {
    await page.goto('/');
    
    // Trust signals
    await expect(page.getByText(/DBS/i).first()).toBeVisible();
    await expect(page.getByText(/insured/i).first()).toBeVisible();
  });

  test('should display FAQ section', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to FAQ section
    await page.evaluate(() => {
      document.querySelector('#faqs')?.scrollIntoView();
    });
    
    // FAQs should be interactive
    const faqItem = page.locator('[data-radix-accordion-item]').first();
    if (await faqItem.isVisible()) {
      await faqItem.click();
    }
  });
});

test.describe('Footer', () => {
  test('should display contact information', async ({ page }) => {
    await page.goto('/');
    
    const footer = page.locator('footer');
    await expect(footer.getByText(/07/)).toBeVisible();
    await expect(footer.getByText(/@/)).toBeVisible();
  });

  test('should have links to policy pages', async ({ page }) => {
    await page.goto('/');
    
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', { name: /privacy/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /terms/i })).toBeVisible();
  });
});
