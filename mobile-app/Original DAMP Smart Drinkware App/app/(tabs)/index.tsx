import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Droplets, Bluetooth, MapPin, Battery, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Plus } from 'lucide-react-native';
import { getUserProfile, getUserGreeting, registerCurrentDevice } from '@/utils/userProfileManager';
import { supabase } from '@/lib/supabase';
import DeviceInfoModal from '@/components/modals/DeviceInfoModal';
import DeviceList from '@/components/DeviceList';
import { 
  getAllDevices, 
  getDeviceStats,
  Device 
} from '@/utils/supabaseDeviceManager';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceInfoModalVisible, setDeviceInfoModalVisible] = useState(false);
  const [greeting, setGreeting] = useState('Hello');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    total: 0, 
    connected: 0, 
    disconnected: 0, 
    lowBattery: 0 
  });
  const [zones] = useState([
    { id: '1', name: 'Home', isActive: true, deviceCount: 1 },
    { id: '2', name: 'Office', isActive: true, deviceCount: 1 },
    { id: '3', name: 'Kitchen', isActive: false, deviceCount: 1 }
  ]);

  // Load user data and devices on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Get user profile
        const profile = await getUserProfile();
        if (profile) {
          setUserName(profile.full_name || '');
        }
        
        // Get personalized greeting
        try {
          const personalizedGreeting = await getUserGreeting();
          setGreeting(personalizedGreeting);
        } catch (error) {
          console.error('Error fetching greeting:', error);
          setGreeting('Hello');
        }
        
        // Register current device
        try {
          await registerCurrentDevice();
        } catch (error) {
          console.error('Error registering device:', error);
        }
        
        // Load device stats
        await loadDeviceStats();
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        loadUserData();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadDeviceStats = async () => {
    try {
      const deviceStats = await getDeviceStats();
      setStats(deviceStats);
    } catch (error) {
      console.error('Error loading device stats:', error);
    }
  };

  const handleDevicePress = (device: Device) => {
    setSelectedDevice(device);
    setDeviceInfoModalVisible(true);
  };

  const handleDeviceUpdate = (updatedDevice: Device) => {
    setSelectedDevice(updatedDevice);
    loadDeviceStats();
  };

  const handleDeviceRemove = (deviceId: string) => {
    setDeviceInfoModalVisible(false);
    setSelectedDevice(null);
    loadDeviceStats();
  };

  const handleAddDevice = () => {
    router.push('/add-device');
  };

  const activeZones = zones.filter(z => z.isActive);

  if (loading) {
    return (
      <LinearGradient
        colors={['#E0F7FF', '#F8FCFF']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0277BD" />
            <Text style={styles.loadingText}>Loading your dashboard...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#E0F7FF', '#F8FCFF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{greeting}{userName ? `, ${userName}` : ''}!</Text>
              <Text style={styles.subtitle}>Your DAMP devices are ready</Text>
            </View>
            <View style={styles.logoContainer}>
              <Droplets size={32} color="#0277BD" />
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Bluetooth size={20} color="#4CAF50" />
              <Text style={styles.statNumber}>{stats.connected}</Text>
              <Text style={styles.statLabel}>Connected</Text>
            </View>
            <View style={styles.statCard}>
              <MapPin size={20} color="#2196F3" />
              <Text style={styles.statNumber}>{activeZones.length}</Text>
              <Text style={styles.statLabel}>Active Zones</Text>
            </View>
            <View style={styles.statCard}>
              <Battery size={20} color={stats.lowBattery > 0 ? "#FF9800" : "#4CAF50"} />
              <Text style={styles.statNumber}>{stats.lowBattery}</Text>
              <Text style={styles.statLabel}>Low Battery</Text>
            </View>
          </View>

          {/* Alerts */}
          {stats.lowBattery > 0 && (
            <View style={styles.alertCard}>
              <AlertTriangle size={20} color="#FF9800" />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Battery Alert</Text>
                <Text style={styles.alertText}>
                  {stats.lowBattery} device{stats.lowBattery > 1 ? 's' : ''} need charging
                </Text>
              </View>
            </View>
          )}

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {stats.connected > 0 ? (
              <View>
                {/* This would be replaced with actual activity data */}
                <View style={styles.activityCard}>
                  <CheckCircle size={16} color="#4CAF50" />
                  <Text style={styles.activityText}>
                    Coffee Cup Handle connected to Home zone
                  </Text>
                  <Text style={styles.activityTime}>
                    {new Date().toLocaleTimeString()}
                  </Text>
                </View>
                <View style={styles.activityCard}>
                  <CheckCircle size={16} color="#4CAF50" />
                  <Text style={styles.activityText}>
                    Office Cup Sleeve connected to Office zone
                  </Text>
                  <Text style={styles.activityTime}>
                    {new Date(Date.now() - 3600000).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.activityCard}>
                <AlertTriangle size={16} color="#FF9800" />
                <Text style={styles.activityText}>No recent device activity</Text>
                <Text style={styles.activityTime}>Add devices to get started</Text>
              </View>
            )}
          </View>

          {/* Connected Devices */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Devices</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddDevice}>
                <Plus size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <DeviceList 
              showTitle={false}
              maxDevices={3}
              onDevicePress={handleDevicePress}
              emptyStateMessage="Add your first DAMP device to start tracking your drinkware"
            />
          </View>

          {/* Active Zones */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Zones</Text>
            {activeZones.map((zone) => (
              <View key={zone.id} style={styles.zoneCard}>
                <MapPin size={20} color="#0277BD" />
                <View style={styles.zoneInfo}>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  <Text style={styles.zoneDevices}>
                    {zone.deviceCount} device{zone.deviceCount > 1 ? 's' : ''} tracked
                  </Text>
                </View>
                <View style={styles.zoneStatus}>
                  <Text style={styles.zoneStatusText}>Active</Text>
                </View>
              </View>
            ))}
          </View>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  greeting: {
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
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginTop: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  alertContent: {
    marginLeft: 12,
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F57C00',
  },
  alertText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FF8F00',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginBottom: 12,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0277BD',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0277BD',
    marginLeft: 12,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
  },
  zoneCard: {
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
  zoneInfo: {
    flex: 1,
    marginLeft: 12,
  },
  zoneName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
  },
  zoneDevices: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginTop: 2,
  },
  zoneStatus: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  zoneStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#4CAF50',
  },
});