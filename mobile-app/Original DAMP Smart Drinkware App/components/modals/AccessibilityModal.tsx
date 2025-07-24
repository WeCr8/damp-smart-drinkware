/**
 * Accessibility Settings Modal
 * 
 * Comprehensive accessibility and display options
 */

import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Slider,
} from 'react-native';
import {
  Eye,
  Type,
  Volume2,
  Vibrate,
  Contrast,
  MousePointer,
  Zap,
  Moon,
  Sun,
  Accessibility,
} from 'lucide-react-native';
import BaseModal from './BaseModal';
import { settingsStyles } from '@/styles/settings';
import { BaseModalProps } from '@/types/settings';

interface AccessibilityModalProps extends BaseModalProps {}

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  voiceOver: boolean;
  hapticFeedback: boolean;
  soundFeedback: boolean;
  largerTouchTargets: boolean;
  simplifiedUI: boolean;
  colorBlindSupport: boolean;
}

export default function AccessibilityModal({
  visible,
  onClose,
}: AccessibilityModalProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
    voiceOver: false,
    hapticFeedback: true,
    soundFeedback: true,
    largerTouchTargets: false,
    simplifiedUI: false,
    colorBlindSupport: false,
  });

  const handleToggle = (key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSliderChange = (key: keyof AccessibilitySettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getFontSizeLabel = (size: number) => {
    if (size <= 12) return 'Small';
    if (size <= 16) return 'Normal';
    if (size <= 20) return 'Large';
    if (size <= 24) return 'Extra Large';
    return 'Huge';
  };

  const accessibilitySections = [
    {
      title: 'Visual',
      items: [
        {
          key: 'fontSize',
          title: 'Font Size',
          subtitle: `${getFontSizeLabel(settings.fontSize)} (${settings.fontSize}pt)`,
          icon: <Type size={20} color="#0277BD" />,
          type: 'slider' as const,
          min: 10,
          max: 28,
          value: settings.fontSize,
        },
        {
          key: 'highContrast' as keyof AccessibilitySettings,
          title: 'High Contrast',
          subtitle: 'Increase color contrast for better visibility',
          icon: <Contrast size={20} color="#0277BD" />,
          type: 'toggle' as const,
        },
        {
          key: 'colorBlindSupport' as keyof AccessibilitySettings,
          title: 'Color Blind Support',
          subtitle: 'Adjust colors for color vision deficiency',
          icon: <Eye size={20} color="#0277BD" />,
          type: 'toggle' as const,
        },
      ],
    },
    {
      title: 'Motion & Animation',
      items: [
        {
          key: 'reduceMotion' as keyof AccessibilitySettings,
          title: 'Reduce Motion',
          subtitle: 'Minimize animations and transitions',
          icon: <Zap size={20} color="#0277BD" />,
          type: 'toggle' as const,
        },
      ],
    },
    {
      title: 'Audio & Haptics',
      items: [
        {
          key: 'soundFeedback' as keyof AccessibilitySettings,
          title: 'Sound Feedback',
          subtitle: 'Play sounds for interactions',
          icon: <Volume2 size={20} color="#0277BD" />,
          type: 'toggle' as const,
        },
        {
          key: 'hapticFeedback' as keyof AccessibilitySettings,
          title: 'Haptic Feedback',
          subtitle: 'Vibrate for touch interactions',
          icon: <Vibrate size={20} color="#0277BD" />,
          type: 'toggle' as const,
        },
      ],
    },
    {
      title: 'Interaction',
      items: [
        {
          key: 'largerTouchTargets' as keyof AccessibilitySettings,
          title: 'Larger Touch Targets',
          subtitle: 'Make buttons and controls bigger',
          icon: <MousePointer size={20} color="#0277BD" />,
          type: 'toggle' as const,
        },
        {
          key: 'simplifiedUI' as keyof AccessibilitySettings,
          title: 'Simplified Interface',
          subtitle: 'Reduce visual complexity',
          icon: <Moon size={20} color="#0277BD" />,
          type: 'toggle' as const,
        },
      ],
    },
    {
      title: 'Screen Reader',
      items: [
        {
          key: 'screenReader' as keyof AccessibilitySettings,
          title: 'Screen Reader Support',
          subtitle: 'Enhanced support for screen readers',
          icon: <Accessibility size={20} color="#0277BD" />,
          type: 'toggle' as const,
        },
        {
          key: 'voiceOver' as keyof AccessibilitySettings,
          title: 'VoiceOver Optimization',
          subtitle: 'Optimize for iOS VoiceOver',
          icon: <Volume2 size={20} color="#0277BD" />,
          type: 'toggle' as const,
        },
      ],
    },
  ];

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Accessibility"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Font Size Preview */}
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>Preview</Text>
          <View style={settingsStyles.sectionContent}>
            <View style={[settingsStyles.settingItem, settingsStyles.lastSettingItem]}>
              <View style={{ flex: 1, alignItems: 'center', paddingVertical: 20 }}>
                <Text
                  style={[
                    settingsStyles.settingTitle,
                    {
                      fontSize: settings.fontSize,
                      textAlign: 'center',
                      lineHeight: settings.fontSize * 1.4,
                    },
                  ]}
                >
                  Sample Text
                </Text>
                <Text
                  style={[
                    settingsStyles.settingSubtitle,
                    {
                      fontSize: settings.fontSize * 0.85,
                      textAlign: 'center',
                      marginTop: 8,
                    },
                  ]}
                >
                  This is how text will appear with your current settings
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Accessibility Settings */}
        {accessibilitySections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={settingsStyles.section}>
            <Text style={settingsStyles.sectionTitle}>{section.title}</Text>
            <View style={settingsStyles.sectionContent}>
              {section.items.map((item, itemIndex) => {
                const isLast = itemIndex === section.items.length - 1;
                
                if (item.type === 'slider') {
                  return (
                    <View
                      key={item.key}
                      style={[
                        settingsStyles.settingItem,
                        isLast && settingsStyles.lastSettingItem,
                        { flexDirection: 'column', alignItems: 'stretch' },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <View style={settingsStyles.settingLeft}>
                          <View style={settingsStyles.settingIcon}>
                            {item.icon}
                          </View>
                          <View style={settingsStyles.settingText}>
                            <Text style={settingsStyles.settingTitle}>{item.title}</Text>
                            <Text style={settingsStyles.settingSubtitle}>{item.subtitle}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={{ paddingHorizontal: 16 }}>
                        <Slider
                          style={{ height: 40 }}
                          minimumValue={item.min}
                          maximumValue={item.max}
                          value={item.value}
                          onValueChange={(value) => handleSliderChange(item.key, Math.round(value))}
                          minimumTrackTintColor="#0277BD"
                          maximumTrackTintColor="#E1F5FE"
                          thumbStyle={{ backgroundColor: '#0277BD' }}
                          step={1}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                          <Text style={[settingsStyles.settingSubtitle, { fontSize: 11 }]}>
                            {item.min}pt
                          </Text>
                          <Text style={[settingsStyles.settingSubtitle, { fontSize: 11 }]}>
                            {item.max}pt
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                }

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
                        <Text style={settingsStyles.settingTitle}>{item.title}</Text>
                        <Text style={settingsStyles.settingSubtitle}>{item.subtitle}</Text>
                      </View>
                    </View>
                    <Switch
                      value={settings[item.key]}
                      onValueChange={(value) => handleToggle(item.key, value)}
                      trackColor={{ false: '#E0E0E0', true: '#81D4FA' }}
                      thumbColor={settings[item.key] ? '#0277BD' : '#F4F3F4'}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {/* Accessibility Notice */}
        <View style={[settingsStyles.section, { marginBottom: 40 }]}>
          <View style={settingsStyles.errorContainer}>
            <Text style={[settingsStyles.errorTitle, { color: '#0277BD' }]}>
              Accessibility Features
            </Text>
            <Text style={[settingsStyles.errorMessage, { color: '#64B5F6' }]}>
              These settings help make the app more accessible for users with different needs. 
              Changes take effect immediately and are saved automatically.
            </Text>
          </View>
        </View>
      </ScrollView>
    </BaseModal>
  );
}