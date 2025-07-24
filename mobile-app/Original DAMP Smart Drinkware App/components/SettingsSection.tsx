/**
 * Settings Section Component
 * 
 * Reusable component for grouping related settings with a title and card-based UI
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SettingCard from './SettingCard';

interface SettingItem {
  id: string;
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
}

interface SettingsSectionProps {
  title: string;
  items: SettingItem[];
}

export default function SettingsSection({ title, items }: SettingsSectionProps) {
  if (items.length === 0) return null;
  
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {items.map((item, index) => (
          <SettingCard
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            icon={item.icon}
            type={item.type}
            value={item.value}
            onToggle={item.onToggle}
            onPress={item.onPress}
            destructive={item.destructive}
            loading={item.loading}
            disabled={item.disabled}
            isLast={index === items.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});