import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';

interface SettingsCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
  toggle?: {
    value: boolean;
    onChange: (value: boolean) => void;
  };
}

export function SettingsCard({ icon, title, description, onPress, toggle }: SettingsCardProps) {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {toggle ? (
        <Switch
          value={toggle.value}
          onValueChange={toggle.onChange}
          trackColor={{ false: '#E0E0E0', true: '#81D4FA' }}
          thumbColor={toggle.value ? '#0277BD' : '#F4F3F4'}
        />
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FCFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
  },
  chevron: {
    fontSize: 24,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
  },
});