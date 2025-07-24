/**
 * Edit Profile Modal
 * 
 * Allows users to edit their profile information
 */

import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { User, Camera, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import BaseModal from './BaseModal';
import { settingsStyles } from '@/styles/settings';
import { EditProfileModalProps } from '@/types/settings';
import { AuthUser } from '@/contexts/AuthContext';

export default function EditProfileModal({
  visible,
  onClose,
  user,
  onSave,
}: EditProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    phone: user.phone || '',
    avatar_url: user.avatar_url || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Image picker is not available on web platform');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to change your profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData(prev => ({ ...prev, avatar_url: result.assets[0].uri }));
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Edit Profile"
      rightAction={{
        icon: <Check size={20} color="#FFFFFF" />,
        onPress: handleSave,
        loading,
        disabled: loading,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Picture */}
        <View style={settingsStyles.profileSection}>
          <TouchableOpacity
            onPress={pickImage}
            style={settingsStyles.profileImageContainer}
            accessibilityLabel="Change profile picture"
            accessibilityRole="button"
          >
            {formData.avatar_url ? (
              <Image source={{ uri: formData.avatar_url }} style={settingsStyles.profileImage} />
            ) : (
              <View style={settingsStyles.profileImagePlaceholder}>
                <User size={56} color="#64B5F6" />
              </View>
            )}
            <View style={settingsStyles.profileImageOverlay}>
              <Camera size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={settingsStyles.profileChangeText}>Tap to change photo</Text>
        </View>

        {/* Form Fields */}
        <View style={settingsStyles.formSection}>
          <View style={settingsStyles.inputGroup}>
            <Text style={settingsStyles.inputLabel}>Full Name</Text>
            <TextInput
              style={[
                settingsStyles.textInput,
                focusedField === 'full_name' && settingsStyles.textInputFocused,
                errors.full_name && settingsStyles.inputError,
              ]}
              value={formData.full_name}
              onChangeText={(text) => updateField('full_name', text)}
              onFocus={() => setFocusedField('full_name')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your full name"
              placeholderTextColor="#64B5F6"
              editable={!loading}
              autoCapitalize="words"
              textContentType="name"
            />
            {errors.full_name && (
              <Text style={settingsStyles.errorText}>{errors.full_name}</Text>
            )}
          </View>

          <View style={settingsStyles.inputGroup}>
            <Text style={settingsStyles.inputLabel}>Phone Number</Text>
            <TextInput
              style={[
                settingsStyles.textInput,
                focusedField === 'phone' && settingsStyles.textInputFocused,
                errors.phone && settingsStyles.inputError,
              ]}
              value={formData.phone}
              onChangeText={(text) => updateField('phone', text)}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your phone number"
              placeholderTextColor="#64B5F6"
              keyboardType="phone-pad"
              editable={!loading}
              textContentType="telephoneNumber"
            />
            {errors.phone && (
              <Text style={settingsStyles.errorText}>{errors.phone}</Text>
            )}
          </View>

          <View style={settingsStyles.inputGroup}>
            <Text style={settingsStyles.inputLabel}>Email Address</Text>
            <TextInput
              style={[settingsStyles.textInput, settingsStyles.disabledInput]}
              value={user.email}
              editable={false}
              placeholder="Email cannot be changed here"
              placeholderTextColor="#64B5F6"
            />
            <Text style={settingsStyles.inputHint}>
              To change your email address, please contact our support team
            </Text>
          </View>
        </View>

        <View style={settingsStyles.spacer} />
      </ScrollView>
    </BaseModal>
  );
}