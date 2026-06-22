import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Platform, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { BagCard } from '../../components/buyer/BagCard';
import { getVendorById, getBags } from '../../services/api';

export default function VendorStorefrontScreen({ route, navigation }) {
  const { vendorId } = route.params;
  const [vendor, setVendor] = useState(null);
  const [bags, setBags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getVendorById(vendorId),
      getBags({}),
    ]).then(([vRes, bRes]) => {
      setVendor(vRes.vendor || vRes);
      const vendorBags = (bRes.bags || []).filter(b => b.vendorId === vendorId);
      setBags(vendorBags);
    }).catch(console.log).finally(() => setLoading(false));
  }, [vendorId]);

  function openDirections() {
    if (!vendor) return;
    const url = Platform.select({
      ios: `maps:0,0?q=${vendor.lat},${vendor.lng}`,
      android: `geo:0,0?q=${vendor.lat},${vendor.lng}(${vendor.name})`,
    });
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url);
    });
  }

  const v = vendor || {};

  async function handleShare() {
    try {
      await Share.share({
        message: `Check out ${v.name || 'this vendor'} on FoodLoop! ${v.rating ? v.rating + ' star rating \u2022 ' : ''}${bags.length} bags available. Download FoodLoop to discover surplus food near you!`,
      });
    } catch (e) { console.log(e); }
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={s.title} numberOfLines={1}>{v.name || 'Vendor'}</Text>
        <TouchableOpacity onPress={handleShare} style={s.shareBtn} accessibilityLabel="Share this vendor">
          <Text style={s.shareBtnText}>{'\u{1F4E4}'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Vendor profile card */}
        <View style={s.profileCard}>
          <View style={[s.avatar, { backgroundColor: v.color + '22' || '#eee' }]}>
            <Text style={[s.avatarText, { color: v.color || Colors.textPrimary }]}>{v.initials || '?'}</Text>
          </View>
          <Text style={s.vendorName}>{v.name || ''}</Text>
          <Text style={s.vendorAddress}>{v.address || ''}</Text>
          <View style={s.ratingRow}>
            <Text style={s.ratingStar}>{'\u2605'}</Text>
            <Text style={s.ratingText}>{v.rating || '0.0'}</Text>
            <Text style={s.reviewCount}>({v.reviewCount || 0} reviews)</Text>
          </View>
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statVal}>{loading ? '...' : bags.length}</Text>
              <Text style={s.statLabel}>Bags available</Text>
            </View>
          </View>
          <TouchableOpacity style={s.directionsBtn} onPress={openDirections}>
            <Text style={s.directionsBtnText}>{'\u{1F4CD}'} Get Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Bag list */}
        <Text style={s.sectionTitle}>Available bags from {v.name || 'this vendor'}</Text>
        {bags.length === 0 && !loading ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>{'\u{1F6D2}'}</Text>
            <Text style={s.emptyText}>No bags available right now. Check back later!</Text>
          </View>
        ) : (
          bags.map(bag => (
            <BagCard key={bag.id} bag={bag} onPress={(b) => navigation.navigate('BagDetail', { bagId: b.id })} />
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
  shareBtn: { padding: Spacing.sm },
  shareBtnText: { fontSize: 20 },
  title: { ...Typography.headingSm, color: Colors.textPrimary, flex: 1, textAlign: 'center' },
  profileCard: { alignItems: 'center', padding: Spacing.lg, margin: Spacing.lg, backgroundColor: Colors.bgPrimary, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.borderLight },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  avatarText: { fontSize: 24, fontWeight: '700' },
  vendorName: { ...Typography.headingMd, color: Colors.textPrimary, marginBottom: 2 },
  vendorAddress: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.sm },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.md },
  ratingStar: { fontSize: 16, color: '#F59E0B' },
  ratingText: { ...Typography.bodySm, fontWeight: '600', color: Colors.textPrimary },
  reviewCount: { ...Typography.caption, color: Colors.textSecondary },
  statsRow: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.md },
  statItem: { alignItems: 'center' },
  statVal: { ...Typography.headingMd, color: Colors.primary },
  statLabel: { ...Typography.caption, color: Colors.textSecondary },
  directionsBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  directionsBtnText: { ...Typography.bodySm, color: Colors.white, fontWeight: '600' },
  sectionTitle: { ...Typography.headingSm, color: Colors.textPrimary, paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  empty: { alignItems: 'center', padding: Spacing.xl },
  emptyIcon: { fontSize: 32, marginBottom: Spacing.sm },
  emptyText: { ...Typography.caption, color: Colors.textSecondary, textAlign: 'center' },
});
