/**
 * Data Management Modal
 * 
 * Storage, backup, and data management options
 */

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { HardDrive, Cloud, Download, Upload, Trash2, RefreshCw, Archive, Database, Wifi, WifiOff, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import BaseModal from './BaseModal';
import { settingsStyles } from '@/styles/settings';
import { BaseModalProps } from '@/types/settings';

interface DataManagementModalProps extends BaseModalProps {}

interface StorageInfo {
  total: number;
  used: number;
  devices: number;
  preferences: number;
  cache: number;
  backups: number;
}

interface BackupInfo {
  lastBackup: Date | null;
  autoBackup: boolean;
  cloudSync: boolean;
  backupSize: number;
  status: 'idle' | 'backing-up' | 'restoring' | 'error';
}

export default function DataManagementModal({
  visible,
  onClose,
}: DataManagementModalProps) {
  const [loading, setLoading] = useState(false);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    total: 100,
    used: 23,
    devices: 8,
    preferences: 5,
    cache: 7,
    backups: 3,
  });
  const [backupInfo, setBackupInfo] = useState<BackupInfo>({
    lastBackup: new Date(Date.now() - 86400000), // 1 day ago
    autoBackup: true,
    cloudSync: false,
    backupSize: 2.3,
    status: 'idle',
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBackup = async () => {
    setBackupInfo(prev => ({ ...prev, status: 'backing-up' }));
    setLoading(true);

    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setBackupInfo(prev => ({
        ...prev,
        status: 'idle',
        lastBackup: new Date(),
        backupSize: prev.backupSize + 0.1,
      }));
      
      Alert.alert('Backup Complete', 'Your data has been successfully backed up.');
    } catch (error) {
      setBackupInfo(prev => ({ ...prev, status: 'error' }));
      Alert.alert('Backup Failed', 'Failed to backup your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore from Backup',
      'This will replace your current data with the backup. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setBackupInfo(prev => ({ ...prev, status: 'restoring' }));
            setLoading(true);

            try {
              // Simulate restore process
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              setBackupInfo(prev => ({ ...prev, status: 'idle' }));
              Alert.alert('Restore Complete', 'Your data has been restored from backup.');
            } catch (error) {
              setBackupInfo(prev => ({ ...prev, status: 'error' }));
              Alert.alert('Restore Failed', 'Failed to restore from backup. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear temporary files and may improve performance.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => {
            setStorageInfo(prev => ({
              ...prev,
              cache: 0,
              used: prev.used - prev.cache,
            }));
            Alert.alert('Cache Cleared', 'Temporary files have been removed.');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your data will be exported as a JSON file.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert('Export Started', 'Your data export will be ready shortly.');
          },
        },
      ]
    );
  };

  const getStoragePercentage = () => {
    return Math.round((storageInfo.used / storageInfo.total) * 100);
  };

  const getStatusIcon = () => {
    switch (backupInfo.status) {
      case 'backing-up':
      case 'restoring':
        return <RefreshCw size={16} color="#FF9800" />;
      case 'error':
        return <AlertCircle size={16} color="#F44336" />;
      default:
        return <CheckCircle size={16} color="#4CAF50" />;
    }
  };

  const getStatusText = () => {
    switch (backupInfo.status) {
      case 'backing-up':
        return 'Backing up...';
      case 'restoring':
        return 'Restoring...';
      case 'error':
        return 'Error occurred';
      default:
        return 'Ready';
    }
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Data Management"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Storage Overview */}
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>Storage Usage</Text>
          <View style={settingsStyles.sectionContent}>
            <View style={[settingsStyles.settingItem, settingsStyles.lastSettingItem]}>
              <View style={settingsStyles.settingLeft}>
                <View style={settingsStyles.settingIcon}>
                  <HardDrive size={20} color="#0277BD" />
                </View>
                <View style={settingsStyles.settingText}>
                  <Text style={settingsStyles.settingTitle}>
                    {formatBytes(storageInfo.used * 1024 * 1024)} of {formatBytes(storageInfo.total * 1024 * 1024)} used
                  </Text>
                  <Text style={settingsStyles.settingSubtitle}>
                    {getStoragePercentage()}% storage used
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Storage Bar */}
            <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
              <View
                style={{
                  height: 8,
                  backgroundColor: '#E1F5FE',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${getStoragePercentage()}%`,
                    backgroundColor: getStoragePercentage() > 80 ? '#F44336' : '#0277BD',
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Storage Breakdown */}
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>Storage Breakdown</Text>
          <View style={settingsStyles.sectionContent}>
            {[
              { label: 'Device Data', value: storageInfo.devices, icon: <Database size={20} color="#0277BD" /> },
              { label: 'Preferences', value: storageInfo.preferences, icon: <Archive size={20} color="#0277BD" /> },
              { label: 'Cache', value: storageInfo.cache, icon: <RefreshCw size={20} color="#0277BD" /> },
              { label: 'Backups', value: storageInfo.backups, icon: <Cloud size={20} color="#0277BD" /> },
            ].map((item, index, array) => (
              <View
                key={item.label}
                style={[
                  settingsStyles.settingItem,
                  index === array.length - 1 && settingsStyles.lastSettingItem,
                ]}
              >
                <View style={settingsStyles.settingLeft}>
                  <View style={settingsStyles.settingIcon}>
                    {item.icon}
                  </View>
                  <View style={settingsStyles.settingText}>
                    <Text style={settingsStyles.settingTitle}>{item.label}</Text>
                    <Text style={settingsStyles.settingSubtitle}>
                      {formatBytes(item.value * 1024 * 1024)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Backup Status */}
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>Backup Status</Text>
          <View style={settingsStyles.sectionContent}>
            <View style={settingsStyles.settingItem}>
              <View style={settingsStyles.settingLeft}>
                <View style={settingsStyles.settingIcon}>
                  {getStatusIcon()}
                </View>
                <View style={settingsStyles.settingText}>
                  <Text style={settingsStyles.settingTitle}>Status</Text>
                  <Text style={settingsStyles.settingSubtitle}>
                    {getStatusText()}
                  </Text>
                </View>
              </View>
            </View>

            {backupInfo.lastBackup && (
              <View style={settingsStyles.settingItem}>
                <View style={settingsStyles.settingLeft}>
                  <View style={settingsStyles.settingIcon}>
                    <Archive size={20} color="#0277BD" />
                  </View>
                  <View style={settingsStyles.settingText}>
                    <Text style={settingsStyles.settingTitle}>Last Backup</Text>
                    <Text style={settingsStyles.settingSubtitle}>
                      {formatDate(backupInfo.lastBackup)} • {formatBytes(backupInfo.backupSize * 1024 * 1024)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={settingsStyles.settingItem}>
              <View style={settingsStyles.settingLeft}>
                <View style={settingsStyles.settingIcon}>
                  <RefreshCw size={20} color="#0277BD" />
                </View>
                <View style={settingsStyles.settingText}>
                  <Text style={settingsStyles.settingTitle}>Auto Backup</Text>
                  <Text style={settingsStyles.settingSubtitle}>
                    Automatically backup daily
                  </Text>
                </View>
              </View>
              <Switch
                value={backupInfo.autoBackup}
                onValueChange={(value) =>
                  setBackupInfo(prev => ({ ...prev, autoBackup: value }))
                }
                trackColor={{ false: '#E0E0E0', true: '#81D4FA' }}
                thumbColor={backupInfo.autoBackup ? '#0277BD' : '#F4F3F4'}
              />
            </View>

            <View style={[settingsStyles.settingItem, settingsStyles.lastSettingItem]}>
              <View style={settingsStyles.settingLeft}>
                <View style={settingsStyles.settingIcon}>
                  {backupInfo.cloudSync ? (
                    <Wifi size={20} color="#0277BD" />
                  ) : (
                    <WifiOff size={20} color="#64B5F6" />
                  )}
                </View>
                <View style={settingsStyles.settingText}>
                  <Text style={settingsStyles.settingTitle}>Cloud Sync</Text>
                  <Text style={settingsStyles.settingSubtitle}>
                    Sync backups to cloud storage
                  </Text>
                </View>
              </View>
              <Switch
                value={backupInfo.cloudSync}
                onValueChange={(value) =>
                  setBackupInfo(prev => ({ ...prev, cloudSync: value }))
                }
                trackColor={{ false: '#E0E0E0', true: '#81D4FA' }}
                thumbColor={backupInfo.cloudSync ? '#0277BD' : '#F4F3F4'}
              />
            </View>
          </View>
        </View>

        {/* Data Actions */}
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>Data Actions</Text>
          <View style={settingsStyles.sectionContent}>
            <TouchableOpacity
              style={settingsStyles.settingItem}
              onPress={handleBackup}
              disabled={loading || backupInfo.status !== 'idle'}
            >
              <View style={settingsStyles.settingLeft}>
                <View style={settingsStyles.settingIcon}>
                  {backupInfo.status === 'backing-up' ? (
                    <ActivityIndicator size="small" color="#0277BD" />
                  ) : (
                    <Upload size={20} color="#0277BD" />
                  )}
                </View>
                <View style={settingsStyles.settingText}>
                  <Text style={settingsStyles.settingTitle}>Create Backup</Text>
                  <Text style={settingsStyles.settingSubtitle}>
                    Backup all your data now
                  </Text>
                </View>
              </View>
              <Text style={settingsStyles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={settingsStyles.settingItem}
              onPress={handleRestore}
              disabled={loading || !backupInfo.lastBackup || backupInfo.status !== 'idle'}
            >
              <View style={settingsStyles.settingLeft}>
                <View style={settingsStyles.settingIcon}>
                  {backupInfo.status === 'restoring' ? (
                    <ActivityIndicator size="small" color="#0277BD" />
                  ) : (
                    <Download size={20} color="#0277BD" />
                  )}
                </View>
                <View style={settingsStyles.settingText}>
                  <Text style={settingsStyles.settingTitle}>Restore from Backup</Text>
                  <Text style={settingsStyles.settingSubtitle}>
                    Restore from last backup
                  </Text>
                </View>
              </View>
              <Text style={settingsStyles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={settingsStyles.settingItem}
              onPress={handleExportData}
              disabled={loading}
            >
              <View style={settingsStyles.settingLeft}>
                <View style={settingsStyles.settingIcon}>
                  <Archive size={20} color="#0277BD" />
                </View>
                <View style={settingsStyles.settingText}>
                  <Text style={settingsStyles.settingTitle}>Export Data</Text>
                  <Text style={settingsStyles.settingSubtitle}>
                    Download your data as JSON
                  </Text>
                </View>
              </View>
              <Text style={settingsStyles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[settingsStyles.settingItem, settingsStyles.lastSettingItem]}
              onPress={handleClearCache}
              disabled={loading || storageInfo.cache === 0}
            >
              <View style={settingsStyles.settingLeft}>
                <View style={settingsStyles.settingIcon}>
                  <Trash2 size={20} color="#F44336" />
                </View>
                <View style={settingsStyles.settingText}>
                  <Text style={[settingsStyles.settingTitle, { color: '#F44336' }]}>
                    Clear Cache
                  </Text>
                  <Text style={settingsStyles.settingSubtitle}>
                    Free up {formatBytes(storageInfo.cache * 1024 * 1024)}
                  </Text>
                </View>
              </View>
              <Text style={settingsStyles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={settingsStyles.spacer} />
      </ScrollView>
    </BaseModal>
  );
}