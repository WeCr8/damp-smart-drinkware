/**
 * Privacy Settings Modal
 * 
 * Comprehensive privacy and security settings
 */

import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Shield, Eye, EyeOff, Lock, Key, MapPin, Database, Share2, Trash2, Download, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import BaseModal from './BaseModal';
import { settingsStyles } from '@/styles/settings';
import { BaseModalProps } from '@/types/settings';

interface PrivacySettingsModalProps extends BaseModalProps {}

interface PrivacySettings {
  dataCollection: boolean;
  locationTracking: boolean;
  analyticsSharing: boolean;
  marketingEmails: boolean;
  thirdPartySharing: boolean;
  crashReporting: boolean;
  usageStatistics: boolean;
  personalizedAds: boolean;
}

export default function PrivacySettingsModal({
  visible,
  onClose,
}: PrivacySettingsModalProps) {
  const [settings, setSettings] = useState<PrivacySettings>({
    dataCollection: true,
    locationTracking: true,
    analyticsSharing: false,
    marketingEmails: false,
    thirdPartySharing: false,
    crashReporting: true,
    usageStatistics: true,
    personalizedAds: false,
  });

  const handleToggle = (key: keyof PrivacySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleDataExport = () => {
    Alert.alert(
      'Export Personal Data',
      'We will prepare your data export and send it to your email address within 24 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request Export', onPress: () => {
          Alert.alert('Export Requested', 'You will receive an email with your data export within 24 hours.');
        }},
      ]
    );
  };

  const handleDataDeletion = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your data including devices, preferences, and account information. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All Data',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Are you absolutely sure? This will delete everything and close your account.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete Everything',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Data Deletion Scheduled', 'Your data will be deleted within 30 days. You can cancel this request by contacting support.');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const privacySections = [
    {
      title: 'Data Collection',
      items: [
        {
          key: 'dataCollection' as keyof PrivacySettings,
          title: 'Essential Data Collection',
          subtitle: 'Required for app functionality',
          icon: <Database size={20} color="#0277BD" />,
          required: true,
        },
        {
          key: 'locationTracking' as keyof PrivacySettings,
          title: 'Location Tracking',
          subtitle: 'For device zone detection',
          icon: <MapPin size={20} color="#0277BD" />,
        },
        {
          key: 'usageStatistics' as keyof PrivacySettings,
          title: 'Usage Statistics',
          subtitle: 'Help improve the app',
          icon: <Eye size={20} color="#0277BD" />,
        },
        {
          key: 'crashReporting' as keyof PrivacySettings,
          title: 'Crash Reporting',
          subtitle: 'Automatic error reporting',
          icon: <AlertTriangle size={20} color="#0277BD" />,
        },
      ],
    },
    {
      title: 'Sharing & Marketing',
      items: [
        {
          key: 'analyticsSharing' as keyof PrivacySettings,
          title: 'Analytics Sharing',
          subtitle: 'Share anonymized usage data',
          icon: <Share2 size={20} color="#0277BD" />,
        },
        {
          key: 'thirdPartySharing' as keyof PrivacySettings,
          title: 'Third-party Sharing',
          subtitle: 'Share data with partners',
          icon: <Shield size={20} color="#0277BD" />,
        },
        {
          key: 'marketingEmails' as keyof PrivacySettings,
          title: 'Marketing Emails',
          subtitle: 'Receive promotional content',
          icon: <Share2 size={20} color="#0277BD" />,
        },
        {
          key: 'personalizedAds' as keyof PrivacySettings,
          title: 'Personalized Ads',
          subtitle: 'Show relevant advertisements',
          icon: <Eye size={20} color="#0277BD" />,
        },
      ],
    },
  ];

  const securityActions = [
    {
      title: 'Two-Factor Authentication',
      subtitle: 'Add an extra layer of security',
      icon: <Key size={20} color="#0277BD" />,
      onPress: () => {
        Alert.alert('Coming Soon', '2FA will be available in a future update.');
      },
    },
    {
      title: 'Change Password',
      subtitle: 'Update your account password',
      icon: <Lock size={20} color="#0277BD" />,
      onPress: () => {
        Alert.alert('Coming Soon', 'Password change will be available in a future update.');
      },
    },
    {
      title: 'Export Personal Data',
      subtitle: 'Download all your data',
      icon: <Download size={20} color="#0277BD" />,
      onPress: handleDataExport,
    },
    {
      title: 'Delete All Data',
      subtitle: 'Permanently remove your account',
      icon: <Trash2 size={20} color="#F44336" />,
      onPress: handleDataDeletion,
      destructive: true,
    },
  ];

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Privacy & Security"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Privacy Settings */}
        {privacySections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={settingsStyles.section}>
            <Text style={settingsStyles.sectionTitle}>{section.title}</Text>
            <View style={settingsStyles.sectionContent}>
              {section.items.map((item, itemIndex) => {
                const isLast = itemIndex === section.items.length - 1;
                return (
                  <View
                    key={item.key}
                    style={[
                      settingsStyles.settingItem,
                      isLast && settingsStyles.lastSettingItem,
                    ]}
                  >
                    <View style={settingsStyles.settingLeft}>
                      <View style={settingsStyles.settingIcon}>
                        {item.icon}
                      </View>
                      <View style={settingsStyles.settingText}>
                        <Text style={settingsStyles.settingTitle}>
                          {item.title}
                          {item.required && (
                            <Text style={{ color: '#F44336' }}> *</Text>
                          )}
                        </Text>
                        <Text style={settingsStyles.settingSubtitle}>
                          {item.subtitle}
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={settings[item.key]}
                      onValueChange={(value) => handleToggle(item.key, value)}
                      trackColor={{ false: '#E0E0E0', true: '#81D4FA' }}
                      thumbColor={settings[item.key] ? '#0277BD' : '#F4F3F4'}
                      disabled={item.required}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {/* Security Actions */}
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>Security Actions</Text>
          <View style={settingsStyles.sectionContent}>
            {securityActions.map((action, index) => {
              const isLast = index === securityActions.length - 1;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    settingsStyles.settingItem,
                    isLast && settingsStyles.lastSettingItem,
                    action.destructive && settingsStyles.destructiveSettingItem,
                  ]}
                  onPress={action.onPress}
                >
                  <View style={settingsStyles.settingLeft}>
                    <View style={[
                      settingsStyles.settingIcon,
                      action.destructive && settingsStyles.destructiveSettingIcon,
                    ]}>
                      {action.icon}
                    </View>
                    <View style={settingsStyles.settingText}>
                      <Text style={[
                        settingsStyles.settingTitle,
                        action.destructive && settingsStyles.destructiveSettingTitle,
                      ]}>
                        {action.title}
                      </Text>
                      <Text style={settingsStyles.settingSubtitle}>
                        {action.subtitle}
                      </Text>
                    </View>
                  </View>
                  <Text style={settingsStyles.chevron}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={[settingsStyles.section, { marginBottom: 40 }]}>
          <View style={settingsStyles.errorContainer}>
            <Text style={[settingsStyles.errorTitle, { color: '#0277BD' }]}>
              Privacy Notice
            </Text>
            <Text style={[settingsStyles.errorMessage, { color: '#64B5F6' }]}>
              We are committed to protecting your privacy. Required settings marked with * 
              are essential for app functionality and cannot be disabled. 
              All other settings are optional and can be changed at any time.
            </Text>
          </View>
        </View>
      </ScrollView>
    </BaseModal>
  );
}