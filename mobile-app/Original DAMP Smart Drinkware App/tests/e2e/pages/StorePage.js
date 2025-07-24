/**
 * Store Page Object
 * 
 * Page object for interacting with the store functionality
 */

export class StorePage {
  constructor(page) {
    this.page = page;
    
    // Selectors
    this.categoryButtonsSelector = '[data-testid="category-button"]';
    this.productCardSelector = '[data-testid="product-card"]';
    this.productNameSelector = '[data-testid="product-name"]';
    this.productPriceSelector = '[data-testid="product-price"]';
    this.productOriginalPriceSelector = '[data-testid="product-original-price"]';
    this.productDescriptionSelector = '[data-testid="product-description"]';
    this.productFeaturesSelector = '[data-testid="product-features"]';
    this.productRatingSelector = '[data-testid="product-rating"]';
    this.productImageSelector = '[data-testid="product-image"]';
    this.addToCartButtonSelector = '[data-testid="add-to-cart-button"]';
    this.increaseQuantityButtonSelector = '[data-testid="increase-quantity"]';
    this.decreaseQuantityButtonSelector = '[data-testid="decrease-quantity"]';
    this.productQuantitySelector = '[data-testid="product-quantity"]';
    this.outOfStockLabelSelector = '[data-testid="out-of-stock-label"]';
    this.outOfStockButtonSelector = '[data-testid="out-of-stock-button"]';
    this.cartItemCountSelector = '[data-testid="cart-item-count"]';
    this.cartTotalSelector = '[data-testid="cart-total"]';
    this.checkoutButtonSelector = '[data-testid="checkout-button"]';
    this.emptyCartSelector = '[data-testid="empty-cart"]';
    this.freeShippingBadgeSelector = '[data-testid="free-shipping-badge"]';
    this.orderConfirmationSelector = '[data-testid="order-confirmation"]';
    this.orderTotalSelector = '[data-testid="order-total"]';
    this.continueToAppButtonSelector = '[data-testid="continue-to-app"]';
    this.productCategorySelector = '[data-testid="product-category"]';
  }

  // Navigation
  async goto() {
    await this.page.goto('/settings');
    await this.page.click('text=Store');
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.page.waitForSelector(this.categoryButtonsSelector);
  }

  // Category selection
  async selectCategory(categoryId) {
    await this.page.click(`[data-testid="category-${categoryId}"]`);
  }

  async getSelectedCategory() {
    return this.page.locator(`${this.categoryButtonsSelector}.selected`);
  }

  // Product interaction
  async selectProductByName(name) {
    await this.page.click(`${this.productCardSelector}:has-text("${name}")`);
  }

  async addProductToCart(name) {
    const productCard = this.page.locator(`${this.productCardSelector}:has-text("${name}")`);
    await productCard.locator(this.addToCartButtonSelector).click();
  }

  async increaseProductQuantity(name) {
    const productCard = this.page.locator(`${this.productCardSelector}:has-text("${name}")`);
    await productCard.locator(this.increaseQuantityButtonSelector).click();
  }

  async decreaseProductQuantity(name) {
    const productCard = this.page.locator(`${this.productCardSelector}:has-text("${name}")`);
    await productCard.locator(this.decreaseQuantityButtonSelector).click();
  }

  async getProductQuantity(name) {
    const productCard = this.page.locator(`${this.productCardSelector}:has-text("${name}")`);
    return productCard.locator(this.productQuantitySelector);
  }

  async getProductCount() {
    return this.page.locator(this.productCardSelector).count();
  }

  async getProductCategory() {
    return this.page.locator(this.productCategorySelector).first();
  }

  // Cart and checkout
  async clickCheckout() {
    await this.page.click(this.checkoutButtonSelector);
  }

  async clearCart() {
    // Find all products in cart and remove them
    const productCards = this.page.locator(this.productCardSelector);
    const count = await productCards.count();
    
    for (let i = 0; i < count; i++) {
      const card = productCards.nth(0); // Always remove the first one
      await card.locator(this.decreaseQuantityButtonSelector).click();
      
      // If quantity is 1, clicking decrease will remove it from cart
      // Otherwise, keep clicking until removed
      let quantityElement = await card.locator(this.productQuantitySelector).isVisible();
      while (quantityElement) {
        await card.locator(this.decreaseQuantityButtonSelector).click();
        quantityElement = await card.locator(this.productQuantitySelector).isVisible();
      }
    }
  }

  async waitForSuccessPage() {
    await this.page.waitForSelector(this.orderConfirmationSelector);
  }

  async clickContinueToApp() {
    await this.page.click(this.continueToAppButtonSelector);
  }

  // Layout testing
  async getProductsPerRow() {
    // Get the first product's position
    const firstProduct = this.page.locator(this.productCardSelector).first();
    const firstBounds = await firstProduct.boundingBox();
    
    // Get the second product's position
    const secondProduct = this.page.locator(this.productCardSelector).nth(1);
    const secondBounds = await secondProduct.boundingBox();
    
    // If they're on the same row, their y positions will be similar
    if (Math.abs(firstBounds.y - secondBounds.y) < 20) {
      return 2; // At least 2 per row
    }
    
    return 1; // One per row
  }

  async getCategoriesWidth() {
    const categoriesContainer = this.page.locator('[data-testid="categories-container"]');
    const scrollWidth = await categoriesContainer.evaluate(el => el.scrollWidth);
    return scrollWidth;
  }

  // Getters for elements
  get categoryButtons() {
    return this.page.locator(this.categoryButtonsSelector);
  }

  get productName() {
    return this.page.locator(this.productNameSelector);
  }

  get productPrice() {
    return this.page.locator(this.productPriceSelector);
  }

  get productOriginalPrice() {
    return this.page.locator(this.productOriginalPriceSelector);
  }

  get productDescription() {
    return this.page.locator(this.productDescriptionSelector);
  }

  get productFeatures() {
    return this.page.locator(this.productFeaturesSelector);
  }

  get productRating() {
    return this.page.locator(this.productRatingSelector);
  }

  get productImage() {
    return this.page.locator(this.productImageSelector);
  }

  get outOfStockLabel() {
    return this.page.locator(this.outOfStockLabelSelector);
  }

  get outOfStockButton() {
    return this.page.locator(this.outOfStockButtonSelector);
  }

  get cartItemCount() {
    return this.page.locator(this.cartItemCountSelector);
  }

  get cartTotal() {
    return this.page.locator(this.cartTotalSelector);
  }

  get emptyCart() {
    return this.page.locator(this.emptyCartSelector);
  }

  get freeShippingBadge() {
    return this.page.locator(this.freeShippingBadgeSelector);
  }

  get orderConfirmation() {
    return this.page.locator(this.orderConfirmationSelector);
  }

  get orderTotal() {
    return this.page.locator(this.orderTotalSelector);
  }
}