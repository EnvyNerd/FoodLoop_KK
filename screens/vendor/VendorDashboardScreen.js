import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { Avatar, StatusTag, SectionHeader } from '../../components/common';
import { getVendorStats, getVendorOrders } from '../../services/api';

export default function VendorDashboardScreen() {
  const [bagLive, setBagLive] = useState(true);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    Promise.all([getVendorStats(), getVendorOrders()]).then(([s, o]) => {
      setStats(s.stats || s);
      setOrders(o.orders || []);
    }).catch(console.log);
  }, []);

  const st = stats || { todaySold: 0, todayRemaining: 0, todayEarnings: 0, monthSold: 0, monthEarnings: 0 };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <Text style={s.heading}>Sunrise Bakery</Text>
        <Text style={s.sub}>Today's overview</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.toggleSection}>
          <View style={s.toggleRow}>
            <View style={s.toggleInfo}>
              <Text style={s.toggleTitle}>Sunrise Bakery Surprise Bag</Text>
              <Text style={s.toggleSub}>RM 6 · 7:30\u20138:30 PM · {bagLive ? '7 / 10 available' : 'Paused'}</Text>
            </View>
            <View style={s.toggleRight}>
              <View style={[s.livePill, !bagLive && s.livePillOff]}>
                <Text style={[s.livePillText, !bagLive && s.livePillTextOff]}>{bagLive ? 'Live' : 'Paused'}</Text>
              </View>
              <Switch value={bagLive} onValueChange={setBagLive} trackColor={{ false: Colors.gray200, true: Colors.primaryLight }} thumbColor={Colors.white} />
            </View>
          </View>
        </View>
        <View style={s.donateBanner}>
          <Text style={s.donateIcon}>{'\u{1F91D}'}</Text>
          <View style={s.donateBody}>
            <Text style={s.donateTitle}>Donation mode available</Text>
            <Text style={s.donateSub}>If bags are unsold by 8:00 PM, auto-donate to Rumah Nur Kasih shelter.</Text>
            <TouchableOpacity><Text style={s.donateLink}>Enable donation mode {'\u2192'}</Text></TouchableOpacity>
          </View>
        </View>
        <View style={s.statsGrid}>
          <View style={s.statCard}><Text style={s.statVal}>{st.todaySold}</Text><Text style={s.statLabel}>Bags sold today</Text><Text style={s.statSub}>RM {st.todayEarnings.toFixed(2)} earned</Text></View>
          <View style={s.statCard}><Text style={s.statVal}>{st.todayRemaining}</Text><Text style={s.statLabel}>Remaining today</Text><Text style={s.statSub}>Updated live</Text></View>
          <View style={s.statCard}><Text style={s.statVal}>{st.monthSold}</Text><Text style={s.statLabel}>Total bags sold</Text><Text style={s.statSub}>This month</Text></View>
          <View style={[s.statCard, s.statCardGreen]}><Text style={[s.statVal, { color: Colors.primary }]}>RM {st.monthEarnings.toLocaleString()}</Text><Text style={s.statLabel}>Monthly earnings</Text><Text style={s.statSub}>After platform fee</Text></View>
        </View>
        <SectionHeader title="Today's orders" action="Scan QR" onAction={() => {}} />
        {orders.map(order => (
          <View key={order.id} style={s.orderRow}>
            <Avatar initials={order.initials} bg={order.color} color={order.textColor} size={36} />
            <View style={s.orderInfo}>
              <Text style={s.orderName}>{order.buyerName}</Text>
              <Text style={s.orderMeta}>{order.id} · RM {order.price}.00 · {order.time}</Text>
            </View>
            <StatusTag status={order.status} />
          </View>
        ))}
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
  toggleSection: { margin: Spacing.lg, marginBottom: Spacing.sm },
  toggleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgPrimary, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.borderLight, padding: Spacing.md, gap: Spacing.sm },
  toggleInfo: { flex: 1 },
  toggleTitle: { ...Typography.bodySm, fontWeight: '500', color: Colors.textPrimary },
  toggleSub: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  toggleRight: { alignItems: 'center', gap: 4 },
  livePill: { backgroundColor: Colors.primarySurface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  livePillOff: { backgroundColor: Colors.bgSecondary },
  livePillText: { ...Typography.label, fontSize: 10, color: Colors.primaryDark },
  livePillTextOff: { color: Colors.textSecondary },
  donateBanner: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.mixedBg, borderRadius: Radius.lg, marginHorizontal: Spacing.lg, marginBottom: Spacing.md, padding: Spacing.md },
  donateIcon: { fontSize: 18, marginTop: 1 },
  donateBody: { flex: 1 },
  donateTitle: { ...Typography.bodySm, fontWeight: '500', color: '#412402' },
  donateSub: { ...Typography.caption, color: Colors.mixedText, marginTop: 2, lineHeight: 17 },
  donateLink: { ...Typography.caption, color: Colors.primary, marginTop: 5, fontWeight: '500' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  statCard: { width: '47%', backgroundColor: Colors.bgSecondary, borderRadius: Radius.md, padding: Spacing.md },
  statCardGreen: { backgroundColor: Colors.primarySurface },
  statVal: { ...Typography.displayMd, fontSize: 22, color: Colors.textPrimary },
  statLabel: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  statSub: { ...Typography.label, fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight },
  orderInfo: { flex: 1 },
  orderName: { ...Typography.bodySm, fontWeight: '500', color: Colors.textPrimary },
  orderMeta: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
});
