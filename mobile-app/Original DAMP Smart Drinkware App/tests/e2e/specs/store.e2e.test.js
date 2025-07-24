/**
 * Store E2E Tests
 * 
 * Tests covering store functionality, product browsing, and checkout
 */

import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';
import { SettingsPage } from '../pages/SettingsPage';
import { TestDataFactory } from '../utils/TestDataFactory';
import { MockStripeService } from '../mocks/MockStripeService';

test.describe('Store Functionality', () => {
  let authPage;
  let settingsPage;
  let testUser;
  let mockStripe;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    settingsPage = new SettingsPage(page);
    testUser = TestDataFactory.createUser();
    mockStripe = new MockStripeService(page);
    
    // Setup mock Stripe service
    await mockStripe.setup();
    
    // Create and login test user
    await TestDataFactory.createTestUser(testUser);
    await authPage.goto();
    await authPage.login(testUser.email, testUser.password);
  });

  test.afterEach(async () => {
    await mockStripe.cleanup();
  });

  test('should display store categories and products', async ({ page }) => {
    // Navigate to store
    await settingsPage.goto();
    await settingsPage.clickStore();
    
    // Wait for store modal to appear
    await page.waitForSelector('[data-testid="store-modal"]', { state: 'visible' });
    
    // Verify categories are displayed
    const categories = page.locator('[data-testid="category-item"]');
    await expect(categories).toHaveCount(6); // all, bundles, handles, sleeves, bottles, accessories
    
    // Verify products are displayed
    const products = page.locator('[data-testid="product-card"]');
    await expect(products).toHaveCountGreaterThan(0);
    
    // Check product details
    const firstProduct = products.first();
    await expect(firstProduct.locator('[data-testid="product-name"]')).toBeVisible();
    await expect(firstProduct.locator('[data-testid="product-price"]')).toBeVisible();
    await expect(firstProduct.locator('[data-testid="product-description"]')).toBeVisible();
  });

  test('should filter products by category', async ({ page }) => {
    // Navigate to store
    await settingsPage.goto();
    await settingsPage.clickStore();
    
    // Wait for store modal to appear
    await page.waitForSelector('[data-testid="store-modal"]', { state: 'visible' });
    
    // Get initial product count
    const initialProducts = page.locator('[data-testid="product-card"]');
    const initialCount = await initialProducts.count();
    
    // Filter by a specific category
    await page.locator('[data-testid="category-item-handles"]').click();
    
    // Verify filtered products
    const filteredProducts = page.locator('[data-testid="product-card"]');
    await expect(filteredProducts).toHaveCount(1); // Assuming only one handle product
    
    // Verify product type
    await expect(filteredProducts.first().locator('[data-testid="product-category"]')).toContainText('Handles');
    
    // Reset filter
    await page.locator('[data-testid="category-item-all"]').click();
    
    // Verify all products are shown again
    const resetProducts = page.locator('[data-testid="product-card"]');
    await expect(resetProducts).toHaveCount(initialCount);
  });

  test('should add products to cart', async ({ page }) => {
    // Navigate to store
    await settingsPage.goto();
    await settingsPage.clickStore();
    
    // Wait for store modal to appear
    await page.waitForSelector('[data-testid="store-modal"]', { state: 'visible' });
    
    // Add a product to cart
    await page.locator('[data-testid="product-card"]').first().locator('[data-testid="add-to-cart-button"]').click();
    
    // Verify cart is updated
    await expect(page.locator('[data-testid="cart-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-item-count"]')).toContainText('1');
    
    // Add another product
    await page.locator('[data-testid="product-card"]').nth(1).locator('[data-testid="add-to-cart-button"]').click();
    
    // Verify cart is updated
    await expect(page.locator('[data-testid="cart-item-count"]')).toContainText('2');
    
    // Verify cart total
    await expect(page.locator('[data-testid="cart-total"]')).toBeVisible();
  });

  test('should handle product quantity changes', async ({ page }) => {
    // Navigate to store
    await settingsPage.goto();
    await settingsPage.clickStore();
    
    // Wait for store modal to appear
    await page.waitForSelector('[data-testid="store-modal"]', { state: 'visible' });
    
    // Add a product to cart
    await page.locator('[data-testid="product-card"]').first().locator('[data-testid="add-to-cart-button"]').click();
    
    // Increase quantity
    await page.locator('[data-testid="quantity-increase"]').click();
    
    // Verify quantity updated
    await expect(page.locator('[data-testid="quantity-value"]')).toContainText('2');
    
    // Decrease quantity
    await page.locator('[data-testid="quantity-decrease"]').click();
    
    // Verify quantity updated
    await expect(page.locator('[data-testid="quantity-value"]')).toContainText('1');
    
    // Decrease again to remove from cart
    await page.locator('[data-testid="quantity-decrease"]').click();
    
    // Verify cart is empty
    await expect(page.locator('[data-testid="cart-summary"]')).not.toBeVisible();
  });

  test('should complete checkout process', async ({ page }) => {
    // Navigate to store
    await settingsPage.goto();
    await settingsPage.clickStore();
    
    // Wait for store modal to appear
    await page.waitForSelector('[data-testid="store-modal"]', { state: 'visible' });
    
    // Add a product to cart
    await page.locator('[data-testid="product-card"]').first().locator('[data-testid="add-to-cart-button"]').click();
    
    // Click checkout
    await page.locator('[data-testid="checkout-button"]').click();
    
    // Verify Stripe checkout opens
    await expect(mockStripe.checkoutModal).toBeVisible();
    
    // Complete payment
    await mockStripe.fillPaymentDetails({
      cardNumber: '4242424242424242',
      expiry: '12/25',
      cvc: '123',
      name: 'Test User'
    });
    
    await mockStripe.submitPayment();
    
    // Verify success page
    await page.waitForSelector('[data-testid="order-success-page"]', { state: 'visible' });
    await expect(page.locator('[data-testid="order-success-message"]')).toBeVisible();
    
    // Continue to app
    await page.locator('[data-testid="continue-to-app-button"]').click();
    
    // Verify redirect back to app
    await expect(page.url()).toContain('/(tabs)');
  });

  test('should handle out of stock products', async ({ page }) => {
    // Navigate to store
    await settingsPage.goto();
    await settingsPage.clickStore();
    
    // Wait for store modal to appear
    await page.waitForSelector('[data-testid="store-modal"]', { state: 'visible' });
    
    // Find an out of stock product
    const outOfStockProduct = page.locator('[data-testid="product-card"]').filter({ has: page.locator('[data-testid="out-of-stock"]') });
    
    // Verify out of stock message
    await expect(outOfStockProduct.locator('[data-testid="out-of-stock"]')).toBeVisible();
    
    // Verify add to cart button is disabled
    await expect(outOfStockProduct.locator('[data-testid="add-to-cart-button"]')).toBeDisabled();
  });

  test('should display product details', async ({ page }) => {
    // Navigate to store
    await settingsPage.goto();
    await settingsPage.clickStore();
    
    // Wait for store modal to appear
    await page.waitForSelector('[data-testid="store-modal"]', { state: 'visible' });
    
    // Click on a product to view details
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Verify product details modal
    await expect(page.locator('[data-testid="product-details-modal"]')).toBeVisible();
    
    // Check details content
    await expect(page.locator('[data-testid="product-details-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-details-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-details-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-details-features"]')).toBeVisible();
    
    // Close details modal
    await page.locator('[data-testid="close-details-button"]').click();
    
    // Verify modal closed
    await expect(page.locator('[data-testid="product-details-modal"]')).not.toBeVisible();
  });
});