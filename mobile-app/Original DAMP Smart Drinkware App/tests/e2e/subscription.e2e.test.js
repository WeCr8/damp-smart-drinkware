/**
 * Subscription E2E Tests
 * 
 * Tests covering subscription purchase, management, and feature access
 */

import { test, expect } from '@playwright/test';
import { AuthPage } from './pages/AuthPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { SettingsPage } from './pages/SettingsPage';
import { TestDataFactory } from './utils/TestDataFactory';
import { MockStripeService } from './mocks/MockStripeService';

test.describe('Subscription Management', () => {
  let authPage;
  let subscriptionPage;
  let settingsPage;
  let testUser;
  let mockStripe;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    subscriptionPage = new SubscriptionPage(page);
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

  test('should purchase DAMP+ subscription successfully', async ({ page }) => {
    // Navigate to subscription page
    await settingsPage.goto();
    await settingsPage.clickSubscription();
    
    // Verify subscription plans are displayed
    await expect(subscriptionPage.planCards).toHaveCount(2);
    await expect(subscriptionPage.freePlan).toBeVisible();
    await expect(subscriptionPage.premiumPlan).toBeVisible();
    
    // Check premium plan details
    await expect(subscriptionPage.premiumPlan.locator('[data-testid="plan-name"]')).toContainText('DAMP+');
    await expect(subscriptionPage.premiumPlan.locator('[data-testid="plan-price"]')).toContainText('$2.99');
    await expect(subscriptionPage.premiumPlan.locator('[data-testid="plan-interval"]')).toContainText('per month');
    
    // Verify features are listed
    const features = subscriptionPage.premiumPlan.locator('[data-testid="feature-item"]');
    await expect(features).toContainText(['Track up to 10 devices', 'Unlimited safe zones', 'Custom notifications']);
    
    // Click subscribe button
    await subscriptionPage.clickSubscribe('premium');
    
    // Verify Stripe checkout opens
    await expect(mockStripe.checkoutModal).toBeVisible();
    await expect(mockStripe.checkoutModal).toContainText('DAMP+');
    await expect(mockStripe.checkoutModal).toContainText('$2.99');
    
    // Complete payment
    await mockStripe.fillPaymentDetails({
      cardNumber: '4242424242424242',
      expiry: '12/25',
      cvc: '123',
      name: 'Test User'
    });
    
    await mockStripe.submitPayment();
    
    // Verify success page
    await expect(subscriptionPage.successPage).toBeVisible();
    await expect(subscriptionPage.successMessage).toContainText('Welcome to DAMP+');
    
    // Continue to app
    await subscriptionPage.clickContinueToApp();
    
    // Verify subscription status updated
    await settingsPage.goto();
    await settingsPage.clickSubscription();
    
    await expect(subscriptionPage.currentSubscription).toBeVisible();
    await expect(subscriptionPage.currentSubscription).toContainText('DAMP+');
    await expect(subscriptionPage.subscriptionStatus).toContainText('Active');
  });

  test('should handle payment failure gracefully', async ({ page }) => {
    await settingsPage.goto();
    await settingsPage.clickSubscription();
    
    await subscriptionPage.clickSubscribe('premium');
    
    // Use declined card
    await mockStripe.fillPaymentDetails({
      cardNumber: '4000000000000002', // Declined card
      expiry: '12/25',
      cvc: '123',
      name: 'Test User'
    });
    
    await mockStripe.submitPayment();
    
    // Verify error handling
    await expect(mockStripe.paymentError).toBeVisible();
    await expect(mockStripe.paymentError).toContainText('Your card was declined');
    
    // Verify user can retry
    await expect(mockStripe.retryButton).toBeVisible();
    
    // Cancel and verify no subscription created
    await mockStripe.cancelCheckout();
    
    await expect(subscriptionPage.currentSubscription).not.toBeVisible();
  });

  test('should display current subscription details', async ({ page }) => {
    // Create active subscription
    await TestDataFactory.createSubscription(testUser.id, 'premium');
    
    await settingsPage.goto();
    await settingsPage.clickSubscription();
    
    // Verify subscription information
    await expect(subscriptionPage.currentSubscription).toBeVisible();
    await expect(subscriptionPage.subscriptionPlan).toContainText('DAMP+');
    await expect(subscriptionPage.subscriptionStatus).toContainText('Active');
    await expect(subscriptionPage.subscriptionPrice).toContainText('$2.99');
    await expect(subscriptionPage.billingCycle).toContainText('Monthly');
    
    // Verify next billing date
    await expect(subscriptionPage.nextBillingDate).toBeVisible();
    await expect(subscriptionPage.nextBillingDate).toContainText('Renews');
  });

  test('should update subscription status in settings', async ({ page }) => {
    // Create active subscription
    await TestDataFactory.createSubscription(testUser.id, 'premium');
    
    // Go to settings
    await settingsPage.goto();
    
    // Check subscription status in settings
    const subscriptionItem = page.locator('#subscription');
    await expect(subscriptionItem).toBeVisible();
    
    // Verify status is shown in settings
    await expect(subscriptionItem.locator('text=DAMP+ Active')).toBeVisible();
  });

  test('should restrict features for free users', async ({ page }) => {
    // Ensure user has free subscription
    await settingsPage.goto();
    await settingsPage.clickDevices();
    
    // Verify premium features show upgrade prompts
    await expect(page.locator('text=PRO')).toBeVisible();
    
    // Try to enable location tracking
    await page.locator('[data-testid="location-tracking-toggle"]').click();
    
    // Verify upgrade modal
    await expect(page.locator('text=Subscription Required')).toBeVisible();
    await expect(page.locator('text=Location tracking requires an active DAMP+ subscription')).toBeVisible();
    
    // Verify upgrade button
    await expect(page.locator('text=Upgrade')).toBeVisible();
  });
});