/**
 * Stripe Product Configuration
 * 
 * This file contains the product definitions for DAMP Smart Drinkware subscriptions.
 * Each product includes pricing information, features, and Stripe integration details.
 */

export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval?: 'month' | 'year';
  mode: 'subscription' | 'payment';
  features: string[];
  popular?: boolean;
}

// DAMP Family
export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_SZfhGiRkeApGkC',
    priceId: 'price_1ReWMUCcrIDahSGRJgVqS4ns',
    name: 'DAMP Family',
    description: 'Perfect for families who want to keep track of their drinkware',
    price: 5.99,
    currency: 'usd',
    interval: 'month',
    mode: 'subscription',
    features: [
      'Track up to 10 devices',
      'Unlimited safe zones',
      'Custom notifications',
      'Time-based reminders',
      'Shared alerts for teams',
      'Last known location history',
      'Smart recommendations',
      'Priority support'
    ],
    popular: false
  },

  // DAMP+
  {
    id: 'prod_SZfg2AbQGXWCdS',
    priceId: 'price_1ReWLYCcrIDahSGRUnhZ9GpV',
    name: 'DAMP+',
    description: 'More Devices (Up to 5–10)Unlimited or Expanded Safe ZonesCustom Notifications (e.g., Time-based reminders, shared alerts for kids/teams)"Last Known Location" HistoryBattery Status & Smart Recommendations',
    price: 2.99,
    currency: 'usd',
    interval: 'month',
    mode: 'subscription',
    features: [
      'Track up to 3 devices',
      'Basic safe zones',
      'Standard notifications',
      'Battery monitoring',
      'Mobile app access'
    ],
    popular: true
  }
];

/**
 * Get product by price ID
 */
export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
}

/**
 * Get product by product ID
 */
export function getProductById(productId: string): StripeProduct | undefined {
  return STRIPE_PRODUCTS.find(product => product.id === productId);
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price);
}

/**
 * Get subscription interval display text
 */
export function getIntervalText(interval?: string): string {
  switch (interval) {
    case 'month':
      return 'per month';
    case 'year':
      return 'per year';
    default:
      return '';
  }
}