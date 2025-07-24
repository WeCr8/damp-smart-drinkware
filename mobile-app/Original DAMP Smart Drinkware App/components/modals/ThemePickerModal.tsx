/**
 * Theme Picker Modal
 * 
 * Allows users to select their preferred theme
 */

import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Check, Sun, Moon, Smartphone } from 'lucide-react-native';
import BaseModal from './BaseModal';
import { settingsStyles } from '@/styles/settings';
import { ThemePickerModalProps } from '@/types/settings';

const themes = [
  {
    value: 'light',
    label: 'Light',
    description: 'Clean and bright interface',
    icon: <Sun size={24} color="#0277BD" />,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Easy on the eyes in low light',
    icon: <Moon size={24} color="#0277BD" />,
  },
  {
    value: 'system',
    label: 'System',
    description: 'Matches your device settings',
    icon: <Smartphone size={24} color="#0277BD" />,
  },
];

export default function ThemePickerModal({
  visible,
  onClose,
  currentTheme,
  onSelect,
}: ThemePickerModalProps) {
  const handleSelect = (theme: string) => {
    onSelect(theme);
    onClose();
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Choose Theme"
      presentationStyle="formSheet"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={settingsStyles.pickerContainer}>
          {themes.map((theme, index) => {
            const isSelected = currentTheme === theme.value;
            const isLast = index === themes.length - 1;

            return (
              <TouchableOpacity
                key={theme.value}
                style={[
                  settingsStyles.pickerItem,
                  isSelected && settingsStyles.selectedPickerItem,
                  isLast && settingsStyles.lastPickerItem,
                ]}
                onPress={() => handleSelect(theme.value)}
                accessibilityLabel={`Select ${theme.label} theme`}
                accessibilityRole="button"
              >
                <View style={settingsStyles.settingLeft}>
                  <View style={settingsStyles.settingIcon}>
                    {theme.icon}
                  </View>
                  <View style={settingsStyles.settingText}>
                    <Text
                      style={[
                        settingsStyles.pickerItemText,
                        isSelected && settingsStyles.selectedPickerItemText,
                      ]}
                    >
                      {theme.label}
                    </Text>
                    <Text style={settingsStyles.settingSubtitle}>
                      {theme.description}
                    </Text>
                  </View>
                </View>
                {isSelected && (
                  <View style={settingsStyles.checkIcon}>
                    <Check size={20} color="#0277BD" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={settingsStyles.spacer} />
      </ScrollView>
    </BaseModal>
  );
}