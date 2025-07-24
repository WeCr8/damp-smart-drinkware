/**
 * Language Picker Modal
 * 
 * Allows users to select their preferred language
 */

import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Check, Globe } from 'lucide-react-native';
import BaseModal from './BaseModal';
import { settingsStyles } from '@/styles/settings';
import { LanguagePickerModalProps } from '@/types/settings';

const languages = [
  { value: 'en', label: 'English', nativeName: 'English' },
  { value: 'es', label: 'Spanish', nativeName: 'Español' },
  { value: 'fr', label: 'French', nativeName: 'Français' },
  { value: 'de', label: 'German', nativeName: 'Deutsch' },
  { value: 'it', label: 'Italian', nativeName: 'Italiano' },
  { value: 'pt', label: 'Portuguese', nativeName: 'Português' },
  { value: 'zh', label: 'Chinese', nativeName: '中文' },
  { value: 'ja', label: 'Japanese', nativeName: '日本語' },
  { value: 'ko', label: 'Korean', nativeName: '한국어' },
];

export default function LanguagePickerModal({
  visible,
  onClose,
  currentLanguage,
  onSelect,
}: LanguagePickerModalProps) {
  const handleSelect = (language: string) => {
    onSelect(language);
    onClose();
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Choose Language"
      presentationStyle="formSheet"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={settingsStyles.pickerContainer}>
          {languages.map((language, index) => {
            const isSelected = currentLanguage === language.value;
            const isLast = index === languages.length - 1;

            return (
              <TouchableOpacity
                key={language.value}
                style={[
                  settingsStyles.pickerItem,
                  isSelected && settingsStyles.selectedPickerItem,
                  isLast && settingsStyles.lastPickerItem,
                ]}
                onPress={() => handleSelect(language.value)}
                accessibilityLabel={`Select ${language.label} language`}
                accessibilityRole="button"
              >
                <View style={settingsStyles.settingLeft}>
                  <View style={settingsStyles.settingIcon}>
                    <Globe size={24} color="#0277BD" />
                  </View>
                  <View style={settingsStyles.settingText}>
                    <Text
                      style={[
                        settingsStyles.pickerItemText,
                        isSelected && settingsStyles.selectedPickerItemText,
                      ]}
                    >
                      {language.label}
                    </Text>
                    <Text style={settingsStyles.settingSubtitle}>
                      {language.nativeName}
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