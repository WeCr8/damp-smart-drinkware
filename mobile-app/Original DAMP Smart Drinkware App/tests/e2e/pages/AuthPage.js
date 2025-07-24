/**
 * Auth Page Object
 * 
 * Page object for interacting with authentication screens
 */

export class AuthPage {
  constructor(page) {
    this.page = page;
    
    // Selectors
    this.loginFormSelector = '[data-testid="login-form"]';
    this.emailInputSelector = '[data-testid="email-input"]';
    this.passwordInputSelector = '[data-testid="password-input"]';
    this.submitButtonSelector = '[data-testid="submit-button"]';
    this.signUpLinkSelector = '[data-testid="signup-link"]';
    this.errorMessageSelector = '[data-testid="error-message"]';
    this.successMessageSelector = '[data-testid="success-message"]';
    this.togglePasswordVisibilitySelector = '[data-testid="toggle-password"]';
    this.confirmPasswordInputSelector = '[data-testid="confirm-password-input"]';
  }

  // Navigation
  async goto() {
    await this.page.goto('/auth/login');
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.page.waitForSelector(this.loginFormSelector);
  }

  // Login
  async login(email, password) {
    await this.fillLoginForm({ email, password });
    await this.submitLogin();
  }

  async fillLoginForm({ email, password }) {
    if (email) {
      await this.page.fill(this.emailInputSelector, email);
    }
    if (password) {
      await this.page.fill(this.passwordInputSelector, password);
    }
  }

  async submitLogin() {
    await this.page.click(this.submitButtonSelector);
  }

  // Registration
  async clickSignUp() {
    await this.page.click(this.signUpLinkSelector);
  }

  async fillRegistrationForm({ email, password, confirmPassword }) {
    if (email) {
      await this.page.fill(this.emailInputSelector, email);
    }
    if (password) {
      await this.page.fill(this.passwordInputSelector, password);
    }
    if (confirmPassword) {
      await this.page.fill(this.confirmPasswordInputSelector, confirmPassword);
    }
  }

  async submitRegistration() {
    await this.page.click(this.submitButtonSelector);
  }

  // Password visibility
  async togglePasswordVisibility() {
    await this.page.click(this.togglePasswordVisibilitySelector);
  }

  async fillPassword(password) {
    await this.page.fill(this.passwordInputSelector, password);
  }

  // Session management
  async getSessionToken() {
    return this.page.evaluate(() => {
      return localStorage.getItem('supabase.auth.token');
    });
  }

  async clearSession() {
    await this.page.evaluate(() => {
      localStorage.removeItem('supabase.auth.token');
    });
  }

  // Getters for elements
  get loginForm() {
    return this.page.locator(this.loginFormSelector);
  }

  get emailInput() {
    return this.page.locator(this.emailInputSelector);
  }

  get passwordInput() {
    return this.page.locator(this.passwordInputSelector);
  }

  get submitButton() {
    return this.page.locator(this.submitButtonSelector);
  }

  get errorMessage() {
    return this.page.locator(this.errorMessageSelector);
  }

  get successMessage() {
    return this.page.locator(this.successMessageSelector);
  }
}