/**
 * Mock Bluetooth Service
 * 
 * Provides a mock implementation of Bluetooth functionality for testing
 */

export class MockBluetoothService {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.devices = new Map();
    this.pairingFailures = new Set();
    this.isBluetoothEnabled = true;
  }

  /**
   * Set up the mock Bluetooth service
   */
  async setup() {
    await this.page.evaluate(() => {
      // Create global mock objects
      window.mockBluetooth = {
        devices: [],
        isEnabled: true,
        pairingFailures: [],
        connectionLosses: [],
        batteryLevels: {},
      };

      // Mock the native BLE module
      window.mockNativeBLE = {
        startScan: () => {
          console.log('Mock BLE: Starting scan');
          return window.mockBluetooth.devices.filter(d => window.mockBluetooth.isEnabled);
        },
        stopScan: () => {
          console.log('Mock BLE: Stopping scan');
        },
        connectToDevice: (deviceId) => {
          console.log(`Mock BLE: Connecting to device ${deviceId}`);
          if (window.mockBluetooth.pairingFailures.includes(deviceId)) {
            throw new Error('Mock pairing failure');
          }
          return window.mockBluetooth.devices.find(d => d.id === deviceId);
        },
        disconnectFromDevice: (deviceId) => {
          console.log(`Mock BLE: Disconnecting from device ${deviceId}`);
        },
        getBatteryLevel: (deviceId) => {
          return window.mockBluetooth.batteryLevels[deviceId] || 100;
        },
      };
    });
  }

  /**
   * Clean up the mock Bluetooth service
   */
  async cleanup() {
    await this.page.evaluate(() => {
      delete window.mockBluetooth;
      delete window.mockNativeBLE;
    });
  }

  /**
   * Add a mock device
   * @param {Object} device - Device data
   */
  async addDevice(device) {
    await this.page.evaluate((device) => {
      window.mockBluetooth.devices.push(device);
      window.mockBluetooth.batteryLevels[device.id] = device.batteryLevel;
    }, device);
    this.devices.set(device.id, device);
  }

  /**
   * Set a device to fail pairing
   * @param {string} deviceId - Device ID
   */
  async setPairingFailure(deviceId) {
    await this.page.evaluate((deviceId) => {
      window.mockBluetooth.pairingFailures.push(deviceId);
    }, deviceId);
    this.pairingFailures.add(deviceId);
  }

  /**
   * Disable Bluetooth
   */
  async disableBluetooth() {
    await this.page.evaluate(() => {
      window.mockBluetooth.isEnabled = false;
    });
    this.isBluetoothEnabled = false;
  }

  /**
   * Enable Bluetooth
   */
  async enableBluetooth() {
    await this.page.evaluate(() => {
      window.mockBluetooth.isEnabled = true;
    });
    this.isBluetoothEnabled = true;
  }

  /**
   * Simulate connection loss for a device
   * @param {string} deviceId - Device ID
   */
  async simulateConnectionLoss(deviceId) {
    await this.page.evaluate((deviceId) => {
      window.mockBluetooth.connectionLosses.push(deviceId);
      // Trigger the connection loss event
      if (window.onDeviceDisconnected) {
        window.onDeviceDisconnected(deviceId);
      }
    }, deviceId);
  }

  /**
   * Update battery level for a device
   * @param {string} deviceId - Device ID
   * @param {number} level - Battery level (0-100)
   */
  async updateBatteryLevel(deviceId, level) {
    await this.page.evaluate((deviceId, level) => {
      window.mockBluetooth.batteryLevels[deviceId] = level;
      // Trigger battery update event
      if (window.onBatteryLevelChanged) {
        window.onBatteryLevelChanged(deviceId, level);
      }
    }, deviceId, level);
  }
}