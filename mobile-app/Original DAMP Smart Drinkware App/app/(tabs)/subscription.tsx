import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleCheck as CheckCircle, Star, CreditCard, CircleAlert as AlertCircle } from 'lucide-react-native';
import { STRIPE_PRODUCTS, formatPrice, getIntervalText, type StripeProduct } from '@/src/stripe-config';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

interface UserSubscription {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

export default function SubscriptionScreen() {
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [error, setError] = useState('');
  const mounted = useRef(true);

  useEffect(() => {
    fetchUserSubscription();
    
    return () => {
      mounted.current = false;
    };
  }, []);

  const fetchUserSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.replace('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id, current_period_end, cancel_at_period_end')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        if (mounted.current) {
          setError('Failed to load subscription information');
        }
      } else {
        if (mounted.current) {
          setUserSubscription(data);
        }
      }
    } catch (err) {
      console.error('Error:', err);
      if (mounted.current) {
        setError('An unexpected error occurred');
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  const handleSubscribe = async (product: StripeProduct) => {
    if (mounted.current) {
      setCheckoutLoading(product.priceId);
      setError('');
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        router.replace('/auth/login');
        return;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: product.priceId,
          success_url: `${window.location.origin}/subscription/success`,
          cancel_url: `${window.location.origin}/subscription`,
          mode: product.mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      if (mounted.current) {
        setError(err.message || 'Failed to start checkout process');
      }
    } finally {
      if (mounted.current) {
        setCheckoutLoading(null);
      }
    }
  };

  const getCurrentProduct = (): StripeProduct | null => {
    if (!userSubscription?.price_id) return null;
    return STRIPE_PRODUCTS.find(p => p.priceId === userSubscription.price_id) || null;
  };

  const isActiveSubscription = (): boolean => {
    return userSubscription?.subscription_status === 'active' && !userSubscription.cancel_at_period_end;
  };

  const formatSubscriptionStatus = (status: string): string => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'canceled':
        return 'Canceled';
      case 'past_due':
        return 'Past Due';
      case 'incomplete':
        return 'Incomplete';
      case 'trialing':
        return 'Trial';
      default:
        return 'No Subscription';
    }
  };

  const renderProductCard = (product: StripeProduct) => {
    const currentProduct = getCurrentProduct();
    const isCurrentPlan = currentProduct?.priceId === product.priceId;
    const isSubscribed = isActiveSubscription();
    const isLoadingThis = checkoutLoading === product.priceId;

    return (
      <View key={product.priceId} style={[
        styles.productCard,
        product.popular && styles.popularCard,
        isCurrentPlan && styles.currentPlanCard
      ]}>
        {product.popular && (
          <View style={styles.popularBadge}>
            <Star size={16} color="#FFFFFF" />
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        )}

        <View style={styles.productHeader}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            <Text style={styles.interval}>{getIntervalText(product.interval)}</Text>
          </View>
        </View>

        <Text style={styles.productDescription}>{product.description}</Text>

        <View style={styles.featuresContainer}>
          {product.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <CheckCircle size={16} color="#4CAF50" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.subscribeButton,
            product.popular && styles.popularButton,
            isCurrentPlan && styles.currentPlanButton,
            (isLoadingThis || (isSubscribed && isCurrentPlan)) && styles.disabledButton
          ]}
          onPress={() => handleSubscribe(product)}
          disabled={isLoadingThis || (isSubscribed && isCurrentPlan)}
        >
          {isLoadingThis ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[
              styles.subscribeButtonText,
              isCurrentPlan && styles.currentPlanButtonText
            ]}>
              {isCurrentPlan ? 'Current Plan' : 'Subscribe'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0277BD" />
            <Text style={styles.loadingText}>Loading subscription information...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Plan</Text>
            <Text style={styles.subtitle}>
              Unlock the full potential of your DAMP smart drinkware
            </Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color="#F44336" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {userSubscription && (
            <View style={styles.currentSubscriptionCard}>
              <CreditCard size={24} color="#0277BD" />
              <View style={styles.subscriptionInfo}>
                <Text style={styles.subscriptionTitle}>Current Subscription</Text>
                <Text style={styles.subscriptionStatus}>
                  {formatSubscriptionStatus(userSubscription.subscription_status)}
                  {userSubscription.current_period_end && (
                    <Text style={styles.subscriptionPeriod}>
                      {' • Renews '}
                      {new Date(userSubscription.current_period_end * 1000).toLocaleDateString()}
                    </Text>
                  )}
                </Text>
                {getCurrentProduct() && (
                  <Text style={styles.currentPlanName}>
                    {getCurrentProduct()?.name}
                  </Text>
                )}
              </View>
            </View>
          )}

          <View style={styles.productsContainer}>
            {STRIPE_PRODUCTS.map(renderProductCard)}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              All plans include secure payment processing and can be canceled anytime.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0277BD',
    marginTop: 16,
  },
  header: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#0277BD',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#F44336',
    marginLeft: 12,
    flex: 1,
  },
  currentSubscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subscriptionInfo: {
    marginLeft: 16,
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
  },
  subscriptionStatus: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginTop: 2,
  },
  subscriptionPeriod: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#81C784',
  },
  currentPlanName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#4CAF50',
    marginTop: 4,
  },
  productsContainer: {
    gap: 20,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  popularCard: {
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  currentPlanCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    right: 20,
    backgroundColor: '#FF9800',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    maxWidth: 140,
  },
  popularText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  productHeader: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  productName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#0277BD',
    marginBottom: 8,
  },
  priceContainer: {
    alignItems: 'center',
  },
  price: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#0277BD',
  },
  interval: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
  },
  productDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0277BD',
    marginLeft: 12,
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#0277BD',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  popularButton: {
    backgroundColor: '#FF9800',
  },
  currentPlanButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  currentPlanButtonText: {
    color: '#FFFFFF',
  },
  footer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});