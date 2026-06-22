import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { getPayouts } from '../../services/api';

export default function PayoutHistoryScreen({ navigation }) {
  const [payouts, setPayouts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    try { const res = await getPayouts(); setPayouts(res.payouts || []); }
    catch (e) { console.log(e); }
    finally { setRefreshing(false); }
  }

  useEffect(() => { loadData(); }, []);

  function onRefresh() { setRefreshing(true); loadData(); }

  const totalPaid = payouts.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const pendingAmount = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}><Text style={s.backText}>{'\u2190'}</Text></TouchableOpacity>
        <Text style={s.title}>Payout history</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Summary */}
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={s.summaryVal}>RM {totalPaid.toFixed(2)}</Text>
            <Text style={s.summaryLabel}>Total paid out</Text>
          </View>
          <View style={[s.summaryCard, s.summaryCardPending]}>
            <Text style={s.summaryVal}>RM {pendingAmount.toFixed(2)}</Text>
            <Text style={s.summaryLabel}>Pending</Text>
          </View>
        </View>

        {/* Payout list */}
        {payouts.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>{'\u{1F4B0}'}</Text>
            <Text style={s.emptyTitle}>No payouts yet</Text>
            <Text style={s.emptyText}>Payouts will appear here once your earnings are processed.</Text>
          </View>
        ) : (
          payouts.map(p => (
            <View key={p.id} style={s.payoutRow}>
              <View style={s.payoutInfo}>
                <Text style={s.payoutDate}>{p.date}</Text>
                <Text style={s.payoutRef}>{p.ref}</Text>
              </View>
              <View style={s.payoutRight}>
                <Text style={s.payoutAmount}>RM {p.amount.toFixed(2)}</Text>
                <View style={[s.statusBadge, p.status === 'pending' && s.statusBadgePending]}>
                  <Text style={[s.statusText, p.status === 'pending' && s.statusTextPending]}>
                    {p.status === 'completed' ? 'Completed' : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight },
  backBtn: { padding: Spacing.sm },
  backText: { fontSize: 22, color: Colors.textPrimary },
  title: { ...Typography.headingSm, color: Colors.textPrimary },
  summaryRow: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.lg },
  summaryCard: { flex: 1, backgroundColor: Colors.primarySurface, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center' },
  summaryCardPending: { backgroundColor: '#FEF3C7' },
  summaryVal: { ...Typography.headingMd, color: Colors.primary },
  summaryLabel: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 40, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.headingSm, color: Colors.textPrimary, marginBottom: Spacing.xs },
  emptyText: { ...Typography.caption, color: Colors.textSecondary, textAlign: 'center' },
  payoutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight },
  payoutInfo: { flex: 1 },
  payoutDate: { ...Typography.bodySm, fontWeight: '500', color: Colors.textPrimary },
  payoutRef: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  payoutRight: { alignItems: 'flex-end' },
  payoutAmount: { ...Typography.headingSm, color: Colors.textPrimary },
  statusBadge: { backgroundColor: Colors.primarySurface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, marginTop: 4 },
  statusBadgePending: { backgroundColor: '#FEF3C7' },
  statusText: { ...Typography.label, fontSize: 10, color: Colors.primaryDark, fontWeight: '600' },
  statusTextPending: { color: '#92400E' },
});
