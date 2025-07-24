/**
 * Subscription Page Object
 * 
 * Represents the subscription management pages and provides methods
 * to interact with them in tests.
 */

export class SubscriptionPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Selectors
    this.planCards = page.locator('[data-testid="plan-card"]');
    this.freePlan = page.locator('[data-testid="plan-card-free"]');
    this.premiumPlan = page.locator('[data-testid="plan-card-premium"]');
    this.currentSubscription = page.locator('[data-testid="current-subscription"]');
    this.subscriptionStatus = page.locator('[data-testid="subscription-status"]');
    this.subscriptionPlan = page.locator('[data-testid="subscription-plan"]');
    this.subscriptionPrice = page.locator('[data-testid="subscription-price"]');
    this.billingCycle = page.locator('[data-testid="billing-cycle"]');
    this.nextBillingDate = page.locator('[data-testid="next-billing-date"]');
    this.manageSubscriptionButton = page.locator('[data-testid="manage-subscription-button"]');
    this.cancelSubscriptionButton = page.locator('[data-testid="cancel-subscription-button"]');
    this.cancelConfirmDialog = page.locator('[data-testid="cancel-confirm-dialog"]');
    this.cancellationSuccess = page.locator('[data-testid="cancellation-success"]');
    this.accessUntilDate = page.locator('[data-testid="access-until-date"]');
    this.renewalNotice = page.locator('[data-testid="renewal-notice"]');
    this.paymentMethod = page.locator('[data-testid="payment-method"]');
    this.updatePaymentMethodButton = page.locator('[data-testid="update-payment-method-button"]');
    this.paymentMethodUpdated = page.locator('[data-testid="payment-method-updated"]');
    this.paymentFailureAlert = page.locator('[data-testid="payment-failure-alert"]');
    this.updatePaymentButton = page.locator('[data-testid="update-payment-button"]');
    this.retryPaymentButton = page.locator('[data-testid="retry-payment-button"]');
    this.paymentRetrySuccess = page.locator('[data-testid="payment-retry-success"]');
    this.billingHistoryButton = page.locator('[data-testid="billing-history-button"]');
    this.invoicesList = page.locator('[data-testid="invoices-list"]');
    this.invoiceItems = page.locator('[data-testid="invoice-item"]');
    this.premiumFeatures = page.locator('[data-testid="premium-features"]');
    this.currentPlanBadge = page.locator('[data-testid="current-plan-badge"]');
    this.successPage = page.locator('[data-testid="subscription-success-page"]');
    this.successMessage = page.locator('[data-testid="success-message"]');
    this.continueButton = page.locator('[data-testid="continue-button"]');
    this.networkError = page.locator('[data-testid="network-error"]');
    this.serverError = page.locator('[data-testid="server-error"]');
    this.retryButton = page.locator('[data-testid="retry-button"]');
  }

  /**
   * Wait for the subscription page to load
   */
  async waitForLoad() {
    await this.page.waitForSelector('[data-testid="subscription-page"]', { state: 'visible' });
  }

  /**
   * Click subscribe button for a specific plan
   * @param {string} planType - Plan type (free, premium, etc.)
   */
  async clickSubscribe(planType) {
    await this.page.locator(`[data-testid="subscribe-button-${planType}"]`).click();
  }

  /**
   * Click the manage subscription button
   */
  async clickManageSubscription() {
    await this.manageSubscriptionButton.click();
  }

  /**
   * Click the cancel subscription button
   */
  async clickCancelSubscription() {
    await this.cancelSubscriptionButton.click();
  }

  /**
   * Confirm subscription cancellation
   */
  async confirmCancellation() {
    await this.page.locator('[data-testid="confirm-cancellation-button"]').click();
  }

  /**
   * Click the billing history button
   */
  async clickBillingHistory() {
    await this.billingHistoryButton.click();
  }

  /**
   * Click download invoice button for a specific invoice
   * @param {number} index - Index of the invoice to download
   */
  async clickDownloadInvoice(index) {
    await this.invoiceItems.nth(index).locator('[data-testid="download-invoice-button"]').click();
  }

  /**
   * Click update payment method button
   */
  async clickUpdatePaymentMethod() {
    await this.updatePaymentMethodButton.click();
  }

  /**
   * Click retry payment button
   */
  async clickRetryPayment() {
    await this.retryPaymentButton.click();
  }

  /**
   * Click continue to app button on success page
   */
  async clickContinueToApp() {
    await this.continueButton.click();
  }
}