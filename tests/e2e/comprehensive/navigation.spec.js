/**
 * DAMP Smart Drinkware - Comprehensive Navigation E2E Tests
 * Google Engineering Standards - Advanced Navigation Testing
 */

const { test, expect } = require('@playwright/test');

test.describe('Universal Navigation System', () => {
  const pages = [
    { name: 'Homepage', url: '/', title: /DAMP.*Never Leave Your Drink Behind/ },
    { name: 'Products', url: '/pages/products.html', title: /Products.*DAMP/ },
    { name: 'About', url: '/pages/about.html', title: /About.*DAMP/ },
    { name: 'Support', url: '/pages/support.html', title: /Support.*DAMP/ },
    { name: 'Cart', url: '/pages/cart.html', title: /Cart.*DAMP/ }
  ];

  test.describe('Cross-Page Navigation Consistency', () => {
    pages.forEach(({ name, url, title }) => {
      test(`should maintain navigation consistency on ${name}`, async ({ page }) => {
        await page.goto(url);
        await expect(page).toHaveTitle(title);
        
        // Test universal navigation elements
        await expect(page.locator('.damp-nav')).toBeVisible();
        await expect(page.locator('.logo')).toBeVisible();
        await expect(page.locator('.hamburger')).toBeVisible();
        
        // Test logo functionality
        const logo = page.locator('.logo');
        await expect(logo).toHaveAttribute('href', /\//);
        
        // Test navigation accessibility
        const hamburger = page.locator('.hamburger');
        await expect(hamburger).toHaveAttribute('aria-label');
        await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });

  test.describe('Mobile Menu Functionality', () => {
    test('should open and close mobile menu correctly', async ({ page }) => {
      await page.goto('/');
      
      const hamburger = page.locator('.hamburger');
      const mobileMenu = page.locator('.safe-area-mobile-menu, #mobileMenu');
      
      // Test menu opening
      await hamburger.click();
      await expect(mobileMenu).toHaveClass(/active/);
      await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
      
      // Test menu closing with close button
      const closeButton = page.locator('.mobile-close, #mobileCloseBtn');
      await closeButton.click();
      await expect(mobileMenu).not.toHaveClass(/active/);
      await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    });

    test('should close menu on escape key', async ({ page }) => {
      await page.goto('/');
      
      const hamburger = page.locator('.hamburger');
      const mobileMenu = page.locator('.safe-area-mobile-menu, #mobileMenu');
      
      await hamburger.click();
      await expect(mobileMenu).toHaveClass(/active/);
      
      await page.keyboard.press('Escape');
      await expect(mobileMenu).not.toHaveClass(/active/);
    });

    test('should close menu when clicking outside', async ({ page }) => {
      await page.goto('/');
      
      const hamburger = page.locator('.hamburger');
      const mobileMenu = page.locator('.safe-area-mobile-menu, #mobileMenu');
      
      await hamburger.click();
      await expect(mobileMenu).toHaveClass(/active/);
      
      // Click outside menu
      await page.click('body', { position: { x: 10, y: 200 } });
      await expect(mobileMenu).not.toHaveClass(/active/);
    });

    test('should navigate correctly from mobile menu', async ({ page }) => {
      await page.goto('/');
      
      const hamburger = page.locator('.hamburger');
      await hamburger.click();
      
      // Test navigation to products page
      const productsLink = page.locator('.mobile-nav-link[href*="products"], .mobile-nav a[href*="products"]').first();
      if (await productsLink.count() > 0) {
        await productsLink.click();
        await expect(page).toHaveURL(/products/);
        await expect(page).toHaveTitle(/Products/);
      }
    });
  });

  test.describe('Responsive Navigation Testing', () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1280, height: 720 },
      { name: 'Large Desktop', width: 1920, height: 1080 }
    ];

    viewports.forEach(({ name, width, height }) => {
      test(`should display correctly on ${name} (${width}x${height})`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/');
        
        const hamburger = page.locator('.hamburger');
        const logo = page.locator('.logo');
        
        // Logo should always be visible
        await expect(logo).toBeVisible();
        
        if (width < 769) {
          // Mobile: hamburger should be visible
          await expect(hamburger).toBeVisible();
        } else {
          // Desktop: hamburger might be hidden or visible depending on design
          // Both patterns are acceptable in modern design
        }
        
        // Test navigation functionality works at this viewport
        await hamburger.click();
        const mobileMenu = page.locator('.safe-area-mobile-menu, #mobileMenu');
        await expect(mobileMenu).toBeVisible();
      });
    });
  });

  test.describe('Navigation Performance', () => {
    test('should have fast navigation interactions', async ({ page }) => {
      await page.goto('/');
      
      // Measure hamburger click response time
      const startTime = Date.now();
      await page.locator('.hamburger').click();
      
      const mobileMenu = page.locator('.safe-area-mobile-menu, #mobileMenu');
      await expect(mobileMenu).toBeVisible();
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(500); // Should respond within 500ms
    });

    test('should preserve scroll position during navigation', async ({ page }) => {
      await page.goto('/');
      
      // Scroll down
      await page.locator('.products-section, .hero-section').scrollIntoViewIfNeeded();
      const scrollY = await page.evaluate(() => window.scrollY);
      
      // Open mobile menu
      await page.locator('.hamburger').click();
      
      // Scroll position should be preserved
      const newScrollY = await page.evaluate(() => window.scrollY);
      expect(Math.abs(newScrollY - scrollY)).toBeLessThan(50);
    });
  });

  test.describe('Safe Area and PWA Navigation', () => {
    test('should handle safe areas correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12 with notch
      await page.goto('/');
      
      // Test that navigation respects safe areas
      const nav = page.locator('.damp-nav');
      const computedStyle = await nav.evaluate(el => window.getComputedStyle(el));
      
      // Should have proper padding for safe areas
      expect(parseInt(computedStyle.paddingTop)).toBeGreaterThan(15);
    });

    test('should work in PWA mode', async ({ page, context }) => {
      // Add PWA context
      await context.addInitScript(() => {
        window.navigator.standalone = true;
      });
      
      await page.goto('/');
      
      // Navigation should work in PWA mode
      const hamburger = page.locator('.hamburger');
      await hamburger.click();
      
      const mobileMenu = page.locator('.safe-area-mobile-menu, #mobileMenu');
      await expect(mobileMenu).toBeVisible();
    });
  });
}); 