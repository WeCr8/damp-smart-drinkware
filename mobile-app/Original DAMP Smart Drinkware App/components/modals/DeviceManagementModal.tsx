import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Smartphone, Battery, Wifi, WifiOff, Camera, CreditCard as Edit3, Trash2, Settings as SettingsIcon, MapPin, Clock, Check, X, Plus, Info } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import BaseModal from './BaseModal';
import DeviceInfoModal from './DeviceInfoModal';
import { settingsStyles } from '@/styles/settings';
import { BaseModalProps } from '@/types/settings';
import { getAllDevices, updateDevice, removeDevice, type Device } from '@/utils/deviceManager';

interface DeviceManagementModalProps extends BaseModalProps {}

export default function DeviceManagementModal({
  visible,
  onClose,
}: DeviceManagementModalProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingDevice, setEditingDevice] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', image: '' });
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceInfoModalVisible, setDeviceInfoModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      loadDevices();
    }
  }, [visible]);

  const loadDevices = () => {
    const allDevices = getAllDevices();
    setDevices(allDevices);
  };

  const handleDeviceToggle = async (deviceId: string, isActive: boolean) => {
    setLoading(true);
    try {
      const result = await updateDevice(deviceId, {
        status: isActive ? 'connected' : 'disconnected',
      });
      
      if (result.success) {
        loadDevices();
      } else {
        Alert.alert('Error', result.error || 'Failed to update device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update device status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceRemove = (deviceId: string, deviceName: string) => {
    Alert.alert(
      'Remove Device',
      `Are you sure you want to remove "${deviceName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await removeDevice(deviceId);
              if (result.success) {
                loadDevices();
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

  const handleDevicePress = (device: Device) => {
    setSelectedDevice(device);
    setDeviceInfoModalVisible(true);
  };

  const handleDeviceUpdate = (updatedDevice: Device) => {
    setSelectedDevice(updatedDevice);
    loadDevices();
  };

  const handleDeviceInfoRemove = (deviceId: string) => {
    setDeviceInfoModalVisible(false);
    setSelectedDevice(null);
    loadDevices();
  };

  const startEditing = (device: Device) => {
    setEditingDevice(device.id);
    setEditForm({
      name: device.name,
      image: device.metadata?.image || '',
    });
  };

  const cancelEditing = () => {
    setEditingDevice(null);
    setEditForm({ name: '', image: '' });
  };

  const saveEditing = async () => {
    if (!editingDevice) return;

    setLoading(true);
    try {
      const result = await updateDevice(editingDevice, {
        name: editForm.name,
        metadata: { image: editForm.image },
      });

      if (result.success) {
        setEditingDevice(null);
        setEditForm({ name: '', image: '' });
        loadDevices();
      } else {
        Alert.alert('Error', result.error || 'Failed to update device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update device');
    } finally {
      setLoading(false);
    }
  };

  const pickDeviceImage = async () => {
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
        setEditForm(prev => ({ ...prev, image: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return '#4CAF50';
    if (level > 20) return '#FF9800';
    return '#F44336';
  };

  const getDeviceTypeIcon = (type: string) => {
    return <Smartphone size={20} color="#0277BD" />;
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

  return (
    <>
      <BaseModal
        visible={visible}
        onClose={onClose}
        title="Device Management"
        rightAction={{
          icon: <Plus size={20} color="#FFFFFF" />,
          onPress: () => {
            Alert.alert('Add Device', 'Use the Add Device tab to connect new devices.');
          },
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {devices.length === 0 ? (
            <View style={settingsStyles.loadingContainer}>
              <Smartphone size={48} color="#64B5F6" />
              <Text style={settingsStyles.loadingText}>No devices found</Text>
              <Text style={settingsStyles.settingSubtitle}>
                Add your first DAMP device to get started
              </Text>
            </View>
          ) : (
            <View style={settingsStyles.pickerContainer}>
              {devices.map((device, index) => {
                const isEditing = editingDevice === device.id;
                const isLast = index === devices.length - 1;

                return (
                  <View
                    key={device.id}
                    style={[
                      settingsStyles.pickerItem,
                      isLast && settingsStyles.lastPickerItem,
                      { flexDirection: 'column', alignItems: 'stretch' },
                    ]}
                  >
                    {/* Device Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <TouchableOpacity
                        onPress={isEditing ? pickDeviceImage : () => handleDevicePress(device)}
                        style={[
                          settingsStyles.settingIcon,
                          { marginRight: 16, position: 'relative' },
                        ]}
                      >
                        {isEditing && editForm.image ? (
                          <Image
                            source={{ uri: editForm.image }}
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 22,
                            }}
                          />
                        ) : device.metadata?.image ? (
                          <Image
                            source={{ uri: device.metadata.image }}
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 22,
                            }}
                          />
                        ) : (
                          getDeviceTypeIcon(device.type)
                        )}
                        {isEditing && (
                          <View
                            style={{
                              position: 'absolute',
                              bottom: -2,
                              right: -2,
                              width: 20,
                              height: 20,
                              borderRadius: 10,
                              backgroundColor: '#0277BD',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Camera size={12} color="#FFFFFF" />
                          </View>
                        )}
                      </TouchableOpacity>

                      <View style={{ flex: 1 }}>
                        {isEditing ? (
                          <TextInput
                            style={[
                              settingsStyles.textInput,
                              { marginBottom: 0, paddingVertical: 8 },
                            ]}
                            value={editForm.name}
                            onChangeText={(text) =>
                              setEditForm(prev => ({ ...prev, name: text }))
                            }
                            placeholder="Device name"
                            placeholderTextColor="#64B5F6"
                          />
                        ) : (
                          <>
                            <Text style={settingsStyles.pickerItemText}>{device.name}</Text>
                            <Text style={settingsStyles.settingSubtitle}>
                              {device.type.charAt(0).toUpperCase() + device.type.slice(1)} • v{device.firmware}
                            </Text>
                          </>
                        )}
                      </View>

                      {isEditing ? (
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TouchableOpacity
                            onPress={saveEditing}
                            style={[
                              settingsStyles.modalActionButton,
                              { width: 36, height: 36 },
                            ]}
                            disabled={loading}
                          >
                            {loading ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <Check size={16} color="#FFFFFF" />
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={cancelEditing}
                            style={[
                              settingsStyles.modalCloseButton,
                              { width: 36, height: 36 },
                            ]}
                          >
                            <X size={16} color="#0277BD" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <Switch
                          value={device.status === 'connected'}
                          onValueChange={(value) => handleDeviceToggle(device.id, value)}
                          trackColor={{ false: '#E0E0E0', true: '#81D4FA' }}
                          thumbColor={device.status === 'connected' ? '#0277BD' : '#F4F3F4'}
                          disabled={loading}
                        />
                      )}
                    </View>

                    {/* Device Stats */}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        paddingVertical: 12,
                        backgroundColor: '#F8FCFF',
                        borderRadius: 12,
                        marginBottom: 12,
                      }}
                    >
                      <View style={{ alignItems: 'center' }}>
                        <Battery size={16} color={getBatteryColor(device.batteryLevel)} />
                        <Text
                          style={[
                            settingsStyles.settingSubtitle,
                            { marginTop: 4, fontSize: 11 },
                          ]}
                        >
                          {device.batteryLevel}%
                        </Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        {device.status === 'connected' ? (
                          <Wifi size={16} color="#4CAF50" />
                        ) : (
                          <WifiOff size={16} color="#F44336" />
                        )}
                        <Text
                          style={[
                            settingsStyles.settingSubtitle,
                            { marginTop: 4, fontSize: 11 },
                          ]}
                        >
                          {device.status === 'connected' ? 'Online' : 'Offline'}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Clock size={16} color="#64B5F6" />
                        <Text
                          style={[
                            settingsStyles.settingSubtitle,
                            { marginTop: 4, fontSize: 11 },
                          ]}
                        >
                          {formatLastSeen(device.lastSeen)}
                        </Text>
                      </View>
                      {device.zoneId && (
                        <View style={{ alignItems: 'center' }}>
                          <MapPin size={16} color="#4CAF50" />
                          <Text
                            style={[
                              settingsStyles.settingSubtitle,
                              { marginTop: 4, fontSize: 11 },
                            ]}
                          >
                            {device.zoneId}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Device Actions */}
                    {!isEditing && (
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => handleDevicePress(device)}
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 8,
                            backgroundColor: '#E1F5FE',
                            borderRadius: 8,
                          }}
                        >
                          <Info size={14} color="#0277BD" />
                          <Text
                            style={[
                              settingsStyles.settingSubtitle,
                              { marginLeft: 6, color: '#0277BD' },
                            ]}
                          >
                            Details
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => startEditing(device)}
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 8,
                            backgroundColor: '#F8FCFF',
                            borderRadius: 8,
                          }}
                        >
                          <Edit3 size={14} color="#64B5F6" />
                          <Text
                            style={[
                              settingsStyles.settingSubtitle,
                              { marginLeft: 6 },
                            ]}
                          >
                            Edit
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            Alert.alert('Coming Soon', 'Device settings will be available in a future update.');
                          }}
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            backgroundColor: '#F8FCFF',
                            borderRadius: 8,
                          }}
                        >
                          <SettingsIcon size={14} color="#64B5F6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeviceRemove(device.id, device.name)}
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            backgroundColor: '#FFEBEE',
                            borderRadius: 8,
                          }}
                        >
                          <Trash2 size={14} color="#F44336" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          <View style={settingsStyles.spacer} />
        </ScrollView>
      </BaseModal>

      {/* Device Info Modal */}
      <DeviceInfoModal
        visible={deviceInfoModalVisible}
        onClose={() => {
          setDeviceInfoModalVisible(false);
          setSelectedDevice(null);
        }}
        device={selectedDevice}
        onDeviceUpdate={handleDeviceUpdate}
        onDeviceRemove={handleDeviceInfoRemove}
      />
    </>
  );
}

const styles = StyleSheet.create({
  // Additional styles if needed
});