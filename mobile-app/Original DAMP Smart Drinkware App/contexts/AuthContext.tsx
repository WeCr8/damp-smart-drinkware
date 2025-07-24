import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { createOrUpdateCleanUserProfile, getCleanUserProfile } from '@/utils/userDataManager';

// Types
export interface AuthUser extends User {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  preferences?: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });
  
  const mounted = useRef(true);

  // Helper function to safely update state
  const updateState = (updates: Partial<AuthState>) => {
    if (mounted.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  };

  // Helper function to create enhanced user object with clean profile data
  const createEnhancedUser = async (authUser: User): Promise<AuthUser> => {
    try {
      // Get clean profile data from Supabase
      const profileResult = await getCleanUserProfile(authUser.id);
      
      if (profileResult.success && profileResult.data) {
        return {
          ...authUser,
          full_name: profileResult.data.full_name,
          avatar_url: profileResult.data.avatar_url,
          phone: profileResult.data.phone,
          preferences: profileResult.data.preferences || {
            notifications: true,
            theme: 'system' as const,
            language: 'en',
          },
        };
      } else {
        // If no clean profile exists, create one with minimal data
        const cleanProfileResult = await createOrUpdateCleanUserProfile(authUser.id, {
          preferences: {
            notifications: true,
            theme: 'system' as const,
            language: 'en',
          },
        });
        
        if (cleanProfileResult.success && cleanProfileResult.data) {
          return {
            ...authUser,
            full_name: cleanProfileResult.data.full_name,
            avatar_url: cleanProfileResult.data.avatar_url,
            phone: cleanProfileResult.data.phone,
            preferences: cleanProfileResult.data.preferences || {
              notifications: true,
              theme: 'system' as const,
              language: 'en',
            },
          };
        }
      }
    } catch (error) {
      console.error('Error creating enhanced user:', error);
    }
    
    // Fallback to basic user with default preferences
    return {
      ...authUser,
      preferences: {
        notifications: true,
        theme: 'system' as const,
        language: 'en',
      },
    };
  };

  // Initialize auth state
  useEffect(() => {
    let authSubscription: { data: { subscription: any } } | null = null;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          updateState({ error: error.message, loading: false });
          return;
        }

        if (session?.user) {
          // Create enhanced user with clean profile data
          const enhancedUser = await createEnhancedUser(session.user);

          updateState({
            user: enhancedUser,
            session,
            loading: false,
            error: null,
          });
        } else {
          updateState({
            user: null,
            session: null,
            loading: false,
            error: null,
          });
        }

        // Set up auth state listener
        authSubscription = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted.current) return;

            console.log('Auth state changed:', event);

            if (event === 'SIGNED_IN' && session?.user) {
              // Create enhanced user with clean profile data
              const enhancedUser = await createEnhancedUser(session.user);

              updateState({
                user: enhancedUser,
                session,
                loading: false,
                error: null,
              });
            } else if (event === 'SIGNED_OUT') {
              updateState({
                user: null,
                session: null,
                loading: false,
                error: null,
              });
            } else if (event === 'TOKEN_REFRESHED' && session) {
              updateState({
                session,
                loading: false,
              });
            }
          }
        );

      } catch (error) {
        console.error('Auth initialization error:', error);
        updateState({
          error: error instanceof Error ? error.message : 'Authentication initialization failed',
          loading: false,
        });
      }
    };

    initializeAuth();

    return () => {
      mounted.current = false;
      authSubscription?.data?.subscription?.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    updateState({ loading: true, error: null });

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        updateState({ error: error.message, loading: false });
        return { error };
      }

      // State will be updated by the auth listener
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      updateState({ error: errorMessage, loading: false });
      return { error: new Error(errorMessage) as AuthError };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    updateState({ loading: true, error: null });

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        updateState({ error: error.message, loading: false });
        return { error };
      }

      updateState({ loading: false });
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      updateState({ error: errorMessage, loading: false });
      return { error: new Error(errorMessage) as AuthError };
    }
  };

  // Sign out function
  const signOut = async () => {
    updateState({ loading: true, error: null });

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        updateState({ error: error.message, loading: false });
        return { error };
      }

      // State will be updated by the auth listener
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      updateState({ error: errorMessage, loading: false });
      return { error: new Error(errorMessage) as AuthError };
    }
  };

  // Update profile function with data cleaning
  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!state.user) {
      return { error: new Error('No user logged in') };
    }

    updateState({ loading: true, error: null });

    try {
      // Update auth metadata if needed
      const authUpdates: any = {};
      if (updates.email && updates.email !== state.user.email) {
        authUpdates.email = updates.email;
      }

      if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(authUpdates);
        if (authError) {
          updateState({ error: authError.message, loading: false });
          return { error: authError };
        }
      }

      // Create or update clean profile in Supabase
      const cleanProfileResult = await createOrUpdateCleanUserProfile(state.user.id, updates);

      if (!cleanProfileResult.success) {
        updateState({ error: cleanProfileResult.error || 'Profile update failed', loading: false });
        return { error: new Error(cleanProfileResult.error || 'Profile update failed') };
      }

      // Log any warnings about removed template data
      if (cleanProfileResult.warnings && cleanProfileResult.warnings.length > 0) {
        console.log('Profile update warnings:', cleanProfileResult.warnings);
      }

      // Create updated user object with clean data
      const updatedUser: AuthUser = {
        ...state.user,
        full_name: cleanProfileResult.data?.full_name,
        avatar_url: cleanProfileResult.data?.avatar_url,
        phone: cleanProfileResult.data?.phone,
        preferences: cleanProfileResult.data?.preferences || state.user.preferences,
      };

      updateState({
        user: updatedUser,
        loading: false,
        error: null,
      });

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      updateState({ error: errorMessage, loading: false });
      return { error: new Error(errorMessage) };
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    updateState({ loading: true, error: null });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (error) {
        updateState({ error: error.message, loading: false });
        return { error };
      }

      updateState({ loading: false });
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      updateState({ error: errorMessage, loading: false });
      return { error: new Error(errorMessage) as AuthError };
    }
  };

  // Refresh session function
  const refreshSession = async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh error:', error);
        updateState({ error: error.message });
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Session refresh failed' 
      });
    }
  };

  // Clear error function
  const clearError = () => {
    updateState({ error: null });
  };

  const contextValue: AuthContextValue = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    refreshSession,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hooks for common use cases
export function useAuthUser() {
  const { user } = useAuth();
  return user;
}

export function useAuthSession() {
  const { session } = useAuth();
  return session;
}

export function useAuthLoading() {
  const { loading } = useAuth();
  return loading;
}