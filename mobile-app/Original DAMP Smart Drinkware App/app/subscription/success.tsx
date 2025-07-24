import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleCheck as CheckCircle, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SubscriptionSuccessScreen() {
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const mounted = useRef(true);

  useEffect(() => {
    // Wait a moment for webhook to process, then fetch updated subscription
    const timer = setTimeout(() => {
      fetchSubscriptionData();
    }, 2000);

    return () => {
      mounted.current = false;
      clearTimeout(timer);
    };
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
      } else {
        if (mounted.current) {
          setSubscriptionData(data);
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

  return (
    <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <CheckCircle size={80} color="#4CAF50" />
          </View>

          <Text style={styles.title}>Welcome to DAMP!</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0277BD" />
              <Text style={styles.loadingText}>Setting up your subscription...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Your subscription has been activated successfully. You now have access to all premium features.
              </Text>

              {subscriptionData && (
                <View style={styles.subscriptionInfo}>
                  <Text style={styles.subscriptionStatus}>
                    Status: {subscriptionData.subscription_status === 'active' ? 'Active' : 'Processing'}
                  </Text>
                </View>
              )}

              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>What's included:</Text>
                <Text style={styles.featureItem}>• Enhanced device tracking</Text>
                <Text style={styles.featureItem}>• Advanced notifications</Text>
                <Text style={styles.featureItem}>• Premium support</Text>
                <Text style={styles.featureItem}>• All future updates</Text>
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
        </View>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
  subscriptionInfo: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  subscriptionStatus: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  featuresContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
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