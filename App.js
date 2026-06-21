import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import SplashScreen from './screens/SplashScreen';
import RootNavigator from './navigation/RootNavigator';

function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return <RootNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
