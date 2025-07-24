import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
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
  Smartphone,
  ShoppingBag,
  MapPin,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  AccountInfoModal,
  EditProfileModal,
  ThemePickerModal,
  LanguagePickerModal,
} from '@/components/modals';
import DeviceManagementModal from '@/components/modals/DeviceManagementModal';
import PrivacySettingsModal from '@/components/modals/PrivacySettingsModal';
import SubscriptionModal from '@/components/modals/SubscriptionModal';
import StoreModal from '@/components/modals/StoreModal';
import ZoneManagementModal from '@/components/modals/ZoneManagementModal';
import { SettingsCard } from '@/components/SettingsCard';

export default function Settings() {
  const { user, signOut, updateProfile, loading } = useAuth();
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [deviceModalVisible, setDeviceModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [storeModalVisible, setStoreModalVisible] = useState(false);
  const [zoneModalVisible, setZoneModalVisible] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    notifications: user?.preferences?.notifications ?? true,
    theme: user?.preferences?.theme ?? 'system',
    language: user?.preferences?.language ?? 'en',
  });

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      setSubscriptionLoading(true);
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status')
        .maybeSingle();

      if (!error && data) {
        setSubscriptionStatus(data.subscription_status);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  if (!user) {
    return (
      <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Authentication Required</Text>
            <Text style={styles.errorMessage}>
              Please log in to access your settings
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const handleProfileSave = useCallback(async (updates: Partial<typeof user>) => {
    await updateProfile(updates);
  }, [updateProfile]);

  const handleSignOut = useCallback(async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Failed to sign out:', error);
    }
  }, [signOut]);

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

  if (loading) {
    return (
      <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0277BD" />
            <Text style={styles.loadingText}>Loading settings...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your DAMP experience</Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.cardsContainer}>
              <SettingsCard
                icon={<User size={24} color="#0277BD" />}
                title="Profile"
                description="View and edit your profile details"
                onPress={() => setAccountModalVisible(true)}
              />
              <SettingsCard
                icon={<CreditCard size={24} color="#0277BD" />}
                title="Subscription"
                description={subscriptionLoading 
                  ? 'Loading subscription status...' 
                  : subscriptionStatus === 'active' 
                    ? 'DAMP+ Active' 
                    : 'Manage your DAMP+ subscription'}
                onPress={() => setSubscriptionModalVisible(true)}
              />
              <SettingsCard
                icon={<Shield size={24} color="#0277BD" />}
                title="Privacy & Security"
                description="Manage your privacy settings"
                onPress={() => setPrivacyModalVisible(true)}
              />
            </View>
          </View>

          {/* Devices & Zones Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Devices & Zones</Text>
            <View style={styles.cardsContainer}>
              <SettingsCard
                icon={<Smartphone size={24} color="#0277BD" />}
                title="My Devices"
                description="View and manage your DAMP devices"
                onPress={() => setDeviceModalVisible(true)}
              />
              <SettingsCard
                icon={<MapPin size={24} color="#0277BD" />}
                title="My Zones"
                description="Create and manage location zones"
                onPress={() => setZoneModalVisible(true)}
              />
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.cardsContainer}>
              <SettingsCard
                icon={<Bell size={24} color="#0277BD" />}
                title="Notifications"
                description={preferences.notifications ? 'Enabled' : 'Disabled'}
                onPress={() => {
                  const newValue = !preferences.notifications;
                  setPreferences(prev => ({ ...prev, notifications: newValue }));
                  updateProfile({ preferences: { ...preferences, notifications: newValue } });
                }}
                toggle={{
                  value: preferences.notifications,
                  onChange: (value) => {
                    setPreferences(prev => ({ ...prev, notifications: value }));
                    updateProfile({ preferences: { ...preferences, notifications: value } });
                  }
                }}
              />
              <SettingsCard
                icon={<Palette size={24} color="#0277BD" />}
                title="Theme"
                description={`${preferences.theme.charAt(0).toUpperCase() + preferences.theme.slice(1)}`}
                onPress={() => setThemeModalVisible(true)}
              />
              <SettingsCard
                icon={<Globe size={24} color="#0277BD" />}
                title="Language"
                description={getLanguageLabel(preferences.language)}
                onPress={() => setLanguageModalVisible(true)}
              />
            </View>
          </View>

          {/* Store & Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Store & Support</Text>
            <View style={styles.cardsContainer}>
              <SettingsCard
                icon={<ShoppingBag size={24} color="#0277BD" />}
                title="DAMP Store"
                description="Shop premium DAMP smart drinkware"
                onPress={() => setStoreModalVisible(true)}
              />
              <SettingsCard
                icon={<HelpCircle size={24} color="#0277BD" />}
                title="Help & Support"
                description="Get help with your DAMP devices"
                onPress={() => {
                  // Show help options
                }}
              />
            </View>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={20} color="#F44336" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <View style={styles.spacer} />
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
          onSelect={(theme) => {
            setPreferences(prev => ({ ...prev, theme }));
            updateProfile({ preferences: { ...preferences, theme } });
          }}
        />

        <LanguagePickerModal
          visible={languageModalVisible}
          onClose={() => setLanguageModalVisible(false)}
          currentLanguage={preferences.language}
          onSelect={(language) => {
            setPreferences(prev => ({ ...prev, language }));
            updateProfile({ preferences: { ...preferences, language } });
          }}
        />

        <DeviceManagementModal
          visible={deviceModalVisible}
          onClose={() => setDeviceModalVisible(false)}
        />

        <PrivacySettingsModal
          visible={privacyModalVisible}
          onClose={() => setPrivacyModalVisible(false)}
        />

        <SubscriptionModal
          visible={subscriptionModalVisible}
          onClose={() => {
            setSubscriptionModalVisible(false);
            fetchSubscriptionStatus(); // Refresh subscription status when modal closes
          }}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#0277BD',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginBottom: 12,
  },
  cardsContainer: {
    gap: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 12,
    marginBottom: 24,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F44336',
    marginLeft: 8,
  },
  spacer: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#F44336',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F44336',
    textAlign: 'center',
  },
});