// Notification Manager for DAMP Smart Drinkware
// Handles all app notifications and alerts

export interface NotificationConfig {
  deviceAlerts: boolean;
  zoneAlerts: boolean;
  batteryAlerts: boolean;
  connectionAlerts: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface NotificationData {
  id: string;
  type: 'device' | 'zone' | 'battery' | 'connection';
  title: string;
  message: string;
  deviceId?: string;
  zoneId?: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface NotificationManagerInterface {
  configure(config: NotificationConfig): void;
  showNotification(data: Omit<NotificationData, 'id' | 'timestamp' | 'isRead'>): void;
  getNotifications(): NotificationData[];
  markAsRead(notificationId: string): void;
  clearAll(): void;
  onNotificationReceived(callback: (notification: NotificationData) => void): void;
}

class NotificationManager implements NotificationManagerInterface {
  private config: NotificationConfig = {
    deviceAlerts: true,
    zoneAlerts: true,
    batteryAlerts: true,
    connectionAlerts: true,
    soundEnabled: true,
    vibrationEnabled: true
  };

  private notifications: Map<string, NotificationData> = new Map();
  private onNotificationCallback?: (notification: NotificationData) => void;

  configure(config: NotificationConfig): void {
    this.config = { ...config };
  }

  showNotification(data: Omit<NotificationData, 'id' | 'timestamp' | 'isRead'>): void {
    // Check if this type of notification is enabled
    const isEnabled = this.isNotificationTypeEnabled(data.type);
    if (!isEnabled) return;

    const notification: NotificationData = {
      ...data,
      id: `notification-${Date.now()}`,
      timestamp: new Date(),
      isRead: false
    };

    this.notifications.set(notification.id, notification);

    // Trigger platform-specific notification
    this.triggerPlatformNotification(notification);

    // Call callback if set
    this.onNotificationCallback?.(notification);
  }

  getNotifications(): NotificationData[] {
    return Array.from(this.notifications.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  clearAll(): void {
    this.notifications.clear();
  }

  onNotificationReceived(callback: (notification: NotificationData) => void): void {
    this.onNotificationCallback = callback;
  }

  private isNotificationTypeEnabled(type: string): boolean {
    switch (type) {
      case 'device':
        return this.config.deviceAlerts;
      case 'zone':
        return this.config.zoneAlerts;
      case 'battery':
        return this.config.batteryAlerts;
      case 'connection':
        return this.config.connectionAlerts;
      default:
        return true;
    }
  }

  private triggerPlatformNotification(notification: NotificationData): void {
    // For web platform, we'll use browser notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/assets/images/icon.png',
          tag: notification.id
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/assets/images/icon.png',
              tag: notification.id
            });
          }
        });
      }
    }

    // Trigger sound if enabled
    if (this.config.soundEnabled) {
      this.playNotificationSound(notification.priority);
    }

    // Trigger vibration if enabled (mobile only)
    if (this.config.vibrationEnabled && 'vibrate' in navigator) {
      const pattern = this.getVibrationPattern(notification.priority);
      navigator.vibrate(pattern);
    }
  }

  private playNotificationSound(priority: string): void {
    // In a real app, you would play different sounds based on priority
    // For web, we can use the Web Audio API or HTML5 audio
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different priorities
      const frequency = priority === 'high' ? 800 : priority === 'medium' ? 600 : 400;
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }

  private getVibrationPattern(priority: string): number[] {
    switch (priority) {
      case 'high':
        return [200, 100, 200, 100, 200]; // Long-short-long-short-long
      case 'medium':
        return [100, 50, 100]; // Short-pause-short
      case 'low':
        return [50]; // Single short vibration
      default:
        return [100];
    }
  }

  // Predefined notification templates
  deviceLeftZone(deviceName: string, zoneName: string): void {
    this.showNotification({
      type: 'zone',
      title: 'Device Left Zone',
      message: `${deviceName} has left ${zoneName}`,
      priority: 'medium'
    });
  }

  deviceEnteredZone(deviceName: string, zoneName: string): void {
    this.showNotification({
      type: 'zone',
      title: 'Device Entered Zone',
      message: `${deviceName} is now in ${zoneName}`,
      priority: 'low'
    });
  }

  lowBatteryAlert(deviceName: string, batteryLevel: number): void {
    this.showNotification({
      type: 'battery',
      title: 'Low Battery',
      message: `${deviceName} battery is at ${batteryLevel}%`,
      priority: 'high'
    });
  }

  deviceDisconnected(deviceName: string): void {
    this.showNotification({
      type: 'connection',
      title: 'Device Disconnected',
      message: `${deviceName} has been disconnected`,
      priority: 'medium'
    });
  }

  deviceConnected(deviceName: string): void {
    this.showNotification({
      type: 'connection',
      title: 'Device Connected',
      message: `${deviceName} is now connected`,
      priority: 'low'
    });
  }
}

export const notificationManager = new NotificationManager();