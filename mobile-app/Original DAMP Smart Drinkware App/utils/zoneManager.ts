/**
 * Zone Management System for DAMP Smart Drinkware
 * 
 * Handles zone-based operations including geofencing, zone hierarchies,
 * device tracking, and location-based notifications.
 * 
 * @example
 * ```typescript
 * import { zoneManager } from '@/utils/zoneManager';
 * 
 * // Create a new zone
 * const homeZone = await zoneManager.createZone({
 *   name: 'Home',
 *   type: 'home',
 *   latitude: 37.7749,
 *   longitude: -122.4194,
 *   radius: 50
 * });
 * 
 * // Add device to zone
 * await zoneManager.addDeviceToZone(homeZone.id, 'device-123');
 * 
 * // Start monitoring
 * zoneManager.startMonitoring();
 * ```
 */

import { notificationManager } from '@/lib/notifications';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Zone types for different use cases
 */
export type ZoneType = 'home' | 'office' | 'school' | 'custom' | 'no-alert' | 'safe';

/**
 * Zone priority levels for conflict resolution
 */
export type ZonePriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Zone status
 */
export type ZoneStatus = 'active' | 'inactive' | 'paused' | 'archived';

/**
 * Zone event types
 */
export type ZoneEventType = 'enter' | 'exit' | 'dwell' | 'breach' | 'proximity';

/**
 * Zone permission levels
 */
export type ZonePermission = 'owner' | 'admin' | 'member' | 'viewer';

/**
 * Zone input parameters for creation
 */
export interface ZoneInput {
  /** Zone display name */
  name: string;
  /** Zone type */
  type: ZoneType;
  /** Zone description */
  description?: string;
  /** Center latitude coordinate */
  latitude: number;
  /** Center longitude coordinate */
  longitude: number;
  /** Zone radius in meters */
  radius: number;
  /** Zone priority for conflict resolution */
  priority?: ZonePriority;
  /** Zone status */
  status?: ZoneStatus;
  /** Parent zone ID for hierarchies */
  parentZoneId?: string;
  /** Zone-specific settings */
  settings?: ZoneSettings;
  /** Zone metadata */
  metadata?: Record<string, any>;
}

/**
 * Zone settings configuration
 */
export interface ZoneSettings {
  /** Enable entry notifications */
  notifyOnEntry?: boolean;
  /** Enable exit notifications */
  notifyOnExit?: boolean;
  /** Enable dwell time notifications */
  notifyOnDwell?: boolean;
  /** Dwell time threshold in minutes */
  dwellTimeThreshold?: number;
  /** Enable breach notifications */
  notifyOnBreach?: boolean;
  /** Auto-activate devices in zone */
  autoActivateDevices?: boolean;
  /** Shared with family members */
  isShared?: boolean;
  /** Require confirmation for alerts */
  requireConfirmation?: boolean;
  /** Custom notification message */
  customMessage?: string;
}

/**
 * Complete zone object
 */
export interface Zone extends Required<Omit<ZoneInput, 'settings' | 'metadata'>> {
  /** Unique zone identifier */
  id: string;
  /** Zone creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Zone creator user ID */
  createdBy: string;
  /** Devices currently in this zone */
  deviceIds: string[];
  /** Child zone IDs */
  childZoneIds: string[];
  /** Zone settings */
  settings: ZoneSettings;
  /** Zone metadata */
  metadata: Record<string, any>;
  /** Zone statistics */
  stats: ZoneStats;
}

/**
 * Zone statistics
 */
export interface ZoneStats {
  /** Total entries */
  totalEntries: number;
  /** Total exits */
  totalExits: number;
  /** Average dwell time in minutes */
  averageDwellTime: number;
  /** Last activity timestamp */
  lastActivity?: Date;
  /** Most active device */
  mostActiveDevice?: string;
}

/**
 * Zone event data
 */
export interface ZoneEvent {
  /** Event type */
  type: ZoneEventType;
  /** Zone ID */
  zoneId: string;
  /** Device ID */
  deviceId: string;
  /** Event timestamp */
  timestamp: Date;
  /** Device location at event time */
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  /** Additional event data */
  metadata?: Record<string, any>;
}

/**
 * Zone boundary check result
 */
export interface ZoneBoundaryResult {
  /** Whether device is inside zone */
  isInside: boolean;
  /** Distance from zone center in meters */
  distanceFromCenter: number;
  /** Distance from zone boundary in meters (negative if inside) */
  distanceFromBoundary: number;
  /** Zone that was checked */
  zone: Zone;
}

/**
 * Zone operation result
 */
export interface ZoneOperationResult<T = Zone> {
  /** Whether operation was successful */
  success: boolean;
  /** Result data */
  data?: T;
  /** Error message if failed */
  error?: string;
  /** Additional error details */
  errorDetails?: any;
  /** Operation timestamp */
  timestamp: Date;
  /** Operation type */
  operation: string;
}

/**
 * Zone validation result
 */
export interface ZoneValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
}

/**
 * Zone hierarchy node
 */
export interface ZoneHierarchyNode {
  /** Zone data */
  zone: Zone;
  /** Parent node */
  parent?: ZoneHierarchyNode;
  /** Child nodes */
  children: ZoneHierarchyNode[];
  /** Depth in hierarchy */
  depth: number;
}

/**
 * Zone access control entry
 */
export interface ZoneAccessControl {
  /** User ID */
  userId: string;
  /** Permission level */
  permission: ZonePermission;
  /** Granted timestamp */
  grantedAt: Date;
  /** Granted by user ID */
  grantedBy: string;
  /** Expiration timestamp */
  expiresAt?: Date;
}

/**
 * Zone monitoring options
 */
export interface ZoneMonitoringOptions {
  /** Monitoring interval in milliseconds */
  interval?: number;
  /** Enable high accuracy location */
  highAccuracy?: boolean;
  /** Location timeout in milliseconds */
  timeout?: number;
  /** Maximum location age in milliseconds */
  maximumAge?: number;
  /** Enable background monitoring */
  backgroundMonitoring?: boolean;
}

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

/** Default monitoring interval in milliseconds */
const DEFAULT_MONITORING_INTERVAL = 5000;

/** Maximum zone radius in meters */
const MAX_ZONE_RADIUS = 10000;

/** Minimum zone radius in meters */
const MIN_ZONE_RADIUS = 5;

/** Maximum zones per user */
const MAX_ZONES_PER_USER = 50;

/** Maximum zone hierarchy depth */
const MAX_HIERARCHY_DEPTH = 5;

/** Default zone settings */
const DEFAULT_ZONE_SETTINGS: ZoneSettings = {
  notifyOnEntry: true,
  notifyOnExit: true,
  notifyOnDwell: false,
  dwellTimeThreshold: 30,
  notifyOnBreach: false,
  autoActivateDevices: false,
  isShared: false,
  requireConfirmation: false,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculates distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Generates a unique zone ID
 */
function generateZoneId(): string {
  return `zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates a log entry for zone operations
 */
function log(
  level: 'info' | 'warn' | 'error',
  operation: string,
  message: string,
  data?: any
): void {
  const timestamp = new Date().toISOString();
  console[level](`[ZoneManager] ${timestamp} [${level.toUpperCase()}] ${operation}: ${message}`, data || '');
}

// ============================================================================
// ZONE MANAGER CLASS
// ============================================================================

export class ZoneManager {
  private zones: Map<string, Zone> = new Map();
  private deviceZoneMap: Map<string, string> = new Map();
  private zoneAccessControl: Map<string, ZoneAccessControl[]> = new Map();
  private eventListeners: Array<(event: ZoneEvent) => void> = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private lastKnownPositions: Map<string, { latitude: number; longitude: number; timestamp: Date }> = new Map();
  private dwellTimers: Map<string, NodeJS.Timeout> = new Map();

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  /**
   * Validates zone input parameters
   */
  validateZoneInput(input: ZoneInput): ZoneValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!input.name || typeof input.name !== 'string') {
      errors.push('Zone name is required and must be a string');
    } else if (input.name.trim().length < 1) {
      errors.push('Zone name cannot be empty');
    } else if (input.name.length > 50) {
      errors.push('Zone name must not exceed 50 characters');
    }

    if (!input.type || !['home', 'office', 'school', 'custom', 'no-alert', 'safe'].includes(input.type)) {
      errors.push('Invalid zone type');
    }

    // Validate coordinates
    if (typeof input.latitude !== 'number' || input.latitude < -90 || input.latitude > 90) {
      errors.push('Latitude must be a number between -90 and 90');
    }

    if (typeof input.longitude !== 'number' || input.longitude < -180 || input.longitude > 180) {
      errors.push('Longitude must be a number between -180 and 180');
    }

    // Validate radius
    if (typeof input.radius !== 'number' || input.radius < MIN_ZONE_RADIUS || input.radius > MAX_ZONE_RADIUS) {
      errors.push(`Radius must be between ${MIN_ZONE_RADIUS} and ${MAX_ZONE_RADIUS} meters`);
    }

    // Validate priority
    if (input.priority && !['low', 'medium', 'high', 'critical'].includes(input.priority)) {
      errors.push('Invalid zone priority');
    }

    // Validate status
    if (input.status && !['active', 'inactive', 'paused', 'archived'].includes(input.status)) {
      errors.push('Invalid zone status');
    }

    // Check for overlapping zones
    const existingZones = Array.from(this.zones.values());
    const overlapping = existingZones.filter(zone => {
      const distance = calculateDistance(
        input.latitude,
        input.longitude,
        zone.latitude,
        zone.longitude
      );
      return distance < (input.radius + zone.radius);
    });

    if (overlapping.length > 0) {
      warnings.push(`Zone overlaps with ${overlapping.length} existing zone(s)`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates zone hierarchy to prevent cycles
   */
  private validateHierarchy(zoneId: string, parentZoneId: string): boolean {
    const visited = new Set<string>();
    let currentId: string | undefined = parentZoneId;

    while (currentId) {
      if (visited.has(currentId)) {
        return false; // Cycle detected
      }
      if (currentId === zoneId) {
        return false; // Would create cycle
      }
      visited.add(currentId);
      currentId = this.zones.get(currentId)?.parentZoneId;
    }

    return visited.size <= MAX_HIERARCHY_DEPTH;
  }

  // ============================================================================
  // CORE ZONE MANAGEMENT
  // ============================================================================

  /**
   * Creates a new zone
   */
  async createZone(
    input: ZoneInput,
    createdBy: string = 'system'
  ): Promise<ZoneOperationResult<Zone>> {
    const operation = 'createZone';
    
    try {
      log('info', operation, 'Creating new zone', { input, createdBy });

      // Validate input
      const validation = this.validateZoneInput(input);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
          errorDetails: validation,
          timestamp: new Date(),
          operation,
        };
      }

      // Check zone limit
      const userZones = Array.from(this.zones.values()).filter(z => z.createdBy === createdBy);
      if (userZones.length >= MAX_ZONES_PER_USER) {
        return {
          success: false,
          error: `Maximum zones limit reached (${MAX_ZONES_PER_USER})`,
          timestamp: new Date(),
          operation,
        };
      }

      // Validate hierarchy if parent specified
      if (input.parentZoneId) {
        const parentZone = this.zones.get(input.parentZoneId);
        if (!parentZone) {
          return {
            success: false,
            error: 'Parent zone not found',
            timestamp: new Date(),
            operation,
          };
        }

        const zoneId = generateZoneId();
        if (!this.validateHierarchy(zoneId, input.parentZoneId)) {
          return {
            success: false,
            error: 'Invalid hierarchy: would create cycle or exceed depth limit',
            timestamp: new Date(),
            operation,
          };
        }
      }

      // Create zone object
      const now = new Date();
      const zone: Zone = {
        id: generateZoneId(),
        name: input.name.trim(),
        type: input.type,
        description: input.description || '',
        latitude: input.latitude,
        longitude: input.longitude,
        radius: input.radius,
        priority: input.priority || 'medium',
        status: input.status || 'active',
        parentZoneId: input.parentZoneId || '',
        createdAt: now,
        updatedAt: now,
        createdBy,
        deviceIds: [],
        childZoneIds: [],
        settings: { ...DEFAULT_ZONE_SETTINGS, ...input.settings },
        metadata: input.metadata || {},
        stats: {
          totalEntries: 0,
          totalExits: 0,
          averageDwellTime: 0,
        },
      };

      // Store zone
      this.zones.set(zone.id, zone);

      // Update parent zone if specified
      if (zone.parentZoneId) {
        const parentZone = this.zones.get(zone.parentZoneId);
        if (parentZone) {
          parentZone.childZoneIds.push(zone.id);
          parentZone.updatedAt = now;
        }
      }

      // Initialize access control
      this.zoneAccessControl.set(zone.id, [{
        userId: createdBy,
        permission: 'owner',
        grantedAt: now,
        grantedBy: createdBy,
      }]);

      log('info', operation, 'Zone created successfully', { zoneId: zone.id });

      return {
        success: true,
        data: zone,
        timestamp: new Date(),
        operation,
      };

    } catch (error) {
      log('error', operation, 'Failed to create zone', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        errorDetails: error,
        timestamp: new Date(),
        operation,
      };
    }
  }

  /**
   * Updates an existing zone
   */
  async updateZone(
    zoneId: string,
    updates: Partial<ZoneInput>,
    updatedBy: string = 'system'
  ): Promise<ZoneOperationResult<Zone>> {
    const operation = 'updateZone';

    try {
      log('info', operation, 'Updating zone', { zoneId, updates, updatedBy });

      const existingZone = this.zones.get(zoneId);
      if (!existingZone) {
        return {
          success: false,
          error: 'Zone not found',
          timestamp: new Date(),
          operation,
        };
      }

      // Check permissions
      if (!this.hasZonePermission(zoneId, updatedBy, 'admin')) {
        return {
          success: false,
          error: 'Insufficient permissions to update zone',
          timestamp: new Date(),
          operation,
        };
      }

      // Validate updates
      const mergedInput = { ...existingZone, ...updates };
      const validation = this.validateZoneInput(mergedInput);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
          errorDetails: validation,
          timestamp: new Date(),
          operation,
        };
      }

      // Validate hierarchy changes
      if (updates.parentZoneId !== undefined && updates.parentZoneId !== existingZone.parentZoneId) {
        if (updates.parentZoneId && !this.validateHierarchy(zoneId, updates.parentZoneId)) {
          return {
            success: false,
            error: 'Invalid hierarchy: would create cycle or exceed depth limit',
            timestamp: new Date(),
            operation,
          };
        }
      }

      // Apply updates
      const updatedZone: Zone = {
        ...existingZone,
        ...updates,
        id: zoneId, // Ensure ID cannot be changed
        updatedAt: new Date(),
        settings: { ...existingZone.settings, ...updates.settings },
        metadata: { ...existingZone.metadata, ...updates.metadata },
      };

      // Handle parent zone changes
      if (updates.parentZoneId !== undefined && updates.parentZoneId !== existingZone.parentZoneId) {
        // Remove from old parent
        if (existingZone.parentZoneId) {
          const oldParent = this.zones.get(existingZone.parentZoneId);
          if (oldParent) {
            oldParent.childZoneIds = oldParent.childZoneIds.filter(id => id !== zoneId);
            oldParent.updatedAt = new Date();
          }
        }

        // Add to new parent
        if (updates.parentZoneId) {
          const newParent = this.zones.get(updates.parentZoneId);
          if (newParent) {
            newParent.childZoneIds.push(zoneId);
            newParent.updatedAt = new Date();
          }
        }
      }

      this.zones.set(zoneId, updatedZone);

      log('info', operation, 'Zone updated successfully', { zoneId });

      return {
        success: true,
        data: updatedZone,
        timestamp: new Date(),
        operation,
      };

    } catch (error) {
      log('error', operation, 'Failed to update zone', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        errorDetails: error,
        timestamp: new Date(),
        operation,
      };
    }
  }

  /**
   * Deletes a zone
   */
  async deleteZone(
    zoneId: string,
    deletedBy: string = 'system'
  ): Promise<ZoneOperationResult<Zone>> {
    const operation = 'deleteZone';

    try {
      log('info', operation, 'Deleting zone', { zoneId, deletedBy });

      const zone = this.zones.get(zoneId);
      if (!zone) {
        return {
          success: false,
          error: 'Zone not found',
          timestamp: new Date(),
          operation,
        };
      }

      // Check permissions
      if (!this.hasZonePermission(zoneId, deletedBy, 'owner')) {
        return {
          success: false,
          error: 'Insufficient permissions to delete zone',
          timestamp: new Date(),
          operation,
        };
      }

      // Handle child zones
      if (zone.childZoneIds.length > 0) {
        return {
          success: false,
          error: 'Cannot delete zone with child zones. Delete child zones first.',
          timestamp: new Date(),
          operation,
        };
      }

      // Remove devices from zone
      zone.deviceIds.forEach(deviceId => {
        this.deviceZoneMap.delete(deviceId);
      });

      // Remove from parent zone
      if (zone.parentZoneId) {
        const parentZone = this.zones.get(zone.parentZoneId);
        if (parentZone) {
          parentZone.childZoneIds = parentZone.childZoneIds.filter(id => id !== zoneId);
          parentZone.updatedAt = new Date();
        }
      }

      // Clean up timers
      this.dwellTimers.forEach((timer, key) => {
        if (key.startsWith(`${zoneId}-`)) {
          clearTimeout(timer);
          this.dwellTimers.delete(key);
        }
      });

      // Remove zone and access control
      this.zones.delete(zoneId);
      this.zoneAccessControl.delete(zoneId);

      log('info', operation, 'Zone deleted successfully', { zoneId });

      return {
        success: true,
        data: zone,
        timestamp: new Date(),
        operation,
      };

    } catch (error) {
      log('error', operation, 'Failed to delete zone', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        errorDetails: error,
        timestamp: new Date(),
        operation,
      };
    }
  }

  // ============================================================================
  // DEVICE MANAGEMENT
  // ============================================================================

  /**
   * Adds a device to a zone
   */
  async addDeviceToZone(zoneId: string, deviceId: string): Promise<ZoneOperationResult<Zone>> {
    const operation = 'addDeviceToZone';

    try {
      const zone = this.zones.get(zoneId);
      if (!zone) {
        return {
          success: false,
          error: 'Zone not found',
          timestamp: new Date(),
          operation,
        };
      }

      // Remove device from current zone if any
      const currentZoneId = this.deviceZoneMap.get(deviceId);
      if (currentZoneId && currentZoneId !== zoneId) {
        await this.removeDeviceFromZone(currentZoneId, deviceId);
      }

      // Add device to zone
      if (!zone.deviceIds.includes(deviceId)) {
        zone.deviceIds.push(deviceId);
        zone.updatedAt = new Date();
      }

      this.deviceZoneMap.set(deviceId, zoneId);

      log('info', operation, 'Device added to zone', { zoneId, deviceId });

      return {
        success: true,
        data: zone,
        timestamp: new Date(),
        operation,
      };

    } catch (error) {
      log('error', operation, 'Failed to add device to zone', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        errorDetails: error,
        timestamp: new Date(),
        operation,
      };
    }
  }

  /**
   * Removes a device from a zone
   */
  async removeDeviceFromZone(zoneId: string, deviceId: string): Promise<ZoneOperationResult<Zone>> {
    const operation = 'removeDeviceFromZone';

    try {
      const zone = this.zones.get(zoneId);
      if (!zone) {
        return {
          success: false,
          error: 'Zone not found',
          timestamp: new Date(),
          operation,
        };
      }

      // Remove device from zone
      zone.deviceIds = zone.deviceIds.filter(id => id !== deviceId);
      zone.updatedAt = new Date();

      this.deviceZoneMap.delete(deviceId);

      // Clear any dwell timers for this device in this zone
      const timerKey = `${zoneId}-${deviceId}`;
      const timer = this.dwellTimers.get(timerKey);
      if (timer) {
        clearTimeout(timer);
        this.dwellTimers.delete(timerKey);
      }

      log('info', operation, 'Device removed from zone', { zoneId, deviceId });

      return {
        success: true,
        data: zone,
        timestamp: new Date(),
        operation,
      };

    } catch (error) {
      log('error', operation, 'Failed to remove device from zone', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        errorDetails: error,
        timestamp: new Date(),
        operation,
      };
    }
  }

  // ============================================================================
  // BOUNDARY DETECTION
  // ============================================================================

  /**
   * Checks if a device is within a zone boundary
   */
  checkDeviceInZone(
    deviceId: string,
    latitude: number,
    longitude: number,
    zoneId?: string
  ): ZoneBoundaryResult | null {
    const zonesToCheck = zoneId 
      ? [this.zones.get(zoneId)].filter(Boolean) as Zone[]
      : Array.from(this.zones.values()).filter(z => z.status === 'active');

    let closestResult: ZoneBoundaryResult | null = null;
    let minDistance = Infinity;

    for (const zone of zonesToCheck) {
      const distanceFromCenter = calculateDistance(
        latitude,
        longitude,
        zone.latitude,
        zone.longitude
      );

      const distanceFromBoundary = distanceFromCenter - zone.radius;
      const isInside = distanceFromBoundary <= 0;

      const result: ZoneBoundaryResult = {
        isInside,
        distanceFromCenter,
        distanceFromBoundary,
        zone,
      };

      if (isInside && Math.abs(distanceFromBoundary) < minDistance) {
        minDistance = Math.abs(distanceFromBoundary);
        closestResult = result;
      }
    }

    return closestResult;
  }

  /**
   * Processes device location update and triggers zone events
   */
  async processLocationUpdate(
    deviceId: string,
    latitude: number,
    longitude: number,
    accuracy?: number
  ): Promise<ZoneEvent[]> {
    const events: ZoneEvent[] = [];
    const timestamp = new Date();
    const location = { latitude, longitude, accuracy };

    // Get previous position
    const previousPosition = this.lastKnownPositions.get(deviceId);
    const currentZoneId = this.deviceZoneMap.get(deviceId);

    // Update position
    this.lastKnownPositions.set(deviceId, { latitude, longitude, timestamp });

    // Check all active zones
    const activeZones = Array.from(this.zones.values()).filter(z => z.status === 'active');
    
    for (const zone of activeZones) {
      const boundaryResult = this.checkDeviceInZone(deviceId, latitude, longitude, zone.id);
      const wasInZone = currentZoneId === zone.id;
      const isInZone = boundaryResult?.isInside || false;

      // Zone entry
      if (!wasInZone && isInZone) {
        await this.addDeviceToZone(zone.id, deviceId);
        
        const event: ZoneEvent = {
          type: 'enter',
          zoneId: zone.id,
          deviceId,
          timestamp,
          location,
        };
        
        events.push(event);
        this.notifyEvent(event);
        this.updateZoneStats(zone.id, 'entry');

        // Start dwell timer if enabled
        if (zone.settings.notifyOnDwell && zone.settings.dwellTimeThreshold) {
          this.startDwellTimer(zone.id, deviceId, zone.settings.dwellTimeThreshold);
        }
      }
      
      // Zone exit
      else if (wasInZone && !isInZone) {
        await this.removeDeviceFromZone(zone.id, deviceId);
        
        const event: ZoneEvent = {
          type: 'exit',
          zoneId: zone.id,
          deviceId,
          timestamp,
          location,
        };
        
        events.push(event);
        this.notifyEvent(event);
        this.updateZoneStats(zone.id, 'exit');
      }
    }

    return events;
  }

  // ============================================================================
  // MONITORING
  // ============================================================================

  /**
   * Starts zone monitoring
   */
  startMonitoring(options: ZoneMonitoringOptions = {}): void {
    if (this.isMonitoring) {
      log('warn', 'startMonitoring', 'Monitoring already active');
      return;
    }

    const interval = options.interval || DEFAULT_MONITORING_INTERVAL;
    
    this.isMonitoring = true;
    log('info', 'startMonitoring', 'Zone monitoring started', { interval });

    this.monitoringInterval = setInterval(() => {
      this.simulateLocationUpdates();
    }, interval);
  }

  /**
   * Stops zone monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    // Clear all dwell timers
    this.dwellTimers.forEach(timer => clearTimeout(timer));
    this.dwellTimers.clear();

    log('info', 'stopMonitoring', 'Zone monitoring stopped');
  }

  /**
   * Simulates location updates for demo purposes
   */
  private simulateLocationUpdates(): void {
    const deviceIds = ['device-1', 'device-2', 'device-3'];
    const zones = Array.from(this.zones.values()).filter(z => z.status === 'active');

    if (zones.length === 0) return;

    deviceIds.forEach(deviceId => {
      const randomZone = zones[Math.floor(Math.random() * zones.length)];
      
      // Generate random position near zone center
      const offsetLat = (Math.random() - 0.5) * 0.002; // ~200m variation
      const offsetLng = (Math.random() - 0.5) * 0.002;
      
      const lat = randomZone.latitude + offsetLat;
      const lng = randomZone.longitude + offsetLng;
      
      this.processLocationUpdate(deviceId, lat, lng, 10);
    });
  }

  // ============================================================================
  // EVENT HANDLING
  // ============================================================================

  /**
   * Adds an event listener
   */
  addEventListener(listener: (event: ZoneEvent) => void): () => void {
    this.eventListeners.push(listener);
    
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notifies all event listeners
   */
  private notifyEvent(event: ZoneEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        log('error', 'notifyEvent', 'Event listener error', error);
      }
    });

    // Send system notification if enabled
    const zone = this.zones.get(event.zoneId);
    if (zone && this.shouldNotify(zone, event.type)) {
      this.sendNotification(zone, event);
    }
  }

  /**
   * Determines if notification should be sent
   */
  private shouldNotify(zone: Zone, eventType: ZoneEventType): boolean {
    switch (eventType) {
      case 'enter':
        return zone.settings.notifyOnEntry || false;
      case 'exit':
        return zone.settings.notifyOnExit || false;
      case 'dwell':
        return zone.settings.notifyOnDwell || false;
      case 'breach':
        return zone.settings.notifyOnBreach || false;
      default:
        return false;
    }
  }

  /**
   * Sends notification for zone event
   */
  private sendNotification(zone: Zone, event: ZoneEvent): void {
    const message = zone.settings.customMessage || this.getDefaultMessage(zone, event);
    
    notificationManager.showNotification({
      type: 'zone',
      title: this.getNotificationTitle(event.type),
      message,
      zoneId: zone.id,
      deviceId: event.deviceId,
      priority: zone.priority === 'critical' ? 'high' : 'medium',
    });
  }

  /**
   * Gets default notification message
   */
  private getDefaultMessage(zone: Zone, event: ZoneEvent): string {
    switch (event.type) {
      case 'enter':
        return `Device entered ${zone.name}`;
      case 'exit':
        return `Device left ${zone.name}`;
      case 'dwell':
        return `Device has been in ${zone.name} for ${zone.settings.dwellTimeThreshold} minutes`;
      case 'breach':
        return `Zone breach detected in ${zone.name}`;
      default:
        return `Zone event in ${zone.name}`;
    }
  }

  /**
   * Gets notification title for event type
   */
  private getNotificationTitle(eventType: ZoneEventType): string {
    switch (eventType) {
      case 'enter':
        return 'Zone Entry';
      case 'exit':
        return 'Zone Exit';
      case 'dwell':
        return 'Dwell Alert';
      case 'breach':
        return 'Zone Breach';
      default:
        return 'Zone Event';
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Starts dwell timer for device in zone
   */
  private startDwellTimer(zoneId: string, deviceId: string, thresholdMinutes: number): void {
    const timerKey = `${zoneId}-${deviceId}`;
    
    // Clear existing timer
    const existingTimer = this.dwellTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Start new timer
    const timer = setTimeout(() => {
      const event: ZoneEvent = {
        type: 'dwell',
        zoneId,
        deviceId,
        timestamp: new Date(),
        location: this.lastKnownPositions.get(deviceId) || { latitude: 0, longitude: 0 },
      };
      
      this.notifyEvent(event);
      this.dwellTimers.delete(timerKey);
    }, thresholdMinutes * 60 * 1000);

    this.dwellTimers.set(timerKey, timer);
  }

  /**
   * Updates zone statistics
   */
  private updateZoneStats(zoneId: string, eventType: 'entry' | 'exit'): void {
    const zone = this.zones.get(zoneId);
    if (!zone) return;

    if (eventType === 'entry') {
      zone.stats.totalEntries++;
    } else {
      zone.stats.totalExits++;
    }

    zone.stats.lastActivity = new Date();
    zone.updatedAt = new Date();
  }

  /**
   * Checks if user has permission for zone
   */
  hasZonePermission(zoneId: string, userId: string, requiredPermission: ZonePermission): boolean {
    const accessList = this.zoneAccessControl.get(zoneId);
    if (!accessList) return false;

    const userAccess = accessList.find(access => access.userId === userId);
    if (!userAccess) return false;

    // Check expiration
    if (userAccess.expiresAt && userAccess.expiresAt < new Date()) {
      return false;
    }

    // Permission hierarchy: owner > admin > member > viewer
    const permissionLevels = { viewer: 1, member: 2, admin: 3, owner: 4 };
    return permissionLevels[userAccess.permission] >= permissionLevels[requiredPermission];
  }

  // ============================================================================
  // QUERY METHODS
  // ============================================================================

  /**
   * Gets all zones
   */
  getAllZones(): Zone[] {
    return Array.from(this.zones.values());
  }

  /**
   * Gets zones by type
   */
  getZonesByType(type: ZoneType): Zone[] {
    return this.getAllZones().filter(zone => zone.type === type);
  }

  /**
   * Gets active zones
   */
  getActiveZones(): Zone[] {
    return this.getAllZones().filter(zone => zone.status === 'active');
  }

  /**
   * Gets zone by ID
   */
  getZone(zoneId: string): Zone | null {
    return this.zones.get(zoneId) || null;
  }

  /**
   * Gets zones for user
   */
  getUserZones(userId: string): Zone[] {
    return this.getAllZones().filter(zone => 
      this.hasZonePermission(zone.id, userId, 'viewer')
    );
  }

  /**
   * Gets device's current zone
   */
  getDeviceZone(deviceId: string): Zone | null {
    const zoneId = this.deviceZoneMap.get(deviceId);
    return zoneId ? this.zones.get(zoneId) || null : null;
  }

  /**
   * Gets zone hierarchy
   */
  getZoneHierarchy(rootZoneId?: string): ZoneHierarchyNode[] {
    const buildNode = (zone: Zone, parent?: ZoneHierarchyNode): ZoneHierarchyNode => {
      const node: ZoneHierarchyNode = {
        zone,
        parent,
        children: [],
        depth: parent ? parent.depth + 1 : 0,
      };

      // Add child nodes
      zone.childZoneIds.forEach(childId => {
        const childZone = this.zones.get(childId);
        if (childZone) {
          node.children.push(buildNode(childZone, node));
        }
      });

      return node;
    };

    if (rootZoneId) {
      const rootZone = this.zones.get(rootZoneId);
      return rootZone ? [buildNode(rootZone)] : [];
    }

    // Get all root zones (zones without parents)
    const rootZones = this.getAllZones().filter(zone => !zone.parentZoneId);
    return rootZones.map(zone => buildNode(zone));
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initializes the zone manager with sample data
   */
  initializeWithSampleData(): void {
    log('info', 'initializeWithSampleData', 'Initializing with sample zones');

    const sampleZones: ZoneInput[] = [
      {
        name: 'Home',
        type: 'home',
        description: 'Primary residence',
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 50,
        priority: 'high',
        settings: {
          notifyOnEntry: false,
          notifyOnExit: true,
          autoActivateDevices: true,
        },
      },
      {
        name: 'Office',
        type: 'office',
        description: 'Workplace location',
        latitude: 37.7849,
        longitude: -122.4094,
        radius: 30,
        priority: 'medium',
        settings: {
          notifyOnEntry: true,
          notifyOnExit: true,
          notifyOnDwell: true,
          dwellTimeThreshold: 60,
        },
      },
      {
        name: 'School',
        type: 'school',
        description: 'Educational institution',
        latitude: 37.7649,
        longitude: -122.4294,
        radius: 100,
        priority: 'medium',
        settings: {
          notifyOnEntry: true,
          notifyOnExit: true,
          isShared: true,
        },
      },
    ];

    sampleZones.forEach(async (zoneInput) => {
      await this.createZone(zoneInput, 'demo-user');
    });
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const zoneManager = new ZoneManager();

// Initialize with sample data in development
if (process.env.NODE_ENV === 'development') {
  zoneManager.initializeWithSampleData();
}