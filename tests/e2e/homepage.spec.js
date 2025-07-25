/**
 * DAMP Smart Drinkware - Homepage E2E Tests
 * Tests the main landing page functionality
 */

const { test, expect } = require('@playwright/test');

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
  });

  test('should load successfully', async ({ page }) => {
    // Check page loads and has correct title
    await expect(page).toHaveTitle(/DAMP.*Never Leave Your Drink Behind/);
    
    // Verify main elements are visible
    await expect(page.locator('.hero-section')).toBeVisible();
    await expect(page.locator('.hero-title')).toContainText('Never Leave Your Drink Behind');
  });

  test('should display hero section with stats', async ({ page }) => {
    // Check hero content
    await expect(page.locator('.hero-logo img')).toBeVisible();
    await expect(page.locator('.hero-subtitle')).toContainText('Transform any cup into a smart device');
    
    // Verify stats are displayed
    await expect(page.locator('.hero-stats')).toBeVisible();
    await expect(page.locator('.stat-item')).toHaveCount(3);
    
    // Check for specific stats
    await expect(page.locator('.stat-number').first()).toContainText(/\d+/);
  });

  test('should navigate to pre-order page', async ({ page }) => {
    // Click the main CTA button
    await page.click('text=Pre-Order Now');
    
    // Should navigate to pre-sale funnel
    await expect(page).toHaveURL(/pre-sale-funnel/);
  });

  test('should display all product sections', async ({ page }) => {
    // Scroll to products section
    await page.locator('#products').scrollIntoViewIfNeeded();
    
    // Check products are displayed
    await expect(page.locator('.products-section')).toBeVisible();
    await expect(page.locator('.product-card')).toHaveCount(4);
    
    // Verify product names
    await expect(page.locator('.product-name')).toContainText(['Handle', 'Bottom', 'Sleeve', 'Baby']);
  });

  test('should show FAQ section with interactive items', async ({ page }) => {
    // Scroll to FAQ section
    await page.locator('#faq').scrollIntoViewIfNeeded();
    
    // Verify FAQ section exists
    await expect(page.locator('.faq-section')).toBeVisible();
    
    // Test FAQ interaction
    const firstFaq = page.locator('.faq-item').first();
    await firstFaq.locator('.faq-question').click();
    
    // Check if FAQ answer becomes visible
    await expect(firstFaq.locator('.faq-answer')).toBeVisible();
  });

  test('should validate newsletter signup form', async ({ page }) => {
    // Scroll to newsletter section
    await page.locator('#newsletter').scrollIntoViewIfNeeded();
    
    // Test newsletter form
    const emailInput = page.locator('.newsletter-input');
    const submitButton = page.locator('.newsletter-button');
    
    // Test invalid email
    await emailInput.fill('invalid-email');
    await submitButton.click();
    
    // Test valid email
    await emailInput.fill('test@example.com');
    await submitButton.click();
    
    // Should show success notification
    await expect(page.locator('.notification')).toBeVisible({ timeout: 5000 });
  });

  test('should display footer with all links', async ({ page }) => {
    // Scroll to footer
    await page.locator('.footer').scrollIntoViewIfNeeded();
    
    // Verify footer sections
    await expect(page.locator('.footer-section')).toHaveCount(4);
    
    // Check copyright
    await expect(page.locator('.footer-bottom')).toContainText('2025 WeCr8 Solutions LLC');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check mobile navigation
    await expect(page.locator('.hero-section')).toBeVisible();
    await expect(page.locator('.hero-title')).toBeVisible();
    
    // Check stats stack on mobile
    const stats = page.locator('.hero-stats');
    await expect(stats).toBeVisible();
  });

  test('should handle smooth scrolling', async ({ page }) => {
    // Click "See the Problem" button
    await page.click('text=See the Problem');
    
    // Should scroll to pain point section
    await expect(page.locator('#pain-point')).toBeInViewport();
  });

  test('should track user engagement', async ({ page }) => {
    // Mock analytics calls
    await page.route('**/gtag/**', route => route.fulfill({ status: 200 }));
    await page.route('**/analytics/**', route => route.fulfill({ status: 200 }));
    
    // Perform actions that should trigger analytics
    await page.click('.btn-primary');
    
    // Scroll to trigger scroll depth tracking
    await page.locator('#voting').scrollIntoViewIfNeeded();
    
    // The test passes if no errors are thrown
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors = [];
    
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Navigate and interact with page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Scroll through the page
    await page.locator('.footer').scrollIntoViewIfNeeded();
    
    // Check for critical errors (allow minor ones)
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('analytics') &&
      !error.includes('gtag')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
}); 