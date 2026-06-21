import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../theme';

export function HalalBadge({ status, size = 'sm' }) {
  const config = {
    halal: { label: '\u2713 Halal', bg: Colors.halalBg, color: Colors.halalText },
    mixed: { label: 'Mixed kitchen', bg: Colors.mixedBg, color: Colors.mixedText },
    'non-halal': { label: 'Non-halal', bg: Colors.nonHalalBg, color: Colors.nonHalalText },
  };
  const c = config[status] || config['non-halal'];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, size === 'lg' && styles.badgeLg]}>
      <Text style={[styles.badgeText, { color: c.color }, size === 'lg' && styles.badgeTextLg]}>{c.label}</Text>
    </View>
  );
}

export function StatusTag({ status }) {
  const config = {
    paid: { label: 'Paid', ...Colors.statusPaid },
    collected: { label: 'Collected', ...Colors.statusDone },
    pickup: { label: 'Pickup soon', ...Colors.statusPickup },
    done: { label: 'Done', ...Colors.statusDone },
    donated: { label: 'Donated', bg: Colors.primarySurface, text: Colors.primaryDark },
  };
  const c = config[status] || config.done;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

export function SectionHeader({ title, action, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function Avatar({ initials, size = 36, bg = Colors.primarySurface, color = Colors.primaryDark }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.avatarText, { color, fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

export function GreenPointsBanner({ meals, foodKg, co2Kg }) {
  return (
    <View style={styles.impactBar}>
      <Text style={styles.impactTitle}>Your community impact</Text>
      <View style={styles.impactRow}>
        <View style={styles.impactStat}><Text style={styles.impactVal}>{meals}</Text><Text style={styles.impactLabel}>meals saved</Text></View>
        <View style={styles.impactStat}><Text style={styles.impactVal}>{foodKg} kg</Text><Text style={styles.impactLabel}>food rescued</Text></View>
        <View style={styles.impactStat}><Text style={styles.impactVal}>{co2Kg} kg</Text><Text style={styles.impactLabel}>CO₂ saved</Text></View>
      </View>
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled }) {
  return (
    <TouchableOpacity style={[styles.primaryBtn, disabled && styles.primaryBtnDisabled]} onPress={onPress} disabled={disabled} activeOpacity={0.85}>
      <Text style={styles.primaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function SecondaryButton({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.secondaryBtn} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  badgeLg: { paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { ...Typography.label, fontSize: 11 },
  badgeTextLg: { fontSize: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  sectionTitle: { ...Typography.headingSm, color: Colors.textPrimary },
  sectionAction: { ...Typography.caption, color: Colors.primary },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '500' },
  impactBar: { backgroundColor: Colors.primarySurface, marginHorizontal: Spacing.lg, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  impactTitle: { ...Typography.caption, fontWeight: '500', color: Colors.primaryDark, marginBottom: Spacing.sm },
  impactRow: { flexDirection: 'row', justifyContent: 'space-around' },
  impactStat: { alignItems: 'center' },
  impactVal: { ...Typography.headingSm, color: Colors.primary },
  impactLabel: { ...Typography.label, color: Colors.primaryLight, marginTop: 2 },
  primaryBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  primaryBtnDisabled: { backgroundColor: Colors.gray200 },
  primaryBtnText: { ...Typography.headingSm, color: Colors.white },
  secondaryBtn: { borderRadius: Radius.md, paddingVertical: 12, alignItems: 'center', borderWidth: 0.5, borderColor: Colors.borderMedium, marginTop: Spacing.sm },
  secondaryBtnText: { ...Typography.bodySm, color: Colors.textSecondary },
});
