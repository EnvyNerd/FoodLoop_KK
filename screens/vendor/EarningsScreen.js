import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { getVendorStats } from '../../services/api';
import { getPayouts, requestPayout } from '../../services/api';

const PLATFORM_FEE_PCT = 15;

const MOCK_WEEKLY = [
  { day: 'Mon', amount: 34.20 },
  { day: 'Tue', amount: 48.60 },
  { day: 'Wed', amount: 28.80 },
  { day: 'Thu', amount: 52.40 },
  { day: 'Fri', amount: 66.00 },
  { day: 'Sat', amount: 58.20 },
  { day: 'Sun', amount: 22.40 },
];

export default function EarningsScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  async function loadData() {
    try {
      const [s, p] = await Promise.all([getVendorStats(), getPayouts()]);
      setStats(s.stats || s);
      setPayouts(p.payouts || []);
    } catch (e) { console.log(e); }
    finally { setRefreshing(false); }
  }

  useEffect(() => { loadData(); }, []);

  function onRefresh() { setRefreshing(true); loadData(); }

  const st = stats || { todayEarnings: 0, monthEarnings: 0, todaySold: 0, monthSold: 0 };
  const weeklyTotal = MOCK_WEEKLY.reduce((s, d) => s + d.amount, 0);
  const weekFee = weeklyTotal * PLATFORM_FEE_PCT / 100;
  const weekNet = weeklyTotal - weekFee;
  const maxDay = Math.max(...MOCK_WEEKLY.map(d => d.amount));
  const bestDay = MOCK_WEEKLY.reduce((a, b) => a.amount > b.amount ? a : b);
  const avgOrder = st.monthSold > 0 ? (st.monthEarnings / st.monthSold).toFixed(2) : '0.00';

  // Available balance = last month earnings minus already paid out
  const totalPaidOut = payouts.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const availableBalance = Math.max(0, st.monthEarnings - totalPaidOut);

  async function handleWithdraw() {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) { Alert.alert('Error', 'Enter a valid amount'); return; }
    if (amt > availableBalance) { Alert.alert('Error', `Available balance is RM ${availableBalance.toFixed(2)}`); return; }
    setProcessing(true);
    try {
      await requestPayout(amt);
      Alert.alert('Success', `Payout request of RM ${amt.toFixed(2)} submitted. Expected in 2-3 business days.`);
      setShowWithdraw(false);
      setWithdrawAmount('');
      loadData();
    } catch (e) { Alert.alert('Error', 'Failed to request payout'); }
    finally { setProcessing(false); }
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}><Text style={s.backText}>{'\u2190'}</Text></TouchableOpacity>
        <Text style={s.title}>Earnings</Text>
        <TouchableOpacity onPress={() => navigation.navigate('PayoutHistory')}>
          <Text style={s.historyLink}>History</Text>
        </TouchableOpacity>
      </View>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        {/* Available balance */}
        <View style={s.balanceCard}>
          <Text style={s.balanceLabel}>Available balance</Text>
          <Text style={s.balanceAmount}>RM {availableBalance.toFixed(2)}</Text>
          <TouchableOpacity style={s.withdrawBtn} onPress={() => setShowWithdraw(!showWithdraw)}>
            <Text style={s.withdrawBtnText}>Request withdrawal</Text>
          </TouchableOpacity>
        </View>

        {/* Withdrawal form */}
        {showWithdraw && (
          <View style={s.withdrawForm}>
            <Text style={s.label}>Amount to withdraw</Text>
            <TextInput style={s.input} value={withdrawAmount} onChangeText={setWithdrawAmount} placeholder="0.00" placeholderTextColor={Colors.textTertiary} keyboardType="decimal-pad" />
            <View style={s.withdrawActions}>
              <TouchableOpacity style={s.submitWithdrawBtn} onPress={handleWithdraw} disabled={processing}>
                <Text style={s.submitWithdrawBtnText}>{processing ? 'Processing...' : 'Submit'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.cancelWithdrawBtn} onPress={() => setShowWithdraw(false)}>
                <Text style={s.cancelWithdrawBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Weekly chart */}
        <View style={s.chartCard}>
          <Text style={s.chartTitle}>This week's revenue</Text>
          <Text style={s.chartTotal}>RM {weeklyTotal.toFixed(2)}</Text>
          <View style={s.bars}>
            {MOCK_WEEKLY.map(d => (
              <View key={d.day} style={s.barCol}>
                <Text style={s.barVal}>RM{d.amount.toFixed(1)}</Text>
                <View style={s.barTrack}>
                  <View style={[s.barFill, { height: maxDay > 0 ? (d.amount / maxDay) * 100 + '%' : '0%' }]} />
                </View>
                <Text style={s.barDay}>{d.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Breakdown */}
        <View style={s.breakdownCard}>
          <Text style={s.breakdownTitle}>Revenue breakdown</Text>
          <View style={s.breakdownRow}><Text style={s.breakdownLabel}>Gross revenue</Text><Text style={s.breakdownValue}>RM {weeklyTotal.toFixed(2)}</Text></View>
          <View style={s.breakdownRow}><Text style={s.breakdownLabel}>Platform fee ({PLATFORM_FEE_PCT}%)</Text><Text style={[s.breakdownValue, { color: Colors.danger }]}>-RM {weekFee.toFixed(2)}</Text></View>
          <View style={s.breakdownDivider} />
          <View style={s.breakdownRow}><Text style={s.breakdownLabelBold}>Net earnings</Text><Text style={s.breakdownValueBold}>RM {weekNet.toFixed(2)}</Text></View>
        </View>

        {/* Key metrics */}
        <View style={s.metricsGrid}>
          <View style={s.metricCard}><Text style={s.metricVal}>RM {st.todayEarnings.toFixed(2)}</Text><Text style={s.metricLabel}>Today</Text></View>
          <View style={s.metricCard}><Text style={s.metricVal}>RM {st.monthEarnings.toFixed(2)}</Text><Text style={s.metricLabel}>This month</Text></View>
          <View style={s.metricCard}><Text style={s.metricVal}>RM {avgOrder}</Text><Text style={s.metricLabel}>Avg order</Text></View>
          <View style={s.metricCard}><Text style={s.metricVal}>{bestDay.day}</Text><Text style={s.metricLabel}>Best day</Text></View>
        </View>

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
  historyLink: { ...Typography.caption, color: Colors.primary, fontWeight: '500', padding: Spacing.sm },
  balanceCard: { backgroundColor: Colors.primary, margin: Spacing.lg, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center' },
  balanceLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  balanceAmount: { fontSize: 32, fontWeight: '700', color: Colors.white, marginBottom: Spacing.md },
  withdrawBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  withdrawBtnText: { ...Typography.bodySm, color: Colors.white, fontWeight: '600' },
  withdrawForm: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: Colors.bgSecondary, borderRadius: Radius.lg, padding: Spacing.md },
  label: { ...Typography.label, color: Colors.textSecondary, marginBottom: 6 },
  input: { height: 48, borderWidth: 1, borderColor: Colors.borderMedium, borderRadius: Radius.md, paddingHorizontal: 14, fontSize: 16, backgroundColor: Colors.bgPrimary, color: Colors.textPrimary, marginBottom: Spacing.sm },
  withdrawActions: { flexDirection: 'row', gap: Spacing.sm },
  submitWithdrawBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  submitWithdrawBtnText: { ...Typography.bodySm, color: Colors.white, fontWeight: '600' },
  cancelWithdrawBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  cancelWithdrawBtnText: { ...Typography.bodySm, color: Colors.textSecondary },
  chartCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: Colors.bgSecondary, borderRadius: Radius.lg, padding: Spacing.md },
  chartTitle: { ...Typography.bodySm, fontWeight: '500', color: Colors.textPrimary, marginBottom: 2 },
  chartTotal: { ...Typography.headingMd, color: Colors.primary, marginBottom: Spacing.md },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 4 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barVal: { ...Typography.label, fontSize: 9, color: Colors.textTertiary },
  barTrack: { flex: 1, width: '100%', backgroundColor: Colors.bgPrimary, borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { backgroundColor: Colors.primary, borderRadius: 4, width: '100%' },
  barDay: { ...Typography.label, fontSize: 10, color: Colors.textTertiary },
  breakdownCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: Colors.bgSecondary, borderRadius: Radius.lg, padding: Spacing.md },
  breakdownTitle: { ...Typography.bodySm, fontWeight: '500', color: Colors.textPrimary, marginBottom: Spacing.sm },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  breakdownLabel: { ...Typography.caption, color: Colors.textSecondary },
  breakdownValue: { ...Typography.caption, color: Colors.textPrimary },
  breakdownLabelBold: { ...Typography.bodySm, fontWeight: '600', color: Colors.textPrimary },
  breakdownValueBold: { ...Typography.bodySm, fontWeight: '600', color: Colors.primary },
  breakdownDivider: { height: 0.5, backgroundColor: Colors.borderLight, marginVertical: 6 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingHorizontal: Spacing.lg },
  metricCard: { width: '47%', backgroundColor: Colors.bgSecondary, borderRadius: Radius.md, padding: Spacing.md },
  metricVal: { ...Typography.headingSm, color: Colors.primary },
  metricLabel: { ...Typography.label, color: Colors.textSecondary, marginTop: 2 },
});
