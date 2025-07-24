/**
 * Context Index
 * 
 * Central export point for all context providers and hooks.
 * This file provides easy access to all context functionality across the application.
 */

// Authentication Context
export {
  AuthProvider,
  useAuth,
  useAuthUser,
  useAuthSession,
  useAuthLoading,
  type AuthUser,
  type AuthState,
  type AuthContextValue,
} from './AuthContext';

// Re-export commonly used types for convenience
export type {
  Session,
  User,
  AuthError,
} from '@supabase/supabase-js';