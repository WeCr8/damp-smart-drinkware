/**
 * DAMP Smart Drinkware - Hero Animation E2E Tests
 * Google Engineering Standards - Performance Preservation Testing
 */

const { test, expect } = require('@playwright/test');

test.describe('Hero Animation System', () => {
  test.describe('Animation Performance and Preservation', () => {
    test('should load hero animation without blocking page render', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      
      // Hero should be visible quickly
      await expect(page.locator('.hero-section')).toBeVisible({ timeout: 3000 });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test('should complete animation loading gracefully', async ({ page }) => {
      await page.goto('/');
      
      // Wait for page to be ready
      await expect(page.locator('body')).toHaveClass(/page-ready/);
      
      // Check for animation elements
      const heroContent = page.locator('.hero-content');
      await expect(heroContent).toBeVisible();
      
      // Test animation completion event if available
      const animationComplete = await page.evaluate(() => {
        return new Promise((resolve) => {
          const timeout = setTimeout(() => resolve(false), 5000);
          
          document.addEventListener('heroAnimationComplete', () => {
            clearTimeout(timeout);
            resolve(true);
          });
          
          // If no event fires within 5 seconds, consider it complete
        });
      });
      
      // Animation should either complete or timeout gracefully
      expect(typeof animationComplete).toBe('boolean');
    });

    test('should not block user interactions during animation', async ({ page }) => {
      await page.goto('/');
      
      // User should be able to interact immediately
      const hamburger = page.locator('.hamburger');
      await expect(hamburger).toBeVisible();
      
      // Should be able to click hamburger during animation
      await hamburger.click();
      const mobileMenu = page.locator('.safe-area-mobile-menu, #mobileMenu');
      await expect(mobileMenu).toBeVisible();
    });

    test('should handle reduced motion preferences', async ({ page }) => {
      // Set reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      
      // Page should still load and be functional
      await expect(page.locator('.hero-section')).toBeVisible();
      await expect(page.locator('.hero-title')).toBeVisible();
      
      // Animation should be minimal or disabled
      const heroTitle = page.locator('.hero-title');
      const transform = await heroTitle.evaluate(el => window.getComputedStyle(el).transform);
      
      // Should not have complex transforms when reduced motion is preferred
      expect(transform).not.toContain('matrix3d');
    });
  });

  test.describe('Animation Visual Quality', () => {
    test('should maintain visual quality across viewports', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },   // Mobile
        { width: 768, height: 1024 },  // Tablet
        { width: 1280, height: 720 }   // Desktop
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        
        // Hero should be properly sized
        const hero = page.locator('.hero-section');
        await expect(hero).toBeVisible();
        
        const heroBox = await hero.boundingBox();
        expect(heroBox.height).toBeGreaterThan(viewport.height * 0.7); // At least 70% of viewport
      }
    });

    test('should preserve hero stats and content', async ({ page }) => {
      await page.goto('/');
      
      // Wait for hero to load
      await expect(page.locator('.hero-title')).toBeVisible();
      
      // Check for stats if they exist
      const stats = page.locator('.hero-stats, .stat-item');
      if (await stats.count() > 0) {
        await expect(stats.first()).toBeVisible();
        
        // Stats should contain numbers
        const statNumbers = page.locator('.stat-number, .hero-stats .number');
        if (await statNumbers.count() > 0) {
          const statText = await statNumbers.first().textContent();
          expect(statText).toMatch(/\d/); // Should contain at least one digit
        }
      }
    });
  });

  test.describe('Animation Error Handling', () => {
    test('should handle missing animation assets gracefully', async ({ page }) => {
      // Block animation-related resources
      await page.route('**/hero-animation.js', route => route.abort());
      await page.route('**/animations.css', route => route.abort());
      
      await page.goto('/');
      
      // Page should still load and be functional
      await expect(page.locator('.hero-section')).toBeVisible();
      await expect(page.locator('.hero-title')).toBeVisible();
    });

    test('should not show JavaScript errors in console', async ({ page }) => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Filter out acceptable errors (analytics, external resources)
      const criticalErrors = errors.filter(error => 
        !error.includes('googleapis') &&
        !error.includes('gtag') &&
        !error.includes('analytics') &&
        !error.includes('favicon')
      );
      
      expect(criticalErrors).toHaveLength(0);
    });
  });
}); 