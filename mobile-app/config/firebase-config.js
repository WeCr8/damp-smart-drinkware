// Firebase configuration for DAMP Smart Drinkware Mobile App
// Compatible with React Native and Flutter

export const firebaseConfig = {
  projectId: "damp-smart-drinkware",
  appId: "1:309818614427:web:db15a4851c05e58aa25c3e", // Will be updated when mobile apps are created
  storageBucket: "damp-smart-drinkware.firebasestorage.app",
  apiKey: "AIzaSyAKkZEf6c3mTzDdOoDT6xmhhsmx1RP_G8w",
  authDomain: "damp-smart-drinkware.firebaseapp.com",
  messagingSenderId: "309818614427",
  measurementId: "G-YW2BN4SVPQ"
};

// iOS specific configuration (when iOS app is created)
export const iosConfig = {
  projectId: "damp-smart-drinkware",
  bundleId: "com.wecr8.dampsmartdrinkware",
  // iOS-specific keys will be added when iOS app is created
};

// Android specific configuration (when Android app is created)
export const androidConfig = {
  projectId: "damp-smart-drinkware",
  packageName: "com.wecr8.dampsmartdrinkware",
  // Android-specific keys will be added when Android app is created
};

// Platform detection helper
export const getPlatformConfig = () => {
  // For React Native
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return { ...firebaseConfig, ...iosConfig };
    } else if (/android/i.test(userAgent)) {
      return { ...firebaseConfig, ...androidConfig };
    }
  }
  
  // Default to web config
  return firebaseConfig;
};

// Environment configuration
export const getEnvironmentConfig = () => {
  const baseConfig = getPlatformConfig();
  
  // Development environment
  if (__DEV__ || process.env.NODE_ENV === 'development') {
    return {
      ...baseConfig,
      // Use emulators in development
      useEmulators: true,
      emulatorConfig: {
        auth: { port: 9099 },
        firestore: { port: 8080 },
        functions: { port: 5001 },
        storage: { port: 9199 }
      }
    };
  }
  
  // Production environment
  return {
    ...baseConfig,
    useEmulators: false
  };
};

export default firebaseConfig; 