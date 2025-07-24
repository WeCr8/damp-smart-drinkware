/**
 * Device Management E2E Tests
 * 
 * Tests covering device pairing, management, and monitoring functionality
 */

import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';
import { DevicePage } from '../pages/DevicePage';
import { AddDevicePage } from '../pages/AddDevicePage';
import { TestDataFactory } from '../utils/TestDataFactory';
import { MockBluetoothService } from '../mocks/MockBluetoothService';

test.describe('Device Management', () => {
  let authPage;
  let devicePage;
  let addDevicePage;
  let testUser;
  let mockBluetooth;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    devicePage = new DevicePage(page);
    addDevicePage = new AddDevicePage(page);
    testUser = TestDataFactory.createUser();
    mockBluetooth = new MockBluetoothService(page);
    
    // Create and login test user
    await TestDataFactory.createTestUser(testUser);
    await authPage.goto();
    await authPage.login(testUser.email, testUser.password);
    
    // Setup mock Bluetooth service
    await mockBluetooth.setup();
  });

  test.afterEach(async () => {
    await mockBluetooth.cleanup();
  });

  test.describe('Device Pairing', () => {
    test('should pair coffee cup handle successfully', async () => {
      const mockDevice = TestDataFactory.createMockDevice('cup');
      await mockBluetooth.addDevice(mockDevice);
      
      // Navigate to add device
      await devicePage.goto();
      await devicePage.clickAddDevice();
      
      // Select device type
      await addDevicePage.selectDeviceType('cup');
      await expect(addDevicePage.deviceTypeTitle).toContainText('Coffee Cup Handle');
      
      // Start scanning
      await addDevicePage.startScanning();
      await expect(addDevicePage.scanningIndicator).toBeVisible();
      
      // Wait for device discovery
      await addDevicePage.waitForDeviceDiscovery();
      await expect(addDevicePage.discoveredDevicesList).toBeVisible();
      
      // Select and pair device
      await addDevicePage.selectDevice(mockDevice.id);
      await addDevicePage.confirmPairing();
      
      // Verify pairing success
      await expect(addDevicePage.pairingSuccessMessage).toBeVisible();
      await expect(addDevicePage.pairingSuccessMessage).toContainText('Device paired successfully');
      
      // Verify device appears in device list
      await devicePage.goto();
      await expect(devicePage.getDeviceCard(mockDevice.name)).toBeVisible();
      await expect(devicePage.getDeviceStatus(mockDevice.name)).toContainText('Connected');
    });

    test('should pair baby bottle tracker successfully', async () => {
      const mockDevice = TestDataFactory.createMockDevice('bottle');
      await mockBluetooth.addDevice(mockDevice);
      
      await devicePage.goto();
      await devicePage.clickAddDevice();
      
      await addDevicePage.selectDeviceType('bottle');
      await addDevicePage.startScanning();
      await addDevicePage.waitForDeviceDiscovery();
      await addDevicePage.selectDevice(mockDevice.id);
      await addDevicePage.confirmPairing();
      
      await expect(addDevicePage.pairingSuccessMessage).toBeVisible();
      
      // Verify device-specific features
      await devicePage.goto();
      const deviceCard = devicePage.getDeviceCard(mockDevice.name);
      await expect(deviceCard).toBeVisible();
      await expect(deviceCard.locator('[data-testid="device-type"]')).toContainText('Baby Bottle Tracker');
    });

    test('should handle no devices found scenario', async () => {
      await devicePage.goto();
      await devicePage.clickAddDevice();
      
      await addDevicePage.selectDeviceType('cup');
      await addDevicePage.startScanning();
      
      // Wait for scan timeout
      await addDevicePage.waitForScanTimeout();
      
      await expect(addDevicePage.noDevicesMessage).toBeVisible();
      await expect(addDevicePage.noDevicesMessage).toContainText('No devices found');
      await expect(addDevicePage.scanAgainButton).toBeVisible();
    });

    test('should handle pairing failure', async () => {
      const mockDevice = TestDataFactory.createMockDevice('cup');
      await mockBluetooth.addDevice(mockDevice);
      await mockBluetooth.setPairingFailure(mockDevice.id);
      
      await devicePage.goto();
      await devicePage.clickAddDevice();
      await addDevicePage.selectDeviceType('cup');
      await addDevicePage.startScanning();
      await addDevicePage.waitForDeviceDiscovery();
      await addDevicePage.selectDevice(mockDevice.id);
      await addDevicePage.confirmPairing();
      
      await expect(addDevicePage.pairingErrorMessage).toBeVisible();
      await expect(addDevicePage.pairingErrorMessage).toContainText('Pairing failed');
      await expect(addDevicePage.retryButton).toBeVisible();
    });

    test('should validate device compatibility', async () => {
      const incompatibleDevice = TestDataFactory.createMockDevice('unknown');
      await mockBluetooth.addDevice(incompatibleDevice);
      
      await devicePage.goto();
      await devicePage.clickAddDevice();
      await addDevicePage.selectDeviceType('cup');
      await addDevicePage.startScanning();
      
      // Incompatible device should not appear in list
      await addDevicePage.waitForScanTimeout();
      await expect(addDevicePage.getDeviceInList(incompatibleDevice.id)).not.toBeVisible();
    });
  });

  test.describe('Device Information and Settings', () => {
    let pairedDevice;

    test.beforeEach(async () => {
      pairedDevice = TestDataFactory.createMockDevice('cup');
      await TestDataFactory.createPairedDevice(testUser.id, pairedDevice);
      await devicePage.goto();
    });

    test('should display device information correctly', async () => {
      await devicePage.clickDevice(pairedDevice.name);
      
      // Verify device info modal opens
      await expect(devicePage.deviceInfoModal).toBeVisible();
      
      // Check device details
      await expect(devicePage.deviceName).toContainText(pairedDevice.name);
      await expect(devicePage.deviceType).toContainText('Coffee Cup Handle');
      await expect(devicePage.batteryLevel).toContainText(`${pairedDevice.batteryLevel}%`);
      await expect(devicePage.connectionStatus).toContainText('Connected');
      await expect(devicePage.firmwareVersion).toContainText(pairedDevice.firmware);
    });

    test('should update device settings', async () => {
      await devicePage.clickDevice(pairedDevice.name);
      
      // Enable location tracking
      await devicePage.toggleLocationTracking();
      await expect(devicePage.locationTrackingToggle).toBeChecked();
      
      // Enable location sharing
      await devicePage.toggleLocationSharing();
      await expect(devicePage.locationSharingToggle).toBeChecked();
      
      // Close modal and reopen to verify persistence
      await devicePage.closeDeviceInfoModal();
      await devicePage.clickDevice(pairedDevice.name);
      
      await expect(devicePage.locationTrackingToggle).toBeChecked();
      await expect(devicePage.locationSharingToggle).toBeChecked();
    });

    test('should add no-alert zone', async () => {
      await devicePage.clickDevice(pairedDevice.name);
      
      await devicePage.clickAddNoAlertZone();
      
      // Confirm zone addition
      await expect(devicePage.addZoneConfirmDialog).toBeVisible();
      await devicePage.confirmAddZone();
      
      await expect(devicePage.zoneAddedMessage).toBeVisible();
      await expect(devicePage.noAlertZoneCount).toContainText('1');
    });

    test('should change device image', async () => {
      await devicePage.clickDevice(pairedDevice.name);
      
      // Click device image to change
      await devicePage.clickDeviceImage();
      
      // Select new image (mock file picker)
      const newImageUrl = 'https://example.com/new-device-image.jpg';
      await devicePage.selectDeviceImage(newImageUrl);
      
      await expect(devicePage.deviceImage).toHaveAttribute('src', newImageUrl);
      await expect(devicePage.imageUpdateSuccess).toBeVisible();
    });
  });

  test.describe('Device Status and Monitoring', () => {
    let connectedDevice;
    let disconnectedDevice;

    test.beforeEach(async () => {
      connectedDevice = TestDataFactory.createMockDevice('cup', { status: 'connected' });
      disconnectedDevice = TestDataFactory.createMockDevice('sleeve', { status: 'disconnected' });
      
      await TestDataFactory.createPairedDevice(testUser.id, connectedDevice);
      await TestDataFactory.createPairedDevice(testUser.id, disconnectedDevice);
      
      await devicePage.goto();
    });

    test('should display correct device statuses', async () => {
      // Check connected device
      const connectedCard = devicePage.getDeviceCard(connectedDevice.name);
      await expect(connectedCard.locator('[data-testid="status"]')).toContainText('Online');
      await expect(connectedCard.locator('[data-testid="status-dot"]')).toHaveClass(/connected/);
      
      // Check disconnected device
      const disconnectedCard = devicePage.getDeviceCard(disconnectedDevice.name);
      await expect(disconnectedCard.locator('[data-testid="status"]')).toContainText('Offline');
      await expect(disconnectedCard.locator('[data-testid="status-dot"]')).toHaveClass(/disconnected/);
    });

    test('should toggle device connection', async () => {
      const deviceCard = devicePage.getDeviceCard(connectedDevice.name);
      
      // Disconnect device
      await deviceCard.locator('[data-testid="connection-toggle"]').click();
      
      await expect(deviceCard.locator('[data-testid="status"]')).toContainText('Offline');
      
      // Reconnect device
      await deviceCard.locator('[data-testid="connection-toggle"]').click();
      
      await expect(deviceCard.locator('[data-testid="status"]')).toContainText('Online');
    });

    test('should update battery levels', async () => {
      const deviceCard = devicePage.getDeviceCard(connectedDevice.name);
      
      // Simulate battery level change
      await mockBluetooth.updateBatteryLevel(connectedDevice.id, 45);
      
      // Wait for update
      await devicePage.waitForBatteryUpdate();
      
      await expect(deviceCard.locator('[data-testid="battery-level"]')).toContainText('45%');
      
      // Check battery color changes for low battery
      await expect(deviceCard.locator('[data-testid="battery-icon"]')).toHaveClass(/warning/);
    });

    test('should show last seen timestamp', async () => {
      const deviceCard = devicePage.getDeviceCard(disconnectedDevice.name);
      
      await expect(deviceCard.locator('[data-testid="last-seen"]')).toBeVisible();
      await expect(deviceCard.locator('[data-testid="last-seen"]')).toContainText(/ago/);
    });
  });

  test.describe('Device Removal', () => {
    let testDevice;

    test.beforeEach(async () => {
      testDevice = TestDataFactory.createMockDevice('cup');
      await TestDataFactory.createPairedDevice(testUser.id, testDevice);
      await devicePage.goto();
    });

    test('should remove device successfully', async () => {
      await devicePage.clickDevice(testDevice.name);
      
      // Click remove device
      await devicePage.clickRemoveDevice();
      
      // Confirm removal
      await expect(devicePage.removeConfirmDialog).toBeVisible();
      await expect(devicePage.removeConfirmDialog).toContainText('Are you sure');
      
      await devicePage.confirmRemoval();
      
      // Verify device removed
      await expect(devicePage.removalSuccessMessage).toBeVisible();
      await expect(devicePage.getDeviceCard(testDevice.name)).not.toBeVisible();
    });

    test('should cancel device removal', async () => {
      await devicePage.clickDevice(testDevice.name);
      await devicePage.clickRemoveDevice();
      
      await expect(devicePage.removeConfirmDialog).toBeVisible();
      await devicePage.cancelRemoval();
      
      // Verify device still exists
      await devicePage.closeDeviceInfoModal();
      await expect(devicePage.getDeviceCard(testDevice.name)).toBeVisible();
    });
  });

  test.describe('Multiple Device Management', () => {
    test('should manage multiple devices', async () => {
      const devices = [
        TestDataFactory.createMockDevice('cup', { name: 'Kitchen Cup' }),
        TestDataFactory.createMockDevice('bottle', { name: 'Baby Bottle' }),
        TestDataFactory.createMockDevice('sleeve', { name: 'Office Sleeve' })
      ];
      
      // Create multiple devices
      for (const device of devices) {
        await TestDataFactory.createPairedDevice(testUser.id, device);
      }
      
      await devicePage.goto();
      
      // Verify all devices appear
      for (const device of devices) {
        await expect(devicePage.getDeviceCard(device.name)).toBeVisible();
      }
      
      // Verify device count
      await expect(devicePage.deviceCount).toContainText('3 devices');
    });

    test('should filter devices by type', async () => {
      const cupDevice = TestDataFactory.createMockDevice('cup');
      const bottleDevice = TestDataFactory.createMockDevice('bottle');
      
      await TestDataFactory.createPairedDevice(testUser.id, cupDevice);
      await TestDataFactory.createPairedDevice(testUser.id, bottleDevice);
      
      await devicePage.goto();
      
      // Filter by cup type
      await devicePage.filterByType('cup');
      
      await expect(devicePage.getDeviceCard(cupDevice.name)).toBeVisible();
      await expect(devicePage.getDeviceCard(bottleDevice.name)).not.toBeVisible();
      
      // Clear filter
      await devicePage.clearFilter();
      
      await expect(devicePage.getDeviceCard(cupDevice.name)).toBeVisible();
      await expect(devicePage.getDeviceCard(bottleDevice.name)).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle Bluetooth disabled', async () => {
      await mockBluetooth.disableBluetooth();
      
      await devicePage.goto();
      await devicePage.clickAddDevice();
      await addDevicePage.selectDeviceType('cup');
      await addDevicePage.startScanning();
      
      await expect(addDevicePage.bluetoothDisabledMessage).toBeVisible();
      await expect(addDevicePage.bluetoothDisabledMessage).toContainText('Bluetooth is disabled');
      await expect(addDevicePage.enableBluetoothButton).toBeVisible();
    });

    test('should handle device connection loss', async () => {
      const device = TestDataFactory.createMockDevice('cup', { status: 'connected' });
      await TestDataFactory.createPairedDevice(testUser.id, device);
      
      await devicePage.goto();
      
      // Simulate connection loss
      await mockBluetooth.simulateConnectionLoss(device.id);
      
      // Verify status update
      const deviceCard = devicePage.getDeviceCard(device.name);
      await expect(deviceCard.locator('[data-testid="status"]')).toContainText('Offline');
      
      // Verify notification
      await expect(devicePage.connectionLostNotification).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load device list quickly', async () => {
      // Create multiple devices
      const devices = Array.from({ length: 10 }, (_, i) => 
        TestDataFactory.createMockDevice('cup', { name: `Device ${i + 1}` })
      );
      
      for (const device of devices) {
        await TestDataFactory.createPairedDevice(testUser.id, device);
      }
      
      const startTime = Date.now();
      await devicePage.goto();
      await devicePage.waitForDeviceListLoad();
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(2000); // 2 second SLA
    });

    test('should handle device scanning timeout', async () => {
      await devicePage.goto();
      await devicePage.clickAddDevice();
      await addDevicePage.selectDeviceType('cup');
      
      const startTime = Date.now();
      await addDevicePage.startScanning();
      await addDevicePage.waitForScanTimeout();
      const scanTime = Date.now() - startTime;
      
      expect(scanTime).toBeLessThan(15000); // 15 second timeout
      await expect(addDevicePage.scanTimeoutMessage).toBeVisible();
    });
  });
});