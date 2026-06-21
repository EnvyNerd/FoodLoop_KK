import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { Avatar, StatusTag } from '../../components/common';
import { getOrders } from '../../services/api';

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadOrders() {
    try { const res = await getOrders(); setOrders(res.orders || []); }
    catch (e) { console.log(e); }
    finally { setRefreshing(false); }
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
        {orders.map(order => (
          <View key={order.id} style={s.row}>
            <Avatar initials={order.vendorInitials} bg={order.vendorColor} color={order.vendorTextColor} size={38} />
            <View style={s.info}>
              <Text style={s.bagName} numberOfLines={1}>{order.bagName}</Text>
              <Text style={s.meta}>{order.date} · RM {order.price.toFixed(2)} · {order.id}</Text>
            </View>
            <StatusTag status={order.status} />
          </View>
        ))}
        <View style={s.empty}><Text style={s.emptyNote}>Only showing recent orders. Full history in your account settings.</Text></View>
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
  empty: { padding: Spacing.xl, alignItems: 'center' },
  emptyNote: { ...Typography.caption, color: Colors.textTertiary, textAlign: 'center' },
});
