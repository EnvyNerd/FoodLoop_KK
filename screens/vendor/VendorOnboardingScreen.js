import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../../theme';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    title: 'Welcome to FoodLoop!',
    subtitle: 'Turn your surplus food into revenue. Let us show you how.',
    icon: '\u{1F34E}',
    tip: 'Every bag you list is one less bag going to waste.',
  },
  {
    title: 'List your surplus bags',
    subtitle: 'Add a photo, set your price, and define your pickup window. It takes less than a minute.',
    icon: '\u{1F4F7}',
    tip: 'Bags with photos get 3x more orders!',
  },
  {
    title: 'Get notified when someone orders',
    subtitle: 'Buyers near you will discover your bags. You\'ll get an alert the moment someone reserves.',
    icon: '\u{1F514}',
    tip: 'Mark bags as "Ready" so buyers know when to pick up.',
  },
  {
    title: 'Verify & collect',
    subtitle: 'Show the buyer\'s QR code at pickup. Mark the order as collected. Done!',
    icon: '\u2705',
    tip: 'You can track all your orders and earnings in the dashboard.',
  },
];

export default function VendorOnboardingScreen({ navigation }) {
  const [step, setStep] = useState(0);

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else navigation.replace('VendorTabs');
  }

  function skip() {
    navigation.replace('VendorTabs');
  }

  const current = STEPS[step];

  return (
    <SafeAreaView style={s.container}>
      <View style={s.skipRow}>
        <TouchableOpacity onPress={skip}><Text style={s.skipText}>Skip</Text></TouchableOpacity>
      </View>

      <View style={s.content}>
        <View style={s.iconCircle}>
          <Text style={s.icon}>{current.icon}</Text>
        </View>
        <Text style={s.title}>{current.title}</Text>
        <Text style={s.subtitle}>{current.subtitle}</Text>
        <View style={s.tipBox}>
          <Text style={s.tipIcon}>{'\u{1F4A1}'}</Text>
          <Text style={s.tipText}>{current.tip}</Text>
        </View>
      </View>

      {/* Progress dots */}
      <View style={s.dots}>
        {STEPS.map((_, i) => (
          <View key={i} style={[s.dot, i === step && s.dotActive]} />
        ))}
      </View>

      {/* Actions */}
      <View style={s.actions}>
        {step > 0 && (
          <TouchableOpacity style={s.backBtn} onPress={() => setStep(step - 1)}>
            <Text style={s.backBtnText}>{'\u2190'} Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={s.nextBtn} onPress={next}>
          <Text style={s.nextBtnText}>{step === STEPS.length - 1 ? "Let's go!" : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  skipRow: { alignItems: 'flex-end', padding: Spacing.md },
  skipText: { ...Typography.bodySm, color: 'rgba(255,255,255,0.7)' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  icon: { fontSize: 36 },
  title: { ...Typography.headingLg, color: Colors.white, textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { ...Typography.bodyMd, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 22 },
  tipBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.lg, padding: Spacing.md, marginTop: Spacing.xl, maxWidth: width - 80 },
  tipIcon: { fontSize: 16 },
  tipText: { ...Typography.caption, color: 'rgba(255,255,255,0.9)', flex: 1, lineHeight: 18 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: Spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: Colors.white, width: 24 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  backBtn: { padding: Spacing.md },
  backBtnText: { ...Typography.bodySm, color: 'rgba(255,255,255,0.7)' },
  nextBtn: { backgroundColor: Colors.white, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.md },
  nextBtnText: { ...Typography.bodySm, color: Colors.primary, fontWeight: '600' },
});
