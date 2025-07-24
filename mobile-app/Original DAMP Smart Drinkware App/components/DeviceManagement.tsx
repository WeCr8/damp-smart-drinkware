/**
 * Device Management Component
 * 
 * Displays device cards and handles device information modal
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Smartphone, Battery, Wifi, WifiOff, MapPin, Clock, Plus, Info, Navigation, Users, Share2 } from 'lucide-react-native';
import { getAllDevices, updateDevice, type Device } from '@/utils/deviceManager';
import DeviceInfoModal from '@/components/modals/DeviceInfoModal';

export default function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceInfoModalVisible, setDeviceInfoModalVisible] = useState(false);
  const [subscriptionActive] = useState(true); // This would come from subscription context

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = () => {
    const allDevices = getAllDevices();
    setDevices(allDevices);
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return '#4CAF50';
    if (level > 20) return '#FF9800';
    return '#F44336';
  };

  const getDeviceIcon = (type: string) => {
    return <Smartphone size={20} color="#0277BD" />;
  };

  const getDeviceTypeDisplayName = (type: string) => {
    const typeNames: Record<string, string> = {
      'cup': 'Coffee Cup Handle',
      'sleeve': 'Cup Sleeve',
      'bottle': 'Baby Bottle Tracker',
      'bottom': 'Silicone Bottom',
      'damp-cup': 'DAMP Smart Cup',
    };
    return typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleDevicePress = (device: Device) => {
    setSelectedDevice(device);
    setDeviceInfoModalVisible(true);
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

  const handleLocationTrackingToggle = async (device: Device, enabled: boolean) => {
    if (!subscriptionActive && enabled) {
      Alert.alert(
        'Subscription Required',
        'Location tracking requires an active DAMP+ subscription.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => {
            // Navigate to subscription screen
            Alert.alert('Coming Soon', 'Subscription upgrade will be available soon.');
          }},
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const result = await updateDevice(device.id, {
        metadata: { 
          ...device.metadata, 
          locationTracking: enabled,
          lastLocationUpdate: enabled ? new Date().toISOString() : undefined
        },
      });

      if (result.success) {
        loadDevices();
      } else {
        Alert.alert('Error', result.error || 'Failed to update location tracking');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update location tracking');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNoAlertZone = (device: Device) => {
    if (!subscriptionActive) {
      Alert.alert(
        'Subscription Required',
        'Multi-zone management requires an active DAMP+ subscription.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => {
            Alert.alert('Coming Soon', 'Subscription upgrade will be available soon.');
          }},
        ]
      );
      return;
    }

    Alert.alert(
      'Add No-Alert Zone',
      'Add current location as a no-alert zone for this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Zone',
          onPress: async () => {
            const newZoneId = `zone-${Date.now()}`;
            const currentZones = device.metadata?.noAlertZones || [];
            const updatedZones = [...currentZones, newZoneId];
            
            try {
              const result = await updateDevice(device.id, {
                metadata: { 
                  ...device.metadata, 
                  noAlertZones: updatedZones
                },
              });

              if (result.success) {
                loadDevices();
                Alert.alert('Success', 'No-alert zone added successfully');
              } else {
                Alert.alert('Error', result.error || 'Failed to add no-alert zone');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to add no-alert zone');
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#E0F7FF', '#F8FCFF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Device Management</Text>
          <Text style={styles.subtitle}>Manage your DAMP smart devices</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {devices.length === 0 ? (
            <View style={styles.emptyState}>
              <Smartphone size={48} color="#64B5F6" />
              <Text style={styles.emptyTitle}>No Devices Found</Text>
              <Text style={styles.emptyText}>
                Add your first DAMP device to get started
              </Text>
              <TouchableOpacity style={styles.addButton}>
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Device</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.devicesContainer}>
              {devices.map((device, index) => {
                const isLast = index === devices.length - 1;
                const locationTracking = device.metadata?.locationTracking || false;
                const shareLocation = device.metadata?.shareLocation || false;
                const noAlertZones = device.metadata?.noAlertZones || [];

                return (
                  <TouchableOpacity
                    key={device.id}
                    style={[
                      styles.deviceCard,
                      isLast && styles.lastDeviceCard,
                    ]}
                    onPress={() => handleDevicePress(device)}
                    accessibilityLabel={`View details for ${device.name}`}
                    accessibilityRole="button"
                  >
                    {/* Device Header */}
                    <View style={styles.deviceHeader}>
                      <View style={styles.deviceIconContainer}>
                        {device.metadata?.image ? (
                          <Image
                            source={{ uri: device.metadata.image }}
                            style={styles.deviceImage}
                          />
                        ) : (
                          <View style={styles.deviceIconPlaceholder}>
                            {getDeviceIcon(device.type)}
                          </View>
                        )}
                      </View>

                      <View style={styles.deviceInfo}>
                        <Text style={styles.deviceName}>{device.name}</Text>
                        <Text style={styles.deviceType}>
                          {getDeviceTypeDisplayName(device.type)}
                        </Text>
                        <View style={styles.deviceStatus}>
                          <View style={[
                            styles.statusDot,
                            { backgroundColor: device.status === 'connected' ? '#4CAF50' : '#F44336' }
                          ]} />
                          <Text style={[
                            styles.statusText,
                            { color: device.status === 'connected' ? '#4CAF50' : '#F44336' }
                          ]}>
                            {device.status === 'connected' ? 'Online' : 'Offline'}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.infoButton}
                        onPress={() => handleDevicePress(device)}
                      >
                        <Info size={16} color="#0277BD" />
                      </TouchableOpacity>
                    </View>

                    {/* Device Stats */}
                    <View style={styles.deviceStats}>
                      <View style={styles.statItem}>
                        <Battery size={16} color={getBatteryColor(device.batteryLevel)} />
                        <Text style={[
                          styles.statText,
                          { color: getBatteryColor(device.batteryLevel) }
                        ]}>
                          {device.batteryLevel}%
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        {device.status === 'connected' ? (
                          <Wifi size={16} color="#4CAF50" />
                        ) : (
                          <WifiOff size={16} color="#F44336" />
                        )}
                        <Text style={styles.statText}>
                          {device.status === 'connected' ? 'Connected' : 'Offline'}
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Clock size={16} color="#64B5F6" />
                        <Text style={styles.statText}>
                          {formatLastSeen(device.lastSeen)}
                        </Text>
                      </View>
                      {device.zoneId && (
                        <View style={styles.statItem}>
                          <MapPin size={16} color="#4CAF50" />
                          <Text style={styles.statText}>{device.zoneId}</Text>
                        </View>
                      )}
                    </View>

                    {/* Location & Zone Controls */}
                    <View style={styles.locationControls}>
                      <View style={styles.controlRow}>
                        <View style={styles.controlLeft}>
                          <Navigation size={16} color="#0277BD" />
                          <Text style={styles.controlLabel}>Location Tracking</Text>
                          {!subscriptionActive && (
                            <Text style={styles.proLabel}>PRO</Text>
                          )}
                        </View>
                        <Switch
                          value={locationTracking}
                          onValueChange={(enabled) => handleLocationTrackingToggle(device, enabled)}
                          trackColor={{ false: '#E0E0E0', true: '#81D4FA' }}
                          thumbColor={locationTracking ? '#0277BD' : '#F4F3F4'}
                          disabled={loading}
                        />
                      </View>

                      {locationTracking && (
                        <>
                          <View style={styles.controlRow}>
                            <View style={styles.controlLeft}>
                              <Share2 size={16} color="#0277BD" />
                              <Text style={styles.controlLabel}>Share Location</Text>
                            </View>
                            <Switch
                              value={shareLocation}
                              onValueChange={async (enabled) => {
                                try {
                                  const result = await updateDevice(device.id, {
                                    metadata: { 
                                      ...device.metadata, 
                                      shareLocation: enabled
                                    },
                                  });
                                  if (result.success) loadDevices();
                                } catch (error) {
                                  Alert.alert('Error', 'Failed to update location sharing');
                                }
                              }}
                              trackColor={{ false: '#E0E0E0', true: '#81D4FA' }}
                              thumbColor={shareLocation ? '#0277BD' : '#F4F3F4'}
                              disabled={loading}
                            />
                          </View>

                          <TouchableOpacity
                            style={styles.zoneButton}
                            onPress={() => handleAddNoAlertZone(device)}
                          >
                            <MapPin size={16} color="#4CAF50" />
                            <Text style={styles.zoneButtonText}>
                              Add No-Alert Zone ({noAlertZones.length})
                            </Text>
                            {!subscriptionActive && (
                              <Text style={styles.proLabel}>PRO</Text>
                            )}
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Subscription Notice */}
          {!subscriptionActive && (
            <View style={styles.subscriptionNotice}>
              <Users size={24} color="#FF9800" />
              <View style={styles.noticeContent}>
                <Text style={styles.noticeTitle}>Upgrade to DAMP+</Text>
                <Text style={styles.noticeText}>
                  Get location tracking, multi-zone management, and family sharing features
                </Text>
              </View>
              <TouchableOpacity style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.spacer} />
        </ScrollView>

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
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#0277BD',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0277BD',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  devicesContainer: {
    marginTop: 20,
  },
  deviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lastDeviceCard: {
    marginBottom: 0,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceIconContainer: {
    marginRight: 16,
  },
  deviceImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#E1F5FE',
  },
  deviceIconPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8FCFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E1F5FE',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginBottom: 4,
  },
  deviceType: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginBottom: 6,
  },
  deviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FCFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F8FCFF',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginTop: 4,
  },
  locationControls: {
    gap: 12,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  controlLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0277BD',
    marginLeft: 8,
  },
  proLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FF9800',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  zoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  zoneButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4CAF50',
    marginLeft: 8,
    flex: 1,
  },
  subscriptionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  noticeContent: {
    flex: 1,
    marginLeft: 16,
  },
  noticeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F57C00',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FF8F00',
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 16,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  spacer: {
    height: 40,
  },
});