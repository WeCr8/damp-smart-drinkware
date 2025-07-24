/**
 * Mock Stripe Service
 * 
 * Provides mock implementation of Stripe checkout for testing
 */

export class MockStripeService {
  constructor(page) {
    this.page = page;
    
    // Selectors
    this.checkoutModalSelector = '[data-testid="stripe-checkout-modal"]';
    this.cardNumberInputSelector = '[data-testid="card-number-input"]';
    this.cardExpiryInputSelector = '[data-testid="card-expiry-input"]';
    this.cardCvcInputSelector = '[data-testid="card-cvc-input"]';
    this.cardNameInputSelector = '[data-testid="card-name-input"]';
    this.emailInputSelector = '[data-testid="email-input"]';
    this.submitButtonSelector = '[data-testid="submit-button"]';
    this.cancelButtonSelector = '[data-testid="cancel-button"]';
    this.paymentErrorSelector = '[data-testid="payment-error"]';
    this.retryButtonSelector = '[data-testid="retry-button"]';
    this.checkoutItemsSelector = '[data-testid="checkout-items"]';
    this.paymentMethodModalSelector = '[data-testid="payment-method-modal"]';
  }

  async setup() {
    // Intercept Stripe checkout requests and mock responses
    await this.page.route('**/stripe-store-checkout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionId: 'mock_session_id',
          url: '#mock-checkout',
        }),
      });
    });

    // Mock Stripe checkout UI
    await this.page.route('#mock-checkout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <head>
              <title>Mock Stripe Checkout</title>
              <style>
                body { font-family: sans-serif; padding: 20px; }
                .modal { background: white; padding: 20px; border-radius: 8px; max-width: 500px; margin: 0 auto; }
                .form-group { margin-bottom: 15px; }
                label { display: block; margin-bottom: 5px; }
                input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
                button { padding: 10px 15px; background: #635bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
                .error { color: red; margin-top: 10px; }
                .items { margin: 20px 0; padding: 10px; background: #f9f9f9; border-radius: 4px; }
              </style>
            </head>
            <body>
              <div class="modal" data-testid="stripe-checkout-modal">
                <h2>Checkout</h2>
                <div class="items" data-testid="checkout-items">
                  <div>DAMP Smart Cup Pro - $89.99</div>
                  <div>Shipping - $9.99</div>
                </div>
                <form id="payment-form">
                  <div class="form-group">
                    <label for="email">Email</label>
                    <input id="email" data-testid="email-input" type="email" required />
                  </div>
                  <div class="form-group">
                    <label for="card-number">Card Number</label>
                    <input id="card-number" data-testid="card-number-input" placeholder="4242 4242 4242 4242" required />
                  </div>
                  <div class="form-group">
                    <label for="card-expiry">Expiration Date</label>
                    <input id="card-expiry" data-testid="card-expiry-input" placeholder="MM/YY" required />
                  </div>
                  <div class="form-group">
                    <label for="card-cvc">CVC</label>
                    <input id="card-cvc" data-testid="card-cvc-input" placeholder="123" required />
                  </div>
                  <div class="form-group">
                    <label for="card-name">Name on Card</label>
                    <input id="card-name" data-testid="card-name-input" required />
                  </div>
                  <div class="error" data-testid="payment-error" style="display: none;">
                    Your card was declined. Please try a different payment method.
                  </div>
                  <div>
                    <button type="button" data-testid="submit-button">Pay</button>
                    <button type="button" data-testid="cancel-button" style="background: #f6f6f6; color: #333; margin-left: 10px;">Cancel</button>
                    <button type="button" data-testid="retry-button" style="background: #4CAF50; display: none;">Try Again</button>
                  </div>
                </form>
              </div>
              <script>
                document.querySelector('[data-testid="submit-button"]').addEventListener('click', function() {
                  const cardNumber = document.querySelector('[data-testid="card-number-input"]').value;
                  if (cardNumber.includes('4000000000000002')) {
                    document.querySelector('[data-testid="payment-error"]').style.display = 'block';
                    document.querySelector('[data-testid="retry-button"]').style.display = 'inline-block';
                  } else {
                    window.location.href = '/store/success';
                  }
                });
                
                document.querySelector('[data-testid="cancel-button"]').addEventListener('click', function() {
                  window.location.href = '/store';
                });
                
                document.querySelector('[data-testid="retry-button"]').addEventListener('click', function() {
                  document.querySelector('[data-testid="payment-error"]').style.display = 'none';
                  document.querySelector('[data-testid="retry-button"]').style.display = 'none';
                });
              </script>
            </body>
          </html>
        `,
      });
    });

    // Mock success page
    await this.page.route('**/store/success', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <head>
              <title>Order Confirmation</title>
              <style>
                body { font-family: sans-serif; padding: 20px; text-align: center; }
                .success { color: #4CAF50; font-size: 24px; margin: 20px 0; }
                button { padding: 10px 15px; background: #0277BD; color: white; border: none; border-radius: 4px; cursor: pointer; }
              </style>
            </head>
            <body>
              <h1 data-testid="order-confirmation" class="success">Order Confirmed!</h1>
              <p>Thank you for your purchase!</p>
              <p data-testid="order-total">Total: $89.99</p>
              <button data-testid="continue-to-app">Continue to App</button>
              <script>
                document.querySelector('[data-testid="continue-to-app"]').addEventListener('click', function() {
                  window.location.href = '/';
                });
              </script>
            </body>
          </html>
        `,
      });
    });
  }

  async cleanup() {
    await this.page.unroute('**/stripe-store-checkout');
    await this.page.unroute('#mock-checkout');
    await this.page.unroute('**/store/success');
  }

  async waitForCheckoutLoad() {
    await this.page.waitForSelector(this.checkoutModalSelector);
  }

  async fillPaymentDetails({ cardNumber, expiry, cvc, name, email }) {
    await this.page.fill(this.cardNumberInputSelector, cardNumber);
    await this.page.fill(this.cardExpiryInputSelector, expiry);
    await this.page.fill(this.cardCvcInputSelector, cvc);
    await this.page.fill(this.cardNameInputSelector, name);
    
    if (email) {
      await this.page.fill(this.emailInputSelector, email);
    }
  }

  async submitPayment() {
    await this.page.click(this.submitButtonSelector);
  }

  async cancelCheckout() {
    await this.page.click(this.cancelButtonSelector);
  }

  async updatePaymentMethod(details) {
    await this.fillPaymentDetails(details);
    await this.submitPayment();
  }

  // Getters for elements
  get checkoutModal() {
    return this.page.locator(this.checkoutModalSelector);
  }

  get paymentError() {
    return this.page.locator(this.paymentErrorSelector);
  }

  get retryButton() {
    return this.page.locator(this.retryButtonSelector);
  }

  get checkoutItems() {
    return this.page.locator(this.checkoutItemsSelector);
  }

  get paymentMethodModal() {
    return this.page.locator(this.paymentMethodModalSelector);
  }
}