import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleCheck as CheckCircle, ArrowRight, Package, Truck, Calendar } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function StoreSuccessScreen() {
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const mounted = useRef(true);

  useEffect(() => {
    // Wait a moment for webhook to process, then fetch order data
    const timer = setTimeout(() => {
      fetchOrderData();
    }, 2000);

    return () => {
      mounted.current = false;
      clearTimeout(timer);
    };
  }, []);

  const fetchOrderData = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_orders')
        .select('*')
        .order('order_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching order:', error);
      } else {
        if (mounted.current) {
          setOrderData(data);
        }
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const getEstimatedDelivery = () => {
    const today = new Date();
    const deliveryDate = new Date(today.getTime() + (5 * 24 * 60 * 60 * 1000)); // 5 days from now
    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.iconContainer}>
            <CheckCircle size={80} color="#4CAF50" />
          </View>

          <Text style={styles.title}>Order Confirmed!</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0277BD" />
              <Text style={styles.loadingText}>Processing your order...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Thank you for your purchase! Your DAMP products are being prepared for shipment.
              </Text>

              {orderData && (
                <View style={styles.orderInfo}>
                  <Text style={styles.orderNumber}>
                    Order #{orderData.order_id || 'Processing'}
                  </Text>
                  <Text style={styles.orderAmount}>
                    Total: {formatPrice(orderData.amount_total)}
                  </Text>
                </View>
              )}

              <View style={styles.timelineContainer}>
                <Text style={styles.timelineTitle}>What happens next:</Text>
                
                <View style={styles.timelineItem}>
                  <View style={styles.timelineIcon}>
                    <CheckCircle size={20} color="#4CAF50" />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineItemTitle}>Order Confirmed</Text>
                    <Text style={styles.timelineItemSubtitle}>Your payment has been processed</Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View style={styles.timelineIcon}>
                    <Package size={20} color="#FF9800" />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineItemTitle}>Preparing for Shipment</Text>
                    <Text style={styles.timelineItemSubtitle}>1-2 business days</Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View style={styles.timelineIcon}>
                    <Truck size={20} color="#64B5F6" />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineItemTitle}>Shipped</Text>
                    <Text style={styles.timelineItemSubtitle}>You'll receive tracking information</Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View style={styles.timelineIcon}>
                    <Calendar size={20} color="#64B5F6" />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineItemTitle}>Estimated Delivery</Text>
                    <Text style={styles.timelineItemSubtitle}>{getEstimatedDelivery()}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>Your order includes:</Text>
                <Text style={styles.featureItem}>• Premium DAMP smart drinkware</Text>
                <Text style={styles.featureItem}>• Free shipping on orders over $50</Text>
                <Text style={styles.featureItem}>• 30-day return policy</Text>
                <Text style={styles.featureItem}>• 1-year warranty</Text>
                <Text style={styles.featureItem}>• Setup guide and support</Text>
              </View>

              <View style={styles.supportContainer}>
                <Text style={styles.supportTitle}>Need help?</Text>
                <Text style={styles.supportText}>
                  Contact our support team at support@damp.com or check your email for order updates.
                </Text>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.continueButton, loading && styles.disabledButton]}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.continueButtonText}>Continue to App</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
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
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#0277BD',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0277BD',
    marginTop: 16,
  },
  orderInfo: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  orderAmount: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#4CAF50',
  },
  timelineContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginBottom: 20,
    textAlign: 'center',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FCFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timelineContent: {
    flex: 1,
  },
  timelineItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginBottom: 2,
  },
  timelineItemSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
  },
  featuresContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginBottom: 16,
    textAlign: 'center',
  },
  featureItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginBottom: 8,
    lineHeight: 20,
  },
  supportContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    alignSelf: 'stretch',
  },
  supportTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F57C00',
    marginBottom: 8,
    textAlign: 'center',
  },
  supportText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FF8F00',
    textAlign: 'center',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#0277BD',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  disabledButton: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginRight: 8,
  },
});