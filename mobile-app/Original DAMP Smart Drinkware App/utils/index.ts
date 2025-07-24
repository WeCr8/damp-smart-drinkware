/**
 * Utility Functions Index
 * 
 * Central export point for all utility functions and modules.
 * This file provides easy access to all utility functions across the application.
 */

// Device Management Utilities
export * from './deviceManager';

// User Data Management Utilities
export * from './userDataManager';

// Zone Management Utilities
export * from './zoneManager';

// Re-export commonly used types for convenience
export type {
  Device,
  DeviceInput,
  DeviceType,
  DeviceStatus,
  DeviceOperationResult,
  BatchOperationResult,
  ValidationResult,
  DeviceOperationOptions
} from './deviceManager';

export type {
  CleanUserProfile,
  UserDataValidation
} from './userDataManager';

export type {
  Zone,
  ZoneInput,
  ZoneType,
  ZoneEvent,
  ZoneEventType,
  ZoneBoundaryResult,
  ZoneOperationResult,
  ZoneSettings,
  ZoneHierarchyNode,
  ZoneMonitoringOptions
} from './zoneManager';