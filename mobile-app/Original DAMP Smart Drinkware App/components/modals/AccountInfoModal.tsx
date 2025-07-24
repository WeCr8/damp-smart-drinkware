/**
 * Account Information Modal
 * 
 * Displays detailed user account information
 */

import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
} from 'react-native';
import { User, Mail, Phone, Calendar, Shield, Bell, Palette, Globe, CreditCard as Edit3 } from 'lucide-react-native';
import BaseModal from './BaseModal';
import { settingsStyles } from '@/styles/settings';
import { AccountInfoModalProps } from '@/types/settings';

export default function AccountInfoModal({
  visible,
  onClose,
  user,
  onEdit,
}: AccountInfoModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getVerificationStatus = () => {
    if (user.email_confirmed_at) {
      return { text: 'Verified', style: settingsStyles.verifiedStatus };
    }
    return { text: 'Pending Verification', style: settingsStyles.pendingStatus };
  };

  const verificationStatus = getVerificationStatus();

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Account Information"
      rightAction={{
        icon: <Edit3 size={20} color="#FFFFFF" />,
        onPress: onEdit,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={settingsStyles.profileSection}>
          <View style={settingsStyles.profileImageContainer}>
            {user.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={settingsStyles.profileImage} />
            ) : (
              <View style={settingsStyles.profileImagePlaceholder}>
                <User size={56} color="#64B5F6" />
              </View>
            )}
          </View>
          <Text style={settingsStyles.profileName}>
            {user.full_name || user.email?.split('@')[0] || 'User'}
          </Text>
          <Text style={settingsStyles.profileEmail}>{user.email}</Text>
        </View>

        {/* Account Details */}
        <View style={settingsStyles.detailsSection}>
          <Text style={settingsStyles.sectionTitle}>Account Details</Text>
          
          <View style={settingsStyles.detailItem}>
            <Mail size={24} color="#0277BD" />
            <View style={settingsStyles.detailContent}>
              <Text style={settingsStyles.detailLabel}>Email Address</Text>
              <Text style={settingsStyles.detailValue}>{user.email}</Text>
            </View>
          </View>

          {user.phone && (
            <View style={settingsStyles.detailItem}>
              <Phone size={24} color="#0277BD" />
              <View style={settingsStyles.detailContent}>
                <Text style={settingsStyles.detailLabel}>Phone Number</Text>
                <Text style={settingsStyles.detailValue}>{user.phone}</Text>
              </View>
            </View>
          )}

          <View style={settingsStyles.detailItem}>
            <Calendar size={24} color="#0277BD" />
            <View style={settingsStyles.detailContent}>
              <Text style={settingsStyles.detailLabel}>Member Since</Text>
              <Text style={settingsStyles.detailValue}>
                {formatDate(user.created_at)}
              </Text>
            </View>
          </View>

          <View style={settingsStyles.detailItem}>
            <Shield size={24} color="#0277BD" />
            <View style={settingsStyles.detailContent}>
              <Text style={settingsStyles.detailLabel}>Account Status</Text>
              <Text style={[settingsStyles.detailValue, verificationStatus.style]}>
                {verificationStatus.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Preferences */}
        <View style={settingsStyles.detailsSection}>
          <Text style={settingsStyles.sectionTitle}>Current Preferences</Text>
          
          <View style={settingsStyles.detailItem}>
            <Bell size={24} color="#0277BD" />
            <View style={settingsStyles.detailContent}>
              <Text style={settingsStyles.detailLabel}>Notifications</Text>
              <Text style={settingsStyles.detailValue}>
                {user.preferences?.notifications ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>

          <View style={settingsStyles.detailItem}>
            <Palette size={24} color="#0277BD" />
            <View style={settingsStyles.detailContent}>
              <Text style={settingsStyles.detailLabel}>Theme</Text>
              <Text style={settingsStyles.detailValue}>
                {user.preferences?.theme ? 
                  user.preferences.theme.charAt(0).toUpperCase() + user.preferences.theme.slice(1) : 
                  'System'
                }
              </Text>
            </View>
          </View>

          <View style={settingsStyles.detailItem}>
            <Globe size={24} color="#0277BD" />
            <View style={settingsStyles.detailContent}>
              <Text style={settingsStyles.detailLabel}>Language</Text>
              <Text style={settingsStyles.detailValue}>
                {user.preferences?.language === 'en' ? 'English' : user.preferences?.language || 'English'}
              </Text>
            </View>
          </View>
        </View>

        <View style={settingsStyles.spacer} />
      </ScrollView>
    </BaseModal>
  );
}