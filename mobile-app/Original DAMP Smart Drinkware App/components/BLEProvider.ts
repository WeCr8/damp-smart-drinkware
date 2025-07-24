import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';

// Platform-specific imports
let BleManager: any;
let Device: any;
let Subscription: any;

if (Platform.OS !== 'web') {
  const BLEModule = require('react-native-ble-plx');
  BleManager = BLEModule.BleManager;
  Device = BLEModule.Device;
  Subscription = BLEModule.Subscription;
}

type BLEContextType = {
  devices: any[];
  connectedDevice: any | null;
  startScan: () => void;
  stopScan: () => void;
  connectToDevice: (deviceId: string) => Promise<void>;
  disconnectFromDevice: () => Promise<void>;
  isScanning: boolean;
  bleManager?: any;
  setConnectedDevice: (device: any | null) => void;
  updateDeviceBattery: (deviceId: string, batteryLevel: number) => void;
  updateDeviceRSSI: (deviceId: string, rssi: number) => void;
};

const BLEContext = createContext<BLEContextType | undefined>(undefined);

export const BLEProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const managerRef = useRef<any>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<any | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scanSubscription = useRef<any | null>(null);

  useEffect(() => {
    // Only initialize BLE manager on native platforms
    if (Platform.OS !== 'web' && BleManager) {
      managerRef.current = new BleManager();
    }

    return () => {
      if (managerRef.current && Platform.OS !== 'web') {
        managerRef.current.destroy();
      }
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'web') {
      return false; // BLE not supported on web
    }

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      return Object.values(granted).every(val => val === PermissionsAndroid.RESULTS.GRANTED);
    }
    return true;
  };

  const startScan = async () => {
    if (Platform.OS === 'web' || !managerRef.current) {
      console.warn('BLE scanning not supported on web platform');
      return;
    }

    const granted = await requestPermissions();
    if (!granted) return;

    setIsScanning(true);
    setDevices([]);

    scanSubscription.current = managerRef.current.startDeviceScan(null, null, (error: any, device: any) => {
      if (error) {
        console.warn('Scan error:', error);
        setIsScanning(false);
        return;
      }

      if (device && device.name && !devices.find(d => d.id === device.id)) {
        setDevices(prev => [...prev, device]);
      }
    });

    setTimeout(() => {
      stopScan();
    }, 10000); // Stop after 10 seconds
  };

  const stopScan = () => {
    if (Platform.OS === 'web' || !managerRef.current) {
      return;
    }

    scanSubscription.current?.remove();
    scanSubscription.current = null;
    managerRef.current.stopDeviceScan();
    setIsScanning(false);
  };

  const connectToDevice = async (deviceId: string) => {
    if (Platform.OS === 'web' || !managerRef.current) {
      console.warn('BLE connection not supported on web platform');
      return;
    }

    try {
      const device = await managerRef.current.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      setConnectedDevice(device);
    } catch (error) {
      console.warn('Connection error:', error);
    }
  };

  const disconnectFromDevice = async () => {
    if (Platform.OS === 'web' || !managerRef.current || !connectedDevice) {
      return;
    }

    try {
      await managerRef.current.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
    } catch (error) {
      console.warn('Disconnection error:', error);
    }
  };

  const updateDeviceBattery = (deviceId: string, batteryLevel: number) => {
    if (Platform.OS === 'web') return;
    
    setDevices(prev => prev.map(device => 
      device.id === deviceId ? { ...device, batteryLevel } : device
    ));
  };

  const updateDeviceRSSI = (deviceId: string, rssi: number) => {
    if (Platform.OS === 'web') return;
    
    setDevices(prev => prev.map(device => 
      device.id === deviceId ? { ...device, rssi } : device
    ));
    
    if (connectedDevice && connectedDevice.id === deviceId) {
      setConnectedDevice(prev => prev ? { ...prev, rssi } : null);
    }
  };

  return (
    <BLEContext.Provider
      value={{
        devices,
        connectedDevice,
        startScan,
        stopScan,
        connectToDevice,
        disconnectFromDevice,
        isScanning,
        bleManager: managerRef.current,
        setConnectedDevice,
        updateDeviceBattery,
        updateDeviceRSSI,
      }}
    >
      {children}
    </BLEContext.Provider>
  );
};

export const useBLEContext = () => {
  const context = useContext(BLEContext);
  if (!context) throw new Error('useBLEContext must be used within BLEProvider');
  return context;
};