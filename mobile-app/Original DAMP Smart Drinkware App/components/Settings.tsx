/**
 * Settings Component with Cohesive Design System
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  CircleHelp as HelpCircle,
  LogOut,
  Volume2,
  Vibrate,
  Download,
  Upload,
  RotateCcw,
  Smartphone,
  Database,
  Eye,
  HardDrive,
  Chrome,
  Trash2,
  ShoppingBag,
  MapPin,
  Navigation,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { settingsStyles, designSystem } from '@/styles/settings';
import { SettingsSection, UserPreferences } from '@/types/settings';
import {
  AccountInfoModal,
  EditProfileModal,
  ThemePickerModal,
  LanguagePickerModal,
} from '@/components/modals';
import DeviceManagementModal from '@/components/modals/DeviceManagementModal';
import PrivacySettingsModal from '@/components/modals/PrivacySettingsModal';
import DataManagementModal from '@/components/modals/DataManagementModal';
import AccessibilityModal from '@/components/modals/AccessibilityModal';
import SubscriptionModal from '@/components/modals/SubscriptionModal';
import StoreModal from '@/components/modals/StoreModal';
import ZoneManagementModal from '@/components/modals/ZoneManagementModal';
import DeviceManagement from '@/components/DeviceManagement';
import { cleanAllUserProfiles } from '@/utils/userDataManager';
import CategorySlider from '@/components/CategorySlider';

export default function Settings() {
  const { user, signOut, updateProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [deviceModalVisible, setDeviceModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [dataModalVisible, setDataModalVisible] = useState(false);
  const [accessibilityModalVisible, setAccessibilityModalVisible] = useState(false);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [storeModalVisible, setStoreModalVisible] = useState(false);
  const [zoneModalVisible, setZoneModalVisible] = useState(false);
  const [cleaningData, setCleaningData] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: user?.preferences?.notifications ?? true,
    theme: user?.preferences?.theme ?? 'system',
    language: user?.preferences?.language ?? 'en',
    soundEnabled: true,
    vibrationEnabled: true,
    autoBackup: false,
  });

  if (!user) {
    return (
      <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={settingsStyles.container}>
        <SafeAreaView style={settingsStyles.safeArea}>
          <View style={settingsStyles.errorContainer}>
            <Text style={settingsStyles.errorTitle}>Authentication Required</Text>
            <Text style={settingsStyles.errorMessage}>
              Please log in to access your settings
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const tabs = [
    {
      id: 'account',
      name: 'Account',
      icon: <User size={24} color={activeTab === 'account' ? designSystem.colors.primary : designSystem.colors.textSecondary} />,
    },
    {
      id: 'preferences',
      name: 'Preferences',
      icon: <Palette size={24} color={activeTab === 'preferences' ? designSystem.colors.primary : designSystem.colors.textSecondary} />,
    },
    {
      id: 'devices',
      name: 'Devices',
      icon: <Smartphone size={24} color={activeTab === 'devices' ? designSystem.colors.primary : designSystem.colors.textSecondary} />,
    },
    {
      id: 'zones',
      name: 'Zones',
      icon: <MapPin size={24} color={activeTab === 'zones' ? designSystem.colors.primary : designSystem.colors.textSecondary} />,
    },
    {
      id: 'store',
      name: 'Store',
      icon: <ShoppingBag size={24} color={activeTab === 'store' ? designSystem.colors.primary : designSystem.colors.textSecondary} />,
    },
    {
      id: 'support',
      name: 'Support',
      icon: <HelpCircle size={24} color={activeTab === 'support' ? designSystem.colors.primary : designSystem.colors.textSecondary} />,
    },
  ];

  const handlePreferenceToggle = useCallback(async (key: keyof UserPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      await updateProfile({
        preferences: newPreferences,
      });
    } catch (error) {
      // Revert on error
      setPreferences(preferences);
      Alert.alert('Error', 'Failed to update preferences');
    }
  }, [preferences, updateProfile]);

  const handleThemeSelect = useCallback(async (theme: string) => {
    const newPreferences = { ...preferences, theme: theme as UserPreferences['theme'] };
    setPreferences(newPreferences);

    try {
      await updateProfile({
        preferences: newPreferences,
      });
    } catch (error) {
      setPreferences(preferences);
      Alert.alert('Error', 'Failed to update theme');
    }
  }, [preferences, updateProfile]);

  const handleLanguageSelect = useCallback(async (language: string) => {
    const newPreferences = { ...preferences, language };
    setPreferences(newPreferences);

    try {
      await updateProfile({
        preferences: newPreferences,
      });
    } catch (error) {
      setPreferences(preferences);
      Alert.alert('Error', 'Failed to update language');
    }
  }, [preferences, updateProfile]);

  const handleProfileSave = useCallback(async (updates: Partial<typeof user>) => {
    await updateProfile(updates);
  }, [updateProfile]);

  const handleSignOut = useCallback(async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  }, [signOut]);

  const handleCleanUserData = useCallback(async () => {
    Alert.alert(
      'Clean User Data',
      'This will remove all template and placeholder data from user profiles. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clean Data',
          style: 'destructive',
          onPress: async () => {
            setCleaningData(true);
            try {
              const result = await cleanAllUserProfiles();
              
              if (result.success) {
                Alert.alert(
                  'Data Cleaned Successfully',
                  `Processed ${result.processed} profiles, cleaned ${result.cleaned} profiles with template data.`
                );
              } else {
                Alert.alert(
                  'Cleaning Failed',
                  `Errors occurred: ${result.errors.join(', ')}`
                );
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to clean user data');
            } finally {
              setCleaningData(false);
            }
          },
        },
      ]
    );
  }, []);

  const getLanguageLabel = (code: string) => {
    const languages: Record<string, string> = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      zh: 'Chinese',
      ja: 'Japanese',
      ko: 'Korean',
    };
    return languages[code] || 'English';
  };

  const accountSections: SettingsSection[] = [
    {
      title: 'Profile',
      items: [
        {
          id: 'profile-info',
          title: 'Account Information',
          subtitle: 'View and edit your profile details',
          icon: <User size={20} color={designSystem.colors.primary} />,
          type: 'navigation',
          onPress: () => setAccountModalVisible(true),
        },
        {
          id: 'subscription',
          title: 'Subscription',
          subtitle: 'Manage your DAMP+ subscription',
          icon: <CreditCard size={20} color={designSystem.colors.primary} />,
          type: 'navigation',
          onPress: () => setSubscriptionModalVisible(true),
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          id: 'privacy',
          title: 'Privacy & Security',
          subtitle: 'Manage your privacy settings',
          icon: <Shield size={20} color={designSystem.colors.primary} />,
          type: 'navigation',
          onPress: () => setPrivacyModalVisible(true),
        },
      ],
    },
    {
      title: 'Data Management',
      items: [
        {
          id: 'clean-data',
          title: 'Clean User Data',
          subtitle: 'Remove template and placeholder data',
          icon: <Trash2 size={20} color={designSystem.colors.warning} />,
          type: 'action',
          onPress: handleCleanUserData,
        },
      ],
    },
    {
      title: 'Account Actions',
      items: [
        {
          id: 'sign-out',
          title: 'Sign Out',
          subtitle: 'Sign out of your account',
          icon: <LogOut size={20} color={designSystem.colors.error} />,
          type: 'action',
          onPress: handleSignOut,
          destructive: true,
        },
      ],
    },
  ];

  const preferencesSections: SettingsSection[] = [
    {
      title: 'Notifications',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Receive alerts and updates',
          icon: <Bell size={20} color={designSystem.colors.primary} />,
          type: 'toggle',
          value: preferences.notifications,
          onToggle: (value) => handlePreferenceToggle('notifications', value),
        },
        {
          id: 'sound',
          title: 'Sound Alerts',
          subtitle: 'Play sounds for notifications',
          icon: <Volume2 size={20} color={designSystem.colors.primary} />,
          type: 'toggle',
          value: preferences.soundEnabled,
          onToggle: (value) => handlePreferenceToggle('soundEnabled', value),
        },
        {
          id: 'vibration',
          title: 'Vibration',
          subtitle: 'Vibrate for important alerts',
          icon: <Vibrate size={20} color={designSystem.colors.primary} />,
          type: 'toggle',
          value: preferences.vibrationEnabled,
          onToggle: (value) => handlePreferenceToggle('vibrationEnabled', value),
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          id: 'theme',
          title: 'Theme',
          subtitle: `Current: ${preferences.theme.charAt(0).toUpperCase() + preferences.theme.slice(1)}`,
          icon: <Palette size={20} color={designSystem.colors.primary} />,
          type: 'navigation',
          onPress: () => setThemeModalVisible(true),
        },
        {
          id: 'accessibility',
          title: 'Accessibility',
          subtitle: 'Display and accessibility options',
          icon: <Eye size={20} color={designSystem.colors.primary} />,
          type: 'navigation',
          onPress: () => setAccessibilityModalVisible(true),
        },
      ],
    },
    {
      title: 'Language & Region',
      items: [
        {
          id: 'language',
          title: 'Language',
          subtitle: getLanguageLabel(preferences.language),
          icon: <Globe size={20} color={designSystem.colors.primary} />,
          type: 'navigation',
          onPress: () => setLanguageModalVisible(true),
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          id: 'auto-backup',
          title: 'Auto Backup',
          subtitle: 'Automatically backup your data',
          icon: <Upload size={20} color={designSystem.colors.primary} />,
          type: 'toggle',
          value: preferences.autoBackup,
          onToggle: (value) => handlePreferenceToggle('autoBackup', value),
        },
        {
          id: 'data-management',
          title: 'Data Management',
          subtitle: 'Storage, backup, and export options',
          icon: <HardDrive size={20} color={designSystem.colors.primary} />,
          type: 'navigation',
          onPress: () => setDataModalVisible(true),
        },
        {
          id: 'reset-preferences',
          title: 'Reset Preferences',
          subtitle: 'Reset all preferences to default',
          icon: <RotateCcw size={20} color={designSystem.colors.error} />,
          type: 'action',
          onPress: () => {
            Alert.alert(
              'Reset Preferences',
              'Are you sure you want to reset all preferences to their default values?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset',
                  style: 'destructive',
                  onPress: () => {
                    const defaultPreferences: UserPreferences = {
                      notifications: true,
                      theme: 'system',
                      language: 'en',
                      soundEnabled: true,
                      vibrationEnabled: true,
                      autoBackup: false,
                    };
                    setPreferences(defaultPreferences);
                    updateProfile({ preferences: defaultPreferences });
                  },
                },
              ]
            );
          },
          destructive: true,
        },
      ],
    },
  ];

  const devicesSections: SettingsSection[] = [
    {
      title: 'Device Management',
      items: [
        {
          id: 'manage-devices',
          title: 'My Devices',
          subtitle: 'View and manage your DAMP devices',
          icon: <Chrome size={20} color={designSystem.colors.primary} />,
          type: 'navigation',
          onPress: () => setDeviceModalVisible(true),
        },
        {
          id: 'device-settings',
          title: 'Device Settings',
          subtitle: 'Configure device behavior',
          icon: <Database size={20} color={designSystem.colors.primary} />,
          type: 'navigation',
          onPress: () => {
            Alert.alert('Coming Soon', 'Device settings will be available in a future update.');
          },
        },
      ],
    },
  ];

  const zonesSections: SettingsSection[] = [
    {
      title: 'Zone Management',
      items: [
        {
          id: 'manage-zones',
          title: 'My Zones',
          subtitle: 'Create and manage location zones',
          icon: <MapPin size={20} color={designSystem.colors.primary} />,
          type: 'navigation',
          onPress: () => setZoneModalVisible(true),
        },
        {
          id: 'zone-monitoring',
          title: 'Zone Monitoring',
          subtitle: 'Configure zone tracking and alerts',
          icon: <Navigation size={20} color={designSystem.colors.primary} />,
          type: 'navigation',
          onPress: () => setZoneModalVisible(true),
        },
      ],
    },
  ];

  const storeSections: SettingsSection[] = [
    {
      title: 'DAMP Store',
      items: [
        {
          id: 'browse-store',
          title: 'Browse Products',
          subtitle: 'Shop premium DAMP smart drinkware',
          icon: <ShoppingBag size={20} color={designSystem.colors.primary} />,
          type: 'navigation',
          onPress: () => setStoreModalVisible(true),
        },
      ],
    },
  ];

  const supportSections: SettingsSection[] = [
    {
      title: 'Help',
      items: [
        {
          id: 'help-center',
          title: 'Help Center',
          subtitle: 'Get help with your DAMP devices',
          icon: <HelpCircle size={20} color={designSystem.colors.primary} />,
          type: 'navigation',
          onPress: () => {
            Alert.alert('Coming Soon', 'Help center will be available in a future update.');
          },
        },
        {
          id: 'contact-support',
          title: 'Contact Support',
          subtitle: 'Get in touch with our team',
          icon: <Bell size={20} color={designSystem.colors.primary} />,
          type: 'navigation',
          onPress: () => {
            Alert.alert('Contact Support', 'Email us at support@damp.com for assistance.');
          },
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          id: 'privacy-policy',
          title: 'Privacy Policy',
          subtitle: 'Learn how we protect your data',
          icon: <Shield size={20} color={designSystem.colors.primary} />,
          type: 'navigation',
          onPress: () => {
            Alert.alert('Coming Soon', 'Privacy policy will be available in a future update.');
          },
        },
        {
          id: 'terms-of-service',
          title: 'Terms of Service',
          subtitle: 'Read our terms and conditions',
          icon: <Shield size={20} color={designSystem.colors.primary} />,
          type: 'navigation',
          onPress: () => {
            Alert.alert('Coming Soon', 'Terms of service will be available in a future update.');
          },
        },
      ],
    },
  ];

  const getCurrentSections = () => {
    switch (activeTab) {
      case 'account':
        return accountSections;
      case 'preferences':
        return preferencesSections;
      case 'devices':
        return devicesSections;
      case 'zones':
        return zonesSections;
      case 'store':
        return storeSections;
      case 'support':
        return supportSections;
      default:
        return accountSections;
    }
  };

  const renderSettingItem = (item: SettingsSection['items'][0], isLast: boolean) => (
    <TouchableOpacity
      key={item.id}
      style={[
        settingsStyles.settingItem,
        isLast && settingsStyles.lastSettingItem,
        item.destructive && settingsStyles.destructiveSettingItem,
      ]}
      onPress={item.onPress}
      disabled={item.type === 'toggle' || loading || cleaningData}
      accessibilityLabel={item.title}
      accessibilityRole="button"
    >
      <View style={settingsStyles.settingLeft}>
        <View style={[
          settingsStyles.settingIcon,
          item.destructive && settingsStyles.destructiveSettingIcon,
        ]}>
          {item.id === 'clean-data' && cleaningData ? (
            <ActivityIndicator size="small" color={designSystem.colors.warning} />
          ) : (
            item.icon
          )}
        </View>
        <View style={settingsStyles.settingText}>
          <Text style={[
            settingsStyles.settingTitle,
            item.destructive && settingsStyles.destructiveSettingTitle,
          ]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={settingsStyles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      {item.type === 'toggle' && item.onToggle && (
        <Switch
          value={item.value as boolean}
          onValueChange={item.onToggle}
          trackColor={{ false: designSystem.colors.disabled, true: designSystem.colors.primaryLighter }}
          thumbColor={item.value ? designSystem.colors.primary : '#F4F3F4'}
          disabled={loading || cleaningData}
          style={settingsStyles.switch}
        />
      )}
      {item.type === 'navigation' && (
        <Text style={settingsStyles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );

  // Render specialized tab content for devices, zones, and store
  if (activeTab === 'devices') {
    return (
      <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={settingsStyles.container}>
        <SafeAreaView style={settingsStyles.safeArea} edges={['top', 'left', 'right']}>
          <View style={settingsStyles.header}>
            <Text style={settingsStyles.title}>Settings</Text>
            <Text style={settingsStyles.subtitle}>Customize your DAMP experience</Text>
          </View>

          <View style={settingsStyles.tabContainer}>
            <CategorySlider 
              categories={tabs}
              selectedCategory={activeTab}
              onSelectCategory={setActiveTab}
            />
          </View>

          <DeviceManagement />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (loading) {
    return (
      <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={settingsStyles.container}>
        <SafeAreaView style={settingsStyles.safeArea}>
          <View style={settingsStyles.loadingContainer}>
            <ActivityIndicator size="large" color={designSystem.colors.primary} />
            <Text style={settingsStyles.loadingText}>Loading settings...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={settingsStyles.container}>
      <SafeAreaView style={settingsStyles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={settingsStyles.header}>
          <Text style={settingsStyles.title}>Settings</Text>
          <Text style={settingsStyles.subtitle}>Customize your DAMP experience</Text>
        </View>

        {/* Tab Navigation - Using CategorySlider for horizontal scrolling */}
        <View style={settingsStyles.tabContainer}>
          <CategorySlider 
            categories={tabs}
            selectedCategory={activeTab}
            onSelectCategory={setActiveTab}
          />
        </View>

        {/* Content */}
        <ScrollView style={settingsStyles.content} showsVerticalScrollIndicator={false}>
          {getCurrentSections().map((section, sectionIndex) => (
            <View key={sectionIndex} style={settingsStyles.section}>
              <Text style={settingsStyles.sectionTitle}>{section.title}</Text>
              <View style={settingsStyles.sectionContent}>
                {section.items.map((item, itemIndex) =>
                  renderSettingItem(item, itemIndex === section.items.length - 1)
                )}
              </View>
            </View>
          ))}
          <View style={settingsStyles.spacer} />
        </ScrollView>

        {/* Modals */}
        <AccountInfoModal
          visible={accountModalVisible}
          onClose={() => setAccountModalVisible(false)}
          user={user}
          onEdit={() => {
            setAccountModalVisible(false);
            setEditModalVisible(true);
          }}
        />

        <EditProfileModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          user={user}
          onSave={handleProfileSave}
        />

        <ThemePickerModal
          visible={themeModalVisible}
          onClose={() => setThemeModalVisible(false)}
          currentTheme={preferences.theme}
          onSelect={handleThemeSelect}
        />

        <LanguagePickerModal
          visible={languageModalVisible}
          onClose={() => setLanguageModalVisible(false)}
          currentLanguage={preferences.language}
          onSelect={handleLanguageSelect}
        />

        <DeviceManagementModal
          visible={deviceModalVisible}
          onClose={() => setDeviceModalVisible(false)}
        />

        <PrivacySettingsModal
          visible={privacyModalVisible}
          onClose={() => setPrivacyModalVisible(false)}
        />

        <DataManagementModal
          visible={dataModalVisible}
          onClose={() => setDataModalVisible(false)}
        />

        <AccessibilityModal
          visible={accessibilityModalVisible}
          onClose={() => setAccessibilityModalVisible(false)}
        />

        <SubscriptionModal
          visible={subscriptionModalVisible}
          onClose={() => setSubscriptionModalVisible(false)}
        />

        <StoreModal
          visible={storeModalVisible}
          onClose={() => setStoreModalVisible(false)}
        />

        <ZoneManagementModal
          visible={zoneModalVisible}
          onClose={() => setZoneModalVisible(false)}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}