/**
 * DAMP Smart Drinkware - Store Authentication Integration
 * 
 * Handles authentication flow for e-commerce, checkout, and order management
 */

class DAMPStoreAuth {
  constructor() {
    this.authService = null;
    this.currentUser = null;
    this.guestCheckoutData = null;
    
    this.init();
  }

  async init() {
    // Wait for Firebase services
    await this.waitForAuthService();
    
    this.setupAuthStateListener();
    this.setupStoreEventListeners();
    this.updateStoreUI();
  }

  async waitForAuthService() {
    return new Promise((resolve) => {
      const checkServices = () => {
        if (window.firebaseServices?.authService) {
          this.authService = window.firebaseServices.authService;
          resolve();
        } else {
          setTimeout(checkServices, 100);
        }
      };
      checkServices();
    });
  }

  setupAuthStateListener() {
    if (this.authService) {
      this.authService.onAuthStateChange((user) => {
        this.currentUser = user;
        this.updateStoreUI();
        
        // If user signs in during checkout, merge guest data
        if (user && this.guestCheckoutData) {
          this.mergeGuestCheckoutData();
        }
      });
    }
  }

  setupStoreEventListeners() {
    // Pre-order buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.preorder-btn') || e.target.closest('.preorder-btn')) {
        e.preventDefault();
        this.handlePreOrder(e.target);
      }
    });

    // Add to cart buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.add-to-cart') || e.target.closest('.add-to-cart')) {
        e.preventDefault();
        this.handleAddToCart(e.target);
      }
    });

    // Checkout buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.checkout-btn') || e.target.closest('.checkout-btn')) {
        e.preventDefault();
        this.handleCheckout(e.target);
      }
    });

    // Account creation prompts
    document.addEventListener('click', (e) => {
      if (e.target.matches('.create-account-prompt') || e.target.closest('.create-account-prompt')) {
        e.preventDefault();
        this.showAccountCreationBenefits();
      }
    });

    // Guest checkout option
    document.addEventListener('click', (e) => {
      if (e.target.matches('.guest-checkout') || e.target.closest('.guest-checkout')) {
        e.preventDefault();
        this.handleGuestCheckout();
      }
    });
  }

  updateStoreUI() {
    this.updateProductPages();
    this.updateCheckoutPage();
    this.updateCartSummary();
    this.updateOrderHistory();
  }

  updateProductPages() {
    const user = this.currentUser;
    
    // Update pre-order buttons based on auth state
    const preorderBtns = document.querySelectorAll('.preorder-btn');
    preorderBtns.forEach(btn => {
      if (user) {
        btn.innerHTML = `
          <span class="btn-icon">🛒</span>
          <span class="btn-text">Pre-Order Now</span>
          <span class="btn-subtext">Save to your account</span>
        `;
        btn.classList.add('authenticated');
      } else {
        btn.innerHTML = `
          <span class="btn-icon">🛒</span>
          <span class="btn-text">Pre-Order</span>
          <span class="btn-subtext">Create account & order</span>
        `;
        btn.classList.remove('authenticated');
      }
    });

    // Show personalized recommendations
    if (user) {
      this.showPersonalizedRecommendations();
    }
  }

  updateCheckoutPage() {
    const checkoutForm = document.querySelector('#checkoutForm');
    if (!checkoutForm) return;

    const user = this.currentUser;
    
    if (user) {
      // Pre-fill user data
      this.prefillCheckoutForm(user);
      
      // Show account benefits
      this.showCheckoutAccountBenefits();
    } else {
      // Show account creation prompt
      this.showCheckoutAccountPrompt();
    }
  }

  updateCartSummary() {
    const cartSummary = document.querySelector('.cart-summary');
    if (!cartSummary) return;

    const user = this.currentUser;
    
    if (user) {
      // Show saved items, wishlists, etc.
      this.addAccountCartFeatures(cartSummary);
    }
  }

  updateOrderHistory() {
    const orderHistory = document.querySelector('#orderHistory');
    if (!orderHistory) return;

    const user = this.currentUser;
    
    if (user) {
      this.loadUserOrders();
    } else {
      orderHistory.innerHTML = `
        <div class="no-orders-guest">
          <h3>Track Your Orders</h3>
          <p>Sign in to view your order history and track deliveries.</p>
          <button class="auth-btn primary" data-auth="signin">Sign In</button>
        </div>
      `;
    }
  }

  async handlePreOrder(button) {
    const productId = button.dataset.productId;
    const productName = button.dataset.productName;
    const productPrice = button.dataset.productPrice;

    // Track the pre-order attempt
    this.trackEvent('preorder_attempt', { product_id: productId });

    if (!this.currentUser) {
      // Show sign-in prompt with pre-order context
      this.showPreOrderSignInPrompt(productId, productName, productPrice);
      return;
    }

    // User is signed in, proceed with pre-order
    await this.processPreOrder(productId, productName, productPrice);
  }

  async handleAddToCart(button) {
    const productId = button.dataset.productId;
    const productName = button.dataset.productName;
    const productPrice = button.dataset.productPrice;

    // Add to cart (works for both guest and authenticated users)
    const cartItem = {
      id: productId,
      name: productName,
      price: parseFloat(productPrice),
      quantity: 1,
      addedAt: new Date().toISOString()
    };

    await this.addItemToCart(cartItem);

    // If user is authenticated, save to their account
    if (this.currentUser) {
      await this.saveCartToAccount();
    }

    this.showAddToCartSuccess(productName);
  }

  async handleCheckout(button) {
    const cartItems = this.getCartItems();
    
    if (cartItems.length === 0) {
      this.showError('Your cart is empty');
      return;
    }

    if (!this.currentUser) {
      // Show checkout authentication options
      this.showCheckoutAuthPrompt(cartItems);
      return;
    }

    // Proceed with authenticated checkout
    await this.processAuthenticatedCheckout(cartItems);
  }

  showPreOrderSignInPrompt(productId, productName, productPrice) {
    const modalHTML = `
      <div id="preorderAuthModal" class="auth-modal">
        <div class="modal-overlay"></div>
        <div class="modal-content preorder-context">
          <button class="modal-close" onclick="this.closest('.auth-modal').remove()">&times;</button>
          
          <div class="preorder-header">
            <div class="product-preview">
              <img src="/assets/images/products/${productId}/${productId}.png" alt="${productName}" class="product-image">
              <div class="product-info">
                <h3>${productName}</h3>
                <p class="product-price">$${productPrice}</p>
              </div>
            </div>
          </div>
          
          <div class="auth-benefits">
            <h3>Sign in to pre-order</h3>
            <div class="benefits-list">
              <div class="benefit">
                <span class="benefit-icon">📦</span>
                <span class="benefit-text">Order tracking & updates</span>
              </div>
              <div class="benefit">
                <span class="benefit-icon">⚡</span>
                <span class="benefit-text">Faster future checkouts</span>
              </div>
              <div class="benefit">
                <span class="benefit-icon">🎁</span>
                <span class="benefit-text">Exclusive member benefits</span>
              </div>
              <div class="benefit">
                <span class="benefit-icon">📱</span>
                <span class="benefit-text">Sync with DAMP mobile app</span>
              </div>
            </div>
          </div>
          
          <div class="auth-actions">
            <button class="auth-btn primary" onclick="dampAuth.showSignIn(); this.closest('.auth-modal').remove();">
              Sign In & Pre-Order
            </button>
            <button class="auth-btn secondary" onclick="dampAuth.showSignUp(); this.closest('.auth-modal').remove();">
              Create Account & Pre-Order
            </button>
            <button class="link-btn" onclick="dampStoreAuth.processGuestPreOrder('${productId}', '${productName}', '${productPrice}'); this.closest('.auth-modal').remove();">
              Continue as guest
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  showCheckoutAuthPrompt(cartItems) {
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const modalHTML = `
      <div id="checkoutAuthModal" class="auth-modal">
        <div class="modal-overlay"></div>
        <div class="modal-content checkout-context">
          <button class="modal-close" onclick="this.closest('.auth-modal').remove()">&times;</button>
          
          <div class="checkout-header">
            <h3>Ready to checkout?</h3>
            <div class="order-summary">
              <p class="item-count">${cartItems.length} item${cartItems.length !== 1 ? 's' : ''}</p>
              <p class="total-amount">$${totalAmount.toFixed(2)}</p>
            </div>
          </div>
          
          <div class="checkout-options">
            <div class="option-card recommended">
              <div class="option-header">
                <h4>Create Account</h4>
                <span class="recommended-badge">Recommended</span>
              </div>
              <ul class="option-benefits">
                <li>✅ Order tracking & history</li>
                <li>✅ Faster future checkouts</li>
                <li>✅ DAMP device management</li>
                <li>✅ Exclusive member perks</li>
              </ul>
              <button class="auth-btn primary" onclick="dampAuth.showSignUp(); this.closest('.auth-modal').remove();">
                Create Account & Checkout
              </button>
            </div>
            
            <div class="option-card">
              <div class="option-header">
                <h4>Sign In</h4>
              </div>
              <p class="option-description">Already have a DAMP account?</p>
              <button class="auth-btn secondary" onclick="dampAuth.showSignIn(); this.closest('.auth-modal').remove();">
                Sign In & Checkout
              </button>
            </div>
            
            <div class="option-card guest">
              <div class="option-header">
                <h4>Guest Checkout</h4>
              </div>
              <p class="option-description">Checkout without creating an account</p>
              <button class="auth-btn outline" onclick="dampStoreAuth.processGuestCheckout(); this.closest('.auth-modal').remove();">
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  async processPreOrder(productId, productName, productPrice) {
    try {
      // Create pre-order record
      const preOrderData = {
        productId,
        productName,
        price: parseFloat(productPrice),
        userId: this.currentUser.uid,
        userEmail: this.currentUser.email,
        status: 'pending',
        createdAt: new Date().toISOString(),
        estimatedDelivery: this.calculateEstimatedDelivery(productId),
        orderType: 'preorder'
      };

      // Save to user's account
      await this.authService.addPreOrder(preOrderData);

      // Update user's order history
      const userProfile = await this.authService.getUserProfile();
      await this.authService.updateUserProfile({
        'orders.totalOrders': (userProfile?.orders?.totalOrders || 0) + 1,
        'orders.totalSpent': (userProfile?.orders?.totalSpent || 0) + parseFloat(productPrice),
        'orders.lastOrderDate': new Date().toISOString()
      });

      // Track successful pre-order
      this.trackEvent('preorder_success', {
        product_id: productId,
        value: parseFloat(productPrice),
        currency: 'USD'
      });

      this.showPreOrderSuccess(productName);

    } catch (error) {
      console.error('Pre-order error:', error);
      this.showError('Pre-order failed. Please try again.');
    }
  }

  async processGuestPreOrder(productId, productName, productPrice) {
    // Store guest pre-order data for potential account creation
    this.guestCheckoutData = {
      type: 'preorder',
      productId,
      productName,
      price: parseFloat(productPrice),
      timestamp: new Date().toISOString()
    };

    // Proceed with Stripe checkout for guest
    await this.initiateStripeCheckout([{
      id: productId,
      name: productName,
      price: parseFloat(productPrice),
      quantity: 1
    }], 'guest');
  }

  async processGuestCheckout() {
    const cartItems = this.getCartItems();
    
    // Store guest checkout data
    this.guestCheckoutData = {
      type: 'checkout',
      items: cartItems,
      timestamp: new Date().toISOString()
    };

    await this.initiateStripeCheckout(cartItems, 'guest');
  }

  async processAuthenticatedCheckout(cartItems) {
    try {
      // Create order record
      const orderData = {
        items: cartItems,
        userId: this.currentUser.uid,
        userEmail: this.currentUser.email,
        status: 'pending',
        createdAt: new Date().toISOString(),
        orderType: 'purchase',
        total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };

      // Save order to user account
      await this.authService.addOrder(orderData);

      // Initiate Stripe checkout
      await this.initiateStripeCheckout(cartItems, 'authenticated', orderData.id);

    } catch (error) {
      console.error('Checkout error:', error);
      this.showError('Checkout failed. Please try again.');
    }
  }

  async initiateStripeCheckout(items, userType, orderId = null) {
    try {
      const checkoutData = {
        items: items.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              images: [`https://dampdrink.com/assets/images/products/${item.id}/${item.id}.png`]
            },
            unit_amount: Math.round(item.price * 100) // Convert to cents
          },
          quantity: item.quantity
        })),
        mode: 'payment',
        success_url: `${window.location.origin}/pages/order-success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/pages/cart.html`,
        metadata: {
          userType,
          userId: this.currentUser?.uid || 'guest',
          orderId: orderId || '',
          timestamp: new Date().toISOString()
        }
      };

      // If authenticated user, pre-fill customer data
      if (this.currentUser) {
        const userProfile = await this.authService.getUserProfile();
        checkoutData.customer_email = this.currentUser.email;
        
        if (userProfile?.profile) {
          checkoutData.shipping = {
            name: `${userProfile.profile.firstName} ${userProfile.profile.lastName}`,
            address: userProfile.profile.location
          };
        }
      }

      // Call your Stripe checkout API
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData)
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = window.Stripe(this.getStripePublicKey());
      await stripe.redirectToCheckout({ sessionId });

    } catch (error) {
      console.error('Stripe checkout error:', error);
      this.showError('Payment system error. Please try again.');
    }
  }

  async mergeGuestCheckoutData() {
    if (!this.guestCheckoutData || !this.currentUser) return;

    try {
      const guestData = this.guestCheckoutData;
      
      if (guestData.type === 'preorder') {
        // Convert guest pre-order to authenticated pre-order
        await this.processPreOrder(guestData.productId, guestData.productName, guestData.price);
      } else if (guestData.type === 'checkout') {
        // Merge guest cart with user account
        for (const item of guestData.items) {
          await this.authService.addToWishlist(item);
        }
      }

      // Clear guest data
      this.guestCheckoutData = null;
      
      this.showMessage('success', 'Account Linked!', 'Your previous items have been saved to your account.');

    } catch (error) {
      console.error('Error merging guest data:', error);
    }
  }

  async prefillCheckoutForm(user) {
    try {
      const userProfile = await this.authService.getUserProfile();
      
      if (!userProfile?.profile) return;

      const form = document.querySelector('#checkoutForm');
      if (!form) return;

      // Pre-fill form fields
      const fieldMappings = {
        'firstName': userProfile.profile.firstName,
        'lastName': userProfile.profile.lastName,
        'email': user.email,
        'phone': userProfile.profile.phone,
        'country': userProfile.profile.location?.country,
        'state': userProfile.profile.location?.state,
        'city': userProfile.profile.location?.city,
        'zipCode': userProfile.profile.location?.zipCode
      };

      Object.entries(fieldMappings).forEach(([fieldName, value]) => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field && value) {
          field.value = value;
        }
      });

    } catch (error) {
      console.error('Error prefilling checkout form:', error);
    }
  }

  async showPersonalizedRecommendations() {
    try {
      const userProfile = await this.authService.getUserProfile();
      const votingHistory = userProfile?.damp?.votingHistory || [];
      const orderHistory = userProfile?.orders?.favoriteCategories || [];

      // Create recommendations based on user data
      const recommendations = this.generateRecommendations(votingHistory, orderHistory);
      
      const recommendationsContainer = document.querySelector('#personalizedRecommendations');
      if (recommendationsContainer && recommendations.length > 0) {
        recommendationsContainer.innerHTML = `
          <div class="recommendations-section">
            <h3>Recommended for You</h3>
            <div class="recommendations-grid">
              ${recommendations.map(product => `
                <div class="recommendation-card">
                  <img src="/assets/images/products/${product.id}/${product.id}.png" alt="${product.name}">
                  <h4>${product.name}</h4>
                  <p class="price">$${product.price}</p>
                  <p class="reason">${product.reason}</p>
                  <button class="preorder-btn" data-product-id="${product.id}" data-product-name="${product.name}" data-product-price="${product.price}">
                    Pre-Order Now
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

    } catch (error) {
      console.error('Error loading personalized recommendations:', error);
    }
  }

  async loadUserOrders() {
    try {
      const orders = await this.authService.getUserOrders();
      const orderHistory = document.querySelector('#orderHistory');
      
      if (!orderHistory) return;

      if (orders.length === 0) {
        orderHistory.innerHTML = `
          <div class="no-orders">
            <h3>No orders yet</h3>
            <p>Start shopping to see your order history here.</p>
            <a href="/pages/store.html" class="shop-btn">Browse Products</a>
          </div>
        `;
        return;
      }

      orderHistory.innerHTML = `
        <div class="orders-container">
          <h3>Your Orders</h3>
          ${orders.map(order => `
            <div class="order-card">
              <div class="order-header">
                <h4>Order #${order.id?.slice(-8) || 'Unknown'}</h4>
                <span class="order-status ${order.status}">${this.formatOrderStatus(order.status)}</span>
              </div>
              <div class="order-details">
                <p class="order-date">${this.formatDate(order.createdAt)}</p>
                <p class="order-total">$${order.total?.toFixed(2) || '0.00'}</p>
              </div>
              <div class="order-items">
                ${order.items?.map(item => `
                  <span class="order-item">${item.name} x${item.quantity}</span>
                `).join(', ') || 'No items'}
              </div>
              <div class="order-actions">
                <button class="track-order-btn" onclick="dampStoreAuth.trackOrder('${order.id}')">
                  Track Order
                </button>
                <button class="reorder-btn" onclick="dampStoreAuth.reorder('${order.id}')">
                  Reorder
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;

    } catch (error) {
      console.error('Error loading user orders:', error);
    }
  }

  // Utility methods
  getCartItems() {
    const cart = localStorage.getItem('dampCart');
    return cart ? JSON.parse(cart) : [];
  }

  async addItemToCart(item) {
    const cart = this.getCartItems();
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.push(item);
    }
    
    localStorage.setItem('dampCart', JSON.stringify(cart));
    this.updateCartUI();
  }

  async saveCartToAccount() {
    if (!this.currentUser) return;
    
    const cart = this.getCartItems();
    // Save cart to user's Firestore document for cross-device sync
    await this.authService.updateUserProfile({
      'cart.items': cart,
      'cart.lastUpdated': new Date().toISOString()
    });
  }

  updateCartUI() {
    const cart = this.getCartItems();
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.querySelector('.cart-items');
    
    if (cartCount) {
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }
    
    if (cartItems) {
      // Update cart display
      this.renderCartItems(cart);
    }
  }

  calculateEstimatedDelivery(productId) {
    // Estimate delivery based on product type
    const deliveryTimes = {
      'handle': '2024-06-01',
      'siliconeBottom': '2024-05-15',
      'cupSleeve': '2024-07-01',
      'babyBottle': '2024-08-01'
    };
    
    return deliveryTimes[productId] || '2024-07-01';
  }

  generateRecommendations(votingHistory, orderHistory) {
    // Simple recommendation logic based on user behavior
    const products = [
      { id: 'handle', name: 'DAMP Handle', price: 49.99, category: 'handle' },
      { id: 'siliconeBottom', name: 'Silicone Bottom', price: 29.99, category: 'silicone' },
      { id: 'cupSleeve', name: 'Cup Sleeve', price: 39.99, category: 'sleeve' },
      { id: 'babyBottle', name: 'Baby Bottle', price: 79.99, category: 'baby' }
    ];
    
    const recommendations = [];
    
    // Recommend based on voting history
    votingHistory.forEach(vote => {
      const product = products.find(p => p.id === vote.productId);
      if (product && !recommendations.find(r => r.id === product.id)) {
        recommendations.push({
          ...product,
          reason: "You voted for this product"
        });
      }
    });
    
    // Add complementary products
    if (recommendations.length < 3) {
      products.forEach(product => {
        if (!recommendations.find(r => r.id === product.id)) {
          recommendations.push({
            ...product,
            reason: "Popular choice"
          });
        }
      });
    }
    
    return recommendations.slice(0, 3);
  }

  getStripePublicKey() {
    // Return your Stripe publishable key
    return 'pk_test_your_stripe_publishable_key'; // Replace with actual key
  }

  formatOrderStatus(status) {
    const statusMap = {
      'pending': 'Processing',
      'confirmed': 'Confirmed',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  }

  formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  trackEvent(eventName, parameters = {}) {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, parameters);
    }
    
    if (window.firebaseServices?.analyticsService) {
      window.firebaseServices.analyticsService.trackEvent(eventName, parameters);
    }
  }

  showMessage(type, title, text) {
    // Reuse the auth modal message system or create a toast
    console.log(`${type}: ${title} - ${text}`);
  }

  showError(message) {
    this.showMessage('error', 'Error', message);
  }

  showPreOrderSuccess(productName) {
    this.showMessage('success', 'Pre-Order Confirmed!', 
      `Thank you for pre-ordering ${productName}. You'll receive updates as we prepare your order.`);
  }

  showAddToCartSuccess(productName) {
    this.showMessage('success', 'Added to Cart!', 
      `${productName} has been added to your cart.`);
  }

  // Public API methods
  async trackOrder(orderId) {
    // Implement order tracking
    window.location.href = `/pages/track-order.html?id=${orderId}`;
  }

  async reorder(orderId) {
    try {
      const orders = await this.authService.getUserOrders();
      const order = orders.find(o => o.id === orderId);
      
      if (order && order.items) {
        // Add all items from the order back to cart
        for (const item of order.items) {
          await this.addItemToCart(item);
        }
        
        this.showMessage('success', 'Items Added!', 'Previous order items have been added to your cart.');
        window.location.href = '/pages/cart.html';
      }
    } catch (error) {
      console.error('Reorder error:', error);
      this.showError('Unable to reorder. Please try again.');
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.dampStoreAuth = new DAMPStoreAuth();
});

// Export for module usage
export default DAMPStoreAuth; 