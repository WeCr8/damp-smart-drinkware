/**
 * Device Information Modal
 * 
 * Displays comprehensive device details in a standardized format with zone management
 */

import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Smartphone, Battery, Wifi, WifiOff, MapPin, Clock, Settings as SettingsIcon, CreditCard as Edit3, Trash2, Camera, Info, Zap, Shield, Calendar, Hash, Cpu, Signal, Navigation, Users, Share2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import BaseModal from './BaseModal';
import { settingsStyles } from '@/styles/settings';
import { BaseModalProps } from '@/types/settings';
import { Device, updateDevice, removeDevice } from '@/utils/deviceManager';

interface DeviceInfoModalProps extends BaseModalProps {
  device: Device | null;
  onDeviceUpdate?: (device: Device) => void;
  onDeviceRemove?: (deviceId: string) => void;
}

export default function DeviceInfoModal({
  visible,
  onClose,
  device,
  onDeviceUpdate,
  onDeviceRemove,
}: DeviceInfoModalProps) {
  const [loading, setLoading] = useState(false);
  const [editingImage, setEditingImage] = useState(false);
  const [locationTracking, setLocationTracking] = useState(device?.metadata?.locationTracking || false);
  const [shareLocation, setShareLocation] = useState(device?.metadata?.shareLocation || false);
  const [noAlertZones, setNoAlertZones] = useState<string[]>(device?.metadata?.noAlertZones || []);
  const [subscriptionActive] = useState(true); // This would come from subscription context

  if (!device) {
    return null;
  }

  const getBatteryColor = (level: number) => {
    if (level > 50) return '#4CAF50';
    if (level > 20) return '#FF9800';
    return '#F44336';
  };

  const getSignalStrengthText = (strength: number) => {
    if (strength >= 4) return 'Excellent';
    if (strength >= 3) return 'Good';
    if (strength >= 2) return 'Fair';
    return 'Poor';
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
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusToggle = async (isActive: boolean) => {
    setLoading(true);
    try {
      const result = await updateDevice(device.id, {
        status: isActive ? 'connected' : 'disconnected',
      });
      
      if (result.success && result.data && onDeviceUpdate) {
        onDeviceUpdate(result.data);
      } else {
        Alert.alert('Error', result.error || 'Failed to update device status');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update device status');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationTrackingToggle = async (enabled: boolean) => {
    if (!subscriptionActive && enabled) {
      Alert.alert(
        'Subscription Required',
        'Location tracking requires an active DAMP+ subscription.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => {
            Alert.alert('Coming Soon', 'Subscription upgrade will be available soon.');
          }},
        ]
      );
      return;
    }

    setLocationTracking(enabled);
    try {
      const result = await updateDevice(device.id, {
        metadata: { 
          ...device.metadata, 
          locationTracking: enabled,
          lastLocationUpdate: enabled ? new Date().toISOString() : undefined
        },
      });

      if (result.success && result.data && onDeviceUpdate) {
        onDeviceUpdate(result.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update location tracking');
      setLocationTracking(!enabled);
    }
  };

  const handleShareLocationToggle = async (enabled: boolean) => {
    setShareLocation(enabled);
    try {
      const result = await updateDevice(device.id, {
        metadata: { 
          ...device.metadata, 
          shareLocation: enabled
        },
      });

      if (result.success && result.data && onDeviceUpdate) {
        onDeviceUpdate(result.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update location sharing');
      setShareLocation(!enabled);
    }
  };

  const handleImageChange = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to change device image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLoading(true);
        const updateResult = await updateDevice(device.id, {
          metadata: { 
            ...device.metadata, 
            image: result.assets[0].uri 
          },
        });

        if (updateResult.success && updateResult.data && onDeviceUpdate) {
          onDeviceUpdate(updateResult.data);
          Alert.alert('Success', 'Device image updated successfully');
        } else {
          Alert.alert('Error', updateResult.error || 'Failed to update device image');
        }
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to change device image');
      setLoading(false);
    }
  };

  const handleRemoveDevice = () => {
    Alert.alert(
      'Remove Device',
      `Are you sure you want to remove "${device.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await removeDevice(device.id);
              if (result.success) {
                if (onDeviceRemove) {
                  onDeviceRemove(device.id);
                }
                onClose();
              } else {
                Alert.alert('Error', result.error || 'Failed to remove device');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to remove device');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleAddToNoAlertZone = () => {
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
      'Add current location as a no-alert zone?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Zone',
          onPress: async () => {
            const newZoneId = `zone-${Date.now()}`;
            const updatedZones = [...noAlertZones, newZoneId];
            setNoAlertZones(updatedZones);
            
            try {
              const result = await updateDevice(device.id, {
                metadata: { 
                  ...device.metadata, 
                  noAlertZones: updatedZones
                },
              });

              if (result.success && result.data && onDeviceUpdate) {
                onDeviceUpdate(result.data);
                Alert.alert('Success', 'No-alert zone added successfully');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to add no-alert zone');
              setNoAlertZones(noAlertZones);
            }
          },
        },
      ]
    );
  };

  const getSignalBars = (strength: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <View
        key={i}
        style={[
          styles.signalBar,
          {
            backgroundColor: i < strength ? '#4CAF50' : '#E0E0E0',
            height: 4 + (i * 2),
          }
        ]}
      />
    ));
  };

  const deviceDetails = [
    {
      section: 'Device Information',
      items: [
        {
          icon: <Info size={20} color="#0277BD" />,
          label: 'Device Name',
          value: device.name,
        },
        {
          icon: <Smartphone size={20} color="#0277BD" />,
          label: 'Device Type',
          value: getDeviceTypeDisplayName(device.type),
        },
        {
          icon: <Hash size={20} color="#0277BD" />,
          label: 'Device ID',
          value: device.id.split('-').pop()?.toUpperCase() || 'Unknown',
        },
        {
          icon: <Cpu size={20} color="#0277BD" />,
          label: 'Firmware Version',
          value: `v${device.firmware}`,
        },
      ],
    },
    {
      section: 'Connection Status',
      items: [
        {
          icon: device.status === 'connected' ? <Wifi size={20} color="#4CAF50" /> : <WifiOff size={20} color="#F44336" />,
          label: 'Connection Status',
          value: device.status === 'connected' ? 'Connected' : 'Disconnected',
          valueColor: device.status === 'connected' ? '#4CAF50' : '#F44336',
        },
        {
          icon: <Signal size={20} color="#0277BD" />,
          label: 'Signal Strength',
          value: getSignalStrengthText(device.signalStrength),
          extra: (
            <View style={styles.signalContainer}>
              {getSignalBars(device.signalStrength)}
            </View>
          ),
        },
        {
          icon: <Clock size={20} color="#0277BD" />,
          label: 'Last Seen',
          value: formatLastSeen(device.lastSeen),
        },
      ],
    },
    {
      section: 'Device Status',
      items: [
        {
          icon: <Battery size={20} color={getBatteryColor(device.batteryLevel)} />,
          label: 'Battery Level',
          value: `${device.batteryLevel}%`,
          valueColor: getBatteryColor(device.batteryLevel),
        },
        {
          icon: <Zap size={20} color="#0277BD" />,
          label: 'Active Status',
          value: device.isActive ? 'Active' : 'Inactive',
          valueColor: device.isActive ? '#4CAF50' : '#64B5F6',
        },
        ...(device.zoneId ? [{
          icon: <MapPin size={20} color="#4CAF50" />,
          label: 'Current Zone',
          value: device.zoneId,
          valueColor: '#4CAF50',
        }] : []),
      ],
    },
    {
      section: 'Registration Details',
      items: [
        {
          icon: <Calendar size={20} color="#0277BD" />,
          label: 'Added',
          value: formatDate(device.createdAt),
        },
        {
          icon: <Calendar size={20} color="#0277BD" />,
          label: 'Last Updated',
          value: formatDate(device.updatedAt),
        },
        ...(device.bluetoothId ? [{
          icon: <Shield size={20} color="#0277BD" />,
          label: 'Bluetooth ID',
          value: device.bluetoothId,
        }] : []),
      ],
    },
  ];

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Device Information"
      rightAction={{
        icon: <Edit3 size={20} color="#FFFFFF" />,
        onPress: () => {
          Alert.alert('Coming Soon', 'Device editing will be available in a future update.');
        },
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Device Header */}
        <View style={styles.deviceHeader}>
          <TouchableOpacity
            onPress={handleImageChange}
            style={styles.deviceImageContainer}
            disabled={loading}
          >
            {device.metadata?.image ? (
              <Image
                source={{ uri: device.metadata.image }}
                style={styles.deviceImage}
              />
            ) : (
              <View style={styles.deviceImagePlaceholder}>
                <Smartphone size={48} color="#64B5F6" />
              </View>
            )}
            <View style={styles.deviceImageOverlay}>
              <Camera size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.deviceHeaderInfo}>
            <Text style={styles.deviceHeaderName}>{device.name}</Text>
            <Text style={styles.deviceHeaderType}>
              {getDeviceTypeDisplayName(device.type)}
            </Text>
            <View style={styles.deviceHeaderStatus}>
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

          <View style={styles.deviceHeaderActions}>
            <Switch
              value={device.status === 'connected'}
              onValueChange={handleStatusToggle}
              trackColor={{ false: '#E0E0E0', true: '#81D4FA' }}
              thumbColor={device.status === 'connected' ? '#0277BD' : '#F4F3F4'}
              disabled={loading}
            />
          </View>
        </View>

        {/* Device Details */}
        {deviceDetails.map((section, sectionIndex) => (
          <View key={sectionIndex} style={settingsStyles.section}>
            <Text style={settingsStyles.sectionTitle}>{section.section}</Text>
            <View style={settingsStyles.sectionContent}>
              {section.items.map((item, itemIndex) => {
                const isLast = itemIndex === section.items.length - 1;
                return (
                  <View
                    key={itemIndex}
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
                        <Text style={settingsStyles.settingTitle}>{item.label}</Text>
                        <Text style={[
                          settingsStyles.settingSubtitle,
                          item.valueColor && { color: item.valueColor }
                        ]}>
                          {item.value}
                        </Text>
                      </View>
                    </View>
                    {item.extra && item.extra}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {/* Location & Zone Settings */}
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>Location & Zones</Text>
          <View style={settingsStyles.sectionContent}>
            <View style={settingsStyles.settingItem}>
              <View style={settingsStyles.settingLeft}>
                <View style={settingsStyles.settingIcon}>
                  <Navigation size={20} color="#0277BD" />
                </View>
                <View style={settingsStyles.settingText}>
                  <Text style={settingsStyles.settingTitle}>
                    Location Tracking
                    {!subscriptionActive && (
                      <Text style={{ color: '#FF9800', fontSize: 10 }}> (PRO)</Text>
                    )}
                  </Text>
                  <Text style={settingsStyles.settingSubtitle}>
                    Track device location automatically
                  </Text>
                </View>
              </View>
              <Switch
                value={locationTracking}
                onValueChange={handleLocationTrackingToggle}
                trackColor={{ false: '#E0E0E0', true: '#81D4FA' }}
                thumbColor={locationTracking ? '#0277BD' : '#F4F3F4'}
                disabled={loading}
              />
            </View>

            {locationTracking && (
              <View style={settingsStyles.settingItem}>
                <View style={settingsStyles.settingLeft}>
                  <View style={settingsStyles.settingIcon}>
                    <Share2 size={20} color="#0277BD" />
                  </View>
                  <View style={settingsStyles.settingText}>
                    <Text style={settingsStyles.settingTitle}>Share Last Known Location</Text>
                    <Text style={settingsStyles.settingSubtitle}>
                      Share location with family members
                    </Text>
                  </View>
                </View>
                <Switch
                  value={shareLocation}
                  onValueChange={handleShareLocationToggle}
                  trackColor={{ false: '#E0E0E0', true: '#81D4FA' }}
                  thumbColor={shareLocation ? '#0277BD' : '#F4F3F4'}
                  disabled={loading}
                />
              </View>
            )}

            <TouchableOpacity
              style={[settingsStyles.settingItem, settingsStyles.lastSettingItem]}
              onPress={handleAddToNoAlertZone}
            >
              <View style={settingsStyles.settingLeft}>
                <View style={settingsStyles.settingIcon}>
                  <MapPin size={20} color="#4CAF50" />
                </View>
                <View style={settingsStyles.settingText}>
                  <Text style={settingsStyles.settingTitle}>
                    Add No-Alert Zone
                    {!subscriptionActive && (
                      <Text style={{ color: '#FF9800', fontSize: 10 }}> (PRO)</Text>
                    )}
                  </Text>
                  <Text style={settingsStyles.settingSubtitle}>
                    Add current location to approved zones ({noAlertZones.length} zones)
                  </Text>
                </View>
              </View>
              <Text style={settingsStyles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

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

        {/* Device Actions */}
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>Device Actions</Text>
          <View style={settingsStyles.sectionContent}>
            <TouchableOpacity
              style={settingsStyles.settingItem}
              onPress={() => {
                Alert.alert('Coming Soon', 'Device settings will be available in a future update.');
              }}
            >
              <View style={settingsStyles.settingLeft}>
                <View style={settingsStyles.settingIcon}>
                  <SettingsIcon size={20} color="#0277BD" />
                </View>
                <View style={settingsStyles.settingText}>
                  <Text style={settingsStyles.settingTitle}>Device Settings</Text>
                  <Text style={settingsStyles.settingSubtitle}>
                    Configure device behavior and preferences
                  </Text>
                </View>
              </View>
              <Text style={settingsStyles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[settingsStyles.settingItem, settingsStyles.lastSettingItem]}
              onPress={handleRemoveDevice}
              disabled={loading}
            >
              <View style={settingsStyles.settingLeft}>
                <View style={[settingsStyles.settingIcon, settingsStyles.destructiveSettingIcon]}>
                  <Trash2 size={20} color="#F44336" />
                </View>
                <View style={settingsStyles.settingText}>
                  <Text style={[settingsStyles.settingTitle, settingsStyles.destructiveSettingTitle]}>
                    Remove Device
                  </Text>
                  <Text style={settingsStyles.settingSubtitle}>
                    Permanently remove this device from your account
                  </Text>
                </View>
              </View>
              <Text style={settingsStyles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={settingsStyles.spacer} />
      </ScrollView>
    </BaseModal>
  );
}

const styles = {
  deviceHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  deviceImageContainer: {
    position: 'relative' as const,
    marginRight: 16,
  },
  deviceImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#E1F5FE',
  },
  deviceImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FCFF',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 3,
    borderColor: '#E1F5FE',
  },
  deviceImageOverlay: {
    position: 'absolute' as const,
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0277BD',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  deviceHeaderInfo: {
    flex: 1,
  },
  deviceHeaderName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#0277BD',
    marginBottom: 4,
  },
  deviceHeaderType: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginBottom: 8,
  },
  deviceHeaderStatus: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
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
  deviceHeaderActions: {
    alignItems: 'center' as const,
  },
  signalContainer: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    height: 16,
    marginLeft: 8,
  },
  signalBar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 1,
  },
  subscriptionNotice: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
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
};