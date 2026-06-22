import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { Avatar } from '../../components/common';
import { getVendorProducts, updateProduct, deleteProduct, addProduct } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function MyProductsScreen({ navigation }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async () => {
    try {
      const res = await getVendorProducts(user?.email || 'vendor-001');
      setProducts(res.products || []);
    } catch (e) { console.log('Error loading products:', e); }
    finally { setRefreshing(false); }
  };

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { const unsub = navigation.addListener('focus', loadProducts); return unsub; }, [navigation]);

  async function handleToggle(bagId, currentActive) {
    try { await updateProduct(bagId, { active: !currentActive }); loadProducts(); }
    catch (e) { Alert.alert('Error', 'Failed to update bag status'); }
  }

  function handleDuplicate(bag) {
    Alert.alert('Duplicate Bag', `Create a copy of "${bag.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Duplicate',
        onPress: async () => {
          try {
            await addProduct({
              name: bag.name + ' (Copy)',
              description: bag.description,
              contents: bag.contents,
              category: bag.category,
              halal: bag.halal,
              priceNow: bag.priceNow,
              priceOriginal: bag.priceOriginal,
              pickupStart: bag.pickupStart,
              pickupEnd: bag.pickupEnd,
              pickupAddress: bag.pickupAddress,
              quantityTotal: bag.quantityTotal,
              tags: bag.tags || [],
              vendorId: 'vendor-001',
              vendor: 'Sunrise Bakery',
            });
            Alert.alert('Success', 'Bag duplicated!');
            loadProducts();
          } catch (e) { Alert.alert('Error', 'Failed to duplicate bag'); }
        },
      },
    ]);
  }

  function handleDelete(bag) {
    Alert.alert('Delete Bag', `Are you sure you want to delete "${bag.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteProduct(bag.id); Alert.alert('Deleted', 'Bag has been removed'); loadProducts(); }
        catch (e) { Alert.alert('Error', 'Failed to delete bag'); }
      }},
    ]);
  }

  function onRefresh() { setRefreshing(true); loadProducts(); }

  function sellThrough(bag) {
    if (!bag.quantityTotal) return 0;
    const sold = bag.quantityTotal - (bag.quantityLeft || 0);
    return Math.round((sold / bag.quantityTotal) * 100);
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.backText}>{'\u2039'} Back</Text></TouchableOpacity>
        <Text style={s.heading}>My Bags</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddProduct')}><Text style={s.addBtn}>+ Add</Text></TouchableOpacity>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={s.scroll}>
        {products.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>{'\u{1F6D2}'}</Text>
            <Text style={s.emptyTitle}>No bags yet</Text>
            <Text style={s.emptyText}>Tap "+ Add" to list your first surprise bag.</Text>
          </View>
        ) : (
          products.map(bag => (
            <View key={bag.id} style={s.card}>
              <TouchableOpacity onPress={() => navigation.navigate('EditProduct', { bagId: bag.id })} activeOpacity={0.85}>
                <View style={s.cardHeader}>
                  <View style={[s.colorBar, { backgroundColor: bag.imageColor || '#1D9E75' }]} />
                  <View style={s.cardInfo}>
                    <Text style={s.bagName} numberOfLines={1}>{bag.name}</Text>
                    <Text style={s.bagMeta}>{bag.category} &middot; RM {bag.priceNow} &middot; {bag.quantityLeft}/{bag.quantityTotal} left</Text>
                  </View>
                  <View style={[s.statusPill, !bag.active && s.statusPillOff]}>
                    <Text style={[s.statusPillText, !bag.active && s.statusPillTextOff]}>{bag.active ? 'Live' : 'Paused'}</Text>
                  </View>
                </View>

                {/* Analytics row */}
                <View style={s.analyticsRow}>
                  <View style={s.analyticItem}>
                    <Text style={s.analyticVal}>{bag.views || 0}</Text>
                    <Text style={s.analyticLabel}>Views</Text>
                  </View>
                  <View style={s.analyticItem}>
                    <Text style={s.analyticVal}>{bag.orders || 0}</Text>
                    <Text style={s.analyticLabel}>Orders</Text>
                  </View>
                  <View style={s.analyticItem}>
                    <Text style={s.analyticVal}>{sellThrough(bag)}%</Text>
                    <Text style={s.analyticLabel}>Sell-through</Text>
                  </View>
                  <View style={s.analyticItem}>
                    <Text style={s.analyticVal}>{bag.rating ? bag.rating.toFixed(1) : 'New'}</Text>
                    <Text style={s.analyticLabel}>Rating</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Actions */}
              <View style={s.cardActions}>
                <View style={s.toggleGroup}>
                  <Switch value={bag.active} onValueChange={() => handleToggle(bag.id, bag.active)} trackColor={{ false: Colors.gray200, true: Colors.primaryLight }} thumbColor={Colors.white} />
                </View>
                <View style={s.actionBtns}>
                  <TouchableOpacity style={s.dupBtn} onPress={() => handleDuplicate(bag)}>
                    <Text style={s.dupBtnText}>Duplicate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(bag)}>
                    <Text style={s.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
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
  topBar: { backgroundColor: Colors.primary, padding: Spacing.lg, paddingBottom: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backText: { color: Colors.white, ...Typography.bodySm, width: 50 },
  heading: { ...Typography.headingMd, color: Colors.white, textAlign: 'center' },
  addBtn: { color: Colors.white, ...Typography.bodySm, fontWeight: '600', width: 50, textAlign: 'right' },
  scroll: { padding: Spacing.lg },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 40, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.headingSm, color: Colors.textPrimary, marginBottom: Spacing.xs },
  emptyText: { ...Typography.caption, color: Colors.textSecondary, textAlign: 'center' },
  card: { backgroundColor: Colors.bgPrimary, borderRadius: Radius.lg, marginBottom: Spacing.md, borderWidth: 0.5, borderColor: Colors.borderLight, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  colorBar: { width: 6, height: 44, borderRadius: 3, marginRight: Spacing.md },
  cardInfo: { flex: 1 },
  bagName: { ...Typography.headingSm, color: Colors.textPrimary },
  bagMeta: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  statusPill: { backgroundColor: Colors.primarySurface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusPillOff: { backgroundColor: Colors.bgSecondary },
  statusPillText: { ...Typography.label, fontSize: 10, color: Colors.primaryDark, fontWeight: '600' },
  statusPillTextOff: { color: Colors.textSecondary },
  analyticsRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight },
  analyticItem: { flex: 1, alignItems: 'center' },
  analyticVal: { ...Typography.bodySm, fontWeight: '600', color: Colors.textPrimary },
  analyticLabel: { ...Typography.label, fontSize: 10, color: Colors.textTertiary, marginTop: 1 },
  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, paddingTop: Spacing.sm },
  toggleGroup: { flexDirection: 'row', alignItems: 'center' },
  actionBtns: { flexDirection: 'row', gap: Spacing.sm },
  dupBtn: { backgroundColor: Colors.bgSecondary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.sm, borderWidth: 0.5, borderColor: Colors.borderMedium },
  dupBtnText: { ...Typography.label, color: Colors.textSecondary },
  deleteBtn: { backgroundColor: Colors.danger, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.sm },
  deleteBtnText: { ...Typography.label, color: Colors.white, fontWeight: '600' },
});
