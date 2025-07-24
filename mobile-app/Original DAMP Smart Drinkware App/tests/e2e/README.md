# End-to-End Test Suite for DAMP Smart Drinkware

This directory contains comprehensive E2E tests that validate the complete user journey through the DAMP Smart Drinkware application.

## Test Structure

The tests are organized into the following directories:

- `pages/`: Page Object Models representing different screens in the application
- `specs/`: Test specifications grouped by feature area
- `utils/`: Utility functions and test data factories
- `mocks/`: Mock implementations of external services

## Running Tests

To run the tests, use the following commands:

```bash
# Install test dependencies
npm install --save-dev @playwright/test

# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/specs/auth.e2e.test.js

# Run tests with UI mode
npx playwright test --ui
```

## Test Categories

### Authentication (auth.e2e.test.js)
- User registration
- Login with valid/invalid credentials
- Session management
- Password reset

### Device Management (device-management.e2e.test.js)
- Device pairing
- Device information display
- Device settings
- Device removal

### Subscription Management (subscription.e2e.test.js)
- Subscription purchase
- Plan management
- Feature access control
- Billing and invoices

### Store Functionality (store.e2e.test.js)
- Product browsing
- Cart management
- Checkout process
- Order confirmation

## Page Objects

The tests use the Page Object Model pattern to encapsulate page interactions:

- `AuthPage`: Authentication screens
- `DashboardPage`: Main dashboard
- `DevicePage`: Device management screens
- `AddDevicePage`: Device addition flow
- `SettingsPage`: Settings screens
- `SubscriptionPage`: Subscription management

## Mock Services

To enable reliable testing without external dependencies:

- `MockBluetoothService`: Simulates Bluetooth device discovery and connection
- `MockStripeService`: Simulates Stripe checkout and payment processing

## Test Data

Test data is generated using the `TestDataFactory` class, which provides methods to create:

- Test users
- Mock devices
- Subscriptions
- Zones
- Invoices

## Best Practices

1. **Isolation**: Each test should be independent and not rely on state from other tests
2. **Readability**: Use descriptive test names and page object methods
3. **Reliability**: Avoid flaky selectors and use proper waiting mechanisms
4. **Coverage**: Focus on critical user flows and business processes
5. **Performance**: Keep tests efficient to enable fast feedback cycles

## Continuous Integration

These tests are designed to run in CI environments. The recommended configuration is:

```yaml
name: E2E Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run tests
        run: npx playwright test
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```