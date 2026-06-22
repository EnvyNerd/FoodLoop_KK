import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { Avatar, StatusTag, SectionHeader } from '../../components/common';
import { getVendorStats, getVendorOrders, updateOrderStatus, getVendorProducts, updateProduct, getVendorProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getUnreadCount } from '../../services/notifications';

const ORDER_FILTERS = ['All', 'Pending', 'Ready', 'Collected'];

export default function VendorDashboardScreen({ navigation }) {
  const [bagLive, setBagLive] = useState(true);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [orderFilter, setOrderFilter] = useState('All');
  const { signOut } = useAuth();

  async function loadData() {
    try {
      const [s, o, p, vp] = await Promise.all([
        getVendorStats(), getVendorOrders(), getVendorProducts('vendor-001'), getVendorProfile(),
      ]);
      setStats(s.stats || s);
      setOrders(o.orders || []);
      const vendorBags = p.products || [];
      setProducts(vendorBags);
      if (vendorBags.length > 0) setBagLive(vendorBags[0].active !== false);
      setVendor(vp.vendor || vp);
      setUnreadCount(getUnreadCount('vendor-001'));
    } catch (e) {
      console.log('Error loading dashboard:', e);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleMarkReady(orderId) {
    try {
      await updateOrderStatus(orderId, 'ready');
      Alert.alert('Success', 'Order marked as ready for pickup');
      loadData();
    } catch (e) { Alert.alert('Error', e.message || 'Failed to update order'); }
  }

  async function handleMarkCollected(orderId) {
    try {
      await updateOrderStatus(orderId, 'collected');
      Alert.alert('Success', 'Order marked as collected');
      loadData();
    } catch (e) { Alert.alert('Error', e.message || 'Failed to update order'); }
  }

  async function handleToggleBag(value) {
    setBagLive(value);
    if (products.length > 0) {
      try { await updateProduct(products[0].id, { active: value }); } catch (e) { console.log(e); }
    }
  }

  function onRefresh() { setRefreshing(true); loadData(); }

  const st = stats || { todaySold: 0, todayRemaining: 0, todayEarnings: 0, monthSold: 0, monthEarnings: 0 };
  const vendorName = vendor?.name || 'My Business';

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'All') return true;
    if (orderFilter === 'Pending') return o.status === 'paid';
    if (orderFilter === 'Ready') return o.status === 'ready';
    if (orderFilter === 'Collected') return o.status === 'collected' || o.status === 'done';
    return true;
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <View>
          <Text style={s.heading}>{vendorName}</Text>
          <Text style={s.sub}>Today's overview</Text>
        </View>
        <View style={s.topBarRight}>
          <TouchableOpacity style={s.topBtn} onPress={() => navigation.navigate('MyProducts')}>
            <Text style={s.topBtnText}>My Bags</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.topBtn} onPress={() => navigation.navigate('AddProduct')}>
            <Text style={s.topBtnText}>+ Bag</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.topBtn} onPress={() => navigation.navigate('Notifications')}>
            <Text style={s.topBtnText}>Inbox</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.bellBtn} onPress={() => navigation.navigate('Notifications')}>
            <Text style={s.bellIcon}>{'\u{1F514}'}</Text>
            {unreadCount > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        {/* Bag toggle */}
        <View style={s.toggleSection}>
          {products.length > 0 ? (
            <View style={s.toggleRow}>
              <View style={s.toggleInfo}>
                <Text style={s.toggleTitle}>{products[0].name}</Text>
                <Text style={s.toggleSub}>RM {products[0].priceNow} &middot; {products[0].pickupStart || '7:30'}&ndash;{products[0].pickupEnd || '8:30'} &middot; {bagLive ? (products[0].quantityLeft + ' / ' + products[0].quantityTotal + ' available') : 'Paused'}</Text>
              </View>
              <View style={s.toggleRight}>
                <View style={[s.livePill, !bagLive && s.livePillOff]}>
                  <Text style={[s.livePillText, !bagLive && s.livePillTextOff]}>{bagLive ? 'Live' : 'Paused'}</Text>
                </View>
                <Switch value={bagLive} onValueChange={handleToggleBag} trackColor={{ false: Colors.gray200, true: Colors.primaryLight }} thumbColor={Colors.white} />
              </View>
            </View>
          ) : (
            <View style={s.toggleRow}>
              <View style={s.toggleInfo}>
                <Text style={s.toggleTitle}>No bags listed</Text>
                <Text style={s.toggleSub}>Tap "+ Bag" to create your first listing</Text>
              </View>
            </View>
          )}
        </View>

        {/* Donation banner */}
        <View style={s.donateBanner}>
          <Text style={s.donateIcon}>{'\u{1F91D}'}</Text>
          <View style={s.donateBody}>
            <Text style={s.donateTitle}>Donation mode available</Text>
            <Text style={s.donateSub}>If bags are unsold by 8:00 PM, auto-donate to Rumah Nur Kasih shelter.</Text>
            <TouchableOpacity><Text style={s.donateLink}>Enable donation mode {'\u2192'}</Text></TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsGrid}>
          <View style={s.statCard}><Text style={s.statVal}>{st.todaySold}</Text><Text style={s.statLabel}>Bags sold today</Text><Text style={s.statSub}>RM {st.todayEarnings.toFixed(2)} earned</Text></View>
          <View style={s.statCard}><Text style={s.statVal}>{st.todayRemaining}</Text><Text style={s.statLabel}>Remaining today</Text><Text style={s.statSub}>Updated live</Text></View>
          <View style={s.statCard}><Text style={s.statVal}>{st.monthSold}</Text><Text style={s.statLabel}>Total bags sold</Text><Text style={s.statSub}>This month</Text></View>
          <TouchableOpacity style={[s.statCard, s.statCardGreen]} onPress={() => navigation.navigate('Earnings')}>
            <Text style={[s.statVal, { color: Colors.primary }]}>RM {st.monthEarnings.toLocaleString()}</Text>
            <Text style={s.statLabel}>Monthly earnings</Text>
            <Text style={s.statSub}>View details {'\u203A'}</Text>
          </TouchableOpacity>
        </View>

        {/* Order filter */}
        <View style={s.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterContent}>
            {ORDER_FILTERS.map(f => (
              <TouchableOpacity key={f} style={[s.filterChip, orderFilter === f && s.filterChipActive]} onPress={() => setOrderFilter(f)}>
                <Text style={[s.filterChipText, orderFilter === f && s.filterChipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Orders list */}
        {filteredOrders.length === 0 ? (
          <View style={s.emptyOrders}>
            <Text style={s.emptyOrdersIcon}>{'\u{1F4CB}'}</Text>
            <Text style={s.emptyOrdersText}>
              {orderFilter === 'All' ? 'No orders yet. Orders will appear here when customers reserve your bags.' : `No ${orderFilter.toLowerCase()} orders.`}
            </Text>
          </View>
        ) : (
          filteredOrders.map(order => (
            <TouchableOpacity key={order.id} style={s.orderRow} onPress={() => navigation.navigate('VendorOrderDetail', { orderId: order.id })} activeOpacity={0.7}>
              <Avatar initials={order.initials} bg={order.color} color={order.textColor} size={36} />
              <View style={s.orderInfo}>
                <Text style={s.orderName}>{order.buyerName}</Text>
                <Text style={s.orderMeta}>{order.id} &middot; RM {order.price}.00 &middot; {order.time}</Text>
              </View>
              {order.status === 'paid' && (
                <TouchableOpacity style={s.actionBtn} onPress={() => handleMarkReady(order.id)}>
                  <Text style={s.actionBtnText}>Ready</Text>
                </TouchableOpacity>
              )}
              {order.status === 'ready' && (
                <TouchableOpacity style={[s.actionBtn, s.actionBtnCollected]} onPress={() => handleMarkCollected(order.id)}>
                  <Text style={[s.actionBtnText, s.actionBtnCollectedText]}>Collected</Text>
                </TouchableOpacity>
              )}
              {(order.status === 'collected' || order.status === 'done') && (
                <StatusTag status="done" />
              )}
              {order.status !== 'collected' && order.status !== 'done' && order.status !== 'paid' && order.status !== 'ready' && (
                <StatusTag status={order.status} />
              )}
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  topBar: { backgroundColor: Colors.primary, padding: Spacing.lg, paddingBottom: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topBarRight: { flexDirection: 'row', gap: 6 },
  topBtn: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 6 },
  topBtnText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  bellBtn: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', justifyContent: 'center' },
  bellIcon: { fontSize: 16 },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
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
  filterRow: { marginBottom: Spacing.sm },
  filterContent: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.borderMedium, backgroundColor: Colors.bgPrimary },
  filterChipActive: { backgroundColor: Colors.primarySurface, borderColor: Colors.primaryLight },
  filterChipText: { ...Typography.label, color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.primaryDark },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight },
  orderInfo: { flex: 1 },
  orderName: { ...Typography.bodySm, fontWeight: '500', color: Colors.textPrimary },
  orderMeta: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  actionBtn: { backgroundColor: Colors.warning, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.sm },
  actionBtnText: { ...Typography.label, color: Colors.white, fontWeight: '600' },
  actionBtnCollected: { backgroundColor: Colors.primary },
  actionBtnCollectedText: { color: Colors.white },
  emptyOrders: { alignItems: 'center', padding: Spacing.xl },
  emptyOrdersIcon: { fontSize: 32, marginBottom: Spacing.sm },
  emptyOrdersText: { ...Typography.caption, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },
});
