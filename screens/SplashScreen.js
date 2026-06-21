import React from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';

export default function SplashScreen() {
  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={s.content}>
        <View style={s.logoContainer}>
          <Image
            source={require('../assets/new-icon-logo.png')}
            style={s.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={s.title}>FoodLoop</Text>
        <Text style={s.subtitle}>Savor More, Waste Less</Text>
      </View>
      <View style={s.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.white} style={s.loader} />
        <Text style={s.loaderText}>Loading the freshness...</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'space-between',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: Radius.xl,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    // Soft shadow for the white container on primary green
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    ...Typography.displayLg,
    color: Colors.white,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyLg,
    color: Colors.primarySurface,
    opacity: 0.9,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  loaderContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  loader: {
    marginBottom: Spacing.sm,
  },
  loaderText: {
    ...Typography.bodySm,
    color: Colors.primarySurface,
    opacity: 0.8,
  },
});
