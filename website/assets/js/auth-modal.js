/**
 * DAMP Smart Drinkware - Simple Authentication Modal
 * 
 * Provides sign in/sign up functionality with Firebase integration
 */

class DAMPAuthModal {
  constructor() {
    this.authService = null;
    this.isOpen = false;
    this.currentForm = 'signin';
    
    this.init();
  }

  async init() {
    // Wait for Firebase services to be available
    await this.waitForAuthService();
    
    this.createModal();
    this.setupEventListeners();
    this.setupAuthStateListener();
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

  createModal() {
    const modalHTML = `
      <div id="authModal" class="auth-modal" style="display: none;">
        <div class="modal-overlay" onclick="dampAuth.close()"></div>
        <div class="modal-content">
          <button class="modal-close" onclick="dampAuth.close()">&times;</button>
          
          <!-- Sign In Form -->
          <div id="signinForm" class="auth-form active">
            <h2>Welcome Back</h2>
            <p>Sign in to your DAMP account</p>
            
            <form id="signinFormEl">
              <div class="form-group">
                <input type="email" id="signinEmail" placeholder="Email" required>
              </div>
              <div class="form-group">
                <input type="password" id="signinPassword" placeholder="Password" required>
              </div>
              <button type="submit" class="auth-btn primary">
                <span class="btn-text">Sign In</span>
                <span class="btn-loader" style="display: none;">⏳</span>
              </button>
            </form>
            
            <div class="auth-divider">or</div>
            
            <div class="social-auth">
              <button type="button" class="auth-btn social google" onclick="dampAuth.signInWithGoogle()">
                🌐 Continue with Google
              </button>
            </div>
            
            <div class="auth-footer">
              <p>Don't have an account? 
                <button type="button" class="link-btn" onclick="dampAuth.showSignUp()">Sign up</button>
              </p>
              <button type="button" class="link-btn" onclick="dampAuth.showForgotPassword()">Forgot password?</button>
            </div>
          </div>
          
          <!-- Sign Up Form -->
          <div id="signupForm" class="auth-form">
            <h2>Create Account</h2>
            <p>Join DAMP and never lose your drink again</p>
            
            <form id="signupFormEl">
              <div class="form-row">
                <div class="form-group">
                  <input type="text" id="signupFirstName" placeholder="First Name" required>
                </div>
                <div class="form-group">
                  <input type="text" id="signupLastName" placeholder="Last Name" required>
                </div>
              </div>
              <div class="form-group">
                <input type="email" id="signupEmail" placeholder="Email" required>
              </div>
              <div class="form-group">
                <input type="password" id="signupPassword" placeholder="Password (min 6 chars)" required minlength="6">
              </div>
              <div class="form-group">
                <label class="checkbox">
                  <input type="checkbox" id="signupNewsletter" checked>
                  <span class="checkmark"></span>
                  <span class="label-text">Subscribe to product updates</span>
                </label>
              </div>
              <div class="form-group">
                <label class="checkbox">
                  <input type="checkbox" id="signupTerms" required>
                  <span class="checkmark"></span>
                  <span class="label-text">I agree to the <a href="/pages/terms.html" target="_blank">Terms</a> and <a href="/pages/privacy-policy.html" target="_blank">Privacy Policy</a></span>
                </label>
              </div>
              <button type="submit" class="auth-btn primary">
                <span class="btn-text">Create Account</span>
                <span class="btn-loader" style="display: none;">⏳</span>
              </button>
            </form>
            
            <div class="auth-divider">or</div>
            
            <div class="social-auth">
              <button type="button" class="auth-btn social google" onclick="dampAuth.signUpWithGoogle()">
                🌐 Continue with Google
              </button>
            </div>
            
            <div class="auth-footer">
              <p>Already have an account? 
                <button type="button" class="link-btn" onclick="dampAuth.showSignIn()">Sign in</button>
              </p>
            </div>
          </div>
          
          <!-- Forgot Password Form -->
          <div id="forgotForm" class="auth-form">
            <h2>Reset Password</h2>
            <p>Enter your email to receive reset instructions</p>
            
            <form id="forgotFormEl">
              <div class="form-group">
                <input type="email" id="forgotEmail" placeholder="Email" required>
              </div>
              <button type="submit" class="auth-btn primary">
                <span class="btn-text">Send Reset Link</span>
                <span class="btn-loader" style="display: none;">⏳</span>
              </button>
            </form>
            
            <div class="auth-footer">
              <button type="button" class="link-btn" onclick="dampAuth.showSignIn()">← Back to Sign In</button>
            </div>
          </div>
          
          <!-- Message Display -->
          <div id="authMessage" class="auth-message" style="display: none;">
            <div class="message-icon"></div>
            <h3 class="message-title"></h3>
            <p class="message-text"></p>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  setupEventListeners() {
    // Form submissions
    document.getElementById('signinFormEl').addEventListener('submit', (e) => this.handleSignIn(e));
    document.getElementById('signupFormEl').addEventListener('submit', (e) => this.handleSignUp(e));
    document.getElementById('forgotFormEl').addEventListener('submit', (e) => this.handleForgotPassword(e));
    
    // Auth buttons in header
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-auth="signin"]') || e.target.closest('[data-auth="signin"]')) {
        e.preventDefault();
        this.showSignIn();
      }
      if (e.target.matches('[data-auth="signup"]') || e.target.closest('[data-auth="signup"]')) {
        e.preventDefault();
        this.showSignUp();
      }
      if (e.target.matches('[data-auth="signout"]') || e.target.closest('[data-auth="signout"]')) {
        e.preventDefault();
        this.signOut();
      }
    });
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  setupAuthStateListener() {
    if (this.authService) {
      this.authService.onAuthStateChange((user) => {
        this.updateUI(user);
        if (user && this.isOpen) {
          this.close();
        }
      });
    }
  }

  updateUI(user) {
    // Create auth navigation if it doesn't exist
    if (!document.querySelector('.auth-nav')) {
      this.createAuthNav();
    }
    
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    
    if (user) {
      if (authButtons) authButtons.style.display = 'none';
      if (userMenu) {
        userMenu.style.display = 'flex';
        this.updateUserMenu(user);
      }
    } else {
      if (authButtons) authButtons.style.display = 'flex';
      if (userMenu) userMenu.style.display = 'none';
    }
  }

  createAuthNav() {
    const header = document.querySelector('header, nav, .header');
    if (!header) return;
    
    const authNavHTML = `
      <div class="auth-nav">
        <div class="auth-buttons">
          <button class="auth-nav-btn signin" data-auth="signin">Sign In</button>
          <button class="auth-nav-btn signup" data-auth="signup">Get Started</button>
        </div>
        <div class="user-menu" style="display: none;">
          <div class="user-avatar">👤</div>
          <div class="user-info">
            <span class="user-name">User</span>
            <span class="user-email">user@example.com</span>
          </div>
          <button class="user-menu-btn" onclick="dampAuth.toggleUserMenu()">▼</button>
          <div class="user-dropdown" style="display: none;">
            <a href="/pages/profile.html">Profile</a>
            <a href="/pages/orders.html">Orders</a>
            <a href="/pages/devices.html">My Devices</a>
            <button data-auth="signout">Sign Out</button>
          </div>
        </div>
      </div>
    `;
    
    header.insertAdjacentHTML('beforeend', authNavHTML);
  }

  updateUserMenu(user) {
    const userName = document.querySelector('.user-name');
    const userEmail = document.querySelector('.user-email');
    
    if (userName) userName.textContent = user.displayName || 'DAMP User';
    if (userEmail) userEmail.textContent = user.email;
  }

  // Modal management
  showSignIn() {
    this.currentForm = 'signin';
    this.showModal();
  }

  showSignUp() {
    this.currentForm = 'signup';
    this.showModal();
  }

  showForgotPassword() {
    this.currentForm = 'forgot';
    this.showModal();
  }

  showModal() {
    const modal = document.getElementById('authModal');
    const forms = modal.querySelectorAll('.auth-form');
    const message = document.getElementById('authMessage');
    
    // Hide all forms and message
    forms.forEach(form => form.classList.remove('active'));
    message.style.display = 'none';
    
    // Show target form
    const targetForm = document.getElementById(`${this.currentForm}Form`);
    if (targetForm) targetForm.classList.add('active');
    
    // Show modal
    modal.style.display = 'flex';
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    setTimeout(() => {
      const firstInput = targetForm.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 100);
  }

  close() {
    const modal = document.getElementById('authModal');
    modal.style.display = 'none';
    this.isOpen = false;
    document.body.style.overflow = '';
    this.clearErrors();
  }

  // Authentication handlers
  async handleSignIn(e) {
    e.preventDefault();
    
    const email = document.getElementById('signinEmail').value;
    const password = document.getElementById('signinPassword').value;
    
    if (!this.validateEmail(email)) {
      this.showError('Please enter a valid email address');
      return;
    }
    
    this.setLoading('signin', true);
    
    try {
      const result = await this.authService.signInWithEmail(email, password);
      
      if (result.success) {
        this.showMessage('success', 'Welcome back!', result.message);
        setTimeout(() => this.close(), 1500);
      } else {
        this.showMessage('error', 'Sign In Failed', result.message);
      }
    } catch (error) {
      this.showMessage('error', 'Sign In Failed', 'Please try again');
    } finally {
      this.setLoading('signin', false);
    }
  }

  async handleSignUp(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('signupFirstName').value;
    const lastName = document.getElementById('signupLastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const newsletter = document.getElementById('signupNewsletter').checked;
    const terms = document.getElementById('signupTerms').checked;
    
    if (!this.validateSignUp(firstName, lastName, email, password, terms)) return;
    
    this.setLoading('signup', true);
    
    try {
      const result = await this.authService.signUpWithEmail(email, password, {
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        newsletter,
        source: 'website'
      });
      
      if (result.success) {
        this.showMessage('success', 'Account Created!', result.message);
        setTimeout(() => this.close(), 3000);
      } else {
        this.showMessage('error', 'Sign Up Failed', result.message);
      }
    } catch (error) {
      this.showMessage('error', 'Sign Up Failed', 'Please try again');
    } finally {
      this.setLoading('signup', false);
    }
  }

  async handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value;
    
    if (!this.validateEmail(email)) {
      this.showError('Please enter a valid email address');
      return;
    }
    
    this.setLoading('forgot', true);
    
    try {
      const result = await this.authService.sendPasswordReset(email);
      
      if (result.success) {
        this.showMessage('success', 'Email Sent!', result.message);
      } else {
        this.showMessage('error', 'Reset Failed', result.message);
      }
    } catch (error) {
      this.showMessage('error', 'Reset Failed', 'Please try again');
    } finally {
      this.setLoading('forgot', false);
    }
  }

  async signInWithGoogle() {
    try {
      this.setModalLoading(true);
      const result = await this.authService.signInWithGoogle();
      
      if (result.success) {
        this.showMessage('success', 'Welcome!', result.message);
        setTimeout(() => this.close(), 1500);
      } else {
        this.showMessage('error', 'Google Sign In Failed', result.message);
      }
    } catch (error) {
      this.showMessage('error', 'Google Sign In Failed', 'Please try again');
    } finally {
      this.setModalLoading(false);
    }
  }

  async signUpWithGoogle() {
    await this.signInWithGoogle();
  }

  async signOut() {
    try {
      await this.authService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  // Utility methods
  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  validateSignUp(firstName, lastName, email, password, terms) {
    if (!firstName.trim()) {
      this.showError('First name is required');
      return false;
    }
    if (!lastName.trim()) {
      this.showError('Last name is required');
      return false;
    }
    if (!this.validateEmail(email)) {
      this.showError('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      this.showError('Password must be at least 6 characters');
      return false;
    }
    if (!terms) {
      this.showError('You must agree to the terms');
      return false;
    }
    return true;
  }

  setLoading(form, loading) {
    const submitBtn = document.querySelector(`#${form}FormEl .auth-btn.primary`);
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    if (loading) {
      submitBtn.disabled = true;
      btnText.style.display = 'none';
      btnLoader.style.display = 'inline';
    } else {
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
    }
  }

  setModalLoading(loading) {
    const modal = document.getElementById('authModal');
    if (loading) {
      modal.classList.add('loading');
    } else {
      modal.classList.remove('loading');
    }
  }

  showMessage(type, title, text) {
    const forms = document.querySelectorAll('.auth-form');
    const message = document.getElementById('authMessage');
    const icon = message.querySelector('.message-icon');
    const titleEl = message.querySelector('.message-title');
    const textEl = message.querySelector('.message-text');
    
    forms.forEach(form => form.classList.remove('active'));
    
    icon.textContent = type === 'success' ? '✅' : '❌';
    titleEl.textContent = title;
    textEl.textContent = text;
    
    message.className = `auth-message ${type}`;
    message.style.display = 'block';
  }

  showError(message) {
    this.showMessage('error', 'Error', message);
  }

  clearErrors() {
    const message = document.getElementById('authMessage');
    if (message) message.style.display = 'none';
  }

  toggleUserMenu() {
    const dropdown = document.querySelector('.user-dropdown');
    if (dropdown) {
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.dampAuth = new DAMPAuthModal();
});

// Export for module usage
export default DAMPAuthModal; 