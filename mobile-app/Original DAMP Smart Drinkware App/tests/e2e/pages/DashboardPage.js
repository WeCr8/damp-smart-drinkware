/**
 * Dashboard Page Object
 * 
 * Represents the main dashboard page and provides methods
 * to interact with it in tests.
 */

export class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Selectors
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.userEmail = page.locator('[data-testid="user-email"]');
    this.deviceStats = page.locator('[data-testid="device-stats"]');
    this.zoneStats = page.locator('[data-testid="zone-stats"]');
    this.recentActivity = page.locator('[data-testid="recent-activity"]');
    this.settingsButton = page.locator('[data-testid="settings-button"]');
    this.signOutButton = page.locator('[data-testid="sign-out-button"]');
  }

  /**
   * Navigate to the dashboard page
   */
  async goto() {
    await this.page.goto('/(tabs)');
  }

  /**
   * Wait for the dashboard to load
   */
  async waitForLoad() {
    await this.welcomeMessage.waitFor({ state: 'visible' });
  }

  /**
   * Sign out from the dashboard
   */
  async signOut() {
    await this.settingsButton.click();
    await this.page.waitForSelector('[data-testid="settings-screen"]', { state: 'visible' });
    await this.signOutButton.click();
    await this.page.waitForSelector('[data-testid="sign-out-confirm-dialog"]', { state: 'visible' });
    await this.page.locator('[data-testid="confirm-sign-out-button"]').click();
  }

  /**
   * Get the number of connected devices
   * @returns {Promise<number>}
   */
  async getConnectedDevicesCount() {
    const countText = await this.deviceStats.locator('[data-testid="connected-count"]').textContent();
    return parseInt(countText || '0', 10);
  }

  /**
   * Get the number of active zones
   * @returns {Promise<number>}
   */
  async getActiveZonesCount() {
    const countText = await this.zoneStats.locator('[data-testid="zones-count"]').textContent();
    return parseInt(countText || '0', 10);
  }

  /**
   * Check if a specific device is displayed in recent activity
   * @param {string} deviceName - Name of the device to check
   * @returns {Promise<boolean>}
   */
  async hasDeviceInRecentActivity(deviceName) {
    const activityItems = this.recentActivity.locator('[data-testid="activity-item"]');
    const count = await activityItems.count();
    
    for (let i = 0; i < count; i++) {
      const text = await activityItems.nth(i).textContent();
      if (text && text.includes(deviceName)) {
        return true;
      }
    }
    
    return false;
  }
}