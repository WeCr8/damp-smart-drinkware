/**
 * Authentication E2E Tests
 * 
 * Tests covering user registration, login, logout, and session management
 */

import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';
import { DashboardPage } from '../pages/DashboardPage';
import { TestDataFactory } from '../utils/TestDataFactory';

test.describe('Authentication Flow', () => {
  let authPage;
  let dashboardPage;
  let testUser;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    testUser = TestDataFactory.createUser();
    
    await authPage.goto();
  });

  test.describe('User Registration', () => {
    test('should register new user successfully', async () => {
      // Navigate to registration
      await authPage.clickSignUp();
      
      // Fill registration form
      await authPage.fillRegistrationForm({
        email: testUser.email,
        password: testUser.password,
        confirmPassword: testUser.password
      });
      
      // Submit registration
      await authPage.submitRegistration();
      
      // Verify successful registration
      await expect(authPage.successMessage).toBeVisible();
      await expect(authPage.successMessage).toContainText('Account created successfully');
      
      // Verify automatic login and redirect
      await dashboardPage.waitForLoad();
      await expect(dashboardPage.welcomeMessage).toBeVisible();
      await expect(dashboardPage.userEmail).toContainText(testUser.email);
    });

    test('should validate password requirements', async () => {
      await authPage.clickSignUp();
      
      // Test weak password
      await authPage.fillRegistrationForm({
        email: testUser.email,
        password: '123',
        confirmPassword: '123'
      });
      
      await authPage.submitRegistration();
      
      // Verify validation error
      await expect(authPage.errorMessage).toBeVisible();
      await expect(authPage.errorMessage).toContainText('Password must be at least 6 characters');
    });

    test('should validate password confirmation', async () => {
      await authPage.clickSignUp();
      
      await authPage.fillRegistrationForm({
        email: testUser.email,
        password: 'ValidPass123!',
        confirmPassword: 'DifferentPass123!'
      });
      
      await authPage.submitRegistration();
      
      await expect(authPage.errorMessage).toBeVisible();
      await expect(authPage.errorMessage).toContainText('Passwords do not match');
    });

    test('should prevent duplicate email registration', async () => {
      // Register user first time
      await authPage.clickSignUp();
      await authPage.fillRegistrationForm({
        email: testUser.email,
        password: testUser.password,
        confirmPassword: testUser.password
      });
      await authPage.submitRegistration();
      
      // Wait for registration to complete
      await dashboardPage.waitForLoad();
      
      // Sign out
      await dashboardPage.signOut();
      
      // Try to register with same email
      await authPage.clickSignUp();
      await authPage.fillRegistrationForm({
        email: testUser.email,
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });
      await authPage.submitRegistration();
      
      // Verify error message
      await expect(authPage.errorMessage).toBeVisible();
      await expect(authPage.errorMessage).toContainText('User already registered');
    });
  });

  test.describe('User Login', () => {
    test.beforeEach(async () => {
      // Create test user
      await TestDataFactory.createTestUser(testUser);
    });

    test('should login with valid credentials', async () => {
      await authPage.fillLoginForm({
        email: testUser.email,
        password: testUser.password
      });
      
      await authPage.submitLogin();
      
      // Verify successful login
      await dashboardPage.waitForLoad();
      await expect(dashboardPage.welcomeMessage).toBeVisible();
      await expect(dashboardPage.userEmail).toContainText(testUser.email);
      
      // Verify session is established
      const sessionToken = await authPage.getSessionToken();
      expect(sessionToken).toBeTruthy();
    });

    test('should reject invalid email', async () => {
      await authPage.fillLoginForm({
        email: 'nonexistent@test.com',
        password: testUser.password
      });
      
      await authPage.submitLogin();
      
      await expect(authPage.errorMessage).toBeVisible();
      await expect(authPage.errorMessage).toContainText('Invalid login credentials');
      
      // Verify user stays on login page
      await expect(authPage.loginForm).toBeVisible();
    });

    test('should reject invalid password', async () => {
      await authPage.fillLoginForm({
        email: testUser.email,
        password: 'wrongpassword'
      });
      
      await authPage.submitLogin();
      
      await expect(authPage.errorMessage).toBeVisible();
      await expect(authPage.errorMessage).toContainText('Invalid login credentials');
    });

    test('should handle empty form submission', async () => {
      await authPage.submitLogin();
      
      await expect(authPage.errorMessage).toBeVisible();
      await expect(authPage.errorMessage).toContainText('Please fill in all fields');
    });

    test('should show/hide password', async () => {
      await authPage.fillPassword('testpassword');
      
      // Verify password is hidden by default
      await expect(authPage.passwordInput).toHaveAttribute('type', 'password');
      
      // Click show password
      await authPage.togglePasswordVisibility();
      await expect(authPage.passwordInput).toHaveAttribute('type', 'text');
      
      // Click hide password
      await authPage.togglePasswordVisibility();
      await expect(authPage.passwordInput).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Session Management', () => {
    test.beforeEach(async () => {
      await TestDataFactory.createTestUser(testUser);
      await authPage.login(testUser.email, testUser.password);
      await dashboardPage.waitForLoad();
    });

    test('should maintain session across page refresh', async () => {
      // Refresh the page
      await authPage.page.reload();
      
      // Verify user is still logged in
      await dashboardPage.waitForLoad();
      await expect(dashboardPage.welcomeMessage).toBeVisible();
    });

    test('should logout successfully', async () => {
      await dashboardPage.signOut();
      
      // Verify redirect to login page
      await authPage.waitForLoad();
      await expect(authPage.loginForm).toBeVisible();
      
      // Verify session is cleared
      const sessionToken = await authPage.getSessionToken();
      expect(sessionToken).toBeFalsy();
    });

    test('should handle session expiration', async () => {
      // Simulate session expiration by clearing auth token
      await authPage.clearSession();
      
      // Try to access protected page
      await dashboardPage.goto();
      
      // Verify redirect to login
      await authPage.waitForLoad();
      await expect(authPage.loginForm).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Simulate network failure
      await authPage.page.route('**/auth/**', route => route.abort());
      
      await authPage.fillLoginForm({
        email: testUser.email,
        password: testUser.password
      });
      
      await authPage.submitLogin();
      
      // Verify error message
      await expect(authPage.errorMessage).toBeVisible();
      await expect(authPage.errorMessage).toContainText('Network error');
    });

    test('should handle server errors gracefully', async () => {
      // Simulate server error
      await authPage.page.route('**/auth/signin', route => 
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      );
      
      await authPage.fillLoginForm({
        email: testUser.email,
        password: testUser.password
      });
      
      await authPage.submitLogin();
      
      await expect(authPage.errorMessage).toBeVisible();
      await expect(authPage.errorMessage).toContainText('Server error');
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async () => {
      // Navigate using keyboard
      await authPage.page.keyboard.press('Tab'); // Email field
      await authPage.page.keyboard.type(testUser.email);
      
      await authPage.page.keyboard.press('Tab'); // Password field
      await authPage.page.keyboard.type(testUser.password);
      
      await authPage.page.keyboard.press('Tab'); // Submit button
      await authPage.page.keyboard.press('Enter');
      
      // Verify form submission works
      await expect(authPage.errorMessage).toBeVisible();
    });

    test('should have proper ARIA labels', async () => {
      await expect(authPage.emailInput).toHaveAttribute('aria-label', 'Email address');
      await expect(authPage.passwordInput).toHaveAttribute('aria-label', 'Password');
      await expect(authPage.submitButton).toHaveAttribute('aria-label', 'Sign in');
    });
  });

  test.describe('Performance', () => {
    test('should load login page quickly', async () => {
      const startTime = Date.now();
      await authPage.goto();
      await authPage.waitForLoad();
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000); // 3 second SLA
    });

    test('should authenticate quickly', async () => {
      await TestDataFactory.createTestUser(testUser);
      
      const startTime = Date.now();
      await authPage.login(testUser.email, testUser.password);
      await dashboardPage.waitForLoad();
      const authTime = Date.now() - startTime;
      
      expect(authTime).toBeLessThan(5000); // 5 second SLA
    });
  });
});