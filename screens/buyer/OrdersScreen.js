import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { Avatar, StatusTag } from '../../components/common';
import { getOrders } from '../../services/api';

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    try {
      setError(false);
      const res = await getOrders();
      setOrders(res.orders || []);
    } catch (e) {
      console.log(e);
      setError(true);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }

  useEffect(() => { loadOrders(); }, []);
  useEffect(() => { const u = navigation.addListener('focus', loadOrders); return u; }, [navigation]);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <Text style={s.heading}>My orders</Text>
        <Text style={s.sub}>Your saved bags history</Text>
      </View>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOrders(); }} />}>
        {error && !loading && (
          <View style={s.errorBox}>
            <Text style={s.errorIcon}>{'\u26A0\uFE0F'}</Text>
            <Text style={s.errorTitle}>Failed to load orders</Text>
            <Text style={s.errorText}>Check your connection and try again.</Text>
            <TouchableOpacity style={s.retryBtn} onPress={loadOrders}>
              <Text style={s.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        {!error && !loading && orders.length === 0 && (
          <View style={s.emptyBox}>
            <Text style={s.emptyIcon}>{'\u{1F6D2}'}</Text>
            <Text style={s.emptyTitle}>No orders yet</Text>
            <Text style={s.emptyText}>When you reserve a surprise bag, it will appear here. Start exploring available bags near you!</Text>
            <TouchableOpacity style={s.exploreBtn} onPress={() => navigation.navigate('HomeTab')}>
              <Text style={s.exploreBtnText}>Explore bags</Text>
            </TouchableOpacity>
          </View>
        )}
        {orders.map(order => (
          <TouchableOpacity key={order.id} style={s.row} onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })} activeOpacity={0.7}>
            <Avatar initials={order.vendorInitials} bg={order.vendorColor} color={order.vendorTextColor} size={38} />
            <View style={s.info}>
              <Text style={s.bagName} numberOfLines={1}>{order.bagName}</Text>
              <Text style={s.meta}>{order.date} · RM {order.price.toFixed(2)} · {order.id}</Text>
            </View>
            <StatusTag status={order.status} />
          </TouchableOpacity>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight },
  info: { flex: 1 },
  bagName: { ...Typography.bodySm, fontWeight: '500', color: Colors.textPrimary },
  meta: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  errorBox: { alignItems: 'center', padding: Spacing.xl, margin: Spacing.lg, backgroundColor: '#FEF2F2', borderRadius: Radius.lg },
  errorIcon: { fontSize: 32, marginBottom: Spacing.sm },
  errorTitle: { ...Typography.headingSm, color: '#991B1B', marginBottom: Spacing.xs },
  errorText: { ...Typography.caption, color: '#B91C1C', textAlign: 'center', marginBottom: Spacing.md },
  retryBtn: { backgroundColor: '#DC2626', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  retryBtnText: { ...Typography.bodySm, color: '#fff', fontWeight: '600' },
  emptyBox: { alignItems: 'center', padding: Spacing.xl, margin: Spacing.lg },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.headingSm, color: Colors.textPrimary, marginBottom: Spacing.xs },
  emptyText: { ...Typography.caption, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.lg },
  exploreBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  exploreBtnText: { ...Typography.bodySm, color: Colors.white, fontWeight: '600' },
});
