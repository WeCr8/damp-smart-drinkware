/**
 * DAMP Smart Drinkware - Products E2E Tests
 * Tests the product pages and purchasing flow
 */

const { test, expect } = require('@playwright/test');

test.describe('Products', () => {
  
  test.describe('Product Pages', () => {
    const products = [
      { name: 'DAMP Handle', url: '/pages/damp-handle-v1.0.html', price: '$49.99' },
      { name: 'Silicone Bottom', url: '/pages/silicone-bottom-v1.0.html', price: '$29.99' },
      { name: 'Cup Sleeve', url: '/pages/cup-sleeve-v1.0.html', price: '$39.99' },
      { name: 'Baby Bottle', url: '/pages/baby-bottle-v1.0.html', price: '$79.99' }
    ];

    products.forEach(product => {
      test(`should load ${product.name} page successfully`, async ({ page }) => {
        await page.goto(product.url);
        
        // Check page loads
        await expect(page).toHaveTitle(new RegExp(product.name, 'i'));
        
        // Verify product information is displayed
        await expect(page.locator('h1, .hero-title')).toContainText(product.name);
        
        // Check price is displayed
        await expect(page.locator('.price, .product-price')).toContainText(product.price);
        
        // Verify CTA buttons exist
        await expect(page.locator('text=Pre-Order, text=Buy Now')).toBeVisible();
      });
    });
  });

  test.describe('Product Voting', () => {
    test('should display voting interface', async ({ page }) => {
      await page.goto('/pages/product-voting.html');
      
      // Check voting page loads
      await expect(page).toHaveTitle(/Product Voting/i);
      
      // Verify voting options are available
      await expect(page.locator('.vote-option, .product-vote')).toHaveCount.greaterThan(0);
    });

    test('should allow voting for products', async ({ page }) => {
      await page.goto('/pages/product-voting.html');
      
      // Find and click a vote button
      const voteButton = page.locator('button:has-text("Vote"), .vote-btn').first();
      if (await voteButton.count() > 0) {
        await voteButton.click();
        
        // Should show confirmation or update
        await expect(page.locator('.vote-success, .thank-you, .voted')).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Pre-Sale Funnel', () => {
    test('should load pre-sale funnel page', async ({ page }) => {
      await page.goto('/pages/pre-sale-funnel.html');
      
      // Check page loads
      await expect(page).toHaveTitle(/Pre.*Sale/i);
      
      // Verify main elements
      await expect(page.locator('.hero-section, .presale-hero')).toBeVisible();
    });

    test('should display product selection', async ({ page }) => {
      await page.goto('/pages/pre-sale-funnel.html');
      
      // Check if products are displayed
      const productCards = page.locator('.product-card, .product-option');
      await expect(productCards).toHaveCount.greaterThan(0);
      
      // Verify prices are shown
      await expect(page.locator('.price')).toHaveCount.greaterThan(0);
    });

    test('should handle product selection and checkout', async ({ page }) => {
      await page.goto('/pages/pre-sale-funnel.html');
      
      // Mock Stripe for testing
      await page.route('**/stripe/**', route => route.fulfill({ 
        status: 200, 
        body: JSON.stringify({ success: true }) 
      }));
      
      // Select first product if available
      const firstProduct = page.locator('.product-card, .product-option').first();
      if (await firstProduct.count() > 0) {
        await firstProduct.click();
        
        // Look for checkout button
        const checkoutBtn = page.locator('text=Checkout, text=Pre-Order Now, .checkout-btn');
        if (await checkoutBtn.count() > 0) {
          await checkoutBtn.click();
          
          // Should proceed to checkout or show loading
          await page.waitForTimeout(2000); // Give time for redirect
        }
      }
    });
  });

  test.describe('Support Pages', () => {
    test('should load support page', async ({ page }) => {
      await page.goto('/pages/support.html');
      
      // Check page loads
      await expect(page).toHaveTitle(/Support/i);
      
      // Verify contact information
      await expect(page.locator('text=support@dampdrink.com, text=hello@dampdrink.com')).toBeVisible();
    });

    test('should display FAQ section', async ({ page }) => {
      await page.goto('/pages/support.html');
      
      // Look for FAQ items
      const faqItems = page.locator('.faq-item, .support-faq');
      if (await faqItems.count() > 0) {
        // Test FAQ interaction
        await faqItems.first().click();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Cross-Page Navigation', () => {
    test('should navigate between product pages', async ({ page }) => {
      // Start on homepage
      await page.goto('/');
      
      // Click on a product
      await page.click('.product-card a, .product-name a');
      
      // Should be on a product page
      await expect(page).toHaveURL(/pages\//);
      
      // Go back to homepage
      await page.goBack();
      await expect(page).toHaveURL('/');
    });

    test('should maintain header navigation across pages', async ({ page }) => {
      const pages = ['/', '/pages/about.html', '/pages/support.html'];
      
      for (const url of pages) {
        await page.goto(url);
        
        // Check header exists
        await expect(page.locator('header, nav, damp-header')).toBeVisible();
        
        // Check logo links back to home
        const logo = page.locator('.logo a, .header-logo a');
        if (await logo.count() > 0) {
          // Just verify it exists and has href
          await expect(logo).toHaveAttribute('href', /\//);
        }
      }
    });
  });

  test.describe('Visual Regression', () => {
    test('homepage visual comparison', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Take screenshot for visual comparison
      await expect(page).toHaveScreenshot('homepage.png', {
        fullPage: true,
        threshold: 0.3 // Allow 30% difference for animations/dynamic content
      });
    });

    test('products section visual comparison', async ({ page }) => {
      await page.goto('/');
      await page.locator('#products').scrollIntoViewIfNeeded();
      
      // Take screenshot of products section
      await expect(page.locator('.products-section')).toHaveScreenshot('products-section.png', {
        threshold: 0.3
      });
    });
  });

  test.describe('Performance', () => {
    test('should load pages within performance budget', async ({ page }) => {
      // Start timing
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle network issues gracefully', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });
      
      await page.goto('/');
      
      // Should still load, just slower
      await expect(page.locator('.hero-section')).toBeVisible({ timeout: 10000 });
    });
  });
}); 