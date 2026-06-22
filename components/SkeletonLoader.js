import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors } from '../../theme';

export function SkeletonBlock({ width = '100%', height = 16, style }) {
  const anim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={[{ width, height, backgroundColor: Colors.borderLight, borderRadius: 4, opacity: anim }, style]} />;
}

export function BagCardSkeleton() {
  return (
    <View style={s.card}>
      <SkeletonBlock width="100%" height={140} style={{ borderRadius: 0 }} />
      <View style={s.body}>
        <SkeletonBlock width="70%" height={16} style={{ marginBottom: 6 }} />
        <SkeletonBlock width="50%" height={12} style={{ marginBottom: 12 }} />
        <View style={s.footer}>
          <SkeletonBlock width="30%" height={20} />
          <SkeletonBlock width="40%" height={12} />
        </View>
      </View>
    </View>
  );
}

export function OrderRowSkeleton() {
  return (
    <View style={s.orderRow}>
      <SkeletonBlock width={38} height={38} style={{ borderRadius: 19 }} />
      <View style={s.orderInfo}>
        <SkeletonBlock width="60%" height={14} style={{ marginBottom: 4 }} />
        <SkeletonBlock width="40%" height={10} />
      </View>
      <SkeletonBlock width={60} height={24} style={{ borderRadius: 12 }} />
    </View>
  );
}

export function StatCardSkeleton() {
  return (
    <View style={s.statCard}>
      <SkeletonBlock width="50%" height={22} style={{ marginBottom: 4 }} />
      <SkeletonBlock width="40%" height={12} style={{ marginBottom: 2 }} />
      <SkeletonBlock width="30%" height={10} />
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: Colors.bgPrimary, borderRadius: 12, marginHorizontal: 16, marginBottom: 12, borderWidth: 0.5, borderColor: Colors.borderLight, overflow: 'hidden' },
  body: { padding: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight },
  orderInfo: { flex: 1 },
  statCard: { width: '47%', backgroundColor: Colors.bgSecondary, borderRadius: 8, padding: 12 },
});
