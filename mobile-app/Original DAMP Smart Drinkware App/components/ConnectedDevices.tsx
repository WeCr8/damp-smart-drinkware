import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  Image
} from 'react-native';
import { 
  Bluetooth, 
  Battery, 
  Wifi, 
  WifiOff, 
  MapPin, 
  Clock, 
  Coffee, 
  Baby, 
  Droplets,
  Info
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getAllDevices, getDevicesByStatus, type Device } from '@/utils/deviceManager';
import DeviceInfoModal from '@/components/modals/DeviceInfoModal';

interface ConnectedDevicesProps {
  showTitle?: boolean;
  maxDevices?: number;
  onDevicePress?: (device: Device) => void;
  showEmptyState?: boolean;
  emptyStateMessage?: string;
  filterByStatus?: 'connected' | 'disconnected' | 'all';
}

export default function ConnectedDevices({
  showTitle = true,
  maxDevices,
  onDevicePress,
  showEmptyState = true,
  emptyStateMessage = 'No devices found',
  filterByStatus = 'all'
}: ConnectedDevicesProps) {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceInfoModalVisible, setDeviceInfoModalVisible] = useState(false);

  useEffect(() => {
    loadDevices();
  }, [filterByStatus]);

  const loadDevices = () => {
    setLoading(true);
    try {
      // Get devices based on filter
      let userDevices: Device[] = [];
      
      if (filterByStatus === 'all') {
        userDevices = getAllDevices();
      } else {
        userDevices = getDevicesByStatus(filterByStatus);
      }
      
      // Filter out template/demo devices for signed-in users
      // Keep template devices for onboarding or when no user is signed in
      if (user) {
        // In a real app, you would filter by user ID from the database
        // For now, we'll just filter out devices with certain names or metadata
        userDevices = userDevices.filter(device => {
          // Check if device belongs to current user
          const isTemplateDevice = device.metadata?.isTemplate === true;
          const isUserDevice = device.metadata?.userId === user.id;
          
          // Keep user's devices and template devices during onboarding
          return isUserDevice || (isTemplateDevice && devices.length === 0);
        });
      }
      
      // Limit number of devices if maxDevices is specified
      if (maxDevices && userDevices.length > maxDevices) {
        userDevices = userDevices.slice(0, maxDevices);
      }
      
      setDevices(userDevices);
    } catch (error) {
      console.error('Error loading devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'cup':
        return <Coffee size={24} color="#0277BD" />;
      case 'bottle':
        return <Baby size={24} color="#0277BD" />;
      case 'sleeve':
        return <Droplets size={24} color="#0277BD" />;
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

  const handleDevicePress = (device: Device) => {
    if (onDevicePress) {
      onDevicePress(device);
    } else {
      setSelectedDevice(device);
      setDeviceInfoModalVisible(true);
    }
  };

  const handleDeviceUpdate = (updatedDevice: Device) => {
    setSelectedDevice(updatedDevice);
    loadDevices();
  };

  const handleDeviceRemove = (deviceId: string) => {
    setDeviceInfoModalVisible(false);
    setSelectedDevice(null);
    loadDevices();
  };

  const renderDeviceItem = ({ item }: { item: Device }) => (
    <TouchableOpacity
      style={styles.deviceCard}
      onPress={() => handleDevicePress(item)}
      testID="device-card"
      accessibilityLabel={`${item.name} device card`}
      accessibilityRole="button"
    >
      <View style={styles.deviceIcon}>
        {item.metadata?.image ? (
          <Image
            source={{ uri: item.metadata.image }}
            style={styles.deviceImage}
          />
        ) : (
          getDeviceIcon(item.type)
        )}
      </View>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceStatus}>
          {item.status === 'connected' ? 'Connected' : 'Disconnected'} • {formatLastSeen(item.lastSeen)}
        </Text>
        {item.zoneId && (
          <Text style={styles.deviceZone}>
            Zone: {item.zoneId}
          </Text>
        )}
      </View>
      <View style={styles.deviceMeta}>
        <View style={styles.batteryContainer}>
          <Battery size={16} color={getBatteryColor(item.batteryLevel)} />
          <Text style={[styles.batteryText, { color: getBatteryColor(item.batteryLevel) }]}>
            {item.batteryLevel}%
          </Text>
        </View>
        <View style={[
          styles.connectionStatus,
          { backgroundColor: item.status === 'connected' ? '#E8F5E8' : '#FFEBEE' }
        ]}>
          {item.status === 'connected' ? (
            <Wifi size={16} color="#4CAF50" />
          ) : (
            <WifiOff size={16} color="#F44336" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (!showEmptyState) return null;
    
    return (
      <View style={styles.emptyState}>
        <Bluetooth size={48} color="#64B5F6" />
        <Text style={styles.emptyTitle}>No Devices Found</Text>
        <Text style={styles.emptyText}>
          {emptyStateMessage}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container} testID="connected-devices-container">
      {showTitle && (
        <View style={styles.header}>
          <Text style={styles.title}>
            {filterByStatus === 'connected' ? 'Connected Devices' : 
             filterByStatus === 'disconnected' ? 'Disconnected Devices' : 
             'Your Devices'}
          </Text>
          {devices.length > 0 && (
            <Text style={styles.count} testID="device-count">
              ({devices.length})
            </Text>
          )}
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0277BD" />
          <Text style={styles.loadingText}>Loading devices...</Text>
        </View>
      ) : devices.length > 0 ? (
        <FlatList
          data={devices}
          renderItem={renderDeviceItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.devicesList}
          testID="devices-list"
        />
      ) : (
        renderEmptyState()
      )}

      {/* Device Info Modal */}
      <DeviceInfoModal
        visible={deviceInfoModalVisible}
        onClose={() => {
          setDeviceInfoModalVisible(false);
          setSelectedDevice(null);
        }}
        device={selectedDevice}
        onDeviceUpdate={handleDeviceUpdate}
        onDeviceRemove={handleDeviceRemove}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
  },
  count: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginTop: 16,
  },
  devicesList: {
    paddingBottom: 16,
  },
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});