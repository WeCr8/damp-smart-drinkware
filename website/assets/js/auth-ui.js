/**
 * DAMP Smart Drinkware - Authentication UI Components
 * 
 * Handles all authentication UI interactions, modals, and user experience
 */

class DAMPAuthUI {
  constructor(authService) {
    this.authService = authService;
    this.isModalOpen = false;
    this.currentModal = null;
    
    this.init();
  }

  init() {
    this.createAuthModal();
    this.setupEventListeners();
    this.setupAuthStateListener();
    this.updateUIForAuthState();
  }

  /**
   * Create authentication modal HTML
   */
  createAuthModal() {
    const modalHTML = `
      <!-- DAMP Authentication Modal -->
      <div id="dampAuthModal" class="damp-auth-modal" style="display: none;">
        <div class="auth-modal-overlay" onclick="dampAuthUI.closeModal()"></div>
        <div class="auth-modal-content">
          <button class="auth-modal-close" onclick="dampAuthUI.closeModal()" aria-label="Close">&times;</button>
          
          <!-- Sign In Form -->
          <div id="signInForm" class="auth-form">
            <div class="auth-header">
              <div class="auth-logo">
                <img src="/assets/images/logo/logo-dark.png" alt="DAMP" class="auth-logo-img">
              </div>
              <h2 class="auth-title">Welcome Back</h2>
              <p class="auth-subtitle">Sign in to your DAMP account</p>
            </div>
            
            <form class="auth-form-fields" id="signInFormFields">
              <div class="form-group">
                <label for="signInEmail" class="sr-only">Email</label>
                <input type="email" id="signInEmail" name="email" placeholder="Email address" required>
                <span class="input-icon">📧</span>
              </div>
              
              <div class="form-group">
                <label for="signInPassword" class="sr-only">Password</label>
                <input type="password" id="signInPassword" name="password" placeholder="Password" required>
                <span class="input-icon">🔒</span>
                <button type="button" class="password-toggle" onclick="dampAuthUI.togglePasswordVisibility('signInPassword')">
                  <span class="password-toggle-icon">👁️</span>
                </button>
              </div>
              
              <div class="form-options">
                <label class="checkbox-label">
                  <input type="checkbox" name="rememberMe">
                  <span class="checkmark">✓</span>
                  Remember me
                </label>
                <button type="button" class="forgot-password-link" onclick="dampAuthUI.showForgotPassword()">
                  Forgot password?
                </button>
              </div>
              
              <button type="submit" class="auth-submit-btn">
                <span class="button-text">Sign In</span>
                <span class="button-loader" style="display: none;">⏳</span>
              </button>
            </form>
            
            <div class="auth-divider">
              <span>or continue with</span>
            </div>
            
            <div class="auth-social">
              <button type="button" class="social-btn google-btn" onclick="dampAuthUI.signInWithGoogle()">
                <span class="social-icon">🌐</span>
                <span>Google</span>
              </button>
              <button type="button" class="social-btn facebook-btn" onclick="dampAuthUI.signInWithFacebook()">
                <span class="social-icon">📘</span>
                <span>Facebook</span>
              </button>
            </div>
            
            <div class="auth-footer">
              <p>Don't have an account? 
                <button type="button" class="auth-switch-link" onclick="dampAuthUI.showSignUp()">
                  Create one
                </button>
              </p>
            </div>
          </div>
          
          <!-- Sign Up Form -->
          <div id="signUpForm" class="auth-form" style="display: none;">
            <div class="auth-header">
              <div class="auth-logo">
                <img src="/assets/images/logo/logo-dark.png" alt="DAMP" class="auth-logo-img">
              </div>
              <h2 class="auth-title">Join DAMP</h2>
              <p class="auth-subtitle">Create your account and never lose your drink again</p>
            </div>
            
            <form class="auth-form-fields" id="signUpFormFields">
              <div class="form-row">
                <div class="form-group">
                  <label for="signUpFirstName" class="sr-only">First Name</label>
                  <input type="text" id="signUpFirstName" name="firstName" placeholder="First name" required>
                </div>
                <div class="form-group">
                  <label for="signUpLastName" class="sr-only">Last Name</label>
                  <input type="text" id="signUpLastName" name="lastName" placeholder="Last name" required>
                </div>
              </div>
              
              <div class="form-group">
                <label for="signUpEmail" class="sr-only">Email</label>
                <input type="email" id="signUpEmail" name="email" placeholder="Email address" required>
                <span class="input-icon">📧</span>
              </div>
              
              <div class="form-group">
                <label for="signUpPassword" class="sr-only">Password</label>
                <input type="password" id="signUpPassword" name="password" placeholder="Password (min. 6 characters)" required minlength="6">
                <span class="input-icon">🔒</span>
                <button type="button" class="password-toggle" onclick="dampAuthUI.togglePasswordVisibility('signUpPassword')">
                  <span class="password-toggle-icon">👁️</span>
                </button>
              </div>
              
              <div class="form-group">
                <label for="signUpConfirmPassword" class="sr-only">Confirm Password</label>
                <input type="password" id="signUpConfirmPassword" name="confirmPassword" placeholder="Confirm password" required minlength="6">
                <span class="input-icon">🔒</span>
              </div>
              
              <div class="form-group">
                <label for="signUpPhone" class="sr-only">Phone (Optional)</label>
                <input type="tel" id="signUpPhone" name="phone" placeholder="Phone number (optional)">
                <span class="input-icon">📱</span>
              </div>
              
              <div class="auth-preferences">
                <h4>Stay updated with DAMP</h4>
                <label class="checkbox-label">
                  <input type="checkbox" name="newsletter" checked>
                  <span class="checkmark">✓</span>
                  Product updates and launch alerts
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" name="marketing">
                  <span class="checkmark">✓</span>
                  Special offers and promotions
                </label>
              </div>
              
              <div class="auth-terms">
                <label class="checkbox-label">
                  <input type="checkbox" name="terms" required>
                  <span class="checkmark">✓</span>
                  I agree to the <a href="/pages/terms.html" target="_blank">Terms of Service</a> and 
                  <a href="/pages/privacy-policy.html" target="_blank">Privacy Policy</a>
                </label>
              </div>
              
              <button type="submit" class="auth-submit-btn">
                <span class="button-text">Create Account</span>
                <span class="button-loader" style="display: none;">⏳</span>
              </button>
            </form>
            
            <div class="auth-divider">
              <span>or sign up with</span>
            </div>
            
            <div class="auth-social">
              <button type="button" class="social-btn google-btn" onclick="dampAuthUI.signUpWithGoogle()">
                <span class="social-icon">🌐</span>
                <span>Google</span>
              </button>
              <button type="button" class="social-btn facebook-btn" onclick="dampAuthUI.signUpWithFacebook()">
                <span class="social-icon">📘</span>
                <span>Facebook</span>
              </button>
            </div>
            
            <div class="auth-footer">
              <p>Already have an account? 
                <button type="button" class="auth-switch-link" onclick="dampAuthUI.showSignIn()">
                  Sign in
                </button>
              </p>
            </div>
          </div>
          
          <!-- Forgot Password Form -->
          <div id="forgotPasswordForm" class="auth-form" style="display: none;">
            <div class="auth-header">
              <div class="auth-logo">
                <img src="/assets/images/logo/logo-dark.png" alt="DAMP" class="auth-logo-img">
              </div>
              <h2 class="auth-title">Reset Password</h2>
              <p class="auth-subtitle">Enter your email to receive reset instructions</p>
            </div>
            
            <form class="auth-form-fields" id="forgotPasswordFormFields">
              <div class="form-group">
                <label for="forgotPasswordEmail" class="sr-only">Email</label>
                <input type="email" id="forgotPasswordEmail" name="email" placeholder="Email address" required>
                <span class="input-icon">📧</span>
              </div>
              
              <button type="submit" class="auth-submit-btn">
                <span class="button-text">Send Reset Link</span>
                <span class="button-loader" style="display: none;">⏳</span>
              </button>
            </form>
            
            <div class="auth-footer">
              <p>Remember your password? 
                <button type="button" class="auth-switch-link" onclick="dampAuthUI.showSignIn()">
                  Sign in
                </button>
              </p>
            </div>
          </div>
          
          <!-- Success/Error Messages -->
          <div id="authMessage" class="auth-message" style="display: none;">
            <div class="message-icon"></div>
            <div class="message-content">
              <h3 class="message-title"></h3>
              <p class="message-text"></p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Insert modal into page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Sign In form
    const signInForm = document.getElementById('signInFormFields');
    if (signInForm) {
      signInForm.addEventListener('submit', (e) => this.handleSignIn(e));
    }
    
    // Sign Up form
    const signUpForm = document.getElementById('signUpFormFields');
    if (signUpForm) {
      signUpForm.addEventListener('submit', (e) => this.handleSignUp(e));
    }
    
    // Forgot Password form
    const forgotPasswordForm = document.getElementById('forgotPasswordFormFields');
    if (forgotPasswordForm) {
      forgotPasswordForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
    }
    
    // Auth buttons in header
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-auth="signin"]')) {
        e.preventDefault();
        this.showSignIn();
      }
      if (e.target.matches('[data-auth="signup"]')) {
        e.preventDefault();
        this.showSignUp();
      }
      if (e.target.matches('[data-auth="signout"]')) {
        e.preventDefault();
        this.handleSignOut();
      }
    });
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isModalOpen) {
        this.closeModal();
      }
    });
  }

  /**
   * Setup auth state listener
   */
  setupAuthStateListener() {
    this.authService.onAuthStateChange((user) => {
      this.updateUIForAuthState(user);
      
      if (user && this.isModalOpen) {
        // Close modal on successful sign in
        this.closeModal();
      }
    });
  }

  /**
   * Update UI based on authentication state
   */
  updateUIForAuthState(user = null) {
    const currentUser = user || this.authService.getCurrentUser();
    
    // Update header navigation
    this.updateHeaderNav(currentUser);
    
    // Show/hide authenticated content
    this.updateAuthenticatedContent(currentUser);
    
    // Update user profile elements
    if (currentUser) {
      this.updateUserProfileElements(currentUser);
    }
  }

  /**
   * Update header navigation
   */
  updateHeaderNav(user) {
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    
    if (!authButtons && !userMenu) {
      // Create auth navigation if it doesn't exist
      this.createAuthNavigation();
      return;
    }
    
    if (user) {
      // Show user menu, hide auth buttons
      if (authButtons) authButtons.style.display = 'none';
      if (userMenu) {
        userMenu.style.display = 'flex';
        this.updateUserMenuContent(user);
      }
    } else {
      // Show auth buttons, hide user menu
      if (authButtons) authButtons.style.display = 'flex';
      if (userMenu) userMenu.style.display = 'none';
    }
  }

  /**
   * Create authentication navigation
   */
  createAuthNavigation() {
    const nav = document.querySelector('.main-nav, .header-nav, nav');
    if (!nav) return;
    
    const authNavHTML = `
      <div class="auth-navigation">
        <!-- Auth Buttons (shown when not signed in) -->
        <div class="auth-buttons">
          <button class="auth-btn signin-btn" data-auth="signin">
            <span class="btn-icon">👤</span>
            <span class="btn-text">Sign In</span>
          </button>
          <button class="auth-btn signup-btn" data-auth="signup">
            <span class="btn-text">Get Started</span>
            <span class="btn-icon">→</span>
          </button>
        </div>
        
        <!-- User Menu (shown when signed in) -->
        <div class="user-menu" style="display: none;">
          <div class="user-avatar">
            <img src="" alt="User Avatar" class="avatar-img">
            <span class="avatar-fallback">👤</span>
          </div>
          <div class="user-info">
            <span class="user-name">Loading...</span>
            <span class="user-email">Loading...</span>
          </div>
          <div class="user-menu-dropdown">
            <button class="dropdown-toggle" onclick="dampAuthUI.toggleUserMenu()">
              <span class="dropdown-icon">▼</span>
            </button>
            <div class="dropdown-menu">
              <a href="/pages/profile.html" class="dropdown-item">
                <span class="item-icon">👤</span>
                <span class="item-text">Profile</span>
              </a>
              <a href="/pages/dashboard.html" class="dropdown-item">
                <span class="item-icon">📊</span>
                <span class="item-text">Dashboard</span>
              </a>
              <a href="/pages/devices.html" class="dropdown-item">
                <span class="item-icon">📱</span>
                <span class="item-text">My Devices</span>
              </a>
              <a href="/pages/orders.html" class="dropdown-item">
                <span class="item-icon">📦</span>
                <span class="item-text">Orders</span>
              </a>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item" data-auth="signout">
                <span class="item-icon">🚪</span>
                <span class="item-text">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    nav.insertAdjacentHTML('beforeend', authNavHTML);
  }

  /**
   * Update user menu content
   */
  updateUserMenuContent(user) {
    const userMenu = document.querySelector('.user-menu');
    if (!userMenu) return;
    
    const userName = userMenu.querySelector('.user-name');
    const userEmail = userMenu.querySelector('.user-email');
    const avatarImg = userMenu.querySelector('.avatar-img');
    const avatarFallback = userMenu.querySelector('.avatar-fallback');
    
    if (userName) {
      userName.textContent = user.displayName || 'DAMP User';
    }
    
    if (userEmail) {
      userEmail.textContent = user.email;
    }
    
    if (user.photoURL && avatarImg) {
      avatarImg.src = user.photoURL;
      avatarImg.style.display = 'block';
      if (avatarFallback) avatarFallback.style.display = 'none';
    } else if (avatarFallback) {
      avatarFallback.style.display = 'block';
      if (avatarImg) avatarImg.style.display = 'none';
    }
  }

  /**
   * Update authenticated content visibility
   */
  updateAuthenticatedContent(user) {
    // Show/hide elements based on auth state
    const authRequired = document.querySelectorAll('[data-auth-required="true"]');
    const authHidden = document.querySelectorAll('[data-auth-hidden="true"]');
    
    authRequired.forEach(el => {
      el.style.display = user ? 'block' : 'none';
    });
    
    authHidden.forEach(el => {
      el.style.display = user ? 'none' : 'block';
    });
  }

  /**
   * Update user profile elements
   */
  async updateUserProfileElements(user) {
    try {
      const userProfile = await this.authService.getUserProfile();
      
      // Update any user-specific content on the page
      const userElements = document.querySelectorAll('[data-user-field]');
      userElements.forEach(el => {
        const field = el.getAttribute('data-user-field');
        const value = this.getNestedValue(userProfile, field) || this.getNestedValue(user, field) || '';
        
        if (el.tagName === 'INPUT') {
          el.value = value;
        } else {
          el.textContent = value;
        }
      });
      
    } catch (error) {
      console.error('Error updating user profile elements:', error);
    }
  }

  /**
   * Modal management methods
   */
  showSignIn() {
    this.showModal('signInForm');
  }

  showSignUp() {
    this.showModal('signUpForm');
  }

  showForgotPassword() {
    this.showModal('forgotPasswordForm');
  }

  showModal(formId) {
    const modal = document.getElementById('dampAuthModal');
    if (!modal) return;
    
    // Hide all forms
    const forms = modal.querySelectorAll('.auth-form');
    forms.forEach(form => form.style.display = 'none');
    
    // Hide message
    const message = document.getElementById('authMessage');
    if (message) message.style.display = 'none';
    
    // Show requested form
    const targetForm = document.getElementById(formId);
    if (targetForm) targetForm.style.display = 'block';
    
    // Show modal
    modal.style.display = 'flex';
    this.isModalOpen = true;
    this.currentModal = formId;
    
    // Focus first input
    setTimeout(() => {
      const firstInput = targetForm.querySelector('input[type="email"], input[type="text"]');
      if (firstInput) firstInput.focus();
    }, 100);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    const modal = document.getElementById('dampAuthModal');
    if (modal) {
      modal.style.display = 'none';
    }
    
    this.isModalOpen = false;
    this.currentModal = null;
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Clear form errors
    this.clearFormErrors();
  }

  /**
   * Authentication handlers
   */
  async handleSignIn(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    
    if (!this.validateEmail(email)) {
      this.showFieldError('signInEmail', 'Please enter a valid email address');
      return;
    }
    
    this.setFormLoading(form, true);
    
    try {
      const result = await this.authService.signInWithEmail(email, password);
      
      if (result.success) {
        this.showMessage('success', 'Welcome back!', result.message);
        
        // Link any existing newsletter subscription
        if (email) {
          await this.authService.linkNewsletterSubscription(email);
        }
        
        setTimeout(() => this.closeModal(), 1500);
      } else {
        this.showMessage('error', 'Sign In Failed', result.message);
      }
    } catch (error) {
      this.showMessage('error', 'Sign In Failed', 'An unexpected error occurred. Please try again.');
    } finally {
      this.setFormLoading(form, false);
    }
  }

  async handleSignUp(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const phone = formData.get('phone');
    const terms = formData.get('terms');
    
    // Validation
    if (!this.validateSignUpForm(formData)) return;
    
    this.setFormLoading(form, true);
    
    try {
      const additionalData = {
        firstName,
        lastName,
        phone,
        displayName: `${firstName} ${lastName}`.trim(),
        source: 'website',
        newsletter: formData.get('newsletter') === 'on',
        marketingEmails: formData.get('marketing') === 'on'
      };
      
      const result = await this.authService.signUpWithEmail(email, password, additionalData);
      
      if (result.success) {
        this.showMessage('success', 'Account Created!', result.message);
        setTimeout(() => this.closeModal(), 3000);
      } else {
        this.showMessage('error', 'Sign Up Failed', result.message);
      }
    } catch (error) {
      this.showMessage('error', 'Sign Up Failed', 'An unexpected error occurred. Please try again.');
    } finally {
      this.setFormLoading(form, false);
    }
  }

  async handleForgotPassword(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    
    if (!this.validateEmail(email)) {
      this.showFieldError('forgotPasswordEmail', 'Please enter a valid email address');
      return;
    }
    
    this.setFormLoading(form, true);
    
    try {
      const result = await this.authService.sendPasswordReset(email);
      
      if (result.success) {
        this.showMessage('success', 'Email Sent!', result.message);
      } else {
        this.showMessage('error', 'Reset Failed', result.message);
      }
    } catch (error) {
      this.showMessage('error', 'Reset Failed', 'An unexpected error occurred. Please try again.');
    } finally {
      this.setFormLoading(form, false);
    }
  }

  async handleSignOut() {
    try {
      const result = await this.authService.signOut();
      
      if (result.success) {
        // Redirect to homepage or show success message
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  /**
   * Social authentication
   */
  async signInWithGoogle() {
    try {
      this.setModalLoading(true);
      const result = await this.authService.signInWithGoogle();
      
      if (result.success) {
        this.showMessage('success', 'Welcome!', result.message);
        setTimeout(() => this.closeModal(), 1500);
      } else {
        this.showMessage('error', 'Google Sign In Failed', result.message);
      }
    } catch (error) {
      this.showMessage('error', 'Google Sign In Failed', 'An unexpected error occurred. Please try again.');
    } finally {
      this.setModalLoading(false);
    }
  }

  async signInWithFacebook() {
    try {
      this.setModalLoading(true);
      const result = await this.authService.signInWithFacebook();
      
      if (result.success) {
        this.showMessage('success', 'Welcome!', result.message);
        setTimeout(() => this.closeModal(), 1500);
      } else {
        this.showMessage('error', 'Facebook Sign In Failed', result.message);
      }
    } catch (error) {
      this.showMessage('error', 'Facebook Sign In Failed', 'An unexpected error occurred. Please try again.');
    } finally {
      this.setModalLoading(false);
    }
  }

  async signUpWithGoogle() {
    await this.signInWithGoogle(); // Same process for sign up
  }

  async signUpWithFacebook() {
    await this.signInWithFacebook(); // Same process for sign up
  }

  /**
   * Utility methods
   */
  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.parentElement.querySelector('.password-toggle-icon');
    
    if (input.type === 'password') {
      input.type = 'text';
      toggle.textContent = '🙈';
    } else {
      input.type = 'password';
      toggle.textContent = '👁️';
    }
  }

  toggleUserMenu() {
    const dropdown = document.querySelector('.dropdown-menu');
    if (dropdown) {
      dropdown.classList.toggle('show');
    }
  }

  validateSignUpForm(formData) {
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const terms = formData.get('terms');
    
    let isValid = true;
    
    if (!firstName.trim()) {
      this.showFieldError('signUpFirstName', 'First name is required');
      isValid = false;
    }
    
    if (!lastName.trim()) {
      this.showFieldError('signUpLastName', 'Last name is required');
      isValid = false;
    }
    
    if (!this.validateEmail(email)) {
      this.showFieldError('signUpEmail', 'Please enter a valid email address');
      isValid = false;
    }
    
    if (password.length < 6) {
      this.showFieldError('signUpPassword', 'Password must be at least 6 characters');
      isValid = false;
    }
    
    if (password !== confirmPassword) {
      this.showFieldError('signUpConfirmPassword', 'Passwords do not match');
      isValid = false;
    }
    
    if (!terms) {
      this.showFieldError('signUpTerms', 'You must agree to the terms');
      isValid = false;
    }
    
    return isValid;
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    // Remove existing error
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) existingError.remove();
    
    // Add error class
    field.classList.add('error');
    
    // Add error message
    const errorEl = document.createElement('div');
    errorEl.className = 'field-error';
    errorEl.textContent = message;
    field.parentElement.appendChild(errorEl);
    
    // Focus field
    field.focus();
  }

  clearFormErrors() {
    const errors = document.querySelectorAll('.field-error');
    errors.forEach(error => error.remove());
    
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
  }

  setFormLoading(form, loading) {
    const submitBtn = form.querySelector('.auth-submit-btn');
    const buttonText = submitBtn.querySelector('.button-text');
    const buttonLoader = submitBtn.querySelector('.button-loader');
    
    if (loading) {
      submitBtn.disabled = true;
      buttonText.style.display = 'none';
      buttonLoader.style.display = 'inline';
    } else {
      submitBtn.disabled = false;
      buttonText.style.display = 'inline';
      buttonLoader.style.display = 'none';
    }
  }

  setModalLoading(loading) {
    const modal = document.getElementById('dampAuthModal');
    if (loading) {
      modal.classList.add('loading');
    } else {
      modal.classList.remove('loading');
    }
  }

  showMessage(type, title, message) {
    const messageEl = document.getElementById('authMessage');
    const icon = messageEl.querySelector('.message-icon');
    const titleEl = messageEl.querySelector('.message-title');
    const textEl = messageEl.querySelector('.message-text');
    
    // Hide all forms
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => form.style.display = 'none');
    
    // Update message content
    icon.textContent = type === 'success' ? '✅' : '❌';
    titleEl.textContent = title;
    textEl.textContent = message;
    
    // Show message
    messageEl.style.display = 'block';
    messageEl.className = `auth-message ${type}`;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for auth service to be available
  const initAuthUI = () => {
    if (window.firebaseServices?.authService) {
      window.dampAuthUI = new DAMPAuthUI(window.firebaseServices.authService);
    } else {
      setTimeout(initAuthUI, 100);
    }
  };
  
  initAuthUI();
});

// Export for global access
window.DAMPAuthUI = DAMPAuthUI; 