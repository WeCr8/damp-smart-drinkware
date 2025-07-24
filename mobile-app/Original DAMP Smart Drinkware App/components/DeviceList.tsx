import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator 
} from 'react-native';
import { Bluetooth } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getAllDevices, 
  getDevicesByStatus, 
  getDevicesByType,
  Device 
} from '@/utils/supabaseDeviceManager';
import DeviceCard from './DeviceCard';
import DeviceInfoModal from './modals/DeviceInfoModal';

interface DeviceListProps {
  title?: string;
  maxDevices?: number;
  onDevicePress?: (device: Device) => void;
  showEmptyState?: boolean;
  emptyStateMessage?: string;
  filterByStatus?: 'connected' | 'disconnected' | 'all';
  filterByType?: string;
  showTitle?: boolean;
  showCount?: boolean;
}

export default function DeviceList({
  title,
  maxDevices,
  onDevicePress,
  showEmptyState = true,
  emptyStateMessage = 'No devices found',
  filterByStatus = 'all',
  filterByType,
  showTitle = true,
  showCount = true
}: DeviceListProps) {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceInfoModalVisible, setDeviceInfoModalVisible] = useState(false);

  useEffect(() => {
    loadDevices();
  }, [filterByStatus, filterByType]);

  const loadDevices = async () => {
    setLoading(true);
    try {
      let userDevices: Device[] = [];
      
      // Get devices based on filters
      if (filterByStatus !== 'all' && filterByType) {
        // Filter by both status and type
        const statusDevices = await getDevicesByStatus(filterByStatus);
        userDevices = statusDevices.filter(d => d.type === filterByType);
      } else if (filterByStatus !== 'all') {
        // Filter by status only
        userDevices = await getDevicesByStatus(filterByStatus);
      } else if (filterByType) {
        // Filter by type only
        userDevices = await getDevicesByType(filterByType as any);
      } else {
        // No filters
        userDevices = await getAllDevices();
      }
      
      // Limit number of devices if maxDevices is specified
      if (maxDevices && userDevices.length > maxDevices) {
        userDevices = userDevices.slice(0, maxDevices);
      }
      
      setDevices(userDevices);
    } catch (error) {
      console.error('Error loading devices:', error);
      setDevices([]);
    } finally {
      setLoading(false);
    }
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
    <View style={styles.container} testID="device-list-container">
      {showTitle && title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {showCount && devices.length > 0 && (
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
          renderItem={({ item }) => (
            <DeviceCard 
              device={item} 
              onPress={handleDevicePress} 
            />
          )}
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