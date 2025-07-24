import { Tabs } from 'expo-router';
import { Chrome as Home, MapPin, Settings } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E1F5FE',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 80 : 70,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#0277BD',
        tabBarInactiveTintColor: '#64B5F6',
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-Medium',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="zones"
        options={{
          title: 'Zones',
          tabBarIcon: ({ size, color }) => <MapPin size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}