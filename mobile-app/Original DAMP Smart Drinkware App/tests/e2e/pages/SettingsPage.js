/**
 * Settings Page Object
 * 
 * Represents the settings pages and provides methods
 * to interact with them in tests.
 */

export class SettingsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Selectors
    this.accountTab = page.locator('[data-testid="tab-account"]');
    this.preferencesTab = page.locator('[data-testid="tab-preferences"]');
    this.devicesTab = page.locator('[data-testid="tab-devices"]');
    this.zonesTab = page.locator('[data-testid="tab-zones"]');
    this.storeTab = page.locator('[data-testid="tab-store"]');
    this.supportTab = page.locator('[data-testid="tab-support"]');
    
    this.subscriptionSection = page.locator('[data-testid="section-subscription"]');
    this.deviceManagementSection = page.locator('[data-testid="section-device-management"]');
    this.zoneManagementSection = page.locator('[data-testid="section-zone-management"]');
    this.locationTrackingSection = page.locator('[data-testid="section-location-tracking"]');
    
    this.deviceLimitModal = page.locator('[data-testid="device-limit-modal"]');
    this.upgradeToAddDevicesButton = page.locator('[data-testid="upgrade-to-add-devices-button"]');
    this.zoneLimitModal = page.locator('[data-testid="zone-limit-modal"]');
    this.upgradeForMoreZonesButton = page.locator('[data-testid="upgrade-for-more-zones-button"]');
    
    this.locationTrackingToggle = page.locator('[data-testid="location-tracking-toggle"]');
    this.upgradeModal = page.locator('[data-testid="upgrade-modal"]');
    this.upgradeButton = page.locator('[data-testid="upgrade-button"]');
    
    this.addDeviceModal = page.locator('[data-testid="add-device-modal"]');
    this.createZoneButton = page.locator('[data-testid="create-zone-button"]');
    this.zoneManagement = page.locator('[data-testid="zone-management"]');
    this.deviceCount = page.locator('[data-testid="device-count"]');
  }

  /**
   * Navigate to the settings page
   */
  async goto() {
    await this.page.goto('/(tabs)/settings');
  }

  /**
   * Click the subscription section
   */
  async clickSubscription() {
    await this.subscriptionSection.click();
  }

  /**
   * Click the devices tab
   */
  async clickDevices() {
    await this.devicesTab.click();
  }

  /**
   * Click the zones tab
   */
  async clickZones() {
    await this.zonesTab.click();
  }

  /**
   * Click the store tab
   */
  async clickStore() {
    await this.storeTab.click();
  }

  /**
   * Click the add device button
   */
  async clickAddDevice() {
    await this.page.locator('[data-testid="add-device-button"]').click();
  }

  /**
   * Click the create zone button
   */
  async clickCreateZone() {
    await this.createZoneButton.click();
  }

  /**
   * Click the location tracking toggle
   */
  async clickLocationTracking() {
    await this.locationTrackingToggle.click();
  }

  /**
   * Cancel the upgrade modal
   */
  async cancelUpgrade() {
    await this.page.locator('[data-testid="cancel-upgrade-button"]').click();
  }
}