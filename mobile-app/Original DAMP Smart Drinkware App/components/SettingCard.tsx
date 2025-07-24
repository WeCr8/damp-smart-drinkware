/**
 * Setting Card Component
 * 
 * Reusable card component for settings items with consistent design
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

interface SettingCardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  destructive?: boolean;
  loading?: boolean;
  disabled?: boolean;
  isLast?: boolean;
}

export default function SettingCard({
  title,
  subtitle,
  icon,
  type,
  value,
  onToggle,
  onPress,
  destructive = false,
  loading = false,
  disabled = false,
  isLast = false,
}: SettingCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.settingItem,
        isLast && styles.lastSettingItem,
        destructive && styles.destructiveSettingItem,
      ]}
      onPress={type !== 'toggle' ? onPress : undefined}
      disabled={disabled || loading || type === 'toggle'}
      accessibilityLabel={title}
      accessibilityRole="button"
    >
      <View style={styles.settingLeft}>
        <View style={[
          styles.settingIcon,
          destructive && styles.destructiveSettingIcon,
        ]}>
          {loading ? (
            <ActivityIndicator size="small" color={destructive ? "#F44336" : "#0277BD"} />
          ) : (
            icon
          )}
        </View>
        <View style={styles.settingText}>
          <Text style={[
            styles.settingTitle,
            destructive && styles.destructiveSettingTitle,
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      
      {type === 'toggle' && onToggle && (
        <Switch
          value={value || false}
          onValueChange={onToggle}
          trackColor={{ false: '#E0E0E0', true: '#81D4FA' }}
          thumbColor={value ? '#0277BD' : '#F4F3F4'}
          disabled={disabled || loading}
          style={styles.switch}
        />
      )}
      
      {type === 'navigation' && (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FCFF',
    minHeight: 64,
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  destructiveSettingItem: {
    backgroundColor: '#FFEBEE',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FCFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  destructiveSettingIcon: {
    backgroundColor: '#FFCDD2',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#0277BD',
    marginBottom: 2,
  },
  destructiveSettingTitle: {
    color: '#F44336',
  },
  settingSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  chevron: {
    fontSize: 22,
    color: '#64B5F6',
    fontFamily: 'Inter-Regular',
  },
});