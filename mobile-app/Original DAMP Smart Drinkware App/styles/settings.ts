/**
 * Settings Styles
 * 
 * Shared styles for settings components with consistent design system
 */

import { StyleSheet, Platform } from 'react-native';

// Design System Constants
const COLORS = {
  primary: '#0277BD',
  primaryLight: '#64B5F6',
  primaryLighter: '#E1F5FE',
  primaryBackground: '#F8FCFF',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  white: '#FFFFFF',
  background: '#F8FCFF',
  border: '#E1F5FE',
  text: '#0277BD',
  textSecondary: '#64B5F6',
  textMuted: '#9E9E9E',
  disabled: '#E0E0E0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const TYPOGRAPHY = {
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 24,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    lineHeight: 22,
  },
  settingSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  body: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
  button: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 20,
  },
};

const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const settingsStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  
  // Header Styles
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'ios' ? 0 : SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: 'transparent',
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.text,
  },
  subtitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Tab Styles - Updated to match section cards
  tabContainer: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  tabScrollContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  tab: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: SPACING.xl, // Match section card border radius
    ...SHADOWS.medium, // Match section card shadow
    minHeight: 80, // Consistent height
    minWidth: 80, // Consistent width
  },
  activeTab: {
    backgroundColor: COLORS.primaryLighter,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  tabText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  activeTabText: {
    color: COLORS.primary,
    fontFamily: 'Inter-SemiBold',
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xxxl - 4, // 28px
  },
  sectionTitle: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.text,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  sectionContent: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.xl,
    ...SHADOWS.medium,
    overflow: 'hidden',
  },

  // Setting Item Styles
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg + 2, // 18px
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryBackground,
    minHeight: 64, // Consistent height for all items
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  destructiveSettingItem: {
    backgroundColor: '#FFEBEE',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  destructiveSettingIcon: {
    backgroundColor: '#FFCDD2',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    ...TYPOGRAPHY.settingTitle,
    color: COLORS.text,
    marginBottom: 2,
  },
  destructiveSettingTitle: {
    color: COLORS.error,
  },
  settingSubtitle: {
    ...TYPOGRAPHY.settingSubtitle,
    color: COLORS.textSecondary,
  },
  settingValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontFamily: 'Inter-Medium',
    marginRight: SPACING.sm,
  },
  chevron: {
    fontSize: 22,
    color: COLORS.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'ios' ? 0 : SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
    minHeight: 64, // Consistent header height
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.text,
    fontSize: 20,
  },
  modalActionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
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
    paddingHorizontal: SPACING.xl,
  },

  // Profile Styles
  profileSection: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.white,
    marginHorizontal: -SPACING.xl,
    marginTop: SPACING.xl,
    borderRadius: SPACING.xl,
    ...SHADOWS.small,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: SPACING.xl,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.border,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.border,
  },
  profileImageOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: COLORS.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  profileEmail: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  profileChangeText: {
    ...TYPOGRAPHY.settingSubtitle,
    color: COLORS.primary,
    fontFamily: 'Inter-Medium',
    marginTop: SPACING.md,
  },

  // Detail Styles
  detailsSection: {
    marginTop: SPACING.xxxl,
    marginBottom: SPACING.xxl,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
    minHeight: 72, // Consistent height
  },
  detailContent: {
    marginLeft: SPACING.lg,
    flex: 1,
  },
  detailLabel: {
    ...TYPOGRAPHY.settingSubtitle,
    color: COLORS.textSecondary,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  detailValue: {
    ...TYPOGRAPHY.settingTitle,
    color: COLORS.text,
    fontFamily: 'Inter-SemiBold',
  },
  verifiedStatus: {
    color: COLORS.success,
  },
  pendingStatus: {
    color: COLORS.warning,
  },

  // Form Styles
  formSection: {
    paddingVertical: SPACING.xxl,
  },
  inputGroup: {
    marginBottom: SPACING.xxl,
  },
  inputLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontFamily: 'Inter-SemiBold',
    marginBottom: SPACING.sm + 2, // 10px
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    ...TYPOGRAPHY.settingTitle,
    color: COLORS.text,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.small,
    minHeight: 48, // Consistent input height
  },
  textInputFocused: {
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FFEBEE',
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    color: COLORS.textSecondary,
    borderColor: COLORS.disabled,
  },
  inputHint: {
    ...TYPOGRAPHY.settingSubtitle,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  errorText: {
    ...TYPOGRAPHY.settingSubtitle,
    color: COLORS.error,
    fontFamily: 'Inter-Medium',
    marginTop: SPACING.sm,
  },

  // Picker Styles
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.xl,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    ...SHADOWS.medium,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg + 2, // 18px
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryBackground,
    minHeight: 64, // Consistent height
  },
  lastPickerItem: {
    borderBottomWidth: 0,
  },
  pickerItemText: {
    ...TYPOGRAPHY.settingTitle,
    color: COLORS.text,
  },
  selectedPickerItem: {
    backgroundColor: COLORS.primaryLighter,
  },
  selectedPickerItemText: {
    color: COLORS.primary,
    fontFamily: 'Inter-SemiBold',
  },
  checkIcon: {
    marginLeft: SPACING.md,
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: SPACING.lg,
    padding: SPACING.xl,
    margin: SPACING.xl,
    alignItems: 'center',
  },
  errorTitle: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  errorMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.error,
    textAlign: 'center',
  },

  // Button Styles
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...SHADOWS.small,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.primary,
  },
  destructiveButton: {
    backgroundColor: COLORS.error,
  },
  destructiveButtonText: {
    color: COLORS.white,
  },

  // Card Styles
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.xl,
    padding: SPACING.xl,
    ...SHADOWS.medium,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    ...TYPOGRAPHY.settingTitle,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  cardSubtitle: {
    ...TYPOGRAPHY.settingSubtitle,
    color: COLORS.textSecondary,
  },

  // Badge Styles
  badge: {
    borderRadius: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    alignSelf: 'flex-start',
  },
  successBadge: {
    backgroundColor: '#E8F5E8',
  },
  warningBadge: {
    backgroundColor: '#FFF8E1',
  },
  errorBadge: {
    backgroundColor: '#FFEBEE',
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    fontFamily: 'Inter-SemiBold',
  },
  successBadgeText: {
    color: COLORS.success,
  },
  warningBadgeText: {
    color: COLORS.warning,
  },
  errorBadgeText: {
    color: COLORS.error,
  },

  // Utility Styles
  spacer: {
    height: SPACING.xl,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  centerText: {
    textAlign: 'center',
  },
  boldText: {
    fontFamily: 'Inter-Bold',
  },
  mediumText: {
    fontFamily: 'Inter-Medium',
  },
  regularText: {
    fontFamily: 'Inter-Regular',
  },

  // Switch Styles (for consistency)
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },

  // Icon Styles
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryIconContainer: {
    backgroundColor: COLORS.primaryBackground,
  },
  successIconContainer: {
    backgroundColor: '#E8F5E8',
  },
  warningIconContainer: {
    backgroundColor: '#FFF8E1',
  },
  errorIconContainer: {
    backgroundColor: '#FFEBEE',
  },
});

export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SPACING.xxl,
    borderTopRightRadius: SPACING.xxl,
    paddingTop: SPACING.sm,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.disabled,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

// Export design system constants for use in other components
export const designSystem = {
  colors: COLORS,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  shadows: SHADOWS,
};