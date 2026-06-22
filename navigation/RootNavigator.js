import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { Colors, Typography } from '../theme';
import { useAuth, useIsSignedIn, useIsSignedOut } from '../context/AuthContext';

import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/buyer/HomeScreen';
import BagDetailScreen from '../screens/buyer/BagDetailScreen';
import OrdersScreen from '../screens/buyer/OrdersScreen';
import ProfileScreen from '../screens/buyer/ProfileScreen';
import OrderDetailScreen from '../screens/buyer/OrderDetailScreen';
import VendorDashboardScreen from '../screens/vendor/VendorDashboardScreen';
import VendorInsightsScreen from '../screens/vendor/VendorInsightsScreen';
import AddProductScreen from '../screens/vendor/AddProductScreen';
import MyProductsScreen from '../screens/vendor/MyProductsScreen';
import EditProductScreen from '../screens/vendor/EditProductScreen';
import VendorSettingsScreen from '../screens/vendor/VendorSettingsScreen';
import VendorOrderDetailScreen from '../screens/vendor/VendorOrderDetailScreen';
import VendorOnboardingScreen from '../screens/vendor/VendorOnboardingScreen';
import EarningsScreen from '../screens/vendor/EarningsScreen';
import PayoutHistoryScreen from '../screens/vendor/PayoutHistoryScreen';
import MapScreen from '../screens/MapScreen';
import NotificationScreen from '../screens/NotificationScreen';
import VendorStorefrontScreen from '../screens/buyer/VendorStorefrontScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BuyerHomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="BagDetail" component={BagDetailScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="VendorStorefront" component={VendorStorefrontScreen} />
    </Stack.Navigator>
  );
}

function BuyerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BuyerTabs" component={BuyerTabBar} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

function BuyerTabBar() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: { borderTopWidth: 0.5, borderTopColor: Colors.borderLight },
        tabBarLabelStyle: { ...Typography.label, fontSize: 10, marginBottom: 2 },
        tabBarIcon: ({ color, size }) => {
          const icons = { HomeTab: '\u{1F3E0}', OrdersTab: '\u{1F4C3}', ProfileTab: '\u{1F464}' };
          return <Text style={{ fontSize: size - 4 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={BuyerHomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="OrdersTab" component={OrdersScreen} options={{ title: 'Orders' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function VendorNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VendorOnboarding" component={VendorOnboardingScreen} />
      <Stack.Screen name="VendorTabs" component={VendorTabBar} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="MyProducts" component={MyProductsScreen} />
      <Stack.Screen name="EditProduct" component={EditProductScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="VendorOrderDetail" component={VendorOrderDetailScreen} />
      <Stack.Screen name="Earnings" component={EarningsScreen} />
      <Stack.Screen name="PayoutHistory" component={PayoutHistoryScreen} />
    </Stack.Navigator>
  );
}

function VendorTabBar() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: { borderTopWidth: 0.5, borderTopColor: Colors.borderLight },
        tabBarLabelStyle: { ...Typography.label, fontSize: 10, marginBottom: 2 },
        tabBarIcon: ({ size }) => {
          const icons = { DashTab: '\u{1F4CA}', InsightsTab: '\u{1F4C8}', SettingsTab: '\u2699\uFE0F' };
          return <Text style={{ fontSize: size - 4 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="DashTab" component={VendorDashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="InsightsTab" component={VendorInsightsScreen} options={{ title: 'Insights' }} />
      <Tab.Screen name="SettingsTab" component={VendorSettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const isSignedIn = useIsSignedIn();
  const isSignedOut = useIsSignedOut();
  const { user } = useAuth();

  if (isSignedIn && user?.role === 'vendor') {
    return <VendorNavigator />;
  }
  if (isSignedIn) {
    return <BuyerNavigator />;
  }
  if (isSignedOut) {
    return <AuthStack />;
  }
  return null;
}
