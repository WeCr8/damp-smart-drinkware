import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Battery, Wifi, WifiOff, MapPin, Coffee, Baby, Droplets } from 'lucide-react-native';
import { Device } from '@/utils/supabaseDeviceManager';

interface DeviceCardProps {
  device: Device;
  onPress: (device: Device) => void;
}

export default function DeviceCard({ device, onPress }: DeviceCardProps) {
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'cup':
        return <Coffee size={24} color="#0277BD" />;
      case 'bottle':
        return <Baby size={24} color="#0277BD" />;
      case 'sleeve':
      case 'bottom':
      case 'damp-cup':
      default:
        return <Droplets size={24} color="#0277BD" />;
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return '#4CAF50';
    if (level > 20) return '#FF9800';
    return '#F44336';
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <TouchableOpacity
      style={styles.deviceCard}
      onPress={() => onPress(device)}
      testID="device-card"
      accessibilityLabel={`${device.name} device card`}
      accessibilityRole="button"
    >
      <View style={styles.deviceIcon}>
        {device.metadata?.image ? (
          <Image
            source={{ uri: device.metadata.image }}
            style={styles.deviceImage}
          />
        ) : (
          getDeviceIcon(device.type)
        )}
      </View>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{device.name}</Text>
        <Text style={styles.deviceStatus}>
          {device.status === 'connected' ? 'Connected' : 'Disconnected'} • {formatLastSeen(device.lastSeen)}
        </Text>
        {device.zoneId && (
          <Text style={styles.deviceZone}>
            Zone: {device.zoneId}
          </Text>
        )}
      </View>
      <View style={styles.deviceMeta}>
        <View style={styles.batteryContainer}>
          <Battery size={16} color={getBatteryColor(device.batteryLevel)} />
          <Text style={[styles.batteryText, { color: getBatteryColor(device.batteryLevel) }]}>
            {device.batteryLevel}%
          </Text>
        </View>
        <View style={[
          styles.connectionStatus,
          { backgroundColor: device.status === 'connected' ? '#E8F5E8' : '#FFEBEE' }
        ]}>
          {device.status === 'connected' ? (
            <Wifi size={16} color="#4CAF50" />
          ) : (
            <WifiOff size={16} color="#F44336" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FCFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deviceImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
  },
  deviceStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginTop: 2,
  },
  deviceZone: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#81C784',
    marginTop: 2,
  },
  deviceMeta: {
    alignItems: 'flex-end',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  batteryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  connectionStatus: {
    borderRadius: 12,
    padding: 6,
  },
});