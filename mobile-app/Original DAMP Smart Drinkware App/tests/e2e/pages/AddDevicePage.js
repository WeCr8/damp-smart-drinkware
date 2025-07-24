/**
 * Add Device Page Object
 * 
 * Represents the add device flow and provides methods
 * to interact with it in tests.
 */

export class AddDevicePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Selectors
    this.deviceTypeTitle = page.locator('[data-testid="device-type-title"]');
    this.deviceTypesList = page.locator('[data-testid="device-types-list"]');
    this.scanningIndicator = page.locator('[data-testid="scanning-indicator"]');
    this.discoveredDevicesList = page.locator('[data-testid="discovered-devices-list"]');
    this.noDevicesMessage = page.locator('[data-testid="no-devices-message"]');
    this.scanAgainButton = page.locator('[data-testid="scan-again-button"]');
    this.pairingSuccessMessage = page.locator('[data-testid="pairing-success-message"]');
    this.pairingErrorMessage = page.locator('[data-testid="pairing-error-message"]');
    this.retryButton = page.locator('[data-testid="retry-button"]');
    this.bluetoothDisabledMessage = page.locator('[data-testid="bluetooth-disabled-message"]');
    this.enableBluetoothButton = page.locator('[data-testid="enable-bluetooth-button"]');
    this.scanTimeoutMessage = page.locator('[data-testid="scan-timeout-message"]');
  }

  /**
   * Select a device type
   * @param {string} typeId - Type ID to select (cup, sleeve, bottle, etc.)
   */
  async selectDeviceType(typeId) {
    await this.page.locator(`[data-testid="device-type-${typeId}"]`).click();
  }

  /**
   * Start scanning for devices
   */
  async startScanning() {
    await this.page.locator('[data-testid="start-scan-button"]').click();
  }

  /**
   * Wait for device discovery
   */
  async waitForDeviceDiscovery() {
    await this.discoveredDevicesList.waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Wait for scan timeout
   */
  async waitForScanTimeout() {
    await this.scanTimeoutMessage.waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Select a discovered device
   * @param {string} deviceId - ID of the device to select
   */
  async selectDevice(deviceId) {
    await this.page.locator(`[data-testid="device-${deviceId}"]`).click();
  }

  /**
   * Get a device in the discovered list
   * @param {string} deviceId - ID of the device to get
   * @returns {import('@playwright/test').Locator}
   */
  getDeviceInList(deviceId) {
    return this.page.locator(`[data-testid="device-${deviceId}"]`);
  }

  /**
   * Confirm device pairing
   */
  async confirmPairing() {
    await this.page.locator('[data-testid="confirm-pairing-button"]').click();
  }
}