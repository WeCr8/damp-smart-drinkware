import { supabase } from '@/lib/supabase';
import { notificationManager } from '@/lib/notifications';

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
export interface Device {
  /** Unique device identifier */
  id: string;
  /** User ID that owns this device */
  userId: string;
  /** Display name for the device */
  name: string;
  /** Type of DAMP device */
  type: DeviceType;
  /** Current battery level (0-100) */
  batteryLevel: number;
  /** Device connection status */
  status: DeviceStatus;
  /** Bluetooth device ID */
  bluetoothId: string;
  /** Device firmware version */
  firmware: string;
  /** Signal strength (1-5) */
  signalStrength: number;
  /** Associated zone ID */
  zoneId: string;
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

/** Device name constraints */
const DEVICE_NAME_MIN_LENGTH = 1;
const DEVICE_NAME_MAX_LENGTH = 50;

/** Valid device types */
const VALID_DEVICE_TYPES: DeviceType[] = ['cup', 'sleeve', 'bottle', 'bottom', 'damp-cup'];

/** Valid device statuses */
const VALID_DEVICE_STATUSES: DeviceStatus[] = ['connected', 'disconnected', 'connecting', 'error'];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a standardized log entry
 * @param level - Log level
 * @param operation - Operation name
 * @param message - Log message
 * @param data - Additional data
 */
function log(level: 'info' | 'warn' | 'error', operation: string, message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  console[level](`[SupabaseDeviceManager] ${timestamp} [${level.toUpperCase()}] ${operation}: ${message}`, data || '');
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
 * Converts a database device record to a Device object
 */
function mapDbDeviceToDevice(dbDevice: any): Device {
  return {
    id: dbDevice.id,
    userId: dbDevice.user_id,
    name: dbDevice.name,
    type: dbDevice.type as DeviceType,
    batteryLevel: dbDevice.battery_level,
    status: dbDevice.status as DeviceStatus,
    bluetoothId: dbDevice.bluetooth_id || '',
    firmware: dbDevice.firmware || '',
    signalStrength: dbDevice.signal_strength,
    zoneId: dbDevice.zone_id || '',
    createdAt: new Date(dbDevice.created_at),
    updatedAt: new Date(dbDevice.updated_at),
    lastSeen: new Date(dbDevice.last_seen),
    isActive: dbDevice.is_active,
    metadata: dbDevice.metadata || {},
  };
}

/**
 * Converts a Device object to a database record
 */
function mapDeviceToDbDevice(device: Partial<Device>): any {
  return {
    user_id: device.userId,
    name: device.name,
    type: device.type,
    battery_level: device.batteryLevel,
    status: device.status,
    bluetooth_id: device.bluetoothId,
    firmware: device.firmware,
    signal_strength: device.signalStrength,
    zone_id: device.zoneId,
    is_active: device.isActive,
    metadata: device.metadata,
    last_seen: device.lastSeen ? device.lastSeen.toISOString() : new Date().toISOString(),
  };
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates device input parameters
 * @param input - Device input to validate
 * @returns Validation result with errors and warnings
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

// ============================================================================
// CORE DEVICE MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Adds a new device to the database
 * @param input - Device input parameters
 * @param options - Operation options
 * @returns Promise resolving to operation result
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
        const { data: existingDevices, error: checkError } = await supabase
          .from('device_data')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', input.name.trim());
          
        if (checkError) {
          log('error', operation, 'Error checking device name uniqueness', checkError);
          return {
            success: false,
            error: 'Failed to check device name uniqueness',
            errorDetails: checkError,
            timestamp: new Date(),
            operation
          };
        }
        
        if (existingDevices && existingDevices.length > 0) {
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

      // Create device object for database
      const now = new Date();
      const deviceData = {
        user_id: user.id,
        name: input.name.trim(),
        type: input.type,
        battery_level: input.batteryLevel || 100,
        status: input.status || 'disconnected',
        bluetooth_id: input.bluetoothId || '',
        firmware: input.firmware || '1.0.0',
        signal_strength: input.signalStrength || 3,
        zone_id: input.zoneId || '',
        last_seen: now.toISOString(),
        is_active: true,
        metadata: { ...input.metadata, ...options.metadata }
      };

      // Insert device into database
      const { data: insertedDevice, error: insertError } = await supabase
        .from('device_data')
        .insert(deviceData)
        .select()
        .single();
        
      if (insertError) {
        log('error', operation, 'Error inserting device', insertError);
        return {
          success: false,
          error: 'Failed to insert device into database',
          errorDetails: insertError,
          timestamp: new Date(),
          operation
        };
      }

      // Map database record to Device object
      const device = mapDbDeviceToDevice(insertedDevice);

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
 * Updates an existing device in the database
 * @param deviceId - Device ID to update
 * @param updates - Partial device updates
 * @param options - Operation options
 * @returns Promise resolving to operation result
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

      // Check if device exists and belongs to user
      const { data: existingDevice, error: fetchError } = await supabase
        .from('device_data')
        .select('*')
        .eq('id', deviceId)
        .eq('user_id', user.id)
        .single();
        
      if (fetchError) {
        log('error', operation, 'Error fetching device', fetchError);
        return {
          success: false,
          error: 'Device not found or you do not have permission to update it',
          errorDetails: fetchError,
          timestamp: new Date(),
          operation
        };
      }

      // Validate updates unless skipped
      if (!options.skipValidation && Object.keys(updates).length > 0) {
        const mergedInput = {
          name: updates.name || existingDevice.name,
          type: (updates.type || existingDevice.type) as DeviceType,
          batteryLevel: updates.batteryLevel || existingDevice.battery_level,
          status: (updates.status || existingDevice.status) as DeviceStatus,
          bluetoothId: updates.bluetoothId || existingDevice.bluetooth_id,
          firmware: updates.firmware || existingDevice.firmware,
          signalStrength: updates.signalStrength || existingDevice.signal_strength,
          zoneId: updates.zoneId || existingDevice.zone_id,
        };
        
        const validation = validateDeviceInput(mergedInput);
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
        if (updates.name && updates.name !== existingDevice.name) {
          const { data: nameCheck, error: nameCheckError } = await supabase
            .from('device_data')
            .select('id')
            .eq('user_id', user.id)
            .eq('name', updates.name.trim())
            .neq('id', deviceId);
            
          if (nameCheckError) {
            log('error', operation, 'Error checking device name uniqueness', nameCheckError);
            return {
              success: false,
              error: 'Failed to check device name uniqueness',
              errorDetails: nameCheckError,
              timestamp: new Date(),
              operation
            };
          }
          
          if (nameCheck && nameCheck.length > 0) {
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
      }

      // Prepare update data
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name.trim();
      if (updates.type) updateData.type = updates.type;
      if (updates.batteryLevel !== undefined) updateData.battery_level = updates.batteryLevel;
      if (updates.status) updateData.status = updates.status;
      if (updates.bluetoothId) updateData.bluetooth_id = updates.bluetoothId;
      if (updates.firmware) updateData.firmware = updates.firmware;
      if (updates.signalStrength) updateData.signal_strength = updates.signalStrength;
      if (updates.zoneId !== undefined) updateData.zone_id = updates.zoneId;
      
      // Always update last_seen
      updateData.last_seen = new Date().toISOString();
      
      // Merge metadata
      if (updates.metadata || options.metadata) {
        updateData.metadata = {
          ...existingDevice.metadata,
          ...updates.metadata,
          ...options.metadata
        };
      }

      // Update device in database
      const { data: updatedDevice, error: updateError } = await supabase
        .from('device_data')
        .update(updateData)
        .eq('id', deviceId)
        .select()
        .single();
        
      if (updateError) {
        log('error', operation, 'Error updating device', updateError);
        return {
          success: false,
          error: 'Failed to update device in database',
          errorDetails: updateError,
          timestamp: new Date(),
          operation
        };
      }

      // Map database record to Device object
      const device = mapDbDeviceToDevice(updatedDevice);

      // Send notification if enabled
      if (options.notify !== false) {
        notificationManager.showNotification({
          type: 'device',
          title: 'Device Updated',
          message: `${device.name} has been updated`,
          deviceId: device.id,
          priority: 'low'
        });
      }

      const duration = Date.now() - startTime;
      log('info', operation, `Device updated successfully in ${duration}ms`, { deviceId });

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

/**
 * Removes a device from the database
 * @param deviceId - Device ID to remove
 * @param options - Operation options
 * @returns Promise resolving to operation result
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

      // Get device before deletion
      const { data: device, error: fetchError } = await supabase
        .from('device_data')
        .select('*')
        .eq('id', deviceId)
        .eq('user_id', user.id)
        .single();
        
      if (fetchError) {
        log('error', operation, 'Error fetching device', fetchError);
        return {
          success: false,
          error: 'Device not found or you do not have permission to remove it',
          errorDetails: fetchError,
          timestamp: new Date(),
          operation
        };
      }

      // Delete device from database
      const { error: deleteError } = await supabase
        .from('device_data')
        .delete()
        .eq('id', deviceId)
        .eq('user_id', user.id);
        
      if (deleteError) {
        log('error', operation, 'Error deleting device', deleteError);
        return {
          success: false,
          error: 'Failed to delete device from database',
          errorDetails: deleteError,
          timestamp: new Date(),
          operation
        };
      }

      // Map database record to Device object
      const removedDevice = mapDbDeviceToDevice(device);

      // Send notification if enabled
      if (options.notify !== false) {
        notificationManager.showNotification({
          type: 'device',
          title: 'Device Removed',
          message: `${removedDevice.name} has been removed`,
          deviceId: removedDevice.id,
          priority: 'low'
        });
      }

      const duration = Date.now() - startTime;
      log('info', operation, `Device removed successfully in ${duration}ms`, { deviceId });

      return {
        success: true,
        data: removedDevice,
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
// QUERY AND RETRIEVAL FUNCTIONS
// ============================================================================

/**
 * Retrieves a device by ID
 * @param deviceId - Device ID to retrieve
 * @returns Promise resolving to Device object or null if not found
 */
export async function getDevice(deviceId: string): Promise<Device | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('device_data')
      .select('*')
      .eq('id', deviceId)
      .eq('user_id', user.id)
      .single();
      
    if (error) {
      log('error', 'getDevice', 'Error fetching device', error);
      return null;
    }
    
    return mapDbDeviceToDevice(data);
  } catch (error) {
    log('error', 'getDevice', 'Error retrieving device', error);
    return null;
  }
}

/**
 * Retrieves all devices for the current user
 * @returns Promise resolving to array of Device objects
 */
export async function getAllDevices(): Promise<Device[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('device_data')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      log('error', 'getAllDevices', 'Error fetching devices', error);
      return [];
    }
    
    return data.map(mapDbDeviceToDevice);
  } catch (error) {
    log('error', 'getAllDevices', 'Error retrieving devices', error);
    return [];
  }
}

/**
 * Retrieves devices by type
 * @param type - Device type to filter by
 * @returns Promise resolving to array of devices of the specified type
 */
export async function getDevicesByType(type: DeviceType): Promise<Device[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('device_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', type)
      .order('created_at', { ascending: false });
      
    if (error) {
      log('error', 'getDevicesByType', 'Error fetching devices by type', error);
      return [];
    }
    
    return data.map(mapDbDeviceToDevice);
  } catch (error) {
    log('error', 'getDevicesByType', 'Error retrieving devices by type', error);
    return [];
  }
}

/**
 * Retrieves devices by status
 * @param status - Device status to filter by
 * @returns Promise resolving to array of devices with the specified status
 */
export async function getDevicesByStatus(status: DeviceStatus): Promise<Device[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('device_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('created_at', { ascending: false });
      
    if (error) {
      log('error', 'getDevicesByStatus', 'Error fetching devices by status', error);
      return [];
    }
    
    return data.map(mapDbDeviceToDevice);
  } catch (error) {
    log('error', 'getDevicesByStatus', 'Error retrieving devices by status', error);
    return [];
  }
}

/**
 * Searches devices by name (case-insensitive partial match)
 * @param query - Search query
 * @returns Promise resolving to array of matching devices
 */
export async function searchDevices(query: string): Promise<Device[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('device_data')
      .select('*')
      .eq('user_id', user.id)
      .ilike('name', `%${query}%`)
      .order('created_at', { ascending: false });
      
    if (error) {
      log('error', 'searchDevices', 'Error searching devices', error);
      return [];
    }
    
    return data.map(mapDbDeviceToDevice);
  } catch (error) {
    log('error', 'searchDevices', 'Error searching devices', error);
    return [];
  }
}

/**
 * Gets device statistics for the current user
 * @returns Object with device statistics
 */
export async function getDeviceStats() {
  try {
    const devices = await getAllDevices();
    
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
  } catch (error) {
    log('error', 'getDeviceStats', 'Error getting device stats', error);
    return {
      total: 0,
      connected: 0,
      disconnected: 0,
      lowBattery: 0,
      byType: {}
    };
  }
}

/**
 * Initializes the device manager with sample data (for development/demo)
 * @param includeSampleData - Whether to include sample devices
 */
export async function initializeWithSampleData(includeSampleData: boolean = false): Promise<void> {
  log('info', 'initializeWithSampleData', 'Initializing with sample data', { includeSampleData });

  if (includeSampleData) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        log('warn', 'initializeWithSampleData', 'No authenticated user for sample data');
        return;
      }
      
      // Check if user already has devices
      const { data: existingDevices, error: checkError } = await supabase
        .from('device_data')
        .select('id')
        .eq('user_id', user.id);
        
      if (checkError) {
        log('error', 'initializeWithSampleData', 'Error checking existing devices', checkError);
        return;
      }
      
      // Only add sample data if user has no devices
      if (existingDevices && existingDevices.length > 0) {
        log('info', 'initializeWithSampleData', 'User already has devices, skipping sample data');
        return;
      }
      
      const sampleDevices: DeviceInput[] = [
        {
          name: 'Coffee Cup Handle',
          type: 'cup',
          batteryLevel: 85,
          status: 'connected',
          firmware: '1.2.3',
          signalStrength: 4,
          metadata: { isTemplate: false }
        },
        {
          name: 'Baby Bottle Tracker',
          type: 'bottle',
          batteryLevel: 42,
          status: 'disconnected',
          firmware: '1.1.8',
          signalStrength: 2,
          metadata: { isTemplate: false }
        },
        {
          name: 'Office Cup Sleeve',
          type: 'sleeve',
          batteryLevel: 78,
          status: 'connected',
          firmware: '1.2.1',
          signalStrength: 5,
          metadata: { isTemplate: false }
        }
      ];

      // Add sample devices
      for (const device of sampleDevices) {
        await addDevice(device, { notify: false });
      }
      
      log('info', 'initializeWithSampleData', `Sample data loaded: ${sampleDevices.length} devices`);
    } catch (error) {
      log('error', 'initializeWithSampleData', 'Failed to initialize with sample data', error);
    }
  }
}