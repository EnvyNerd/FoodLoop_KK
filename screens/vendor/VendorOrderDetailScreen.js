import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { Avatar, StatusTag } from '../../components/common';
import { getOrderById, updateOrderStatus } from '../../services/api';

const STATUS_STEPS = [
  { key: 'paid', label: 'Paid', icon: '\u{1F4B3}' },
  { key: 'ready', label: 'Ready for pickup', icon: '\u{1F381}' },
  { key: 'collected', label: 'Collected', icon: '\u2705' },
];

function getStatusIndex(status) {
  const map = { paid: 0, ready: 1, ready_for_pickup: 1, collected: 2, done: 2 };
  return map[status] ?? 0;
}

export default function VendorOrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(orderId)
      .then(res => { setOrder(res.order); setLoading(false); })
      .catch(() => setLoading(false));
  }, [orderId]);

  async function handleMarkReady() {
    try {
      const res = await updateOrderStatus(orderId, 'ready');
      setOrder(res.order);
      Alert.alert('Success', 'Order marked as ready for pickup');
    } catch (e) { Alert.alert('Error', e.message || 'Failed to update'); }
  }

  async function handleMarkCollected() {
    try {
      const res = await updateOrderStatus(orderId, 'collected');
      setOrder(res.order);
      Alert.alert('Success', 'Order marked as collected');
    } catch (e) { Alert.alert('Error', e.message || 'Failed to update'); }
  }

  if (loading || !order) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.backText}>{'\u2039'} Back</Text></TouchableOpacity>
          <Text style={s.heading}>Order Detail</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={s.center}><Text style={s.loadingText}>Loading...</Text></View>
      </SafeAreaView>
    );
  }

  const currentStep = getStatusIndex(order.status);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.backText}>{'\u2039'} Back</Text></TouchableOpacity>
        <Text style={s.heading}>Order {order.id}</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>

        {/* Status tracker */}
        <View style={s.tracker}>
          {STATUS_STEPS.map((step, i) => (
            <React.Fragment key={step.key}>
              <View style={s.stepCol}>
                <View style={[s.stepDot, i <= currentStep && s.stepDotActive]}>
                  <Text style={[s.stepIcon, i <= currentStep && s.stepIconActive]}>{step.icon}</Text>
                </View>
                <Text style={[s.stepLabel, i <= currentStep && s.stepLabelActive]}>{step.label}</Text>
              </View>
              {i < STATUS_STEPS.length - 1 && (
                <View style={[s.stepLine, i < currentStep && s.stepLineActive]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Buyer info */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{'\u{1F464}'} Buyer information</Text>
          <View style={s.buyerRow}>
            <Avatar initials={order.vendorInitials || '?'} bg={order.vendorColor || '#E1F5EE'} color={order.vendorTextColor || '#085041'} size={42} />
            <View style={s.buyerInfo}>
              <Text style={s.buyerName}>{order.buyerName || 'Customer'}</Text>
              <Text style={s.buyerMeta}>{order.id} &middot; {order.date}</Text>
            </View>
            <StatusTag status={order.status === 'ready' ? 'pickup' : order.status} />
          </View>
        </View>

        {/* Order details */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{'\u{1F4E6}'} Order details</Text>
          <View style={s.infoGrid}>
            <View style={s.infoItem}><Text style={s.infoLabel}>Bag</Text><Text style={s.infoValue}>{order.bagName}</Text></View>
            <View style={s.infoItem}><Text style={s.infoLabel}>Amount</Text><Text style={s.infoValue}>RM {order.price.toFixed(2)}</Text></View>
            <View style={s.infoItem}><Text style={s.infoLabel}>Pickup window</Text><Text style={s.infoValue}>{order.pickupWindow}</Text></View>
            <View style={s.infoItem}><Text style={s.infoLabel}>Status</Text><Text style={s.infoValue}>{order.status}</Text></View>
          </View>
        </View>

        {/* QR verification */}
        <View style={s.qrSection}>
          <Text style={s.qrTitle}>Verify pickup with QR code</Text>
          <View style={s.qrCard}>
            <QRCode
              value={JSON.stringify({ orderId: order.id, bagId: order.bagId, vendor: order.vendor, bagName: order.bagName, price: order.price })}
              size={120}
              color={Colors.textPrimary}
              backgroundColor={Colors.bgPrimary}
            />
            <Text style={s.qrMeta}>{order.id} &middot; RM {order.price.toFixed(2)}</Text>
          </View>
          <Text style={s.qrNote}>Ask the buyer to show their QR code, or scan it to verify pickup.</Text>
        </View>

        {/* Action buttons */}
        {order.status === 'paid' && (
          <TouchableOpacity style={s.actionBtn} onPress={handleMarkReady}>
            <Text style={s.actionBtnText}>{'\u2705'} Mark as Ready</Text>
          </TouchableOpacity>
        )}
        {order.status === 'ready' && (
          <TouchableOpacity style={[s.actionBtn, s.actionBtnCollected]} onPress={handleMarkCollected}>
            <Text style={[s.actionBtnText, s.actionBtnCollectedText]}>{'\u{1F381}'} Mark as Collected</Text>
          </TouchableOpacity>
        )}
        {(order.status === 'collected' || order.status === 'done') && (
          <View style={s.completedBanner}>
            <Text style={s.completedText}>{'\u2705'} This order has been completed</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  topBar: { backgroundColor: Colors.primary, padding: Spacing.lg, paddingBottom: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backText: { color: Colors.white, ...Typography.bodySm, width: 50 },
  heading: { ...Typography.headingMd, color: Colors.white, textAlign: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...Typography.bodyMd, color: Colors.textSecondary },
  scroll: { padding: Spacing.lg },
  tracker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg, paddingHorizontal: Spacing.md },
  stepCol: { alignItems: 'center', width: 80 },
  stepDot: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgTertiary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.gray200 },
  stepDotActive: { backgroundColor: Colors.primarySurface, borderColor: Colors.primary },
  stepIcon: { fontSize: 16, opacity: 0.4 },
  stepIconActive: { opacity: 1 },
  stepLabel: { ...Typography.label, color: Colors.textTertiary, marginTop: 6, textAlign: 'center' },
  stepLabelActive: { color: Colors.primaryDark, fontWeight: '600' },
  stepLine: { flex: 1, height: 2, backgroundColor: Colors.gray200, marginTop: 20 },
  stepLineActive: { backgroundColor: Colors.primary },
  card: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg },
  cardTitle: { ...Typography.bodySm, fontWeight: '500', color: Colors.textPrimary, marginBottom: Spacing.sm },
  buyerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  buyerInfo: { flex: 1 },
  buyerName: { ...Typography.headingSm, color: Colors.textPrimary },
  buyerMeta: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  infoItem: { width: '47%', backgroundColor: Colors.bgPrimary, borderRadius: Radius.md, padding: Spacing.sm },
  infoLabel: { ...Typography.label, color: Colors.textTertiary },
  infoValue: { ...Typography.bodySm, color: Colors.textPrimary, marginTop: 2 },
  qrSection: { alignItems: 'center', marginBottom: Spacing.lg },
  qrTitle: { ...Typography.bodySm, color: Colors.textSecondary, marginBottom: Spacing.md },
  qrCard: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center' },
  qrMeta: { ...Typography.caption, color: Colors.textSecondary, marginTop: Spacing.sm },
  qrNote: { ...Typography.caption, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 16 },
  actionBtn: { backgroundColor: Colors.warning, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center', marginBottom: Spacing.md },
  actionBtnText: { ...Typography.headingSm, color: Colors.white },
  actionBtnCollected: { backgroundColor: Colors.primary },
  actionBtnCollectedText: { color: Colors.white },
  completedBanner: { backgroundColor: Colors.primarySurface, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  completedText: { ...Typography.bodySm, color: Colors.primaryDark, fontWeight: '600' },
});
