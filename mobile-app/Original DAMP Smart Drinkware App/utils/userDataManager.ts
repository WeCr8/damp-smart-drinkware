/**
 * User Data Management Utilities
 * 
 * Handles cleaning and managing user data in Supabase by removing
 * template/placeholder values and maintaining only genuine user information.
 */

import { supabase } from '@/lib/supabase';
import { AuthUser } from '@/contexts/AuthContext';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Clean user profile data structure
 */
export interface CleanUserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  preferences?: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
  created_at: string;
  updated_at: string;
}

/**
 * User data validation result
 */
export interface UserDataValidation {
  isValid: boolean;
  cleanedData: Partial<CleanUserProfile>;
  removedFields: string[];
  warnings: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Template/placeholder values to remove */
const TEMPLATE_VALUES = [
  'user',
  'User',
  'test user',
  'Test User',
  'example user',
  'Example User',
  'default user',
  'Default User',
  'placeholder',
  'Placeholder',
  'sample',
  'Sample',
  'demo',
  'Demo',
  'temp',
  'Temp',
  'untitled',
  'Untitled',
  'new user',
  'New User',
];

/** Template/placeholder phone numbers */
const TEMPLATE_PHONES = [
  '+1234567890',
  '1234567890',
  '555-555-5555',
  '(555) 555-5555',
  '000-000-0000',
  '123-456-7890',
  '+1 (555) 123-4567',
];

/** Template/placeholder avatar URLs */
const TEMPLATE_AVATARS = [
  'https://via.placeholder.com',
  'https://picsum.photos',
  'https://i.pravatar.cc',
  'https://robohash.org',
  'https://ui-avatars.com',
  '/assets/images/avatar-default.png',
  '/default-avatar.png',
  'avatar-default',
  'default-avatar',
];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Checks if a value is a template/placeholder value
 */
function isTemplateValue(value: string | null | undefined, templateList: string[]): boolean {
  if (!value || typeof value !== 'string') return false;
  
  const normalizedValue = value.toLowerCase().trim();
  
  return templateList.some(template => 
    normalizedValue.includes(template.toLowerCase()) ||
    normalizedValue === template.toLowerCase()
  );
}

/**
 * Checks if a full name is a template/placeholder
 */
function isTemplateName(name: string | null | undefined): boolean {
  if (!name || typeof name !== 'string') return false;
  
  const trimmedName = name.trim();
  
  // Check against template values
  if (isTemplateValue(trimmedName, TEMPLATE_VALUES)) return true;
  
  // Check for email-derived names (before @ symbol)
  if (trimmedName.includes('@')) return true;
  
  // Check for single character or very short names
  if (trimmedName.length <= 1) return true;
  
  // Check for names that are just numbers
  if (/^\d+$/.test(trimmedName)) return true;
  
  // Check for UUID-like strings
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmedName)) return true;
  
  return false;
}

/**
 * Checks if a phone number is a template/placeholder
 */
function isTemplatePhone(phone: string | null | undefined): boolean {
  if (!phone || typeof phone !== 'string') return false;
  
  const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  return TEMPLATE_PHONES.some(template => {
    const normalizedTemplate = template.replace(/[\s\-\(\)]/g, '');
    return normalizedPhone === normalizedTemplate;
  });
}

/**
 * Checks if an avatar URL is a template/placeholder
 */
function isTemplateAvatar(avatarUrl: string | null | undefined): boolean {
  if (!avatarUrl || typeof avatarUrl !== 'string') return false;
  
  return TEMPLATE_AVATARS.some(template => 
    avatarUrl.toLowerCase().includes(template.toLowerCase())
  );
}

/**
 * Validates and cleans user preferences
 */
function cleanUserPreferences(preferences: any): { notifications: boolean; theme: 'light' | 'dark' | 'system'; language: string } | undefined {
  if (!preferences || typeof preferences !== 'object') {
    return undefined;
  }
  
  const validThemes = ['light', 'dark', 'system'];
  const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko'];
  
  return {
    notifications: typeof preferences.notifications === 'boolean' ? preferences.notifications : true,
    theme: validThemes.includes(preferences.theme) ? preferences.theme : 'system',
    language: validLanguages.includes(preferences.language) ? preferences.language : 'en',
  };
}

// ============================================================================
// CORE CLEANING FUNCTIONS
// ============================================================================

/**
 * Validates and cleans user data, removing template/placeholder values
 */
export function validateAndCleanUserData(userData: Partial<AuthUser>): UserDataValidation {
  const cleanedData: Partial<CleanUserProfile> = {};
  const removedFields: string[] = [];
  const warnings: string[] = [];
  
  // Always include required fields
  if (userData.id) {
    cleanedData.id = userData.id;
  }
  
  // Clean full name
  if (userData.full_name) {
    if (isTemplateName(userData.full_name)) {
      removedFields.push('full_name (template value)');
      warnings.push(`Removed template name: "${userData.full_name}"`);
    } else {
      cleanedData.full_name = userData.full_name.trim();
    }
  }
  
  // Clean phone number
  if (userData.phone) {
    if (isTemplatePhone(userData.phone)) {
      removedFields.push('phone (template value)');
      warnings.push(`Removed template phone: "${userData.phone}"`);
    } else {
      cleanedData.phone = userData.phone.trim();
    }
  }
  
  // Clean avatar URL
  if (userData.avatar_url) {
    if (isTemplateAvatar(userData.avatar_url)) {
      removedFields.push('avatar_url (template value)');
      warnings.push(`Removed template avatar: "${userData.avatar_url}"`);
    } else {
      cleanedData.avatar_url = userData.avatar_url;
    }
  }
  
  // Clean preferences
  if (userData.preferences) {
    const cleanedPreferences = cleanUserPreferences(userData.preferences);
    if (cleanedPreferences) {
      cleanedData.preferences = cleanedPreferences;
    }
  }
  
  // Add timestamps
  const now = new Date().toISOString();
  cleanedData.updated_at = now;
  
  if (!userData.created_at) {
    cleanedData.created_at = now;
  }
  
  return {
    isValid: true,
    cleanedData,
    removedFields,
    warnings,
  };
}

/**
 * Creates or updates a clean user profile in Supabase
 */
export async function createOrUpdateCleanUserProfile(
  userId: string,
  userData: Partial<AuthUser>
): Promise<{ success: boolean; data?: CleanUserProfile; error?: string; warnings?: string[] }> {
  try {
    // Validate and clean the user data
    const validation = validateAndCleanUserData({ ...userData, id: userId });
    
    if (!validation.isValid) {
      return {
        success: false,
        error: 'User data validation failed',
      };
    }
    
    // Check if user profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing profile:', fetchError);
      return {
        success: false,
        error: 'Failed to check existing profile',
      };
    }
    
    let result;
    
    if (existingProfile) {
      // Update existing profile with cleaned data
      const updateData = {
        ...validation.cleanedData,
        id: userId, // Ensure ID is included
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating profile:', error);
        return {
          success: false,
          error: 'Failed to update user profile',
        };
      }
      
      result = data;
    } else {
      // Create new profile with cleaned data
      const insertData = {
        ...validation.cleanedData,
        id: userId,
        created_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating profile:', error);
        return {
          success: false,
          error: 'Failed to create user profile',
        };
      }
      
      result = data;
    }
    
    console.log('User profile cleaned and saved:', {
      userId,
      removedFields: validation.removedFields,
      warnings: validation.warnings,
    });
    
    return {
      success: true,
      data: result,
      warnings: validation.warnings,
    };
    
  } catch (error) {
    console.error('Error in createOrUpdateCleanUserProfile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Cleans all existing user profiles in the database
 */
export async function cleanAllUserProfiles(): Promise<{
  success: boolean;
  processed: number;
  cleaned: number;
  errors: string[];
}> {
  try {
    // Fetch all profiles
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('*');
    
    if (fetchError) {
      return {
        success: false,
        processed: 0,
        cleaned: 0,
        errors: [fetchError.message],
      };
    }
    
    if (!profiles || profiles.length === 0) {
      return {
        success: true,
        processed: 0,
        cleaned: 0,
        errors: [],
      };
    }
    
    let processed = 0;
    let cleaned = 0;
    const errors: string[] = [];
    
    // Process each profile
    for (const profile of profiles) {
      try {
        processed++;
        
        const validation = validateAndCleanUserData(profile);
        
        // Check if any fields were removed (indicating cleaning was needed)
        if (validation.removedFields.length > 0) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update(validation.cleanedData)
            .eq('id', profile.id);
          
          if (updateError) {
            errors.push(`Failed to clean profile ${profile.id}: ${updateError.message}`);
          } else {
            cleaned++;
            console.log(`Cleaned profile ${profile.id}:`, validation.removedFields);
          }
        }
      } catch (error) {
        errors.push(`Error processing profile ${profile.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return {
      success: errors.length === 0,
      processed,
      cleaned,
      errors,
    };
    
  } catch (error) {
    return {
      success: false,
      processed: 0,
      cleaned: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
    };
  }
}

/**
 * Gets clean user profile data from Supabase
 */
export async function getCleanUserProfile(userId: string): Promise<{
  success: boolean;
  data?: CleanUserProfile;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    // Validate that the returned data is clean
    const validation = validateAndCleanUserData(data);
    
    return {
      success: true,
      data: validation.cleanedData as CleanUserProfile,
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}