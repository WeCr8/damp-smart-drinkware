/**
 * Zone Manager Unit Tests
 * 
 * Comprehensive test suite for the ZoneManager functionality
 */

import { ZoneManager, Zone, ZoneInput, ZoneEvent } from './zoneManager';

describe('ZoneManager', () => {
  let zoneManager: ZoneManager;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    zoneManager = new ZoneManager();
  });

  afterEach(() => {
    zoneManager.stopMonitoring();
  });

  describe('Zone Creation', () => {
    test('should create a valid zone', async () => {
      const zoneInput: ZoneInput = {
        name: 'Test Home',
        type: 'home',
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 50,
      };

      const result = await zoneManager.createZone(zoneInput, testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe('Test Home');
      expect(result.data?.type).toBe('home');
      expect(result.data?.createdBy).toBe(testUserId);
    });

    test('should reject invalid zone input', async () => {
      const invalidInput: ZoneInput = {
        name: '',
        type: 'home',
        latitude: 200, // Invalid latitude
        longitude: -122.4194,
        radius: 50,
      };

      const result = await zoneManager.createZone(invalidInput, testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
    });

    test('should enforce zone limit per user', async () => {
      const zoneInput: ZoneInput = {
        name: 'Test Zone',
        type: 'custom',
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 50,
      };

      // Create zones up to the limit
      for (let i = 0; i < 50; i++) {
        await zoneManager.createZone({
          ...zoneInput,
          name: `Zone ${i}`,
        }, testUserId);
      }

      // This should fail
      const result = await zoneManager.createZone(zoneInput, testUserId);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Maximum zones limit reached');
    });
  });

  describe('Zone Hierarchy', () => {
    test('should create parent-child relationship', async () => {
      const parentZone = await zoneManager.createZone({
        name: 'Parent Zone',
        type: 'home',
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 100,
      }, testUserId);

      expect(parentZone.success).toBe(true);

      const childZone = await zoneManager.createZone({
        name: 'Child Zone',
        type: 'custom',
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 30,
        parentZoneId: parentZone.data!.id,
      }, testUserId);

      expect(childZone.success).toBe(true);
      expect(childZone.data?.parentZoneId).toBe(parentZone.data!.id);

      const updatedParent = zoneManager.getZone(parentZone.data!.id);
      expect(updatedParent?.childZoneIds).toContain(childZone.data!.id);
    });

    test('should prevent circular hierarchy', async () => {
      const zone1 = await zoneManager.createZone({
        name: 'Zone 1',
        type: 'home',
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 50,
      }, testUserId);

      const zone2 = await zoneManager.createZone({
        name: 'Zone 2',
        type: 'custom',
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 30,
        parentZoneId: zone1.data!.id,
      }, testUserId);

      // Try to make zone1 a child of zone2 (circular)
      const result = await zoneManager.updateZone(
        zone1.data!.id,
        { parentZoneId: zone2.data!.id },
        testUserId
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('would create cycle');
    });
  });

  describe('Device Management', () => {
    let testZone: Zone;

    beforeEach(async () => {
      const result = await zoneManager.createZone({
        name: 'Test Zone',
        type: 'home',
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 50,
      }, testUserId);
      testZone = result.data!;
    });

    test('should add device to zone', async () => {
      const deviceId = 'device-123';
      const result = await zoneManager.addDeviceToZone(testZone.id, deviceId);

      expect(result.success).toBe(true);
      expect(result.data?.deviceIds).toContain(deviceId);

      const deviceZone = zoneManager.getDeviceZone(deviceId);
      expect(deviceZone?.id).toBe(testZone.id);
    });

    test('should remove device from zone', async () => {
      const deviceId = 'device-123';
      await zoneManager.addDeviceToZone(testZone.id, deviceId);

      const result = await zoneManager.removeDeviceFromZone(testZone.id, deviceId);

      expect(result.success).toBe(true);
      expect(result.data?.deviceIds).not.toContain(deviceId);

      const deviceZone = zoneManager.getDeviceZone(deviceId);
      expect(deviceZone).toBeNull();
    });

    test('should move device between zones', async () => {
      const zone2Result = await zoneManager.createZone({
        name: 'Zone 2',
        type: 'office',
        latitude: 37.7849,
        longitude: -122.4094,
        radius: 30,
      }, testUserId);
      const zone2 = zone2Result.data!;

      const deviceId = 'device-123';
      await zoneManager.addDeviceToZone(testZone.id, deviceId);
      await zoneManager.addDeviceToZone(zone2.id, deviceId);

      const deviceZone = zoneManager.getDeviceZone(deviceId);
      expect(deviceZone?.id).toBe(zone2.id);

      const updatedZone1 = zoneManager.getZone(testZone.id);
      expect(updatedZone1?.deviceIds).not.toContain(deviceId);
    });
  });

  describe('Boundary Detection', () => {
    let testZone: Zone;

    beforeEach(async () => {
      const result = await zoneManager.createZone({
        name: 'Test Zone',
        type: 'home',
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 50, // 50 meter radius
      }, testUserId);
      testZone = result.data!;
    });

    test('should detect device inside zone', () => {
      const result = zoneManager.checkDeviceInZone(
        'device-123',
        37.7749, // Same as zone center
        -122.4194,
        testZone.id
      );

      expect(result).toBeDefined();
      expect(result?.isInside).toBe(true);
      expect(result?.distanceFromCenter).toBeLessThan(1);
    });

    test('should detect device outside zone', () => {
      const result = zoneManager.checkDeviceInZone(
        'device-123',
        37.7849, // ~1km away
        -122.4094,
        testZone.id
      );

      expect(result).toBeDefined();
      expect(result?.isInside).toBe(false);
      expect(result?.distanceFromCenter).toBeGreaterThan(50);
    });

    test('should handle boundary edge cases', () => {
      // Test point exactly on boundary (approximately)
      const result = zoneManager.checkDeviceInZone(
        'device-123',
        37.7753, // ~45m from center
        -122.4194,
        testZone.id
      );

      expect(result).toBeDefined();
      expect(Math.abs(result?.distanceFromBoundary || 0)).toBeLessThan(10);
    });
  });

  describe('Location Updates and Events', () => {
    let testZone: Zone;
    let receivedEvents: ZoneEvent[] = [];

    beforeEach(async () => {
      const result = await zoneManager.createZone({
        name: 'Test Zone',
        type: 'home',
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 50,
        settings: {
          notifyOnEntry: true,
          notifyOnExit: true,
        },
      }, testUserId);
      testZone = result.data!;

      receivedEvents = [];
      zoneManager.addEventListener((event) => {
        receivedEvents.push(event);
      });
    });

    test('should trigger entry event', async () => {
      const deviceId = 'device-123';
      
      // Move device into zone
      await zoneManager.processLocationUpdate(
        deviceId,
        37.7749, // Zone center
        -122.4194
      );

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0].type).toBe('enter');
      expect(receivedEvents[0].zoneId).toBe(testZone.id);
      expect(receivedEvents[0].deviceId).toBe(deviceId);
    });

    test('should trigger exit event', async () => {
      const deviceId = 'device-123';
      
      // First, enter the zone
      await zoneManager.processLocationUpdate(deviceId, 37.7749, -122.4194);
      
      // Clear previous events
      receivedEvents = [];
      
      // Move device out of zone
      await zoneManager.processLocationUpdate(
        deviceId,
        37.7849, // Outside zone
        -122.4094
      );

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0].type).toBe('exit');
      expect(receivedEvents[0].zoneId).toBe(testZone.id);
      expect(receivedEvents[0].deviceId).toBe(deviceId);
    });

    test('should update zone statistics', async () => {
      const deviceId = 'device-123';
      
      // Enter zone
      await zoneManager.processLocationUpdate(deviceId, 37.7749, -122.4194);
      
      // Exit zone
      await zoneManager.processLocationUpdate(deviceId, 37.7849, -122.4094);

      const updatedZone = zoneManager.getZone(testZone.id);
      expect(updatedZone?.stats.totalEntries).toBe(1);
      expect(updatedZone?.stats.totalExits).toBe(1);
      expect(updatedZone?.stats.lastActivity).toBeDefined();
    });
  });

  describe('Zone Monitoring', () => {
    test('should start and stop monitoring', () => {
      expect(() => zoneManager.startMonitoring()).not.toThrow();
      expect(() => zoneManager.stopMonitoring()).not.toThrow();
    });

    test('should handle multiple start calls gracefully', () => {
      zoneManager.startMonitoring();
      expect(() => zoneManager.startMonitoring()).not.toThrow();
      zoneManager.stopMonitoring();
    });
  });

  describe('Zone Queries', () => {
    beforeEach(async () => {
      await zoneManager.createZone({
        name: 'Home Zone',
        type: 'home',
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 50,
      }, testUserId);

      await zoneManager.createZone({
        name: 'Office Zone',
        type: 'office',
        latitude: 37.7849,
        longitude: -122.4094,
        radius: 30,
        status: 'inactive',
      }, testUserId);
    });

    test('should get all zones', () => {
      const zones = zoneManager.getAllZones();
      expect(zones).toHaveLength(2);
    });

    test('should filter zones by type', () => {
      const homeZones = zoneManager.getZonesByType('home');
      expect(homeZones).toHaveLength(1);
      expect(homeZones[0].name).toBe('Home Zone');
    });

    test('should get active zones only', () => {
      const activeZones = zoneManager.getActiveZones();
      expect(activeZones).toHaveLength(1);
      expect(activeZones[0].name).toBe('Home Zone');
    });

    test('should get user zones', () => {
      const userZones = zoneManager.getUserZones(testUserId);
      expect(userZones).toHaveLength(2);
    });
  });

  describe('Zone Deletion', () => {
    test('should delete zone successfully', async () => {
      const zoneResult = await zoneManager.createZone({
        name: 'Temp Zone',
        type: 'custom',
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 50,
      }, testUserId);

      const deleteResult = await zoneManager.deleteZone(zoneResult.data!.id, testUserId);

      expect(deleteResult.success).toBe(true);
      expect(zoneManager.getZone(zoneResult.data!.id)).toBeNull();
    });

    test('should prevent deletion of zone with children', async () => {
      const parentResult = await zoneManager.createZone({
        name: 'Parent Zone',
        type: 'home',
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 100,
      }, testUserId);

      await zoneManager.createZone({
        name: 'Child Zone',
        type: 'custom',
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 30,
        parentZoneId: parentResult.data!.id,
      }, testUserId);

      const deleteResult = await zoneManager.deleteZone(parentResult.data!.id, testUserId);

      expect(deleteResult.success).toBe(false);
      expect(deleteResult.error).toContain('Cannot delete zone with child zones');
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent zone operations', async () => {
      const result = await zoneManager.updateZone('non-existent-id', { name: 'New Name' }, testUserId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Zone not found');
    });

    test('should handle invalid device operations', async () => {
      const result = await zoneManager.addDeviceToZone('non-existent-zone', 'device-123');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Zone not found');
    });
  });
});