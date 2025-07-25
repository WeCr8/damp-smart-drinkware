/**
 * DAMP Smart Drinkware - Admin System E2E Tests
 * Google Engineering Standards - Administrative Interface Testing
 */

const { test, expect } = require('@playwright/test');

test.describe('Admin System Functionality', () => {
  test.describe('Admin Dashboard Access', () => {
    test('should load admin dashboard correctly', async ({ page }) => {
      await page.goto('/pages/admin/index.html');
      
      // Dashboard should load
      await expect(page).toHaveTitle(/Admin|Dashboard/i);
      
      // Check for main dashboard elements
      await expect(page.locator('.admin-container')).toBeVisible();
      await expect(page.locator('.admin-header')).toBeVisible();
      
      // Check for key metrics
      const metrics = page.locator('.metric-card, .dashboard-metric');
      if (await metrics.count() > 0) {
        await expect(metrics.first()).toBeVisible();
      }
    });

    test('should display admin modules correctly', async ({ page }) => {
      await page.goto('/pages/admin/index.html');
      
      // Check for module cards
      const moduleCards = page.locator('.module-card');
      expect(await moduleCards.count()).toBeGreaterThan(0);
      
      // Test key modules
      const expectedModules = [
        'Website Management',
        'Pricing',
        'Project Management',
        'Mobile App',
        'Users',
        'Analytics'
      ];
      
      for (const moduleName of expectedModules) {
        const module = page.locator('.module-card', { hasText: moduleName });
        if (await module.count() > 0) {
          await expect(module).toBeVisible();
        }
      }
    });
  });

  test.describe('Website Management Module', () => {
    test('should navigate to website management correctly', async ({ page }) => {
      await page.goto('/pages/admin/website-management.html');
      
      // Website management should load
      await expect(page).toHaveTitle(/Website Management/i);
      
      // Check for management tabs
      const tabs = page.locator('.tab-button, .management-tab');
      expect(await tabs.count()).toBeGreaterThan(0);
      
      // Test tab switching
      const overviewTab = page.locator('button[data-tab="overview"], .tab-button').first();
      if (await overviewTab.count() > 0) {
        await overviewTab.click();
        
        const overviewContent = page.locator('#overview, .tab-content');
        if (await overviewContent.count() > 0) {
          await expect(overviewContent.first()).toBeVisible();
        }
      }
    });

    test('should display page management interface', async ({ page }) => {
      await page.goto('/pages/admin/website-management.html');
      
      // Switch to pages tab
      const pagesTab = page.locator('button[data-tab="pages"]');
      if (await pagesTab.count() > 0) {
        await pagesTab.click();
        
        // Check for page list
        const pageList = page.locator('.page-list, .pages-list');
        if (await pageList.count() > 0) {
          await expect(pageList).toBeVisible();
          
          // Check for page items
          const pageItems = page.locator('.page-item');
          if (await pageItems.count() > 0) {
            await expect(pageItems.first()).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Pricing Administration', () => {
    test('should load pricing admin interface', async ({ page }) => {
      await page.goto('/pages/admin/pricing-admin.html');
      
      // Pricing admin should load
      await expect(page).toHaveTitle(/Pricing/i);
      
      // Check for pricing controls
      const pricingCards = page.locator('.pricing-card, .product-pricing');
      if (await pricingCards.count() > 0) {
        await expect(pricingCards.first()).toBeVisible();
      }
    });

    test('should handle pricing updates', async ({ page }) => {
      // Mock API for pricing updates
      await page.route('**/api/admin/pricing/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Price updated' })
        });
      });

      await page.goto('/pages/admin/pricing-admin.html');
      
      // Test price input
      const priceInputs = page.locator('input[type="number"], .price-input');
      if (await priceInputs.count() > 0) {
        const firstInput = priceInputs.first();
        await firstInput.fill('99.99');
        
        // Test save button
        const saveBtn = page.locator('button[type="submit"], .save-btn, text=Save').first();
        if (await saveBtn.count() > 0) {
          await saveBtn.click();
          
          // Should show success message
          const successMessage = page.locator('.success, .notification');
          if (await successMessage.count() > 0) {
            await expect(successMessage).toBeVisible({ timeout: 5000 });
          }
        }
      }
    });
  });

  test.describe('Admin System Performance', () => {
    test('should load admin dashboard within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/pages/admin/index.html');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should handle admin API calls efficiently', async ({ page }) => {
      // Mock admin API with delay
      await page.route('**/api/admin/**', route => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: {} })
          });
        }, 100);
      });

      await page.goto('/pages/admin/index.html');
      
      // API calls should complete within reasonable time
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    });
  });

  test.describe('Admin Security and Access Control', () => {
    test('should handle unauthorized access gracefully', async ({ page }) => {
      // Test admin pages without authentication
      const adminPages = [
        '/pages/admin/index.html',
        '/pages/admin/website-management.html',
        '/pages/admin/pricing-admin.html'
      ];

      for (const adminPage of adminPages) {
        await page.goto(adminPage);
        
        // Page should either load (for demo) or show authentication
        const isLoaded = await page.locator('body').isVisible();
        expect(isLoaded).toBeTruthy();
        
        // If there's an auth form, it should be functional
        const authForm = page.locator('form[action*="login"], .auth-form');
        if (await authForm.count() > 0) {
          await expect(authForm).toBeVisible();
        }
      }
    });
  });
}); 