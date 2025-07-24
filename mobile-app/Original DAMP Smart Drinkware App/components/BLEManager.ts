// BLE Manager for DAMP Smart Drinkware
// This is a mock implementation for web compatibility
// In a real app, you would use react-native-ble-plx or similar

export interface DAMPDevice {
  id: string;
  name: string;
  type: 'cup' | 'sleeve' | 'bottle' | 'bottom';
  batteryLevel: number;
  isConnected: boolean;
  signalStrength: number;
  lastSeen: Date;
  firmware: string;
}

export interface BLEManagerInterface {
  startScanning(): Promise<void>;
  stopScanning(): void;
  connectToDevice(deviceId: string): Promise<boolean>;
  disconnectFromDevice(deviceId: string): Promise<void>;
  getConnectedDevices(): DAMPDevice[];
  onDeviceDiscovered(callback: (device: DAMPDevice) => void): void;
  onDeviceConnected(callback: (device: DAMPDevice) => void): void;
  onDeviceDisconnected(callback: (device: DAMPDevice) => void): void;
  onBatteryLevelChanged(callback: (deviceId: string, level: number) => void): void;
}

class BLEManager implements BLEManagerInterface {
  private connectedDevices: Map<string, DAMPDevice> = new Map();
  private discoveredDevices: Map<string, DAMPDevice> = new Map();
  private isScanning = false;
  private scanTimeout?: NodeJS.Timeout;

  // Event callbacks
  private onDeviceDiscoveredCallback?: (device: DAMPDevice) => void;
  private onDeviceConnectedCallback?: (device: DAMPDevice) => void;
  private onDeviceDisconnectedCallback?: (device: DAMPDevice) => void;
  private onBatteryLevelChangedCallback?: (deviceId: string, level: number) => void;

  async startScanning(): Promise<void> {
    if (this.isScanning) return;
    
    this.isScanning = true;
    this.discoveredDevices.clear();

    // Simulate device discovery
    const mockDevices: DAMPDevice[] = [
      {
        id: 'DAMP-CUP-A1B2',
        name: 'Coffee Cup Handle',
        type: 'cup',
        batteryLevel: 85,
        isConnected: false,
        signalStrength: 4,
        lastSeen: new Date(),
        firmware: '1.2.3'
      },
      {
        id: 'DAMP-SLEEVE-C3D4',
        name: 'Cup Sleeve',
        type: 'sleeve',
        batteryLevel: 92,
        isConnected: false,
        signalStrength: 3,
        lastSeen: new Date(),
        firmware: '1.1.8'
      },
      {
        id: 'DAMP-BOTTLE-E5F6',
        name: 'Baby Bottle Tracker',
        type: 'bottle',
        batteryLevel: 67,
        isConnected: false,
        signalStrength: 5,
        lastSeen: new Date(),
        firmware: '1.0.9'
      }
    ];

    // Simulate gradual device discovery
    mockDevices.forEach((device, index) => {
      setTimeout(() => {
        this.discoveredDevices.set(device.id, device);
        this.onDeviceDiscoveredCallback?.(device);
      }, (index + 1) * 1000);
    });

    // Auto-stop scanning after 10 seconds
    this.scanTimeout = setTimeout(() => {
      this.stopScanning();
    }, 10000);
  }

  stopScanning(): void {
    this.isScanning = false;
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = undefined;
    }
  }

  async connectToDevice(deviceId: string): Promise<boolean> {
    const device = this.discoveredDevices.get(deviceId);
    if (!device) return false;

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const connectedDevice: DAMPDevice = {
      ...device,
      isConnected: true,
      lastSeen: new Date()
    };

    this.connectedDevices.set(deviceId, connectedDevice);
    this.onDeviceConnectedCallback?.(connectedDevice);

    // Start battery monitoring
    this.startBatteryMonitoring(deviceId);

    return true;
  }

  async disconnectFromDevice(deviceId: string): Promise<void> {
    const device = this.connectedDevices.get(deviceId);
    if (!device) return;

    const disconnectedDevice: DAMPDevice = {
      ...device,
      isConnected: false
    };

    this.connectedDevices.delete(deviceId);
    this.onDeviceDisconnectedCallback?.(disconnectedDevice);
  }

  getConnectedDevices(): DAMPDevice[] {
    return Array.from(this.connectedDevices.values());
  }

  onDeviceDiscovered(callback: (device: DAMPDevice) => void): void {
    this.onDeviceDiscoveredCallback = callback;
  }

  onDeviceConnected(callback: (device: DAMPDevice) => void): void {
    this.onDeviceConnectedCallback = callback;
  }

  onDeviceDisconnected(callback: (device: DAMPDevice) => void): void {
    this.onDeviceDisconnectedCallback = callback;
  }

  onBatteryLevelChanged(callback: (deviceId: string, level: number) => void): void {
    this.onBatteryLevelChangedCallback = callback;
  }

  private startBatteryMonitoring(deviceId: string): void {
    // Simulate battery level changes
    const interval = setInterval(() => {
      const device = this.connectedDevices.get(deviceId);
      if (!device || !device.isConnected) {
        clearInterval(interval);
        return;
      }

      // Simulate gradual battery drain
      const newLevel = Math.max(0, device.batteryLevel - Math.random() * 2);
      device.batteryLevel = Math.round(newLevel);
      
      this.onBatteryLevelChangedCallback?.(deviceId, device.batteryLevel);
    }, 30000); // Check every 30 seconds
  }
}

export const bleManager = new BLEManager();