/**
 * DAMP Smart Drinkware Subscription Configuration
 * 
 * This file contains the subscription tier definitions with Stripe integration
 * for DAMP Smart Drinkware. Updated with proper TypeScript support and
 * Firebase integration.
 */

// Subscription tier interface
export const SubscriptionTier = {
  FREE: 'free',
  DAMP_PLUS: 'damp_plus',
  DAMP_FAMILY: 'damp_family'
};

// Feature limits for each tier
export const TIER_LIMITS = {
  [SubscriptionTier.FREE]: {
    maxDevices: 1,
    maxSafeZones: 2,
    features: ['basic_notifications', 'battery_monitoring', 'mobile_app']
  },
  [SubscriptionTier.DAMP_PLUS]: {
    maxDevices: 3,
    maxSafeZones: 5,
    features: ['basic_notifications', 'battery_monitoring', 'mobile_app', 'priority_support']
  },
  [SubscriptionTier.DAMP_FAMILY]: {
    maxDevices: 10,
    maxSafeZones: -1, // Unlimited
    features: [
      'basic_notifications', 
      'battery_monitoring', 
      'mobile_app', 
      'priority_support',
      'custom_notifications',
      'shared_alerts',
      'location_history',
      'smart_recommendations'
    ]
  }
};

// Stripe product configuration
export const STRIPE_PRODUCTS = [
  {
    id: 'prod_free_tier',
    priceId: null, // Free tier has no price
    tier: SubscriptionTier.FREE,
    name: 'DAMP Free',
    description: 'Perfect for trying out DAMP Smart Drinkware',
    price: 0,
    currency: 'usd',
    interval: null,
    mode: 'free',
    features: [
      '1 Registered Device',
      '2 Safe Zones',
      'Basic Notifications',
      'Battery Monitoring',
      'Mobile App Access'
    ],
    popular: false,
    buttonText: 'Get Started Free'
  },
  {
    id: 'prod_SZfg2AbQGXWCdS',
    priceId: 'price_1ReWLYCcrIDahSGRUnhZ9GpV',
    tier: SubscriptionTier.DAMP_PLUS,
    name: 'DAMP+',
    description: 'Enhanced features for power users and small families',
    price: 2.99,
    currency: 'usd',
    interval: 'month',
    mode: 'subscription',
    features: [
      'Track up to 3 devices',
      '5 Safe Zones',
      'Standard Notifications',
      'Battery Monitoring',
      'Priority Support'
    ],
    popular: true,
    buttonText: 'Upgrade to DAMP+'
  },
  {
    id: 'prod_SZfhGiRkeApGkC',
    priceId: 'price_1ReWMUCcrIDahSGRJgVqS4ns',
    tier: SubscriptionTier.DAMP_FAMILY,
    name: 'DAMP Family',
    description: 'Complete solution for families and teams',
    price: 5.99,
    currency: 'usd',
    interval: 'month',
    mode: 'subscription',
    features: [
      'Track up to 10 devices',
      'Unlimited Safe Zones',
      'Custom Notifications',
      'Time-based Reminders',
      'Shared Family Alerts',
      'Location History',
      'Smart Recommendations',
      'Priority Support'
    ],
    popular: false,
    buttonText: 'Go Family Plan'
  }
];

/**
 * Get product by price ID
 */
export function getProductByPriceId(priceId) {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
}

/**
 * Get product by product ID
 */
export function getProductById(productId) {
  return STRIPE_PRODUCTS.find(product => product.id === productId);
}

/**
 * Get product by subscription tier
 */
export function getProductByTier(tier) {
  return STRIPE_PRODUCTS.find(product => product.tier === tier);
}

/**
 * Format price for display
 */
export function formatPrice(price, currency = 'usd') {
  if (price === 0) return 'Free';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price);
}

/**
 * Get subscription interval display text
 */
export function getIntervalText(interval) {
  switch (interval) {
    case 'month':
      return 'per month';
    case 'year':
      return 'per year';
    default:
      return '';
  }
}

/**
 * Get full price text with interval
 */
export function getFullPriceText(product) {
  const price = formatPrice(product.price, product.currency);
  const interval = getIntervalText(product.interval);
  return interval ? `${price} ${interval}` : price;
}

/**
 * Check if user can perform action based on tier limits
 */
export function canPerformAction(userTier, action, currentCount) {
  const limits = TIER_LIMITS[userTier];
  if (!limits) return false;

  switch (action) {
    case 'add_device':
      return currentCount < limits.maxDevices;
    case 'add_safe_zone':
      return limits.maxSafeZones === -1 || currentCount < limits.maxSafeZones;
    case 'use_feature':
      return limits.features.includes(action);
    default:
      return false;
  }
}

/**
 * Get upgrade suggestion based on current usage
 */
export function getUpgradeSuggestion(currentTier, deviceCount, zoneCount) {
  const currentLimits = TIER_LIMITS[currentTier];
  
  // Check if user is hitting device limits
  if (deviceCount >= currentLimits.maxDevices && currentTier === SubscriptionTier.FREE) {
    return {
      suggestedTier: SubscriptionTier.DAMP_PLUS,
      reason: 'device_limit',
      message: 'Upgrade to DAMP+ to connect up to 3 devices'
    };
  }
  
  // Check if user is hitting zone limits
  if (zoneCount >= currentLimits.maxSafeZones && currentTier !== SubscriptionTier.DAMP_FAMILY) {
    if (currentTier === SubscriptionTier.FREE) {
      return {
        suggestedTier: SubscriptionTier.DAMP_PLUS,
        reason: 'zone_limit',
        message: 'Upgrade to DAMP+ for 5 safe zones'
      };
    } else {
      return {
        suggestedTier: SubscriptionTier.DAMP_FAMILY,
        reason: 'zone_limit',
        message: 'Upgrade to DAMP Family for unlimited safe zones'
      };
    }
  }
  
  // Suggest family plan for power users
  if (deviceCount >= 3 && zoneCount >= 3 && currentTier === SubscriptionTier.DAMP_PLUS) {
    return {
      suggestedTier: SubscriptionTier.DAMP_FAMILY,
      reason: 'power_user',
      message: 'Upgrade to DAMP Family for unlimited devices and zones'
    };
  }
  
  return null;
}

/**
 * Calculate savings for annual plans (when implemented)
 */
export function calculateAnnualSavings(monthlyPrice) {
  const annualPrice = monthlyPrice * 10; // 2 months free
  const monthlyCost = monthlyPrice * 12;
  return monthlyCost - annualPrice;
}

/**
 * Get feature comparison for all tiers
 */
export function getFeatureComparison() {
  return {
    devices: {
      name: 'Connected Devices',
      free: '1 device',
      plus: '3 devices',
      family: '10 devices'
    },
    zones: {
      name: 'Safe Zones',
      free: '2 zones',
      plus: '5 zones',
      family: 'Unlimited'
    },
    notifications: {
      name: 'Notifications',
      free: 'Basic alerts',
      plus: 'Standard alerts',
      family: 'Custom + shared alerts'
    },
    history: {
      name: 'Location History',
      free: 'Last location only',
      plus: 'Last location only',
      family: 'Full history'
    },
    support: {
      name: 'Customer Support',
      free: 'Community support',
      plus: 'Priority support',
      family: 'Priority support'
    },
    sharing: {
      name: 'Family Sharing',
      free: 'Not available',
      plus: 'Not available',
      family: 'Full family sharing'
    }
  };
}

export default {
  SubscriptionTier,
  TIER_LIMITS,
  STRIPE_PRODUCTS,
  getProductByPriceId,
  getProductById,
  getProductByTier,
  formatPrice,
  getIntervalText,
  getFullPriceText,
  canPerformAction,
  getUpgradeSuggestion,
  calculateAnnualSavings,
  getFeatureComparison
}; 