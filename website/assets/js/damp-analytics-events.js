/**
 * DAMP Smart Drinkware - Custom Analytics Events
 * Business-specific event tracking for user behavior and device interactions
 */

import { logEvent, logPageView, logUserAction } from './firebase-services.js';

// ==================== PRODUCT INTEREST TRACKING ====================

export const trackProductView = (productId, productName, source = 'organic') => {
  logEvent('view_item', {
    item_id: productId,
    item_name: productName,
    item_category: 'smart_drinkware',
    source: source,
    value: 49.99 // Default price, can be dynamic
  });
  
  logUserAction('product_viewed', {
    product_id: productId,
    product_name: productName,
    traffic_source: source
  });
};

export const trackProductInterest = (productId, interactionType) => {
  logEvent('generate_lead', {
    item_id: productId,
    interaction_type: interactionType, // 'newsletter', 'preorder', 'voting'
    currency: 'USD',
    value: 0
  });
};

export const trackPreOrderInitiated = (productId, productName, price) => {
  logEvent('begin_checkout', {
    item_id: productId,
    item_name: productName,
    item_category: 'smart_drinkware',
    currency: 'USD',
    value: price,
    checkout_step: 1,
    checkout_option: 'preorder'
  });
};

export const trackPreOrderCompleted = (orderId, productId, productName, price, quantity = 1) => {
  logEvent('purchase', {
    transaction_id: orderId,
    item_id: productId,
    item_name: productName,
    item_category: 'smart_drinkware',
    currency: 'USD',
    value: price * quantity,
    quantity: quantity,
    order_type: 'preorder'
  });
  
  // Custom DAMP event
  logUserAction('preorder_completed', {
    product_id: productId,
    order_value: price * quantity,
    order_id: orderId
  });
};

// ==================== DEVICE INTERACTION TRACKING ====================

export const trackDevicePairing = (deviceType, pairingMethod, success = true) => {
  logEvent('device_paired', {
    device_type: deviceType, // 'handle', 'silicone_bottom', 'cup_sleeve', 'baby_bottle'
    pairing_method: pairingMethod, // 'bluetooth', 'qr_code', 'manual'
    success: success,
    timestamp: Date.now()
  });
  
  if (success) {
    logUserAction('device_paired_success', {
      device_type: deviceType,
      method: pairingMethod
    });
  } else {
    logUserAction('device_pairing_failed', {
      device_type: deviceType,
      method: pairingMethod,
      error_context: 'user_tracking'
    });
  }
};

export const trackDeviceAlert = (deviceId, alertType, userResponse) => {
  logEvent('notification_received', {
    device_id: deviceId,
    alert_type: alertType, // 'drink_abandonment', 'low_battery', 'connection_lost'
    user_response: userResponse, // 'acknowledged', 'dismissed', 'no_response'
    effectiveness_score: userResponse === 'acknowledged' ? 10 : 0
  });
};

export const trackBluetoothInteraction = (action, success = true, errorType = null) => {
  logEvent('bluetooth_interaction', {
    action: action, // 'scan', 'connect', 'disconnect', 'data_sync'
    success: success,
    error_type: errorType,
    timestamp: Date.now()
  });
};

// ==================== USER ENGAGEMENT TRACKING ====================

export const trackNewsletterSignup = (source, productInterest = null) => {
  logEvent('sign_up', {
    method: 'newsletter',
    source: source, // 'homepage', 'product_page', 'voting_page'
    product_interest: productInterest
  });
  
  logUserAction('newsletter_subscribed', {
    source: source,
    interested_product: productInterest
  });
};

export const trackVoting = (productId, voteType) => {
  logEvent('vote_cast', {
    item_id: productId,
    vote_type: voteType, // 'public', 'authenticated'
    engagement_level: 'high'
  });
  
  logUserAction('product_voted', {
    product_id: productId,
    vote_type: voteType
  });
};

export const trackSocialShare = (platform, contentType, contentId) => {
  logEvent('share', {
    method: platform, // 'facebook', 'twitter', 'linkedin', 'whatsapp'
    content_type: contentType, // 'product', 'general', 'voting'
    item_id: contentId
  });
};

// ==================== CONVERSION FUNNEL TRACKING ====================

export const trackFunnelStep = (step, productId = null, additionalData = {}) => {
  const funnelSteps = {
    'awareness': 1,
    'interest': 2,
    'consideration': 3,
    'intent': 4,
    'evaluation': 5,
    'purchase': 6
  };
  
  logEvent('funnel_step', {
    step_name: step,
    step_number: funnelSteps[step] || 0,
    product_id: productId,
    ...additionalData
  });
};

export const trackUserJourney = (stage, touchpoint, sessionId) => {
  logEvent('user_journey', {
    journey_stage: stage, // 'discovery', 'research', 'decision', 'advocacy'
    touchpoint: touchpoint, // 'organic_search', 'social_media', 'direct', 'referral'
    session_id: sessionId,
    timestamp: Date.now()
  });
};

// ==================== BUSINESS METRICS TRACKING ====================

export const trackSearchQuery = (query, resultsCount, source = 'internal') => {
  logEvent('search', {
    search_term: query,
    results_count: resultsCount,
    source: source
  });
};

export const trackContentEngagement = (contentType, contentId, engagementTime) => {
  logEvent('content_engagement', {
    content_type: contentType, // 'blog_post', 'product_spec', 'how_to_guide'
    content_id: contentId,
    engagement_time: engagementTime, // in seconds
    engagement_level: engagementTime > 30 ? 'high' : 'low'
  });
};

export const trackErrorEvent = (errorType, errorMessage, context = {}) => {
  logEvent('app_error', {
    error_type: errorType,
    error_message: errorMessage,
    error_context: JSON.stringify(context),
    timestamp: Date.now()
  });
};

// ==================== SUBSCRIPTION & PREMIUM TRACKING ====================

export const trackSubscriptionInterest = (tier, source) => {
  logEvent('subscription_interest', {
    subscription_tier: tier, // 'damp_plus', 'damp_family'
    source: source,
    currency: 'USD',
    value: tier === 'damp_plus' ? 9.99 : 19.99
  });
};

export const trackSubscriptionConversion = (tier, price, method) => {
  logEvent('subscription_purchased', {
    subscription_tier: tier,
    currency: 'USD',
    value: price,
    payment_method: method,
    conversion_type: 'new_subscriber'
  });
};

// ==================== DEVICE PERFORMANCE TRACKING ====================

export const trackDevicePerformance = (deviceId, metrics) => {
  logEvent('device_performance', {
    device_id: deviceId,
    battery_level: metrics.batteryLevel,
    connection_quality: metrics.connectionQuality, // 'excellent', 'good', 'poor'
    last_seen: metrics.lastSeen,
    alert_accuracy: metrics.alertAccuracy // percentage
  });
};

// ==================== HELPER FUNCTIONS ====================

export const initializeAnalytics = () => {
  // Track initial page load
  logPageView(document.title);
  
  // Track user device info
  logEvent('user_tech_info', {
    user_agent: navigator.userAgent,
    screen_resolution: `${screen.width}x${screen.height}`,
    browser_language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  // Track if user has Bluetooth capability
  if ('bluetooth' in navigator) {
    logEvent('bluetooth_capability', {
      has_bluetooth: true,
      user_agent: navigator.userAgent
    });
  }
};

// Auto-initialize on page load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeAnalytics);
}

// Export all tracking functions
export default {
  trackProductView,
  trackProductInterest,
  trackPreOrderInitiated,
  trackPreOrderCompleted,
  trackDevicePairing,
  trackDeviceAlert,
  trackBluetoothInteraction,
  trackNewsletterSignup,
  trackVoting,
  trackSocialShare,
  trackFunnelStep,
  trackUserJourney,
  trackSearchQuery,
  trackContentEngagement,
  trackErrorEvent,
  trackSubscriptionInterest,
  trackSubscriptionConversion,
  trackDevicePerformance,
  initializeAnalytics
}; 