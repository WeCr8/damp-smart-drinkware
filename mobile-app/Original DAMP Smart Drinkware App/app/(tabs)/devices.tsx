import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bluetooth, Plus, Users } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import DeviceList from '@/components/DeviceList';
import { initializeWithSampleData } from '@/utils/supabaseDeviceManager';

export default function DevicesScreen() {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [subscriptionActive] = useState(true); // This would come from subscription context

  // Initialize sample data on first load
  useEffect(() => {
    if (user) {
      initializeWithSampleData(true);
    }
  }, [user]);

  const handleScanDevices = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      Alert.alert('Scan Complete', 'No new devices found nearby');
    }, 3000);
  };

  const deviceTypeItems = [
    'Coffee Cup Handles - Track your favorite mug',
    'Cup Sleeves - Protect and track any cup',
    'Baby Bottles - Never lose feeding bottles',
    'Silicone Bottoms - Universal tracking base',
    'DAMP Cups - Complete smart drinkware'
  ];

  return (
    <LinearGradient
      colors={['#E0F7FF', '#F8FCFF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>My Devices</Text>
          <TouchableOpacity
            style={[styles.scanButton, scanning && styles.scanButtonActive]}
            onPress={handleScanDevices}
            disabled={scanning}
            testID="scan-button"
          >
            <Bluetooth size={20} color={scanning ? "#FFFFFF" : "#0277BD"} />
            <Text style={[styles.scanButtonText, scanning && styles.scanButtonTextActive]}>
              {scanning ? 'Scanning...' : 'Scan'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Connected Devices */}
          <DeviceList 
            title="Connected Devices"
            filterByStatus="connected"
            emptyStateMessage="No connected devices found. Scan to discover nearby devices."
          />

          {/* Disconnected Devices */}
          <View style={styles.section}>
            <DeviceList 
              title="Available Devices"
              filterByStatus="disconnected"
              emptyStateMessage="No disconnected devices found."
            />
          </View>

          {/* Device Types Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Device Types</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>DAMP Smart Drinkware</Text>
              <View style={styles.infoTextContainer}>
                {deviceTypeItems.map((item, index) => (
                  <Text key={index} style={styles.infoText}>
                    • {item}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* Subscription Notice */}
          {!subscriptionActive && (
            <View style={styles.subscriptionNotice}>
              <Users size={24} color="#FF9800" />
              <View style={styles.noticeContent}>
                <Text style={styles.noticeTitle}>Upgrade to DAMP+</Text>
                <Text style={styles.noticeText}>
                  Get unlimited zones, advanced monitoring, and family sharing features
                </Text>
              </View>
              <TouchableOpacity style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E1F5FE',
  },
  scanButtonActive: {
    backgroundColor: '#0277BD',
  },
  scanButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0277BD',
    marginLeft: 8,
  },
  scanButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginBottom: 8,
  },
  infoTextContainer: {
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    lineHeight: 18,
  },
  subscriptionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
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
});