/**
 * Device Page Object
 * 
 * Represents the device management pages and provides methods
 * to interact with them in tests.
 */

export class DevicePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Selectors
    this.devicesList = page.locator('[data-testid="devices-list"]');
    this.deviceCount = page.locator('[data-testid="device-count"]');
    this.addDeviceButton = page.locator('[data-testid="add-device-button"]');
    this.deviceInfoModal = page.locator('[data-testid="device-info-modal"]');
    this.deviceName = page.locator('[data-testid="device-name"]');
    this.deviceType = page.locator('[data-testid="device-type"]');
    this.batteryLevel = page.locator('[data-testid="battery-level"]');
    this.connectionStatus = page.locator('[data-testid="connection-status"]');
    this.firmwareVersion = page.locator('[data-testid="firmware-version"]');
    this.deviceImage = page.locator('[data-testid="device-image"]');
    this.locationTrackingToggle = page.locator('[data-testid="location-tracking-toggle"]');
    this.locationSharingToggle = page.locator('[data-testid="location-sharing-toggle"]');
    this.removeDeviceButton = page.locator('[data-testid="remove-device-button"]');
    this.removeConfirmDialog = page.locator('[data-testid="remove-confirm-dialog"]');
    this.removalSuccessMessage = page.locator('[data-testid="removal-success-message"]');
    this.addZoneButton = page.locator('[data-testid="add-zone-button"]');
    this.addZoneConfirmDialog = page.locator('[data-testid="add-zone-confirm-dialog"]');
    this.zoneAddedMessage = page.locator('[data-testid="zone-added-message"]');
    this.noAlertZoneCount = page.locator('[data-testid="no-alert-zone-count"]');
    this.imageUpdateSuccess = page.locator('[data-testid="image-update-success"]');
    this.connectionLostNotification = page.locator('[data-testid="connection-lost-notification"]');
  }

  /**
   * Navigate to the devices page
   */
  async goto() {
    await this.page.goto('/(tabs)/devices');
  }

  /**
   * Click the add device button
   */
  async clickAddDevice() {
    await this.addDeviceButton.click();
  }

  /**
   * Click on a specific device card
   * @param {string} deviceName - Name of the device to click
   */
  async clickDevice(deviceName) {
    await this.getDeviceCard(deviceName).click();
  }

  /**
   * Get a device card by name
   * @param {string} deviceName - Name of the device
   * @returns {import('@playwright/test').Locator}
   */
  getDeviceCard(deviceName) {
    return this.page.locator(`[data-testid="device-card"][data-device-name="${deviceName}"]`);
  }

  /**
   * Get device status text
   * @param {string} deviceName - Name of the device
   * @returns {Promise<string>}
   */
  async getDeviceStatus(deviceName) {
    const statusElement = this.getDeviceCard(deviceName).locator('[data-testid="status"]');
    return statusElement.textContent();
  }

  /**
   * Close the device info modal
   */
  async closeDeviceInfoModal() {
    await this.page.locator('[data-testid="close-modal-button"]').click();
  }

  /**
   * Toggle location tracking for a device
   */
  async toggleLocationTracking() {
    await this.locationTrackingToggle.click();
  }

  /**
   * Toggle location sharing for a device
   */
  async toggleLocationSharing() {
    await this.locationSharingToggle.click();
  }

  /**
   * Click the remove device button
   */
  async clickRemoveDevice() {
    await this.removeDeviceButton.click();
  }

  /**
   * Confirm device removal in the confirmation dialog
   */
  async confirmRemoval() {
    await this.page.locator('[data-testid="confirm-removal-button"]').click();
  }

  /**
   * Cancel device removal in the confirmation dialog
   */
  async cancelRemoval() {
    await this.page.locator('[data-testid="cancel-removal-button"]').click();
  }

  /**
   * Click the add no-alert zone button
   */
  async clickAddNoAlertZone() {
    await this.addZoneButton.click();
  }

  /**
   * Confirm adding a zone in the confirmation dialog
   */
  async confirmAddZone() {
    await this.page.locator('[data-testid="confirm-add-zone-button"]').click();
  }

  /**
   * Click the device image to change it
   */
  async clickDeviceImage() {
    await this.deviceImage.click();
  }

  /**
   * Select a new device image
   * @param {string} imageUrl - URL of the image to select
   */
  async selectDeviceImage(imageUrl) {
    // Mock file selection since file pickers can't be automated directly
    await this.page.evaluate((url) => {
      window.mockFilePickerResult = { uri: url };
    }, imageUrl);
    
    // Trigger the file picker result handler
    await this.page.locator('[data-testid="confirm-image-selection"]').click();
  }

  /**
   * Filter devices by type
   * @param {string} type - Device type to filter by
   */
  async filterByType(type) {
    await this.page.locator(`[data-testid="filter-${type}"]`).click();
  }

  /**
   * Clear device filters
   */
  async clearFilter() {
    await this.page.locator('[data-testid="clear-filter"]').click();
  }

  /**
   * Wait for device list to load
   */
  async waitForDeviceListLoad() {
    await this.devicesList.waitFor({ state: 'visible' });
  }

  /**
   * Wait for battery level update
   */
  async waitForBatteryUpdate() {
    // Wait for any loading indicators to disappear
    await this.page.waitForSelector('[data-testid="battery-loading"]', { state: 'detached' });
  }
}