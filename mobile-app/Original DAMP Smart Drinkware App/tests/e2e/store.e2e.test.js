/**
 * Store E2E Tests
 * 
 * Tests covering the store functionality, product browsing, and checkout process
 */

import { test, expect } from '@playwright/test';
import { AuthPage } from './pages/AuthPage';
import { StorePage } from './pages/StorePage';
import { TestDataFactory } from './utils/TestDataFactory';
import { MockStripeService } from './mocks/MockStripeService';

test.describe('Store Functionality', () => {
  let authPage;
  let storePage;
  let testUser;
  let mockStripe;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    storePage = new StorePage(page);
    testUser = TestDataFactory.createUser();
    mockStripe = new MockStripeService(page);
    
    // Setup mock Stripe service
    await mockStripe.setup();
    
    // Create and login test user
    await TestDataFactory.createTestUser(testUser);
    await authPage.goto();
    await authPage.login(testUser.email, testUser.password);
    
    // Navigate to store
    await storePage.goto();
  });

  test.afterEach(async () => {
    await mockStripe.cleanup();
  });

  test('should display product categories and allow filtering', async () => {
    // Verify all categories are displayed
    await expect(storePage.categoryButtons).toHaveCount(6); // All, Bundles, Handles, Sleeves, Bottles, Accessories
    
    // Verify default category is "All Products"
    await expect(storePage.getSelectedCategory()).toContainText('All Products');
    
    // Verify all products are initially displayed
    const initialProductCount = await storePage.getProductCount();
    expect(initialProductCount).toBeGreaterThan(0);
    
    // Filter by "Handles" category
    await storePage.selectCategory('handles');
    
    // Verify category is selected
    await expect(storePage.getSelectedCategory()).toContainText('Handles');
    
    // Verify filtered products
    const filteredProductCount = await storePage.getProductCount();
    expect(filteredProductCount).toBeLessThan(initialProductCount);
    
    // Verify product type matches filter
    await expect(storePage.getProductCategory()).toContainText('Handles');
    
    // Reset filter to "All Products"
    await storePage.selectCategory('all');
    
    // Verify all products are displayed again
    const resetProductCount = await storePage.getProductCount();
    expect(resetProductCount).toEqual(initialProductCount);
  });

  test('should display product details correctly', async () => {
    // Select a specific product
    const productName = 'DAMP Smart Cup Pro';
    await storePage.selectProductByName(productName);
    
    // Verify product details
    await expect(storePage.productName).toContainText(productName);
    await expect(storePage.productPrice).toContainText('$89.99');
    await expect(storePage.productOriginalPrice).toContainText('$119.99');
    await expect(storePage.productDescription).toBeVisible();
    
    // Verify product features
    await expect(storePage.productFeatures).toContainText('Built-in tracking');
    await expect(storePage.productFeatures).toContainText('Temperature control');
    
    // Verify product rating
    await expect(storePage.productRating).toContainText('4.8');
    
    // Verify product image
    await expect(storePage.productImage).toBeVisible();
  });

  test('should add products to cart and update quantity', async () => {
    // Add product to cart
    await storePage.addProductToCart('DAMP Smart Cup Pro');
    
    // Verify cart updated
    await expect(storePage.cartItemCount).toContainText('1 item');
    await expect(storePage.cartTotal).toContainText('$89.99');
    
    // Increase quantity
    await storePage.increaseProductQuantity('DAMP Smart Cup Pro');
    
    // Verify quantity updated
    await expect(storePage.getProductQuantity('DAMP Smart Cup Pro')).toContainText('2');
    await expect(storePage.cartItemCount).toContainText('2 items');
    await expect(storePage.cartTotal).toContainText('$179.98');
    
    // Decrease quantity
    await storePage.decreaseProductQuantity('DAMP Smart Cup Pro');
    
    // Verify quantity updated
    await expect(storePage.getProductQuantity('DAMP Smart Cup Pro')).toContainText('1');
    await expect(storePage.cartItemCount).toContainText('1 item');
    await expect(storePage.cartTotal).toContainText('$89.99');
    
    // Add another product
    await storePage.addProductToCart('Smart Handle v2.0');
    
    // Verify multiple items in cart
    await expect(storePage.cartItemCount).toContainText('2 items');
    await expect(storePage.cartTotal).toContainText('$124.98'); // 89.99 + 34.99
  });

  test('should handle out of stock products', async () => {
    // Find out of stock product
    await storePage.selectCategory('accessories');
    
    // Verify out of stock indicator
    await expect(storePage.outOfStockLabel).toBeVisible();
    await expect(storePage.outOfStockLabel).toContainText('Out of Stock');
    
    // Verify add to cart button is disabled
    await expect(storePage.outOfStockButton).toBeVisible();
    await expect(storePage.outOfStockButton).toBeDisabled();
  });

  test('should complete checkout process', async () => {
    // Add product to cart
    await storePage.addProductToCart('DAMP Smart Cup Pro');
    
    // Proceed to checkout
    await storePage.clickCheckout();
    
    // Verify Stripe checkout opens
    await expect(mockStripe.checkoutModal).toBeVisible();
    
    // Complete payment
    await mockStripe.fillPaymentDetails({
      cardNumber: '4242424242424242',
      expiry: '12/25',
      cvc: '123',
      name: 'Test User',
      email: testUser.email,
    });
    
    await mockStripe.submitPayment();
    
    // Verify redirect to success page
    await storePage.waitForSuccessPage();
    await expect(storePage.orderConfirmation).toBeVisible();
    await expect(storePage.orderConfirmation).toContainText('Order Confirmed');
    
    // Verify order details
    await expect(storePage.orderTotal).toContainText('$89.99');
    
    // Continue shopping
    await storePage.clickContinueToApp();
    
    // Verify cart is empty after successful purchase
    await storePage.goto();
    await expect(storePage.emptyCart).toBeVisible();
  });

  test('should handle payment failures gracefully', async () => {
    // Add product to cart
    await storePage.addProductToCart('DAMP Smart Cup Pro');
    
    // Proceed to checkout
    await storePage.clickCheckout();
    
    // Use declined card
    await mockStripe.fillPaymentDetails({
      cardNumber: '4000000000000002', // Declined card
      expiry: '12/25',
      cvc: '123',
      name: 'Test User',
      email: testUser.email,
    });
    
    await mockStripe.submitPayment();
    
    // Verify error handling
    await expect(mockStripe.paymentError).toBeVisible();
    await expect(mockStripe.paymentError).toContainText('Your card was declined');
    
    // Verify user can retry
    await expect(mockStripe.retryButton).toBeVisible();
  });

  test('should apply free shipping on orders over $50', async () => {
    // Add expensive product to cart
    await storePage.addProductToCart('DAMP Smart Cup Pro'); // $89.99
    
    // Verify free shipping badge
    await expect(storePage.freeShippingBadge).toBeVisible();
    
    // Proceed to checkout
    await storePage.clickCheckout();
    
    // Verify no shipping charge in checkout
    await expect(mockStripe.checkoutItems).not.toContainText('Shipping');
    
    // Cancel checkout
    await mockStripe.cancelCheckout();
    
    // Clear cart
    await storePage.clearCart();
    
    // Add inexpensive product
    await storePage.addProductToCart('Premium Cup Sleeve'); // $24.99
    
    // Proceed to checkout
    await storePage.clickCheckout();
    
    // Verify shipping charge in checkout
    await expect(mockStripe.checkoutItems).toContainText('Shipping');
    await expect(mockStripe.checkoutItems).toContainText('$9.99');
  });

  test('should persist cart between sessions', async () => {
    // Add product to cart
    await storePage.addProductToCart('DAMP Smart Cup Pro');
    
    // Refresh page
    await storePage.page.reload();
    
    // Verify cart persists
    await expect(storePage.cartItemCount).toContainText('1 item');
    await expect(storePage.cartTotal).toContainText('$89.99');
  });

  test('should handle category navigation with keyboard and screen readers', async () => {
    // Test keyboard navigation
    await storePage.page.keyboard.press('Tab'); // Focus first category
    await storePage.page.keyboard.press('Enter'); // Select category
    
    // Verify category selected
    const selectedCategory = await storePage.getSelectedCategory();
    expect(selectedCategory).not.toBeNull();
    
    // Test screen reader properties
    const categoryButton = storePage.categoryButtons.first();
    await expect(categoryButton).toHaveAttribute('aria-label');
    await expect(categoryButton).toHaveAttribute('role', 'button');
  });

  test('should display responsive layout on different screen sizes', async () => {
    // Test desktop layout
    const desktopWidth = 1200;
    const desktopHeight = 800;
    await storePage.page.setViewportSize({ width: desktopWidth, height: desktopHeight });
    
    // Verify multiple products per row
    const desktopLayout = await storePage.getProductsPerRow();
    expect(desktopLayout).toBeGreaterThan(1);
    
    // Test mobile layout
    const mobileWidth = 375;
    const mobileHeight = 667;
    await storePage.page.setViewportSize({ width: mobileWidth, height: mobileHeight });
    
    // Verify single product per row
    const mobileLayout = await storePage.getProductsPerRow();
    expect(mobileLayout).toBe(1);
    
    // Verify category slider is scrollable
    const categoriesWidth = await storePage.getCategoriesWidth();
    expect(categoriesWidth).toBeGreaterThan(mobileWidth);
  });
});