import { useBLEContext } from '../components/BLEProvider';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// Platform-specific imports
let BleError: any;
let Device: any;

if (Platform.OS !== 'web') {
  const BLEModule = require('react-native-ble-plx');
  BleError = BLEModule.BleError;
  Device = BLEModule.Device;
}

export function useBLE() {
  const {
    devices,
    connectedDevice,
    isScanning,
    startScan,
    stopScan,
    connectToDevice,
    disconnectFromDevice,
    bleManager,
    setConnectedDevice,
    updateDeviceBattery,
    updateDeviceRSSI
  } = useBLEContext();

  // 🔁 Poll RSSI every 3 seconds (only on native platforms)
  useEffect(() => {
    if (Platform.OS === 'web') return;

    let rssiInterval: NodeJS.Timeout | null = null;

    if (connectedDevice && bleManager) {
      rssiInterval = setInterval(async () => {
        try {
          const updatedDevice = await bleManager.readRSSIForDevice(connectedDevice.id);
          if (updatedDevice?.rssi !== null && updatedDevice?.rssi !== undefined) {
            updateDeviceRSSI(connectedDevice.id, updatedDevice.rssi);
          }
        } catch (err) {
          console.warn('RSSI read failed', err);
        }
      }, 3000);
    }

    return () => {
      if (rssiInterval) clearInterval(rssiInterval);
    };
  }, [connectedDevice, bleManager, updateDeviceRSSI]);

  // 🔋 Read battery level after connecting (only on native platforms)
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const fetchBatteryLevel = async () => {
      if (!connectedDevice) return;
      try {
        await connectedDevice.discoverAllServicesAndCharacteristics();
        const services = await connectedDevice.services();
        for (const service of services) {
          if (service.uuid.toLowerCase().includes('180f')) {
            const characteristics = await service.characteristics();
            for (const char of characteristics) {
              if (char.uuid.toLowerCase().includes('2a19')) {
                const batteryData = await char.read();
                const batteryLevel = batteryData.value
                  ? Buffer.from(batteryData.value, 'base64')[0]
                  : 0;
                updateDeviceBattery(connectedDevice.id, batteryLevel);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Battery read failed', err);
      }
    };

    fetchBatteryLevel();
  }, [connectedDevice, updateDeviceBattery]);

  // 🔌 Handle real-time disconnection (only on native platforms)
  useEffect(() => {
    if (Platform.OS === 'web' || !connectedDevice || !bleManager) return;

    const subscription = bleManager.onDeviceDisconnected(
      connectedDevice.id,
      (error: any, device: any) => {
        if (error) {
          console.warn('Disconnection error:', error.message);
        }
        setConnectedDevice(null);
      }
    );

    return () => subscription?.remove();
  }, [connectedDevice, bleManager, setConnectedDevice]);

  return {
    devices,
    connectedDevice,
    isScanning,
    startScan,
    stopScan,
    connectToDevice,
    disconnectFromDevice,
  };
}