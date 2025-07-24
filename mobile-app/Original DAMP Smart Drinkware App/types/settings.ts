/**
 * Settings Types
 * 
 * TypeScript interfaces and types for the settings system
 */

import { ReactNode } from 'react';
import { AuthUser } from '@/contexts/AuthContext';

export interface SettingsTab {
  id: string;
  title: string;
  icon: ReactNode;
}

export interface SettingsSection {
  title: string;
  items: SettingItem[];
}

export interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  type: 'toggle' | 'navigation' | 'action' | 'picker';
  value?: boolean | string;
  options?: Array<{ label: string; value: string }>;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  onSelect?: (value: string) => void;
  destructive?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
}

export interface AccountInfoModalProps extends BaseModalProps {
  user: AuthUser;
  onEdit: () => void;
}

export interface EditProfileModalProps extends BaseModalProps {
  user: AuthUser;
  onSave: (updates: Partial<AuthUser>) => Promise<void>;
}

export interface ThemePickerModalProps extends BaseModalProps {
  currentTheme: string;
  onSelect: (theme: string) => void;
}

export interface LanguagePickerModalProps extends BaseModalProps {
  currentLanguage: string;
  onSelect: (language: string) => void;
}

export interface UserPreferences {
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoBackup: boolean;
}

export interface SettingsContextValue {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => Promise<void>;
  resetPreferences: () => Promise<void>;
  exportSettings: () => Promise<string>;
  importSettings: (data: string) => Promise<void>;
}