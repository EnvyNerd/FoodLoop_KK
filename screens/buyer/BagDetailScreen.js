import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { HalalBadge, PrimaryButton } from '../../components/common';
import { getBagById, createOrder } from '../../services/api';
import { formatPickupWindow } from '../../utils/time';

const CAT_EMOJI = { Bakery: '\u{1F556}', Cafe: '\u2615', Restaurant: '\u{1F371}', Hotel: '\u{1F37D}\uFE0F', Supermarket: '\u{1F6D2}' };

export default function BagDetailScreen({ route, navigation }) {
  const { bagId } = route.params;
  const [bag, setBag] = useState(null);
  const [reserved, setReserved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    getBagById(bagId).then(res => { setBag(res.bag); setLoading(false); }).catch(() => setLoading(false));
  }, [bagId]);

  async function handleReserve() {
    try {
      const res = await createOrder(bagId);
      setOrderId(res.order?.id);
      setReserved(true);
    } catch (e) { console.log('Reserve error:', e); }
  }

  async function handleShare() {
    try {
      await Share.share({
        message: `Check out "${bag.name}" at ${bag.vendor} for only RM ${bag.priceNow} (was RM ${bag.priceOriginal})! Pickup: ${formatPickupWindow(bag.pickupStart, bag.pickupEnd)}. Download FoodLoop to reserve yours!`,
      });
    } catch (e) { console.log(e); }
  }

  if (loading || !bag) return (<SafeAreaView style={s.container}><Text style={{ textAlign: 'center', marginTop: 100 }}>Loading...</Text></SafeAreaView>);

  if (reserved) {
    return (
      <SafeAreaView style={[s.container, { alignItems: 'center', paddingHorizontal: Spacing.xl }]}>
        <View style={s.confirmIcon}><Text style={{ fontSize: 32 }}>{'\u2713'}</Text></View>
        <Text style={s.confirmTitle}>Bag reserved!</Text>
        <Text style={s.confirmSub}>Show this QR code at the counter between {formatPickupWindow(bag.pickupStart, bag.pickupEnd)} tonight.</Text>
        <View style={s.qrCard}>
          <QRCode
            value={JSON.stringify({
              orderId: orderId || 'FL-0000',
              bagId: bag.id,
              vendorId: bag.vendorId,
              vendor: bag.vendor,
              bagName: bag.name,
              price: bag.priceNow,
              pickupStart: bag.pickupStart,
              pickupEnd: bag.pickupEnd,
              pickupAddress: bag.pickupAddress,
            })}
            size={120}
            color={Colors.textPrimary}
            backgroundColor={Colors.bgPrimary}
          />
          <Text style={s.qrVendor}>{bag.vendor}</Text>
          <Text style={s.qrMeta}>Order {orderId || 'FL-0000'} · RM {bag.priceNow}.00</Text>
        </View>
        <TouchableOpacity style={s.backToListBtn} onPress={() => navigation.navigate('HomeTab')}>
          <Text style={s.backToListText}>Back to bags</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const savePct = Math.round(((bag.priceOriginal - bag.priceNow) / bag.priceOriginal) * 100);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.hero}>
        {bag.image ? (
          <Image source={bag.image} style={s.heroImg} resizeMode="cover" />
        ) : (
          <View style={[s.heroFallback, { backgroundColor: bag.imageColor }]}>
            <Text style={s.heroIcon}>{CAT_EMOJI[bag.category] || '\u{1F6D2}'}</Text>
          </View>
        )}
        <View style={s.heroOverlay} />
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}><Text style={s.backBtnText}>{'\u2039'} Back</Text></TouchableOpacity>
        <TouchableOpacity style={s.shareBtn} onPress={handleShare} accessibilityLabel="Share this bag"><Text style={s.shareBtnText}>{'\u{1F4E4}'}</Text></TouchableOpacity>
      </View>
      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        <View style={s.headerRow}>
          <Text style={s.name}>{bag.name}</Text>
          <HalalBadge status={bag.halal} size="lg" />
        </View>
        <View style={s.metaRow}><Text style={s.metaIcon}>{'\u{1F3E8}'}</Text><Text style={s.metaText}>{bag.vendor}</Text></View>
        <View style={s.metaRow}><Text style={s.metaIcon}>{'\u{1F4CD}'}</Text><Text style={s.metaText}>{bag.pickupAddress}</Text></View>
        <View style={s.metaRow}><Text style={s.metaIcon}>{'\u23F0'}</Text><Text style={s.metaText}>Pickup: {formatPickupWindow(bag.pickupStart, bag.pickupEnd)}</Text></View>
        <View style={s.metaRow}><Text style={s.metaIcon}>{'\u{1F6D2}'}</Text><Text style={s.metaText}>{bag.quantityLeft} bags remaining today</Text></View>
        <View style={s.section}><Text style={s.sectionTitle}>What's inside</Text><Text style={s.description}>{bag.description}</Text></View>
        <View style={s.section}><Text style={s.sectionTitle}>Tags</Text><View style={s.tagsRow}>{bag.tags.map(t => (<View key={t} style={s.tag}><Text style={s.tagText}>{t}</Text></View>))}</View></View>
        <View style={s.section}><Text style={s.sectionTitle}>Vendor rating</Text><View style={s.ratingRow}><Text style={s.stars}>{'\u2605'.repeat(Math.round(bag.rating))}{'\u2606'.repeat(5 - Math.round(bag.rating))}</Text><Text style={s.ratingText}>{bag.rating.toFixed(1)} · {bag.reviewCount} reviews</Text></View></View>
        <View style={{ height: 100 }} />
      </ScrollView>
      <View style={s.reserveBar}>
        <View style={s.priceRow}>
          <View><Text style={s.priceNow}>RM {bag.priceNow}</Text><Text style={s.priceWas}>was RM {bag.priceOriginal}</Text></View>
          <View style={s.savePill}><Text style={s.savePillText}>Save {savePct}%</Text></View>
        </View>
        <PrimaryButton label="Reserve this bag" onPress={handleReserve} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  hero: { height: 200, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(0,0,0,0.2)' },
  heroFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: Radius.sm, paddingHorizontal: 12, paddingVertical: 6, zIndex: 2 },
  backBtnText: { color: Colors.white, ...Typography.bodySm },
  shareBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 6, zIndex: 2 },
  shareBtnText: { fontSize: 16 },
  heroIcon: { fontSize: 60 },
  body: { flex: 1, padding: Spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  name: { ...Typography.headingLg, color: Colors.textPrimary, flex: 1, marginRight: Spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  metaIcon: { fontSize: 15, width: 22 },
  metaText: { ...Typography.bodySm, color: Colors.textSecondary, flex: 1 },
  section: { marginTop: Spacing.lg },
  sectionTitle: { ...Typography.label, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: Spacing.sm },
  description: { ...Typography.bodySm, color: Colors.textSecondary, lineHeight: 20 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  tag: { backgroundColor: Colors.bgSecondary, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  tagText: { ...Typography.caption, color: Colors.textSecondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stars: { color: Colors.warning, fontSize: 16 },
  ratingText: { ...Typography.bodySm, color: Colors.textSecondary },
  reserveBar: { padding: Spacing.lg, borderTopWidth: 0.5, borderTopColor: Colors.borderLight, backgroundColor: Colors.bgPrimary },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  priceNow: { ...Typography.displayMd, color: Colors.primary },
  priceWas: { ...Typography.caption, color: Colors.textTertiary, textDecorationLine: 'line-through' },
  savePill: { backgroundColor: Colors.primarySurface, paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full },
  savePillText: { ...Typography.label, color: Colors.primaryDark },
  confirmIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primarySurface, alignItems: 'center', justifyContent: 'center', marginTop: 60, marginBottom: Spacing.md },
  confirmTitle: { ...Typography.headingLg, color: Colors.textPrimary, marginBottom: Spacing.sm },
  confirmSub: { ...Typography.bodySm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.xl },
  qrCard: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.lg, padding: Spacing.xl, width: '100%', alignItems: 'center', marginBottom: Spacing.xl },
  qrPlaceholder: { width: 120, height: 120, backgroundColor: Colors.bgPrimary, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, borderWidth: 0.5, borderColor: Colors.borderLight },
  qrVendor: { ...Typography.headingSm, color: Colors.textPrimary, marginBottom: 4 },
  qrMeta: { ...Typography.caption, color: Colors.textSecondary },
  backToListBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 14, paddingHorizontal: 40, marginTop: 'auto', marginBottom: Spacing.xl },
  backToListText: { ...Typography.headingSm, color: Colors.white },
});
