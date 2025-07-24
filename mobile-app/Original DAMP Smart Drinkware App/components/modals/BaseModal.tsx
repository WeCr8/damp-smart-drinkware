/**
 * Base Modal Component
 * 
 * Provides consistent modal structure with safe area handling
 */

import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  rightAction?: {
    icon: React.ReactNode;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
  };
  presentationStyle?: 'pageSheet' | 'formSheet' | 'fullScreen';
  animationType?: 'slide' | 'fade' | 'none';
}

export default function BaseModal({
  visible,
  onClose,
  title,
  children,
  rightAction,
  presentationStyle = 'pageSheet',
  animationType = 'slide',
}: BaseModalProps) {
  return (
    <Modal
      visible={visible}
      animationType={animationType}
      presentationStyle={presentationStyle}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.modalCloseButton}
            accessibilityLabel="Close modal"
            accessibilityRole="button"
          >
            <X size={24} color="#0277BD" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>{title}</Text>

          {rightAction ? (
            <TouchableOpacity
              onPress={rightAction.onPress}
              style={[
                styles.modalActionButton,
                (rightAction.loading || rightAction.disabled) && styles.disabledButton,
              ]}
              disabled={rightAction.loading || rightAction.disabled}
              accessibilityLabel="Action button"
              accessibilityRole="button"
            >
              {rightAction.loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                rightAction.icon
              )}
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* Content */}
        <View style={styles.modalContent}>
          {children}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FCFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1F5FE',
    backgroundColor: '#FFFFFF',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FCFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
  },
  modalActionButton: {
    backgroundColor: '#0277BD',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
});