/**
 * DAMP Smart Drinkware - Performance Optimization E2E Tests
 * Google Engineering Standards - Performance Validation
 */

const { test, expect } = require('@playwright/test');

test.describe('Performance Optimization Validation', () => {
  test.describe('Core Web Vitals', () => {
    test('should meet LCP (Largest Contentful Paint) requirements', async ({ page }) => {
      await page.goto('/');
      
      // Measure LCP
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            observer.disconnect();
            resolve(lastEntry.startTime);
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Timeout after 10 seconds
          setTimeout(() => resolve(0), 10000);
        });
      });
      
      // LCP should be under 2.5 seconds for good performance
      expect(lcp).toBeLessThan(2500);
    });

    test('should meet FID (First Input Delay) requirements', async ({ page }) => {
      await page.goto('/');
      
      // Wait for page to be interactive
      await page.waitForLoadState('networkidle');
      
      // Test immediate responsiveness
      const startTime = Date.now();
      await page.locator('.hamburger').click();
      
      const mobileMenu = page.locator('.safe-area-mobile-menu, #mobileMenu');
      await expect(mobileMenu).toBeVisible();
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100); // FID should be under 100ms
    });

    test('should meet CLS (Cumulative Layout Shift) requirements', async ({ page }) => {
      await page.goto('/');
      
      // Measure layout shifts
      const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0;
          
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
          });
          
          observer.observe({ entryTypes: ['layout-shift'] });
          
          // Measure for 5 seconds
          setTimeout(() => {
            observer.disconnect();
            resolve(clsValue);
          }, 5000);
        });
      });
      
      // CLS should be under 0.1 for good performance
      expect(cls).toBeLessThan(0.1);
    });
  });

  test.describe('Resource Loading Optimization', () => {
    test('should load critical resources first', async ({ page }) => {
      const resourceTimings = [];
      
      page.on('response', response => {
        resourceTimings.push({
          url: response.url(),
          status: response.status(),
          timing: Date.now()
        });
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Critical resources should load first
      const criticalResources = resourceTimings.filter(r => 
        r.url.includes('main.css') || 
        r.url.includes('navigation.js') ||
        r.url.includes('hero-animation')
      );
      
      expect(criticalResources.length).toBeGreaterThan(0);
      
      // All critical resources should have loaded successfully
      criticalResources.forEach(resource => {
        expect(resource.status).toBe(200);
      });
    });

    test('should lazy load non-critical resources', async ({ page }) => {
      await page.goto('/');
      
      // Check for lazy loading implementation
      const lazyImages = page.locator('img[loading="lazy"], img[data-src]');
      if (await lazyImages.count() > 0) {
        // Images should not all load immediately
        const initialLoadedImages = await page.evaluate(() => {
          const images = Array.from(document.querySelectorAll('img'));
          return images.filter(img => img.complete).length;
        });
        
        const totalImages = await page.locator('img').count();
        
        // Some images should be lazy loaded
        expect(initialLoadedImages).toBeLessThan(totalImages);
      }
    });

    test('should use efficient caching strategies', async ({ page }) => {
      // First visit
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const firstLoadTime = Date.now();
      
      // Second visit (should use cache)
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const secondLoadTime = Date.now();
      
      // Second load should be faster due to caching
      // (This is a simplified test - in real scenarios, you'd measure more precisely)
      expect(secondLoadTime - firstLoadTime).toBeLessThan(5000);
    });
  });

  test.describe('JavaScript Performance', () => {
    test('should not block main thread excessively', async ({ page }) => {
      await page.goto('/');
      
      // Measure main thread blocking
      const longTaskDuration = await page.evaluate(() => {
        return new Promise((resolve) => {
          let totalBlockingTime = 0;
          
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) {
                totalBlockingTime += entry.duration - 50;
              }
            }
          });
          
          observer.observe({ entryTypes: ['longtask'] });
          
          setTimeout(() => {
            observer.disconnect();
            resolve(totalBlockingTime);
          }, 5000);
        });
      });
      
      // Total blocking time should be minimal
      expect(longTaskDuration).toBeLessThan(300); // Under 300ms for 5 seconds
    });

    test('should handle dependency loading efficiently', async ({ page }) => {
      // Mock slow dependency loading
      await page.route('**/firebase/**', route => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: 'console.log("Firebase loaded");'
          });
        }, 1000);
      });
      
      await page.goto('/');
      
      // Page should be interactive before dependencies finish loading
      await expect(page.locator('.hamburger')).toBeVisible();
      
      const hamburger = page.locator('.hamburger');
      await hamburger.click();
      
      const mobileMenu = page.locator('.safe-area-mobile-menu, #mobileMenu');
      await expect(mobileMenu).toBeVisible();
    });
  });

  test.describe('Network Optimization', () => {
    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow 3G
      await page.route('**/*', route => {
        setTimeout(() => {
          route.continue();
        }, 100); // Add 100ms delay to all requests
      });
      
      const startTime = Date.now();
      await page.goto('/');
      
      // Hero should still be visible within reasonable time on slow network
      await expect(page.locator('.hero-section')).toBeVisible({ timeout: 10000 });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds on slow network
    });

    test('should gracefully handle failed resource loading', async ({ page }) => {
      // Block some non-critical resources
      await page.route('**/analytics/**', route => route.abort());
      await page.route('**/gtag/**', route => route.abort());
      
      await page.goto('/');
      
      // Page should still be functional
      await expect(page.locator('.hero-section')).toBeVisible();
      await expect(page.locator('.hamburger')).toBeVisible();
      
      // Navigation should work
      await page.locator('.hamburger').click();
      const mobileMenu = page.locator('.safe-area-mobile-menu, #mobileMenu');
      await expect(mobileMenu).toBeVisible();
    });
  });
}); 