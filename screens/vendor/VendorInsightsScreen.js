import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { getVendorStats } from '../../services/api';

const WEEKLY = [
  { day: 'Mon', value: 6, total: 10 },
  { day: 'Tue', value: 8, total: 10 },
  { day: 'Wed', value: 5, total: 10 },
  { day: 'Thu', value: 9, total: 10 },
  { day: 'Fri', value: 10, total: 10 },
  { day: 'Sat', value: 8, total: 10 },
  { day: 'Sun', value: 3, total: 10 },
];

export default function VendorInsightsScreen() {
  const [stats, setStats] = useState(null);
  useEffect(() => { getVendorStats().then(res => setStats(res.stats || res)).catch(console.log); }, []);
  const st = stats || { sellThroughRate: 0, avgRating: 0, totalReviews: 0, monthFoodRescued: 0, monthCO2Saved: 0, monthSold: 0 };
  const maxVal = Math.max(...WEEKLY.map(d => d.value));

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <Text style={s.heading}>Insights</Text>
        <Text style={s.sub}>Performance & waste data</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.statsGrid}>
          <View style={s.statCard}><Text style={s.statVal}>{st.sellThroughRate}%</Text><Text style={s.statLabel}>Sell-through rate</Text><Text style={s.statSub}>Last 30 days</Text></View>
          <View style={s.statCard}><Text style={s.statVal}>{st.avgRating.toFixed(1)}</Text><Text style={s.statLabel}>Avg. rating</Text><Text style={s.statSub}>{st.totalReviews} reviews</Text></View>
          <View style={[s.statCard, s.statGreen]}><Text style={[s.statVal, { color: Colors.primary }]}>{st.monthFoodRescued} kg</Text><Text style={s.statLabel}>Food rescued</Text><Text style={s.statSub}>This month</Text></View>
          <View style={[s.statCard, s.statGreen]}><Text style={[s.statVal, { color: Colors.primary }]}>{st.monthCO2Saved} kg</Text><Text style={s.statLabel}>CO₂ avoided</Text><Text style={s.statSub}>This month</Text></View>
        </View>
        <View style={s.chartCard}>
          <Text style={s.chartTitle}>Weekly bag sales</Text>
          <View style={s.bars}>
            {WEEKLY.map(d => (
              <View key={d.day} style={s.barCol}>
                <Text style={s.barVal}>{d.value}</Text>
                <View style={s.barTrack}><View style={[s.barFill, { height: (d.value / maxVal) * 100 + '%' }]} /></View>
                <Text style={s.barDay}>{d.day}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={s.tipCard}>
          <Text style={s.tipTitle}>{'\u{1F4A1}'} FoodLoop tip</Text>
          <Text style={s.tipText}>Fridays and Saturdays sell out fastest. Consider listing 2 more bags on those days to maximise earnings.</Text>
        </View>
        <View style={s.impactCard}>
          <Text style={s.impactTitle}>Your environmental impact</Text>
          <Text style={s.impactSub}>By selling {st.monthSold} bags this month, Sunrise Bakery has:</Text>
          <View style={s.impactRow}>
            <View style={s.impactStat}><Text style={s.impactVal}>{st.monthFoodRescued} kg</Text><Text style={s.impactLabel}>food rescued</Text></View>
            <View style={s.impactDivider} />
            <View style={s.impactStat}><Text style={s.impactVal}>{st.monthCO2Saved} kg</Text><Text style={s.impactLabel}>CO₂ avoided</Text></View>
          </View>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  topBar: { backgroundColor: Colors.primary, padding: Spacing.lg, paddingBottom: Spacing.md },
  heading: { ...Typography.headingMd, color: Colors.white },
  sub: { ...Typography.caption, color: Colors.primaryMuted, marginTop: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, padding: Spacing.lg, paddingBottom: 0 },
  statCard: { width: '47%', backgroundColor: Colors.bgSecondary, borderRadius: Radius.md, padding: Spacing.md },
  statGreen: { backgroundColor: Colors.primarySurface },
  statVal: { fontSize: 22, fontWeight: '500', color: Colors.textPrimary },
  statLabel: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  statSub: { ...Typography.label, fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
  chartCard: { margin: Spacing.lg, backgroundColor: Colors.bgSecondary, borderRadius: Radius.lg, padding: Spacing.md },
  chartTitle: { ...Typography.bodySm, fontWeight: '500', color: Colors.textPrimary, marginBottom: Spacing.md },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 4 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barVal: { ...Typography.label, fontSize: 10, color: Colors.textSecondary },
  barTrack: { flex: 1, width: '100%', backgroundColor: Colors.bgPrimary, borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { backgroundColor: Colors.primaryLight, borderRadius: 4, width: '100%' },
  barDay: { ...Typography.label, fontSize: 10, color: Colors.textTertiary },
  tipCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: Colors.primarySurface, borderRadius: Radius.lg, padding: Spacing.md },
  tipTitle: { ...Typography.bodySm, fontWeight: '500', color: Colors.primaryDark, marginBottom: 5 },
  tipText: { ...Typography.caption, color: Colors.primary, lineHeight: 18 },
  impactCard: { marginHorizontal: Spacing.lg, backgroundColor: Colors.bgSecondary, borderRadius: Radius.lg, padding: Spacing.md },
  impactTitle: { ...Typography.bodySm, fontWeight: '500', color: Colors.textPrimary, marginBottom: 4 },
  impactSub: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.md },
  impactRow: { flexDirection: 'row', alignItems: 'center' },
  impactStat: { flex: 1, alignItems: 'center' },
  impactVal: { ...Typography.headingMd, color: Colors.primary },
  impactLabel: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  impactDivider: { width: 0.5, height: 40, backgroundColor: Colors.borderLight },
});
