// Zone Manager for DAMP Smart Drinkware
// Handles geofencing and zone-based tracking

export interface Zone {
  id: string;
  name: string;
  type: 'home' | 'office' | 'custom';
  latitude: number;
  longitude: number;
  radius: number; // in meters
  isActive: boolean;
  deviceIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ZoneEvent {
  type: 'enter' | 'exit';
  deviceId: string;
  zoneId: string;
  timestamp: Date;
}

export interface ZoneManagerInterface {
  createZone(zone: Omit<Zone, 'id' | 'createdAt' | 'updatedAt'>): Promise<Zone>;
  updateZone(zoneId: string, updates: Partial<Zone>): Promise<Zone | null>;
  deleteZone(zoneId: string): Promise<boolean>;
  getZones(): Zone[];
  getActiveZones(): Zone[];
  addDeviceToZone(zoneId: string, deviceId: string): Promise<boolean>;
  removeDeviceFromZone(zoneId: string, deviceId: string): Promise<boolean>;
  checkDeviceInZone(deviceId: string, latitude: number, longitude: number): Zone | null;
  onZoneEvent(callback: (event: ZoneEvent) => void): void;
  startMonitoring(): void;
  stopMonitoring(): void;
}

class ZoneManager implements ZoneManagerInterface {
  private zones: Map<string, Zone> = new Map();
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private onZoneEventCallback?: (event: ZoneEvent) => void;
  private lastKnownPositions: Map<string, { latitude: number; longitude: number; zoneId?: string }> = new Map();

  constructor() {
    // Initialize with default zones
    this.initializeDefaultZones();
  }

  private initializeDefaultZones(): void {
    const defaultZones: Zone[] = [
      {
        id: 'home-zone',
        name: 'Home',
        type: 'home',
        latitude: 37.7749, // San Francisco coordinates as example
        longitude: -122.4194,
        radius: 50,
        isActive: true,
        deviceIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'office-zone',
        name: 'Office',
        type: 'office',
        latitude: 37.7849,
        longitude: -122.4094,
        radius: 30,
        isActive: true,
        deviceIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultZones.forEach(zone => {
      this.zones.set(zone.id, zone);
    });
  }

  async createZone(zoneData: Omit<Zone, 'id' | 'createdAt' | 'updatedAt'>): Promise<Zone> {
    const zone: Zone = {
      ...zoneData,
      id: `zone-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.zones.set(zone.id, zone);
    return zone;
  }

  async updateZone(zoneId: string, updates: Partial<Zone>): Promise<Zone | null> {
    const zone = this.zones.get(zoneId);
    if (!zone) return null;

    const updatedZone: Zone = {
      ...zone,
      ...updates,
      updatedAt: new Date()
    };

    this.zones.set(zoneId, updatedZone);
    return updatedZone;
  }

  async deleteZone(zoneId: string): Promise<boolean> {
    return this.zones.delete(zoneId);
  }

  getZones(): Zone[] {
    return Array.from(this.zones.values());
  }

  getActiveZones(): Zone[] {
    return this.getZones().filter(zone => zone.isActive);
  }

  async addDeviceToZone(zoneId: string, deviceId: string): Promise<boolean> {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;

    if (!zone.deviceIds.includes(deviceId)) {
      zone.deviceIds.push(deviceId);
      zone.updatedAt = new Date();
    }

    return true;
  }

  async removeDeviceFromZone(zoneId: string, deviceId: string): Promise<boolean> {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;

    const index = zone.deviceIds.indexOf(deviceId);
    if (index > -1) {
      zone.deviceIds.splice(index, 1);
      zone.updatedAt = new Date();
    }

    return true;
  }

  checkDeviceInZone(deviceId: string, latitude: number, longitude: number): Zone | null {
    const activeZones = this.getActiveZones();
    
    for (const zone of activeZones) {
      if (zone.deviceIds.includes(deviceId)) {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          zone.latitude,
          zone.longitude
        );
        
        if (distance <= zone.radius) {
          return zone;
        }
      }
    }

    return null;
  }

  onZoneEvent(callback: (event: ZoneEvent) => void): void {
    this.onZoneEventCallback = callback;
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    
    // Simulate location monitoring
    this.monitoringInterval = setInterval(() => {
      this.simulateLocationUpdates();
    }, 5000); // Check every 5 seconds
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  private simulateLocationUpdates(): void {
    // In a real app, this would get actual device locations via BLE proximity
    // For simulation, we'll randomly move devices in and out of zones
    
    const activeZones = this.getActiveZones();
    const deviceIds = ['device-1', 'device-2', 'device-3']; // Mock device IDs

    deviceIds.forEach(deviceId => {
      const lastPosition = this.lastKnownPositions.get(deviceId);
      
      // Simulate random movement
      const randomZone = activeZones[Math.floor(Math.random() * activeZones.length)];
      if (!randomZone) return;

      // Add some randomness to position within/outside zone
      const offsetLat = (Math.random() - 0.5) * 0.001; // ~100m variation
      const offsetLng = (Math.random() - 0.5) * 0.001;
      
      const newLat = randomZone.latitude + offsetLat;
      const newLng = randomZone.longitude + offsetLng;
      
      const currentZone = this.checkDeviceInZone(deviceId, newLat, newLng);
      const previousZoneId = lastPosition?.zoneId;
      const currentZoneId = currentZone?.id;

      // Check for zone transitions
      if (previousZoneId !== currentZoneId) {
        if (previousZoneId && !currentZoneId) {
          // Device left a zone
          this.onZoneEventCallback?.({
            type: 'exit',
            deviceId,
            zoneId: previousZoneId,
            timestamp: new Date()
          });
        } else if (!previousZoneId && currentZoneId) {
          // Device entered a zone
          this.onZoneEventCallback?.({
            type: 'enter',
            deviceId,
            zoneId: currentZoneId,
            timestamp: new Date()
          });
        } else if (previousZoneId && currentZoneId && previousZoneId !== currentZoneId) {
          // Device moved from one zone to another
          this.onZoneEventCallback?.({
            type: 'exit',
            deviceId,
            zoneId: previousZoneId,
            timestamp: new Date()
          });
          
          this.onZoneEventCallback?.({
            type: 'enter',
            deviceId,
            zoneId: currentZoneId,
            timestamp: new Date()
          });
        }
      }

      // Update last known position
      this.lastKnownPositions.set(deviceId, {
        latitude: newLat,
        longitude: newLng,
        zoneId: currentZoneId
      });
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula to calculate distance between two points
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}

export const zoneManager = new ZoneManager();