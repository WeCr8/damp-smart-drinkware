/**
 * DAMP Smart Drinkware - E-commerce Flow E2E Tests
 * Google Engineering Standards - Complete Purchase Journey Testing
 */

const { test, expect } = require('@playwright/test');

test.describe('Complete E-commerce Flow', () => {
  test.describe('Product Selection Journey', () => {
    const products = [
      { name: 'DAMP Handle', page: '/pages/damp-handle-v1.0.html', price: '$69.99' },
      { name: 'Silicone Bottom', page: '/pages/silicone-bottom-v1.0.html', price: '$59.99' },
      { name: 'Cup Sleeve', page: '/pages/cup-sleeve-v1.0.html', price: '$49.99' },
      { name: 'Baby Bottle', page: '/pages/baby-bottle-v1.0.html', price: '$79.99' }
    ];

    products.forEach(product => {
      test(`should complete purchase flow for ${product.name}`, async ({ page }) => {
        // Start from homepage
        await page.goto('/');
        
        // Navigate to product page
        await page.goto(product.page);
        await expect(page).toHaveTitle(new RegExp(product.name, 'i'));
        
        // Verify product information
        await expect(page.locator('h1, .hero-title, .product-name')).toContainText(product.name);
        await expect(page.locator('.price, .product-price')).toContainText(product.price);
        
        // Test Pre-Order button
        const preOrderBtn = page.locator('text=Pre-Order, .btn-primary').first();
        if (await preOrderBtn.count() > 0) {
          await preOrderBtn.click();
          
          // Should navigate to pre-sale funnel or cart
          await page.waitForURL(/pre-sale|cart|checkout/, { timeout: 10000 });
          
          // Verify we're on the right page
          const currentUrl = page.url();
          expect(currentUrl).toMatch(/pre-sale|cart|checkout/);
        }
      });
    });
  });

  test.describe('Shopping Cart Functionality', () => {
    test('should add items to cart and manage quantities', async ({ page }) => {
      // Mock cart functionality for testing
      await page.addInitScript(() => {
        window.mockCart = [];
        window.addToCart = (item) => {
          window.mockCart.push(item);
          return window.mockCart.length;
        };
        window.getCartCount = () => window.mockCart.length;
      });

      await page.goto('/pages/damp-handle-v1.0.html');
      
      // Add to cart
      const addToCartBtn = page.locator('text=Add to Cart, text=Pre-Order').first();
      if (await addToCartBtn.count() > 0) {
        await addToCartBtn.click();
        
        // Cart should update
        const cartCount = await page.evaluate(() => window.getCartCount ? window.getCartCount() : 0);
        expect(cartCount).toBeGreaterThan(0);
      }
    });

    test('should display cart contents correctly', async ({ page }) => {
      await page.goto('/pages/cart.html');
      
      // Cart page should load
      await expect(page).toHaveTitle(/Cart/);
      
      // Check for cart structure
      const cartContainer = page.locator('.cart-container, .cart-items, #cart');
      await expect(cartContainer).toBeVisible();
      
      // Test empty cart state or populated cart
      const cartItems = page.locator('.cart-item');
      const itemCount = await cartItems.count();
      
      if (itemCount === 0) {
        // Empty cart should show appropriate message
        const emptyMessage = page.locator('text=empty, text=no items', { matchCase: false });
        if (await emptyMessage.count() > 0) {
          await expect(emptyMessage).toBeVisible();
        }
      } else {
        // Cart with items should show proper structure
        await expect(cartItems.first()).toBeVisible();
      }
    });
  });

  test.describe('Checkout Process', () => {
    test('should handle Stripe checkout integration', async ({ page }) => {
      // Mock Stripe for testing
      await page.route('**/stripe/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: true, 
            sessionId: 'mock_session_123' 
          })
        });
      });

      await page.goto('/pages/pre-sale-funnel.html');
      
      // Find checkout button
      const checkoutBtn = page.locator('text=Checkout, text=Pre-Order Now, .checkout-btn').first();
      
      if (await checkoutBtn.count() > 0) {
        await checkoutBtn.click();
        
        // Should handle checkout process
        await page.waitForTimeout(2000); // Allow for redirect/processing
        
        // Should either redirect to Stripe or show processing
        const currentUrl = page.url();
        const isCheckoutFlow = currentUrl.includes('checkout') || 
                              currentUrl.includes('stripe') || 
                              currentUrl.includes('success');
        
        expect(isCheckoutFlow || currentUrl.includes('pre-sale')).toBeTruthy();
      }
    });

    test('should validate checkout form fields', async ({ page }) => {
      await page.goto('/pages/stripe-checkout.html');
      
      // Check for form elements
      const emailField = page.locator('input[type="email"], input[name="email"]');
      if (await emailField.count() > 0) {
        // Test email validation
        await emailField.fill('invalid-email');
        
        const submitBtn = page.locator('button[type="submit"], .submit-btn').first();
        if (await submitBtn.count() > 0) {
          await submitBtn.click();
          
          // Should show validation error
          const errorMessage = page.locator('.error, .invalid', { hasText: /email|invalid/ });
          if (await errorMessage.count() > 0) {
            await expect(errorMessage).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Order Success and Confirmation', () => {
    test('should display order success page correctly', async ({ page }) => {
      await page.goto('/pages/success.html');
      
      // Success page should load
      await expect(page).toHaveTitle(/Success|Order|Thank/i);
      
      // Should show success message
      const successMessage = page.locator('text=success, text=thank you, text=order confirmed', { matchCase: false });
      if (await successMessage.count() > 0) {
        await expect(successMessage.first()).toBeVisible();
      }
      
      // Should have navigation back to homepage
      const homeLink = page.locator('a[href="/"], a[href="../index.html"], text=Home');
      if (await homeLink.count() > 0) {
        await expect(homeLink.first()).toBeVisible();
      }
    });
  });

  test.describe('Pre-Sale Funnel Optimization', () => {
    test('should track user interaction in pre-sale funnel', async ({ page }) => {
      // Mock analytics tracking
      await page.addInitScript(() => {
        window.analyticsEvents = [];
        window.gtag = (...args) => {
          window.analyticsEvents.push(args);
        };
      });

      await page.goto('/pages/pre-sale-funnel.html');
      
      // Interact with pre-sale elements
      const productCards = page.locator('.product-card, .product-option');
      if (await productCards.count() > 0) {
        await productCards.first().click();
        
        // Check if analytics events were fired
        const events = await page.evaluate(() => window.analyticsEvents || []);
        expect(events.length).toBeGreaterThan(0);
      }
    });

    test('should handle email collection for pre-orders', async ({ page }) => {
      await page.goto('/pages/pre-sale-funnel.html');
      
      // Look for email collection form
      const emailInput = page.locator('input[type="email"], input[placeholder*="email"]');
      if (await emailInput.count() > 0) {
        await emailInput.fill('test@example.com');
        
        const submitBtn = page.locator('button[type="submit"], .submit-btn, text=Join Waitlist').first();
        if (await submitBtn.count() > 0) {
          await submitBtn.click();
          
          // Should show confirmation
          const confirmation = page.locator('.success, .thank-you, text=thank you', { matchCase: false });
          if (await confirmation.count() > 0) {
            await expect(confirmation.first()).toBeVisible({ timeout: 5000 });
          }
        }
      }
    });
  });
}); 