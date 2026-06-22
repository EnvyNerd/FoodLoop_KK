import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { HalalBadge } from '../common';
import { formatPickupWindow } from '../../utils/time';

export function BagCard({ bag, onPress, onVendorPress }) {
  const savePct = Math.round(((bag.priceOriginal - bag.priceNow) / bag.priceOriginal) * 100);
  const isLow = bag.quantityLeft <= 3;
  const catEmoji = { Bakery: '\u{1F556}', Cafe: '\u2615', Restaurant: '\u{1F371}', Hotel: '\u{1F37D}\uFE0F', Supermarket: '\u{1F6D2}' };
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(bag)} activeOpacity={0.92}>
      <View style={styles.imgArea}>
        {bag.image ? (
          <Image source={bag.image} style={styles.img} resizeMode="cover" />
        ) : (
          <View style={[styles.imgFallback, { backgroundColor: bag.imageColor + '22' }]}>
            <Text style={[styles.imgIcon, { color: bag.imageColor }]}>{catEmoji[bag.category] || '\u{1F6D2}'}</Text>
          </View>
        )}
        <View style={styles.imgOverlay} />
        <View style={styles.imgTopRow}>
          <HalalBadge status={bag.halal} />
          {isLow ? (
            <View style={styles.lowTag}><Text style={styles.lowTagText}>{bag.quantityLeft} left!</Text></View>
          ) : (
            <View style={styles.qtyTag}><Text style={styles.qtyTagText}>{bag.quantityLeft} left</Text></View>
          )}
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{bag.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{bag.distance} km away</Text>
          {onVendorPress ? (
            <TouchableOpacity onPress={() => onVendorPress(bag)}>
              <Text style={styles.vendorLink}>{bag.vendor}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.meta}> · {bag.vendor}</Text>
          )}
          <Text style={styles.meta}> · {bag.category}</Text>
        </View>
        <View style={styles.footer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceNow}>RM {bag.priceNow}</Text>
            <Text style={styles.priceWas}>RM {bag.priceOriginal}</Text>
            <View style={styles.savePill}><Text style={styles.savePillText}>-{savePct}%</Text></View>
          </View>
          <Text style={styles.pickup}>{'\u23F0'} {formatPickupWindow(bag.pickupStart, bag.pickupEnd)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.bgPrimary, borderRadius: Radius.lg, marginHorizontal: Spacing.lg, marginBottom: Spacing.md, borderWidth: 0.5, borderColor: Colors.borderLight, overflow: 'hidden', ...Shadows.card },
  imgArea: { height: 140, position: 'relative' },
  img: { width: '100%', height: '100%' },
  imgFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imgIcon: { fontSize: 44 },
  imgOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, backgroundColor: 'rgba(0,0,0,0.15)' },
  imgTopRow: { position: 'absolute', top: 8, left: 8, right: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lowTag: { backgroundColor: Colors.nonHalalBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  lowTagText: { ...Typography.label, fontSize: 10, color: Colors.nonHalalText },
  qtyTag: { backgroundColor: Colors.bgPrimary + 'CC', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  qtyTagText: { ...Typography.label, fontSize: 10, color: Colors.textSecondary },
  body: { padding: Spacing.md },
  name: { ...Typography.headingSm, color: Colors.textPrimary, marginBottom: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: Spacing.sm },
  meta: { ...Typography.caption, color: Colors.textSecondary },
  vendorLink: { ...Typography.caption, color: Colors.primary, textDecorationLine: 'underline' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priceNow: { ...Typography.headingMd, color: Colors.primary },
  priceWas: { ...Typography.caption, color: Colors.textTertiary, textDecorationLine: 'line-through' },
  savePill: { backgroundColor: Colors.primarySurface, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full },
  savePillText: { ...Typography.label, fontSize: 10, color: Colors.primaryDark },
  pickup: { ...Typography.caption, color: Colors.textSecondary },
});
