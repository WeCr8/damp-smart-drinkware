/**
 * Device Management Utilities for DAMP Smart Drinkware
 * 
 * This module provides standardized functions for managing devices across the application.
 * It includes validation, error handling, logging, and consistent response formats.
 * 
 * @example
 * ```typescript
 * import { addDevice, updateDevice, removeDevice } from '@/utils/deviceManager';
 * 
 * // Add a single device
 * const result = await addDevice({
 *   name: 'Coffee Cup Handle',
 *   type: 'cup',
 *   batteryLevel: 85
 * });
 * 
 * // Add multiple devices
 * const batchResult = await addDeviceBatch([device1, device2, device3]);
 * ```
 */

import { bleManager } from '@/components/BLEManager';
import { notificationManager } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Supported device types for DAMP smart drinkware
 */
export type DeviceType = 'cup' | 'sleeve' | 'bottle' | 'bottom' | 'damp-cup';

/**
 * Device connection status
 */
export type DeviceStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

/**
 * Device input parameters for adding new devices
 */
export interface DeviceInput {
  /** Display name for the device */
  name: string;
  /** Type of DAMP device */
  type: DeviceType;
  /** Current battery level (0-100) */
  batteryLevel?: number;
  /** Device connection status */
  status?: DeviceStatus;
  /** Bluetooth device ID */
  bluetoothId?: string;
  /** Device firmware version */
  firmware?: string;
  /** Signal strength (1-5) */
  signalStrength?: number;
  /** Associated zone ID */
  zoneId?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Complete device object with all properties
 */
export interface Device extends Required<Omit<DeviceInput, 'metadata'>> {
  /** Unique device identifier */
  id: string;
  /** Device creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Last seen timestamp */
  lastSeen: Date;
  /** Whether device is currently active */
  isActive: boolean;
  /** Additional metadata */
  metadata: Record<string, any>;
  /** User ID that owns this device */
  userId: string;
}

/**
 * Standard response format for device operations
 */
export interface DeviceOperationResult<T = Device> {
  /** Whether the operation was successful */
  success: boolean;
  /** Result data (device or devices) */
  data?: T;
  /** Error message if operation failed */
  error?: string;
  /** Additional error details */
  errorDetails?: any;
  /** Operation timestamp */
  timestamp: Date;
  /** Operation type for logging */
  operation: string;
}

/**
 * Batch operation result
 */
export interface BatchOperationResult {
  /** Whether all operations were successful */
  success: boolean;
  /** Successfully processed devices */
  successful: Device[];
  /** Failed operations with errors */
  failed: Array<{
    input: DeviceInput;
    error: string;
    errorDetails?: any;
  }>;
  /** Total number of operations */
  total: number;
  /** Operation timestamp */
  timestamp: Date;
}

/**
 * Device validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
}

/**
 * Device operation options
 */
export interface DeviceOperationOptions {
  /** Operation timeout in milliseconds */
  timeout?: number;
  /** Whether to skip validation */
  skipValidation?: boolean;
  /** Whether to enable verbose logging */
  verbose?: boolean;
  /** Whether to send notifications */
  notify?: boolean;
  /** Custom metadata to include */
  metadata?: Record<string, any>;
}

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

/** Default operation timeout in milliseconds */
const DEFAULT_TIMEOUT = 10000;

/** Maximum batch size for operations */
const MAX_BATCH_SIZE = 50;

/** Device name constraints */
const DEVICE_NAME_MIN_LENGTH = 1;
const DEVICE_NAME_MAX_LENGTH = 50;

/** Valid device types */
const VALID_DEVICE_TYPES: DeviceType[] = ['cup', 'sleeve', 'bottle', 'bottom', 'damp-cup'];

/** Valid device statuses */
const VALID_DEVICE_STATUSES: DeviceStatus[] = ['connected', 'disconnected', 'connecting', 'error'];

// ============================================================================
// STORAGE AND STATE MANAGEMENT
// ============================================================================

/** In-memory device storage (in production, this would be replaced with persistent storage) */
let deviceStorage: Map<string, Device> = new Map();

/** Device operation listeners */
const deviceListeners: Array<(event: string, device: Device) => void> = [];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates a unique device ID
 * @returns Unique device identifier
 */
function generateDeviceId(): string {
  return `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates a standardized log entry
 * @param level - Log level
 * @param operation - Operation name
 * @param message - Log message
 * @param data - Additional data
 */
function log(level: 'info' | 'warn' | 'error', operation: string, message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    operation,
    message,
    data
  };
  
  console[level](`[DeviceManager] ${timestamp} [${level.toUpperCase()}] ${operation}: ${message}`, data || '');
  
  // In production, you might want to send logs to a logging service
  // logService.send(logEntry);
}

/**
 * Creates a timeout promise for operations
 * @param timeout - Timeout in milliseconds
 * @returns Promise that rejects after timeout
 */
function createTimeoutPromise(timeout: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeout}ms`));
    }, timeout);
  });
}

/**
 * Notifies device operation listeners
 * @param event - Event type
 * @param device - Device object
 */
function notifyListeners(event: string, device: Device): void {
  deviceListeners.forEach(listener => {
    try {
      listener(event, device);
    } catch (error) {
      log('error', 'notifyListeners', 'Listener error', error);
    }
  });
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates device input parameters
 * @param input - Device input to validate
 * @returns Validation result with errors and warnings
 * 
 * @example
 * ```typescript
 * const validation = validateDeviceInput({
 *   name: 'My Cup',
 *   type: 'cup',
 *   batteryLevel: 85
 * });
 * 
 * if (!validation.isValid) {
 *   console.error('Validation errors:', validation.errors);
 * }
 * ```
 */
export function validateDeviceInput(input: DeviceInput): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!input.name || typeof input.name !== 'string') {
    errors.push('Device name is required and must be a string');
  } else {
    if (input.name.length < DEVICE_NAME_MIN_LENGTH) {
      errors.push(`Device name must be at least ${DEVICE_NAME_MIN_LENGTH} character(s)`);
    }
    if (input.name.length > DEVICE_NAME_MAX_LENGTH) {
      errors.push(`Device name must not exceed ${DEVICE_NAME_MAX_LENGTH} characters`);
    }
    if (input.name.trim() !== input.name) {
      warnings.push('Device name has leading/trailing whitespace');
    }
  }

  if (!input.type) {
    errors.push('Device type is required');
  } else if (!VALID_DEVICE_TYPES.includes(input.type)) {
    errors.push(`Invalid device type. Must be one of: ${VALID_DEVICE_TYPES.join(', ')}`);
  }

  // Validate optional fields
  if (input.batteryLevel !== undefined) {
    if (typeof input.batteryLevel !== 'number' || input.batteryLevel < 0 || input.batteryLevel > 100) {
      errors.push('Battery level must be a number between 0 and 100');
    } else if (input.batteryLevel < 20) {
      warnings.push('Battery level is low (below 20%)');
    }
  }

  if (input.status && !VALID_DEVICE_STATUSES.includes(input.status)) {
    errors.push(`Invalid device status. Must be one of: ${VALID_DEVICE_STATUSES.join(', ')}`);
  }

  if (input.signalStrength !== undefined) {
    if (typeof input.signalStrength !== 'number' || input.signalStrength < 1 || input.signalStrength > 5) {
      errors.push('Signal strength must be a number between 1 and 5');
    }
  }

  if (input.bluetoothId && typeof input.bluetoothId !== 'string') {
    errors.push('Bluetooth ID must be a string');
  }

  if (input.firmware && typeof input.firmware !== 'string') {
    errors.push('Firmware version must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates that a device name is unique
 * @param name - Device name to check
 * @param excludeId - Device ID to exclude from check (for updates)
 * @returns Whether the name is unique
 */
export function isDeviceNameUnique(name: string, excludeId?: string): boolean {
  const devices = Array.from(deviceStorage.values());
  return !devices.some(device => 
    device.name.toLowerCase() === name.toLowerCase() && 
    device.id !== excludeId
  );
}

// ============================================================================
// CORE DEVICE MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Adds a new device to the system
 * @param input - Device input parameters
 * @param options - Operation options
 * @returns Promise resolving to operation result
 * 
 * @example
 * ```typescript
 * const result = await addDevice({
 *   name: 'Coffee Cup Handle',
 *   type: 'cup',
 *   batteryLevel: 85,
 *   status: 'connected'
 * });
 * 
 * if (result.success) {
 *   console.log('Device added:', result.data);
 * } else {
 *   console.error('Failed to add device:', result.error);
 * }
 * ```
 */
export async function addDevice(
  input: DeviceInput, 
  options: DeviceOperationOptions = {}
): Promise<DeviceOperationResult<Device>> {
  const startTime = Date.now();
  const operation = 'addDevice';
  const timeout = options.timeout || DEFAULT_TIMEOUT;

  try {
    log('info', operation, 'Starting device addition', { input, options });

    // Create timeout promise
    const timeoutPromise = createTimeoutPromise(timeout);
    
    // Main operation promise
    const operationPromise = (async (): Promise<DeviceOperationResult<Device>> => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const error = 'User not authenticated';
        log('error', operation, error);
        return {
          success: false,
          error,
          timestamp: new Date(),
          operation
        };
      }

      // Validate input unless skipped
      if (!options.skipValidation) {
        const validation = validateDeviceInput(input);
        if (!validation.isValid) {
          const error = `Validation failed: ${validation.errors.join(', ')}`;
          log('error', operation, error, validation);
          return {
            success: false,
            error,
            errorDetails: validation,
            timestamp: new Date(),
            operation
          };
        }

        // Log warnings
        if (validation.warnings.length > 0) {
          log('warn', operation, 'Validation warnings', validation.warnings);
        }

        // Check name uniqueness
        if (!isDeviceNameUnique(input.name)) {
          const error = 'Device name must be unique';
          log('error', operation, error);
          return {
            success: false,
            error,
            timestamp: new Date(),
            operation
          };
        }
      }

      // Create device object
      const now = new Date();
      const device: Device = {
        id: generateDeviceId(),
        name: input.name.trim(),
        type: input.type,
        batteryLevel: input.batteryLevel || 100,
        status: input.status || 'disconnected',
        bluetoothId: input.bluetoothId || '',
        firmware: input.firmware || '1.0.0',
        signalStrength: input.signalStrength || 3,
        zoneId: input.zoneId || '',
        createdAt: now,
        updatedAt: now,
        lastSeen: now,
        isActive: true,
        metadata: { ...input.metadata, ...options.metadata },
        userId: user.id
      };

      // Store device
      deviceStorage.set(device.id, device);

      // Attempt BLE connection if Bluetooth ID provided
      if (device.bluetoothId && device.status === 'connected') {
        try {
          await bleManager.connectToDevice(device.bluetoothId);
          log('info', operation, 'BLE connection established', { deviceId: device.id });
        } catch (bleError) {
          log('warn', operation, 'BLE connection failed', bleError);
          device.status = 'error';
        }
      }

      // Send notification if enabled
      if (options.notify !== false) {
        notificationManager.showNotification({
          type: 'device',
          title: 'Device Added',
          message: `${device.name} has been added successfully`,
          deviceId: device.id,
          priority: 'low'
        });
      }

      // Notify listeners
      notifyListeners('deviceAdded', device);

      const duration = Date.now() - startTime;
      log('info', operation, `Device added successfully in ${duration}ms`, { deviceId: device.id });

      return {
        success: true,
        data: device,
        timestamp: new Date(),
        operation
      };
    })();

    // Race between operation and timeout
    return await Promise.race([operationPromise, timeoutPromise]);

  } catch (error) {
    const duration = Date.now() - startTime;
    log('error', operation, `Operation failed after ${duration}ms`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      errorDetails: error,
      timestamp: new Date(),
      operation
    };
  }
}

/**
 * Updates an existing device
 * @param deviceId - Device ID to update
 * @param updates - Partial device updates
 * @param options - Operation options
 * @returns Promise resolving to operation result
 * 
 * @example
 * ```typescript
 * const result = await updateDevice('device-123', {
 *   name: 'Updated Cup Name',
 *   batteryLevel: 75
 * });
 * ```
 */
export async function updateDevice(
  deviceId: string,
  updates: Partial<DeviceInput>,
  options: DeviceOperationOptions = {}
): Promise<DeviceOperationResult<Device>> {
  const startTime = Date.now();
  const operation = 'updateDevice';
  const timeout = options.timeout || DEFAULT_TIMEOUT;

  try {
    log('info', operation, 'Starting device update', { deviceId, updates, options });

    const timeoutPromise = createTimeoutPromise(timeout);
    
    const operationPromise = (async (): Promise<DeviceOperationResult<Device>> => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const error = 'User not authenticated';
        log('error', operation, error);
        return {
          success: false,
          error,
          timestamp: new Date(),
          operation
        };
      }

      // Check if device exists
      const existingDevice = deviceStorage.get(deviceId);
      if (!existingDevice) {
        const error = `Device not found: ${deviceId}`;
        log('error', operation, error);
        return {
          success: false,
          error,
          timestamp: new Date(),
          operation
        };
      }

      // Check if device belongs to current user
      if (existingDevice.userId !== user.id) {
        const error = 'You do not have permission to update this device';
        log('error', operation, error);
        return {
          success: false,
          error,
          timestamp: new Date(),
          operation
        };
      }

      // Validate updates unless skipped
      if (!options.skipValidation && Object.keys(updates).length > 0) {
        const validation = validateDeviceInput({ ...existingDevice, ...updates });
        if (!validation.isValid) {
          const error = `Validation failed: ${validation.errors.join(', ')}`;
          log('error', operation, error, validation);
          return {
            success: false,
            error,
            errorDetails: validation,
            timestamp: new Date(),
            operation
          };
        }

        // Check name uniqueness if name is being updated
        if (updates.name && !isDeviceNameUnique(updates.name, deviceId)) {
          const error = 'Device name must be unique';
          log('error', operation, error);
          return {
            success: false,
            error,
            timestamp: new Date(),
            operation
          };
        }
      }

      // Apply updates
      const updatedDevice: Device = {
        ...existingDevice,
        ...updates,
        id: deviceId, // Ensure ID cannot be changed
        userId: user.id, // Ensure userId cannot be changed
        updatedAt: new Date(),
        metadata: { ...existingDevice.metadata, ...updates.metadata, ...options.metadata }
      };

      // Store updated device
      deviceStorage.set(deviceId, updatedDevice);

      // Handle BLE connection changes
      if (updates.status === 'connected' && updatedDevice.bluetoothId) {
        try {
          await bleManager.connectToDevice(updatedDevice.bluetoothId);
        } catch (bleError) {
          log('warn', operation, 'BLE connection failed during update', bleError);
          updatedDevice.status = 'error';
        }
      } else if (updates.status === 'disconnected' && updatedDevice.bluetoothId) {
        try {
          await bleManager.disconnectFromDevice(updatedDevice.bluetoothId);
        } catch (bleError) {
          log('warn', operation, 'BLE disconnection failed during update', bleError);
        }
      }

      // Send notification if enabled
      if (options.notify !== false) {
        notificationManager.showNotification({
          type: 'device',
          title: 'Device Updated',
          message: `${updatedDevice.name} has been updated`,
          deviceId: updatedDevice.id,
          priority: 'low'
        });
      }

      // Notify listeners
      notifyListeners('deviceUpdated', updatedDevice);

      const duration = Date.now() - startTime;
      log('info', operation, `Device updated successfully in ${duration}ms`, { deviceId });

      return {
        success: true,
        data: updatedDevice,
        timestamp: new Date(),
        operation
      };
    })();

    return await Promise.race([operationPromise, timeoutPromise]);

  } catch (error) {
    const duration = Date.now() - startTime;
    log('error', operation, `Operation failed after ${duration}ms`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      errorDetails: error,
      timestamp: new Date(),
      operation
    };
  }
}

/**
 * Removes a device from the system
 * @param deviceId - Device ID to remove
 * @param options - Operation options
 * @returns Promise resolving to operation result
 * 
 * @example
 * ```typescript
 * const result = await removeDevice('device-123');
 * if (result.success) {
 *   console.log('Device removed successfully');
 * }
 * ```
 */
export async function removeDevice(
  deviceId: string,
  options: DeviceOperationOptions = {}
): Promise<DeviceOperationResult<Device>> {
  const startTime = Date.now();
  const operation = 'removeDevice';
  const timeout = options.timeout || DEFAULT_TIMEOUT;

  try {
    log('info', operation, 'Starting device removal', { deviceId, options });

    const timeoutPromise = createTimeoutPromise(timeout);
    
    const operationPromise = (async (): Promise<DeviceOperationResult<Device>> => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const error = 'User not authenticated';
        log('error', operation, error);
        return {
          success: false,
          error,
          timestamp: new Date(),
          operation
        };
      }

      // Check if device exists
      const device = deviceStorage.get(deviceId);
      if (!device) {
        const error = `Device not found: ${deviceId}`;
        log('error', operation, error);
        return {
          success: false,
          error,
          timestamp: new Date(),
          operation
        };
      }

      // Check if device belongs to current user
      if (device.userId !== user.id) {
        const error = 'You do not have permission to remove this device';
        log('error', operation, error);
        return {
          success: false,
          error,
          timestamp: new Date(),
          operation
        };
      }

      // Disconnect from BLE if connected
      if (device.bluetoothId && device.status === 'connected') {
        try {
          await bleManager.disconnectFromDevice(device.bluetoothId);
          log('info', operation, 'BLE disconnection completed', { deviceId });
        } catch (bleError) {
          log('warn', operation, 'BLE disconnection failed during removal', bleError);
        }
      }

      // Remove from storage
      deviceStorage.delete(deviceId);

      // Send notification if enabled
      if (options.notify !== false) {
        notificationManager.showNotification({
          type: 'device',
          title: 'Device Removed',
          message: `${device.name} has been removed`,
          deviceId: device.id,
          priority: 'low'
        });
      }

      // Notify listeners
      notifyListeners('deviceRemoved', device);

      const duration = Date.now() - startTime;
      log('info', operation, `Device removed successfully in ${duration}ms`, { deviceId });

      return {
        success: true,
        data: device,
        timestamp: new Date(),
        operation
      };
    })();

    return await Promise.race([operationPromise, timeoutPromise]);

  } catch (error) {
    const duration = Date.now() - startTime;
    log('error', operation, `Operation failed after ${duration}ms`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      errorDetails: error,
      timestamp: new Date(),
      operation
    };
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Adds multiple devices in a batch operation
 * @param inputs - Array of device inputs
 * @param options - Operation options
 * @returns Promise resolving to batch operation result
 * 
 * @example
 * ```typescript
 * const devices = [
 *   { name: 'Cup 1', type: 'cup' },
 *   { name: 'Cup 2', type: 'cup' },
 *   { name: 'Bottle 1', type: 'bottle' }
 * ];
 * 
 * const result = await addDeviceBatch(devices);
 * console.log(`Added ${result.successful.length} devices, ${result.failed.length} failed`);
 * ```
 */
export async function addDeviceBatch(
  inputs: DeviceInput[],
  options: DeviceOperationOptions = {}
): Promise<BatchOperationResult> {
  const startTime = Date.now();
  const operation = 'addDeviceBatch';

  log('info', operation, `Starting batch addition of ${inputs.length} devices`, { options });

  if (inputs.length === 0) {
    return {
      success: true,
      successful: [],
      failed: [],
      total: 0,
      timestamp: new Date()
    };
  }

  if (inputs.length > MAX_BATCH_SIZE) {
    log('error', operation, `Batch size exceeds maximum of ${MAX_BATCH_SIZE}`);
    return {
      success: false,
      successful: [],
      failed: inputs.map(input => ({
        input,
        error: `Batch size exceeds maximum of ${MAX_BATCH_SIZE}`
      })),
      total: inputs.length,
      timestamp: new Date()
    };
  }

  const successful: Device[] = [];
  const failed: Array<{ input: DeviceInput; error: string; errorDetails?: any }> = [];

  // Process devices in parallel with concurrency limit
  const concurrencyLimit = 5;
  const chunks = [];
  for (let i = 0; i < inputs.length; i += concurrencyLimit) {
    chunks.push(inputs.slice(i, i + concurrencyLimit));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (input) => {
      try {
        const result = await addDevice(input, { ...options, notify: false });
        if (result.success && result.data) {
          successful.push(result.data);
        } else {
          failed.push({
            input,
            error: result.error || 'Unknown error',
            errorDetails: result.errorDetails
          });
        }
      } catch (error) {
        failed.push({
          input,
          error: error instanceof Error ? error.message : 'Unknown error',
          errorDetails: error
        });
      }
    });

    await Promise.all(promises);
  }

  const duration = Date.now() - startTime;
  const isSuccess = failed.length === 0;

  log('info', operation, `Batch operation completed in ${duration}ms`, {
    total: inputs.length,
    successful: successful.length,
    failed: failed.length
  });

  // Send summary notification if enabled
  if (options.notify !== false && successful.length > 0) {
    notificationManager.showNotification({
      type: 'device',
      title: 'Devices Added',
      message: `${successful.length} device${successful.length > 1 ? 's' : ''} added successfully`,
      priority: 'low'
    });
  }

  return {
    success: isSuccess,
    successful,
    failed,
    total: inputs.length,
    timestamp: new Date()
  };
}

// ============================================================================
// QUERY AND RETRIEVAL FUNCTIONS
// ============================================================================

/**
 * Retrieves a device by ID
 * @param deviceId - Device ID to retrieve
 * @returns Device object or null if not found
 * 
 * @example
 * ```typescript
 * const device = getDevice('device-123');
 * if (device) {
 *   console.log('Found device:', device.name);
 * }
 * ```
 */
export function getDevice(deviceId: string): Device | null {
  return deviceStorage.get(deviceId) || null;
}

/**
 * Retrieves all devices
 * @returns Array of all devices
 * 
 * @example
 * ```typescript
 * const allDevices = getAllDevices();
 * console.log(`Total devices: ${allDevices.length}`);
 * ```
 */
export function getAllDevices(): Device[] {
  return Array.from(deviceStorage.values());
}

/**
 * Retrieves devices by type
 * @param type - Device type to filter by
 * @returns Array of devices of the specified type
 * 
 * @example
 * ```typescript
 * const cups = getDevicesByType('cup');
 * console.log(`Found ${cups.length} cups`);
 * ```
 */
export function getDevicesByType(type: DeviceType): Device[] {
  return getAllDevices().filter(device => device.type === type);
}

/**
 * Retrieves devices by status
 * @param status - Device status to filter by
 * @returns Array of devices with the specified status
 * 
 * @example
 * ```typescript
 * const connectedDevices = getDevicesByStatus('connected');
 * ```
 */
export function getDevicesByStatus(status: DeviceStatus): Device[] {
  return getAllDevices().filter(device => device.status === status);
}

/**
 * Retrieves devices for the current user
 * @returns Array of devices belonging to the current user
 */
export async function getCurrentUserDevices(): Promise<Device[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    return getAllDevices().filter(device => device.userId === user.id);
  } catch (error) {
    console.error('Error getting current user devices:', error);
    return [];
  }
}

/**
 * Searches devices by name (case-insensitive partial match)
 * @param query - Search query
 * @returns Array of matching devices
 * 
 * @example
 * ```typescript
 * const results = searchDevices('coffee');
 * ```
 */
export function searchDevices(query: string): Device[] {
  const lowerQuery = query.toLowerCase();
  return getAllDevices().filter(device => 
    device.name.toLowerCase().includes(lowerQuery)
  );
}

// ============================================================================
// EVENT HANDLING
// ============================================================================

/**
 * Adds a device event listener
 * @param listener - Event listener function
 * @returns Function to remove the listener
 * 
 * @example
 * ```typescript
 * const removeListener = addDeviceListener((event, device) => {
 *   console.log(`Device ${event}:`, device.name);
 * });
 * 
 * // Later, remove the listener
 * removeListener();
 * ```
 */
export function addDeviceListener(
  listener: (event: string, device: Device) => void
): () => void {
  deviceListeners.push(listener);
  
  return () => {
    const index = deviceListeners.indexOf(listener);
    if (index > -1) {
      deviceListeners.splice(index, 1);
    }
  };
}

// ============================================================================
// UTILITY AND HELPER FUNCTIONS
// ============================================================================

/**
 * Gets device statistics
 * @returns Object with device statistics
 * 
 * @example
 * ```typescript
 * const stats = getDeviceStats();
 * console.log(`Connected: ${stats.connected}, Total: ${stats.total}`);
 * ```
 */
export function getDeviceStats() {
  const devices = getAllDevices();
  const stats = {
    total: devices.length,
    connected: devices.filter(d => d.status === 'connected').length,
    disconnected: devices.filter(d => d.status === 'disconnected').length,
    lowBattery: devices.filter(d => d.batteryLevel < 20).length,
    byType: {} as Record<DeviceType, number>
  };

  // Count by type
  VALID_DEVICE_TYPES.forEach(type => {
    stats.byType[type] = devices.filter(d => d.type === type).length;
  });

  return stats;
}

/**
 * Clears all devices (use with caution)
 * @param confirm - Confirmation string to prevent accidental clearing
 * @returns Whether the operation was successful
 * 
 * @example
 * ```typescript
 * const cleared = clearAllDevices('CONFIRM_CLEAR_ALL');
 * ```
 */
export function clearAllDevices(confirm: string): boolean {
  if (confirm !== 'CONFIRM_CLEAR_ALL') {
    log('warn', 'clearAllDevices', 'Clear operation cancelled - invalid confirmation');
    return false;
  }

  const deviceCount = deviceStorage.size;
  deviceStorage.clear();
  
  log('info', 'clearAllDevices', `Cleared ${deviceCount} devices`);
  return true;
}

/**
 * Exports device data for backup or transfer
 * @returns Serializable device data
 * 
 * @example
 * ```typescript
 * const backup = exportDeviceData();
 * localStorage.setItem('deviceBackup', JSON.stringify(backup));
 * ```
 */
export function exportDeviceData() {
  const devices = getAllDevices();
  return {
    devices,
    exportedAt: new Date().toISOString(),
    version: '1.0.0'
  };
}

/**
 * Imports device data from backup
 * @param data - Device data to import
 * @param options - Import options
 * @returns Import result
 * 
 * @example
 * ```typescript
 * const backup = JSON.parse(localStorage.getItem('deviceBackup') || '{}');
 * const result = await importDeviceData(backup);
 * ```
 */
export async function importDeviceData(
  data: any,
  options: { overwrite?: boolean; skipValidation?: boolean } = {}
): Promise<BatchOperationResult> {
  const operation = 'importDeviceData';
  
  if (!data || !Array.isArray(data.devices)) {
    log('error', operation, 'Invalid import data format');
    return {
      success: false,
      successful: [],
      failed: [{ input: data, error: 'Invalid data format' }],
      total: 0,
      timestamp: new Date()
    };
  }

  log('info', operation, `Importing ${data.devices.length} devices`, options);

  // If overwrite is enabled, clear existing devices
  if (options.overwrite) {
    clearAllDevices('CONFIRM_CLEAR_ALL');
  }

  // Convert imported devices to device inputs
  const deviceInputs: DeviceInput[] = data.devices.map((device: any) => ({
    name: device.name,
    type: device.type,
    batteryLevel: device.batteryLevel,
    status: device.status,
    bluetoothId: device.bluetoothId,
    firmware: device.firmware,
    signalStrength: device.signalStrength,
    zoneId: device.zoneId,
    metadata: device.metadata
  }));

  return await addDeviceBatch(deviceInputs, {
    skipValidation: options.skipValidation,
    notify: false
  });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initializes the device manager with sample data (for development/demo)
 * @param includeSampleData - Whether to include sample devices
 */
export async function initializeDeviceManager(includeSampleData: boolean = false): Promise<void> {
  log('info', 'initializeDeviceManager', 'Initializing device manager', { includeSampleData });

  if (includeSampleData) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        log('warn', 'initializeDeviceManager', 'No authenticated user for sample data');
        return;
      }
      
      const sampleDevices: DeviceInput[] = [
        {
          name: 'Coffee Cup Handle',
          type: 'cup',
          batteryLevel: 85,
          status: 'connected',
          firmware: '1.2.3',
          signalStrength: 4
        },
        {
          name: 'Baby Bottle Tracker',
          type: 'bottle',
          batteryLevel: 42,
          status: 'disconnected',
          firmware: '1.1.8',
          signalStrength: 2
        },
        {
          name: 'Office Cup Sleeve',
          type: 'sleeve',
          batteryLevel: 78,
          status: 'connected',
          firmware: '1.2.1',
          signalStrength: 5
        }
      ];

      addDeviceBatch(sampleDevices, { notify: false }).then(result => {
        log('info', 'initializeDeviceManager', `Sample data loaded: ${result.successful.length} devices`);
      });
    } catch (error) {
      log('error', 'initializeDeviceManager', 'Failed to initialize with sample data', error);
    }
  }
}

// Initialize with sample data in development
if (process.env.NODE_ENV === 'development') {
  initializeDeviceManager(true);
}