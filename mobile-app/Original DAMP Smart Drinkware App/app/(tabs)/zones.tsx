import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Plus, Navigation, Bell, Shield, Target, Zap, Settings as SettingsIcon, Trash2 } from 'lucide-react-native';
import { zoneManager, Zone, ZoneEvent, ZoneType } from '@/utils/zoneManager';
import { useAuth } from '@/contexts/AuthContext';
import ZoneManagementModal from '@/components/modals/ZoneManagementModal';

export default function ZonesScreen() {
  const { user } = useAuth();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [monitoring, setMonitoring] = useState(false);
  const [recentEvents, setRecentEvents] = useState<ZoneEvent[]>([]);
  const [zoneModalVisible, setZoneModalVisible] = useState(false);
  const [subscriptionActive] = useState(true); // This would come from subscription context

  useEffect(() => {
    loadZones();
    setupEventListener();
    
    return () => {
      if (monitoring) {
        zoneManager.stopMonitoring();
      }
    };
  }, []);

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

  const handleToggleMonitoring = () => {
    if (!subscriptionActive) {
      Alert.alert(
        'Subscription Required',
        'Zone monitoring requires an active DAMP+ subscription.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => {
            Alert.alert('Coming Soon', 'Subscription upgrade will be available soon.');
          }},
        ]
      );
      return;
    }

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
      case 'home': return <MapPin size={20} color="#4CAF50" />;
      case 'office': return <Shield size={20} color="#2196F3" />;
      case 'school': return <Target size={20} color="#FF9800" />;
      case 'safe': return <Shield size={20} color="#4CAF50" />;
      case 'no-alert': return <Bell size={20} color="#9E9E9E" />;
      default: return <MapPin size={20} color="#64B5F6" />;
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

  const getZoneStats = () => {
    const activeZones = zones.filter(z => z.status === 'active').length;
    const totalDevices = zones.reduce((sum, zone) => sum + zone.deviceIds.length, 0);
    const totalEvents = zones.reduce((sum, zone) => sum + zone.stats.totalEntries + zone.stats.totalExits, 0);
    
    return { activeZones, totalDevices, totalEvents };
  };

  const stats = getZoneStats();

  return (
    <LinearGradient
      colors={['#E0F7FF', '#F8FCFF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Zones</Text>
            <Text style={styles.subtitle}>Manage your location zones</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setZoneModalVisible(true)}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MapPin size={20} color="#4CAF50" />
              <Text style={styles.statNumber}>{stats.activeZones}</Text>
              <Text style={styles.statLabel}>Active Zones</Text>
            </View>
            <View style={styles.statCard}>
              <Navigation size={20} color="#2196F3" />
              <Text style={styles.statNumber}>{stats.totalDevices}</Text>
              <Text style={styles.statLabel}>Tracked Devices</Text>
            </View>
            <View style={styles.statCard}>
              <Zap size={20} color="#FF9800" />
              <Text style={styles.statNumber}>{stats.totalEvents}</Text>
              <Text style={styles.statLabel}>Total Events</Text>
            </View>
          </View>

          {/* Monitoring Control */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zone Monitoring</Text>
            <View style={styles.monitoringCard}>
              <View style={styles.monitoringLeft}>
                <View style={styles.monitoringIcon}>
                  <Navigation size={24} color="#0277BD" />
                </View>
                <View style={styles.monitoringInfo}>
                  <Text style={styles.monitoringTitle}>
                    Location Tracking
                    {!subscriptionActive && (
                      <Text style={styles.proLabel}> PRO</Text>
                    )}
                  </Text>
                  <Text style={styles.monitoringSubtitle}>
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

          {/* Recent Events */}
          {recentEvents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {recentEvents.slice(0, 3).map((event, index) => {
                const zone = zones.find(z => z.id === event.zoneId);
                
                return (
                  <View key={`${event.zoneId}-${event.timestamp.getTime()}`} style={styles.eventCard}>
                    <View style={styles.eventIcon}>
                      {event.type === 'enter' ? (
                        <MapPin size={16} color="#4CAF50" />
                      ) : event.type === 'exit' ? (
                        <MapPin size={16} color="#F44336" />
                      ) : (
                        <Bell size={16} color="#FF9800" />
                      )}
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>
                        {event.type === 'enter' ? 'Zone Entry' : 
                         event.type === 'exit' ? 'Zone Exit' : 'Zone Event'}
                      </Text>
                      <Text style={styles.eventSubtitle}>
                        {zone?.name || 'Unknown Zone'} • {formatEventTime(event.timestamp)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Zones List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Zones ({zones.length})</Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0277BD" />
                <Text style={styles.loadingText}>Loading zones...</Text>
              </View>
            ) : zones.length === 0 ? (
              <View style={styles.emptyState}>
                <MapPin size={48} color="#64B5F6" />
                <Text style={styles.emptyTitle}>No Zones Created</Text>
                <Text style={styles.emptyText}>
                  Create your first zone to start tracking device locations
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => setZoneModalVisible(true)}
                >
                  <Plus size={20} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>Create Zone</Text>
                </TouchableOpacity>
              </View>
            ) : (
              zones.map((zone, index) => (
                <View key={zone.id} style={styles.zoneCard}>
                  <View style={styles.zoneHeader}>
                    <View style={styles.zoneIconContainer}>
                      {getZoneTypeIcon(zone.type)}
                    </View>
                    <View style={styles.zoneInfo}>
                      <Text style={styles.zoneName}>{zone.name}</Text>
                      <Text style={styles.zoneType}>
                        {getZoneTypeLabel(zone.type)} • {zone.radius}m radius
                      </Text>
                      <Text style={styles.zoneStats}>
                        {zone.deviceIds.length} devices • {zone.stats.totalEntries} entries
                      </Text>
                    </View>
                    <View style={styles.zoneActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setZoneModalVisible(true)}
                      >
                        <SettingsIcon size={16} color="#0277BD" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteActionButton]}
                        onPress={() => handleDeleteZone(zone)}
                      >
                        <Trash2 size={16} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.zoneDetails}>
                    <View style={styles.zoneDetail}>
                      <Text style={styles.zoneDetailLabel}>Status</Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: zone.status === 'active' ? '#E8F5E8' : '#FFEBEE' }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: zone.status === 'active' ? '#4CAF50' : '#F44336' }
                        ]}>
                          {zone.status.charAt(0).toUpperCase() + zone.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.zoneDetail}>
                      <Text style={styles.zoneDetailLabel}>Notifications</Text>
                      <Text style={styles.zoneDetailValue}>
                        {zone.settings.notifyOnEntry || zone.settings.notifyOnExit ? 'Enabled' : 'Disabled'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.spacer} />
        </ScrollView>

        {/* Zone Management Modal */}
        <ZoneManagementModal
          visible={zoneModalVisible}
          onClose={() => {
            setZoneModalVisible(false);
            loadZones();
          }}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0277BD',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#0277BD',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginBottom: 12,
  },
  monitoringCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  monitoringLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  monitoringIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FCFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  monitoringInfo: {
    flex: 1,
  },
  monitoringTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
  },
  monitoringSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginTop: 2,
  },
  proLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FF9800',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eventIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FCFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
  },
  eventSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginTop: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0277BD',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  zoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  zoneIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FCFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
  },
  zoneType: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginTop: 2,
  },
  zoneStats: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#81C784',
    marginTop: 2,
  },
  zoneActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FCFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1F5FE',
  },
  deleteActionButton: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  zoneDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F8FCFF',
  },
  zoneDetail: {
    flex: 1,
  },
  zoneDetailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64B5F6',
    marginBottom: 4,
  },
  zoneDetailValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  spacer: {
    height: 40,
  },
});