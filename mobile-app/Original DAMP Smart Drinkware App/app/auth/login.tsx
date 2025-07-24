import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Link } from 'expo-router';
import { Droplets, Mail, Lock, Eye, EyeOff, CircleAlert as AlertCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#E0F7FF', '#B3E5FC', '#81D4FA']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Droplets size={48} color="#0277BD" strokeWidth={2} />
            </View>
            <Text style={styles.title}>DAMP</Text>
            <Text style={styles.subtitle}>Smart Drinkware</Text>
            <Text style={styles.welcomeText}>Welcome back</Text>
          </View>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#F44336" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Mail size={20} color="#0277BD" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                placeholderTextColor="#64B5F6"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#0277BD" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType="password"
                placeholderTextColor="#64B5F6"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={loading}
                accessible
                accessibilityLabel="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={20} color="#0277BD" /> : <Eye size={20} color="#0277BD" />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              accessible
              accessibilityLabel="Sign in"
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>Don't have an account? </Text>
              <Link href="/auth/signup" asChild>
                <TouchableOpacity disabled={loading}>
                  <Text style={styles.linkButton}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#0277BD',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#0288D1',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#0277BD',
  },
  form: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#F44336',
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFF',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E1F5FE',
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0277BD',
  },
  eyeIcon: { padding: 4 },
  loginButton: {
    backgroundColor: '#0277BD',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
  },
  linkButton: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
  },
});