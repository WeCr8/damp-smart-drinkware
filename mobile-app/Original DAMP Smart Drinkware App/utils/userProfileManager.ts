import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

/**
 * User profile manager for handling user data, devices, and greetings
 */

// Types
export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
  } | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export interface DeviceRegistration {
  id: string;
  user_id: string;
  device_type: 'mobile' | 'desktop' | 'tablet';
  device_name: string;
  operating_system: string | null;
  registered_at: string;
  last_active: string;
  status: 'active' | 'inactive';
  device_metadata: Record<string, any> | null;
}

export interface UserGreeting {
  id: string;
  user_id: string;
  greeting_message: string;
  language: string;
  time_context: 'morning' | 'afternoon' | 'evening' | 'night' | 'any';
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Get the current user's profile
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
}

/**
 * Register the current device for the user
 */
export async function registerCurrentDevice(): Promise<DeviceRegistration | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // For now, just return a mock device registration since the table doesn't exist
    return {
      id: 'mock-device-id',
      user_id: user.id,
      device_type: getDeviceType(),
      device_name: Device.deviceName || 'Unknown Device',
      operating_system: getOperatingSystem(),
      registered_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
      status: 'active',
      device_metadata: {
        brand: Device.brand,
        modelName: Device.modelName,
        osVersion: Device.osVersion,
      }
    };
  } catch (error) {
    console.error('Error in registerCurrentDevice:', error);
    return null;
  }
}

/**
 * Get all devices registered to the current user
 */
export async function getUserDevices(): Promise<DeviceRegistration[]> {
  // For now, return an empty array since the table doesn't exist
  return [];
}

/**
 * Get appropriate greeting for the current user based on time of day
 */
export async function getUserGreeting(): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return getDefaultGreeting();
    
    // Since the user_greetings table doesn't exist, return a default greeting
    return getDefaultGreeting();
  } catch (error) {
    console.error('Error in getUserGreeting:', error);
    return getDefaultGreeting();
  }
}

/**
 * Create or update a custom greeting for the user
 */
export async function setCustomGreeting(
  message: string, 
  timeContext: TimeOfDay = 'any'
): Promise<UserGreeting | null> {
  // Since the user_greetings table doesn't exist, return null
  return null;
}

/**
 * Helper function to get device type
 */
function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (Platform.OS === 'web') {
    // Simple detection for web
    const userAgent = navigator.userAgent.toLowerCase();
    const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
    
    if (isTablet) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(userAgent)) return 'mobile';
    return 'desktop';
  } else {
    // For native platforms
    if (Device.deviceType === Device.DeviceType.TABLET) return 'tablet';
    if (Device.deviceType === Device.DeviceType.PHONE) return 'mobile';
    return 'desktop'; // Default fallback
  }
}

/**
 * Helper function to get operating system
 */
function getOperatingSystem(): string {
  if (Platform.OS === 'web') {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Win') !== -1) return 'Windows';
    if (userAgent.indexOf('Mac') !== -1) return 'MacOS';
    if (userAgent.indexOf('Linux') !== -1) return 'Linux';
    if (userAgent.indexOf('Android') !== -1) return 'Android';
    if (userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) return 'iOS';
    return 'Unknown';
  } else {
    return Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : Platform.OS;
  }
}

/**
 * Helper function to get time of day
 */
export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Helper function to get default greeting based on time of day
 */
function getDefaultGreeting(timeContext?: TimeOfDay): string {
  const time = timeContext || getTimeOfDay();
  
  switch (time) {
    case 'morning':
      return 'Good morning';
    case 'afternoon':
      return 'Good afternoon';
    case 'evening':
      return 'Good evening';
    case 'night':
      return 'Good night';
    default:
      return 'Hello';
  }
}