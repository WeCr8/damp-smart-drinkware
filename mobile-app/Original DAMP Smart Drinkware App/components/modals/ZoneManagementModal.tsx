/**
 * Zone Management Modal
 * 
 * Comprehensive zone management interface with creation, editing, and monitoring
 */

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MapPin, Plus, CreditCard as Edit3, Trash2, Navigation, Users, Bell, Clock, Shield, Target, Zap } from 'lucide-react-native';
import BaseModal from './BaseModal';
import { settingsStyles } from '@/styles/settings';
import { BaseModalProps } from '@/types/settings';
import { zoneManager, Zone, ZoneInput, ZoneType, ZoneEvent } from '@/utils/zoneManager';
import { useAuth } from '@/contexts/AuthContext';

interface ZoneManagementModalProps extends BaseModalProps {}

export default function ZoneManagementModal({
  visible,
  onClose,
}: ZoneManagementModalProps) {
  const { user } = useAuth();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [monitoring, setMonitoring] = useState(false);
  const [recentEvents, setRecentEvents] = useState<ZoneEvent[]>([]);
  const [newZone, setNewZone] = useState<Partial<ZoneInput>>({
    name: '',
    type: 'custom',
    latitude: 37.7749,
    longitude: -122.4194,
    radius: 50,
    settings: {
      notifyOnEntry: true,
      notifyOnExit: true,
      notifyOnDwell: false,
      dwellTimeThreshold: 30,
    },
  });

  useEffect(() => {
    if (visible) {
      loadZones();
      setupEventListener();
    }
    return () => {
      if (monitoring) {
        zoneManager.stopMonitoring();
      }
    };
  }, [visible]);

  const loadZones = () => {
    setLoading(true);
    try {
      const userZones = user ? zoneManager.getUserZones(user.id) : [];
      setZones(userZones);
    } catch (error) {
      Alert.alert('Error', 'Failed to load zones');
    } finally {
      setLoading(false);
    }
  };

  const setupEventListener = () => {
    const removeListener = zoneManager.addEventListener((event) => {
      setRecentEvents(prev => [event, ...prev.slice(0, 9)]); // Keep last 10 events
    });

    return removeListener;
  };

  const handleCreateZone = async () => {
    if (!user || !newZone.name || !newZone.type) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const result = await zoneManager.createZone(newZone as ZoneInput, user.id);
      
      if (result.success) {
        setNewZone({
          name: '',
          type: 'custom',
          latitude: 37.7749,
          longitude: -122.4194,
          radius: 50,
          settings: {
            notifyOnEntry: true,
            notifyOnExit: true,
            notifyOnDwell: false,
            dwellTimeThreshold: 30,
          },
        });
        loadZones();
        Alert.alert('Success', 'Zone created successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to create zone');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create zone');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteZone = (zone: Zone) => {
    Alert.alert(
      'Delete Zone',
      `Are you sure you want to delete "${zone.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            
            const result = await zoneManager.deleteZone(zone.id, user.id);
            if (result.success) {
              loadZones();
              Alert.alert('Success', 'Zone deleted successfully');
            } else {
              Alert.alert('Error', result.error || 'Failed to delete zone');
            }
          },
        },
      ]
    );
  };

  const handleToggleMonitoring = () => {
    if (monitoring) {
      zoneManager.stopMonitoring();
      setMonitoring(false);
    } else {
      zoneManager.startMonitoring({
        interval: 5000,
        highAccuracy: true,
      });
      setMonitoring(true);
    }
  };

  const getZoneTypeIcon = (type: ZoneType) => {
    switch (type) {
      case 'home': return <MapPin size={16} color="#4CAF50" />;
      case 'office': return <Shield size={16} color="#2196F3" />;
      case 'school': return <Target size={16} color="#FF9800" />;
      case 'safe': return <Shield size={16} color="#4CAF50" />;
      case 'no-alert': return <Bell size={16} color="#9E9E9E" />;
      default: return <MapPin size={16} color="#64B5F6" />;
    }
  };

  const getZoneTypeLabel = (type: ZoneType) => {
    const labels = {
      home: 'Home',
      office: 'Office',
      school: 'School',
      custom: 'Custom',
      'no-alert': 'No Alert',
      safe: 'Safe Zone',
    };
    return labels[type] || type;
  };

  const formatEventTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  const zoneTypes: { value: ZoneType; label: string }[] = [
    { value: 'home', label: 'Home' },
    { value: 'office', label: 'Office' },
    { value: 'school', label: 'School' },
    { value: 'safe', label: 'Safe Zone' },
    { value: 'no-alert', label: 'No Alert Zone' },
    { value: 'custom', label: 'Custom' },
  ];

  if (loading) {
    return (
      <BaseModal visible={visible} onClose={onClose} title="Zone Management">
        <View style={settingsStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#0277BD" />
          <Text style={settingsStyles.loadingText}>Loading zones...</Text>
        </View>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Zone Management"
      presentationStyle="fullScreen"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Monitoring Status */}
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>Monitoring</Text>
          <View style={settingsStyles.sectionContent}>
            <View style={[settingsStyles.settingItem, settingsStyles.lastSettingItem]}>
              <View style={settingsStyles.settingLeft}>
                <View style={settingsStyles.settingIcon}>
                  <Navigation size={20} color="#0277BD" />
                </View>
                <View style={settingsStyles.settingText}>
                  <Text style={settingsStyles.settingTitle}>Zone Monitoring</Text>
                  <Text style={settingsStyles.settingSubtitle}>
                    {monitoring ? 'Actively monitoring zones' : 'Monitoring disabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={monitoring}
                onValueChange={handleToggleMonitoring}
                trackColor={{ false: '#E0E0E0', true: '#81D4FA' }}
                thumbColor={monitoring ? '#0277BD' : '#F4F3F4'}
              />
            </View>
          </View>
        </View>

        {/* Recent Events */}
        {recentEvents.length > 0 && (
          <View style={settingsStyles.section}>
            <Text style={settingsStyles.sectionTitle}>Recent Events</Text>
            <View style={settingsStyles.sectionContent}>
              {recentEvents.slice(0, 3).map((event, index) => {
                const zone = zones.find(z => z.id === event.zoneId);
                const isLast = index === Math.min(recentEvents.length - 1, 2);
                
                return (
                  <View
                    key={`${event.zoneId}-${event.timestamp.getTime()}`}
                    style={[
                      settingsStyles.settingItem,
                      isLast && settingsStyles.lastSettingItem,
                    ]}
                  >
                    <View style={settingsStyles.settingLeft}>
                      <View style={settingsStyles.settingIcon}>
                        {event.type === 'enter' ? (
                          <MapPin size={20} color="#4CAF50" />
                        ) : event.type === 'exit' ? (
                          <MapPin size={20} color="#F44336" />
                        ) : (
                          <Clock size={20} color="#FF9800" />
                        )}
                      </View>
                      <View style={settingsStyles.settingText}>
                        <Text style={settingsStyles.settingTitle}>
                          {event.type === 'enter' ? 'Zone Entry' : 
                           event.type === 'exit' ? 'Zone Exit' : 'Zone Event'}
                        </Text>
                        <Text style={settingsStyles.settingSubtitle}>
                          {zone?.name || 'Unknown Zone'} • {formatEventTime(event.timestamp)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Create New Zone */}
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>Create New Zone</Text>
          <View style={settingsStyles.sectionContent}>
            <View style={settingsStyles.settingItem}>
              <View style={settingsStyles.settingText}>
                <Text style={settingsStyles.inputLabel}>Zone Name</Text>
                <TextInput
                  style={settingsStyles.textInput}
                  value={newZone.name}
                  onChangeText={(text) => setNewZone(prev => ({ ...prev, name: text }))}
                  placeholder="Enter zone name"
                  placeholderTextColor="#64B5F6"
                />
              </View>
            </View>

            <View style={settingsStyles.settingItem}>
              <View style={settingsStyles.settingText}>
                <Text style={settingsStyles.inputLabel}>Zone Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 8 }}>
                    {zoneTypes.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        style={[
                          styles.typeButton,
                          newZone.type === type.value && styles.selectedTypeButton,
                        ]}
                        onPress={() => setNewZone(prev => ({ ...prev, type: type.value }))}
                      >
                        {getZoneTypeIcon(type.value)}
                        <Text
                          style={[
                            styles.typeButtonText,
                            newZone.type === type.value && styles.selectedTypeButtonText,
                          ]}
                        >
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <View style={settingsStyles.settingItem}>
              <View style={settingsStyles.settingText}>
                <Text style={settingsStyles.inputLabel}>Radius (meters)</Text>
                <TextInput
                  style={settingsStyles.textInput}
                  value={newZone.radius?.toString()}
                  onChangeText={(text) => setNewZone(prev => ({ 
                    ...prev, 
                    radius: parseInt(text) || 50 
                  }))}
                  placeholder="50"
                  keyboardType="numeric"
                  placeholderTextColor="#64B5F6"
                />
              </View>
            </View>

            <View style={settingsStyles.settingItem}>
              <View style={settingsStyles.settingLeft}>
                <View style={settingsStyles.settingIcon}>
                  <Bell size={20} color="#0277BD" />
                </View>
                <View style={settingsStyles.settingText}>
                  <Text style={settingsStyles.settingTitle}>Entry Notifications</Text>
                  <Text style={settingsStyles.settingSubtitle}>
                    Notify when devices enter this zone
                  </Text>
                </View>
              </View>
              <Switch
                value={newZone.settings?.notifyOnEntry || false}
                onValueChange={(value) => setNewZone(prev => ({
                  ...prev,
                  settings: { ...prev.settings, notifyOnEntry: value }
                }))}
                trackColor={{ false: '#E0E0E0', true: '#81D4FA' }}
                thumbColor={newZone.settings?.notifyOnEntry ? '#0277BD' : '#F4F3F4'}
              />
            </View>

            <View style={[settingsStyles.settingItem, settingsStyles.lastSettingItem]}>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateZone}
                disabled={creating || !newZone.name}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Plus size={20} color="#FFFFFF" />
                    <Text style={styles.createButtonText}>Create Zone</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Existing Zones */}
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>Your Zones ({zones.length})</Text>
          {zones.length === 0 ? (
            <View style={settingsStyles.sectionContent}>
              <View style={[settingsStyles.settingItem, settingsStyles.lastSettingItem]}>
                <View style={settingsStyles.settingText}>
                  <Text style={settingsStyles.settingTitle}>No zones created</Text>
                  <Text style={settingsStyles.settingSubtitle}>
                    Create your first zone to start tracking devices
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={settingsStyles.sectionContent}>
              {zones.map((zone, index) => {
                const isLast = index === zones.length - 1;
                
                return (
                  <View
                    key={zone.id}
                    style={[
                      settingsStyles.settingItem,
                      isLast && settingsStyles.lastSettingItem,
                    ]}
                  >
                    <View style={settingsStyles.settingLeft}>
                      <View style={settingsStyles.settingIcon}>
                        {getZoneTypeIcon(zone.type)}
                      </View>
                      <View style={settingsStyles.settingText}>
                        <Text style={settingsStyles.settingTitle}>{zone.name}</Text>
                        <Text style={settingsStyles.settingSubtitle}>
                          {getZoneTypeLabel(zone.type)} • {zone.radius}m radius • {zone.deviceIds.length} devices
                        </Text>
                        <Text style={settingsStyles.settingSubtitle}>
                          {zone.stats.totalEntries} entries • {zone.stats.totalExits} exits
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setEditing(zone.id)}
                      >
                        <Edit3 size={16} color="#0277BD" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteZone(zone)}
                      >
                        <Trash2 size={16} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={settingsStyles.spacer} />
      </ScrollView>
    </BaseModal>
  );
}

const styles = {
  typeButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#F8FCFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E1F5FE',
  },
  selectedTypeButton: {
    backgroundColor: '#E1F5FE',
    borderColor: '#0277BD',
  },
  typeButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64B5F6',
    marginLeft: 6,
  },
  selectedTypeButtonText: {
    color: '#0277BD',
    fontFamily: 'Inter-SemiBold',
  },
  createButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#0277BD',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
  },
  createButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FCFF',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#E1F5FE',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
};