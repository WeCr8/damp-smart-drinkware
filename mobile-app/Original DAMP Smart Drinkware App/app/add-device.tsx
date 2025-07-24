import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Coffee, Baby, Droplets, Bluetooth, Search, CircleCheck as CheckCircle, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { 
  addDevice, 
  validateDeviceInput,
  type DeviceInput,
  type DeviceType 
} from '@/utils/deviceManager';

interface DeviceTypeInfo {
  id: DeviceType;
  name: string;
  description: string;
  icon: string;
  features: string[];
}

interface DiscoveredDevice {
  id: string;
  name: string;
  type: DeviceType;
  signalStrength: number;
  batteryLevel?: number;
}

export default function AddDeviceScreen() {
  const [step, setStep] = useState<'select' | 'scan' | 'pair'>('select');
  const [selectedType, setSelectedType] = useState<DeviceType | ''>('');
  const [scanning, setScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([]);

  const deviceTypes: DeviceTypeInfo[] = [
    {
      id: 'cup',
      name: 'Coffee Cup Handle',
      description: 'Smart handle that attaches to any mug or cup',
      icon: 'coffee',
      features: ['Temperature tracking', 'Location alerts', '30-day battery']
    },
    {
      id: 'sleeve',
      name: 'Cup Sleeve',
      description: 'Universal sleeve for any drinkware',
      icon: 'droplets',
      features: ['Universal fit', 'Insulation', 'Spill detection']
    },
    {
      id: 'bottle',
      name: 'Baby Bottle Tracker',
      description: 'Specialized tracker for baby bottles',
      icon: 'baby',
      features: ['Feeding reminders', 'Temperature alerts', 'Safe materials']
    },
    {
      id: 'bottom',
      name: 'Silicone Bottom',
      description: 'Smart base that sticks to any container',
      icon: 'droplets',
      features: ['Universal attachment', 'Non-slip base', 'Waterproof']
    },
    {
      id: 'damp-cup',
      name: 'DAMP Smart Cup',
      description: 'Complete smart drinkware solution',
      icon: 'coffee',
      features: ['Built-in tracking', 'Premium materials', 'All features included']
    }
  ];

  const getDeviceIcon = (iconType: string) => {
    switch (iconType) {
      case 'coffee':
        return <Coffee size={32} color="#0277BD" />;
      case 'baby':
        return <Baby size={32} color="#0277BD" />;
      case 'droplets':
        return <Droplets size={32} color="#0277BD" />;
      default:
        return <Droplets size={32} color="#0277BD" />;
    }
  };

  const handleSelectType = (typeId: DeviceType) => {
    setSelectedType(typeId);
    setStep('scan');
    startScanning();
  };

  const startScanning = () => {
    setScanning(true);
    setDiscoveredDevices([]);
    
    // Simulate device discovery
    setTimeout(() => {
      const mockDevices: DiscoveredDevice[] = [
        {
          id: 'DAMP-CUP-A1B2',
          name: `DAMP-${selectedType?.toUpperCase()}-A1B2`,
          type: selectedType as DeviceType,
          signalStrength: 4,
          batteryLevel: 95
        },
        {
          id: 'DAMP-CUP-C3D4',
          name: `DAMP-${selectedType?.toUpperCase()}-C3D4`,
          type: selectedType as DeviceType,
          signalStrength: 3,
          batteryLevel: 87
        }
      ];
      setDiscoveredDevices(mockDevices);
    }, 2000);

    setTimeout(() => {
      setScanning(false);
    }, 5000);
  };

  const handlePairDevice = async (discoveredDevice: DiscoveredDevice) => {
    setStep('pair');
    
    try {
      // Create device input from discovered device
      const deviceInput: DeviceInput = {
        name: `${deviceTypes.find(t => t.id === discoveredDevice.type)?.name || 'DAMP Device'}`,
        type: discoveredDevice.type,
        batteryLevel: discoveredDevice.batteryLevel || 100,
        status: 'connected',
        bluetoothId: discoveredDevice.id,
        firmware: '1.2.3',
        signalStrength: discoveredDevice.signalStrength
      };

      // Validate the device input
      const validation = validateDeviceInput(deviceInput);
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.errors.join('\n'));
        setStep('scan');
        return;
      }

      // Add the device
      const result = await addDevice(deviceInput, { 
        timeout: 15000,
        notify: true 
      });

      if (result.success) {
        Alert.alert(
          'Device Paired Successfully!',
          `${result.data?.name} is now connected and ready to use.`,
          [
            {
              text: 'OK',
              onPress: () => {
                router.back();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Pairing Failed',
          result.error || 'Failed to add device. Please try again.',
          [
            {
              text: 'OK',
              onPress: () => setStep('scan')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Device pairing error:', error);
      Alert.alert(
        'Pairing Error',
        'An unexpected error occurred. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => setStep('scan')
          }
        ]
      );
    }
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

  const renderSelectType = () => (
    <View style={styles.content}>
      <Text style={styles.stepTitle}>Choose Device Type</Text>
      <Text style={styles.stepDescription}>
        Select the type of DAMP device you want to add
      </Text>

      <ScrollView style={styles.deviceTypesList} showsVerticalScrollIndicator={false}>
        {deviceTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={styles.deviceTypeCard}
            onPress={() => handleSelectType(type.id)}
          >
            <View style={styles.deviceTypeIcon}>
              {getDeviceIcon(type.icon)}
            </View>
            <View style={styles.deviceTypeInfo}>
              <Text style={styles.deviceTypeName}>{type.name}</Text>
              <Text style={styles.deviceTypeDescription}>{type.description}</Text>
              <View style={styles.featuresList}>
                {type.features.map((feature, index) => (
                  <Text key={index} style={styles.featureText}>
                    • {feature}
                  </Text>
                ))}
              </View>
            </View>
            <Plus size={20} color="#64B5F6" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderScanDevices = () => (
    <View style={styles.content}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep('select')}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.stepTitle}>Scanning for Devices</Text>
      <Text style={styles.stepDescription}>
        Make sure your device is powered on and nearby
      </Text>

      <View style={styles.scanningContainer}>
        <View style={[styles.scanningIndicator, scanning && styles.scanningActive]}>
          <Search size={32} color={scanning ? "#FFFFFF" : "#0277BD"} />
        </View>
        <Text style={styles.scanningText}>
          {scanning ? 'Scanning...' : 'Scan Complete'}
        </Text>
      </View>

      {discoveredDevices.length > 0 && (
        <View style={styles.discoveredDevices}>
          <Text style={styles.discoveredTitle}>Found Devices</Text>
          {discoveredDevices.map((device) => (
            <TouchableOpacity
              key={device.id}
              style={styles.discoveredDeviceCard}
              onPress={() => handlePairDevice(device)}
            >
              <View style={styles.deviceIcon}>
                <Bluetooth size={24} color="#0277BD" />
              </View>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceDetails}>
                  {`Battery: ${device.batteryLevel}% • Ready to pair`}
                </Text>
              </View>
              <View style={styles.signalContainer}>
                {getSignalBars(device.signalStrength)}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.rescanButton}
        onPress={startScanning}
        disabled={scanning}
      >
        <Text style={styles.rescanButtonText}>
          {scanning ? 'Scanning...' : 'Scan Again'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPairDevice = () => (
    <View style={styles.content}>
      <View style={styles.pairingContainer}>
        <View style={styles.pairingIndicator}>
          <CheckCircle size={48} color="#4CAF50" />
        </View>
        <Text style={styles.pairingTitle}>Pairing Device</Text>
        <Text style={styles.pairingDescription}>
          Please wait while we connect your device...
        </Text>
        <View style={styles.pairingSteps}>
          <Text style={styles.pairingStep}>✓ Device discovered</Text>
          <Text style={styles.pairingStep}>✓ Establishing connection</Text>
          <Text style={styles.pairingStep}>⏳ Configuring settings</Text>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#E0F7FF', '#F8FCFF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
            <ArrowLeft size={24} color="#0277BD" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Device</Text>
          <View style={{ width: 24 }} />
        </View>

        {step === 'select' && renderSelectType()}
        {step === 'scan' && renderScanDevices()}
        {step === 'pair' && renderPairDevice()}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#0277BD',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginBottom: 24,
  },
  deviceTypesList: {
    flex: 1,
  },
  deviceTypeCard: {
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
  deviceTypeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FCFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deviceTypeInfo: {
    flex: 1,
  },
  deviceTypeName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginBottom: 4,
  },
  deviceTypeDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginBottom: 8,
  },
  featuresList: {
    marginTop: 4,
  },
  featureText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#81C784',
    lineHeight: 14,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#0277BD',
  },
  scanningContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  scanningIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FCFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E1F5FE',
  },
  scanningActive: {
    backgroundColor: '#0277BD',
    borderColor: '#0277BD',
  },
  scanningText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#0277BD',
  },
  discoveredDevices: {
    marginTop: 24,
  },
  discoveredTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginBottom: 12,
  },
  discoveredDeviceCard: {
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
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FCFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
  },
  deviceDetails: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginTop: 2,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 16,
  },
  signalBar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 1,
  },
  rescanButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#E1F5FE',
  },
  rescanButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0277BD',
  },
  pairingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pairingIndicator: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  pairingTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginBottom: 8,
  },
  pairingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    textAlign: 'center',
    marginBottom: 32,
  },
  pairingSteps: {
    alignItems: 'flex-start',
  },
  pairingStep: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4CAF50',
    marginBottom: 8,
  },
});