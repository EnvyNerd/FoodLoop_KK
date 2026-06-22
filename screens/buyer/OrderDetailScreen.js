import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { Avatar, StatusTag } from '../../components/common';
import { getOrderById } from '../../services/api';

const STATUS_STEPS = [
  { key: 'paid', label: 'Paid', icon: '\u{1F4B3}' },
  { key: 'ready', label: 'Ready for pickup', icon: '\u{1F381}' },
  { key: 'collected', label: 'Collected', icon: '\u2705' },
];

function getStatusIndex(status) {
  const map = { paid: 0, ready: 1, ready_for_pickup: 1, collected: 2 };
  return map[status] ?? 0;
}

function getPickupCountdown(pickupStart) {
  try {
    const now = new Date();
    const [h, m] = pickupStart.split(':').map(Number);
    const pickup = new Date();
    pickup.setHours(h, m, 0, 0);
    const diff = pickup - now;
    if (diff <= 0) return 'Pickup has started';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `Pickup starts in ${hours}h ${mins}m`;
    return `Pickup starts in ${mins} min`;
  } catch {
    return null;
  }
}

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(orderId)
      .then(res => { setOrder(res.order); setLoading(false); })
      .catch(() => setLoading(false));
  }, [orderId]);

  if (loading || !order) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.backText}>{'\u2039'} Back</Text>
          </TouchableOpacity>
          <Text style={s.heading}>Order Detail</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={s.center}><Text style={s.loadingText}>Loading...</Text></View>
      </SafeAreaView>
    );
  }

  const currentStep = getStatusIndex(order.status);
  const countdown = getPickupCountdown(order.pickupWindow?.split('\u2013')[0]?.trim());

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>{'\u2039'} Back</Text>
        </TouchableOpacity>
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

        {/* Countdown */}
        {countdown && order.status === 'paid' && (
          <View style={s.countdownBanner}>
            <Text style={s.countdownIcon}>{'\u23F0'}</Text>
            <Text style={s.countdownText}>{countdown}</Text>
          </View>
        )}

        {/* Order info card */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Avatar initials={order.vendorInitials} bg={order.vendorColor} color={order.vendorTextColor} size={42} />
            <View style={s.cardHeaderInfo}>
              <Text style={s.bagName}>{order.bagName}</Text>
              <Text style={s.vendorName}>{order.vendor}</Text>
            </View>
            <StatusTag status={order.status === 'ready' ? 'pickup' : order.status} />
          </View>

          <View style={s.infoGrid}>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>Order ID</Text>
              <Text style={s.infoValue}>{order.id}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>Amount</Text>
              <Text style={s.infoValue}>RM {order.price.toFixed(2)}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>Date</Text>
              <Text style={s.infoValue}>{order.date}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>Pickup window</Text>
              <Text style={s.infoValue}>{order.pickupWindow}</Text>
            </View>
          </View>
        </View>

        {/* QR Code */}
        <View style={s.qrSection}>
          <Text style={s.qrTitle}>Show this QR code at pickup</Text>
          <View style={s.qrCard}>
            <QRCode
              value={JSON.stringify({
                orderId: order.id,
                bagId: order.bagId,
                vendor: order.vendor,
                bagName: order.bagName,
                price: order.price,
              })}
              size={140}
              color={Colors.textPrimary}
              backgroundColor={Colors.bgPrimary}
            />
            <Text style={s.qrMeta}>{order.id} &middot; RM {order.price.toFixed(2)}</Text>
          </View>
        </View>

        {/* Pickup instructions */}
        <View style={s.instructionsCard}>
          <Text style={s.instructionsTitle}>{'\u{1F4CB}'} Pickup instructions</Text>
          <Text style={s.instructionsText}>1. Arrive at the vendor during your pickup window: <Text style={s.bold}>{order.pickupWindow}</Text></Text>
          <Text style={s.instructionsText}>2. Show the QR code above to the staff</Text>
          <Text style={s.instructionsText}>3. Staff will scan or verify your order ID: <Text style={s.bold}>{order.id}</Text></Text>
          <Text style={s.instructionsText}>4. Collect your surprise bag and enjoy!</Text>
        </View>

        {/* Vendor contact */}
        <View style={s.vendorCard}>
          <Text style={s.vendorCardTitle}>{'\u{1F4AC}'} Vendor contact</Text>
          <Text style={s.vendorCardName}>{order.vendor}</Text>
          <Text style={s.vendorCardNote}>If you have questions about your order, contact the vendor directly at their store during business hours.</Text>
        </View>

        {/* Rate order (only for collected) */}
        {order.status === 'collected' && (
          <TouchableOpacity style={s.rateBtn}>
            <Text style={s.rateBtnText}>{'\u2605'} Rate this order</Text>
          </TouchableOpacity>
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

  /* Status tracker */
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

  /* Countdown */
  countdownBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.primarySurface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg },
  countdownIcon: { fontSize: 18 },
  countdownText: { ...Typography.bodySm, color: Colors.primaryDark, fontWeight: '500' },

  /* Order card */
  card: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  cardHeaderInfo: { flex: 1 },
  bagName: { ...Typography.headingSm, color: Colors.textPrimary },
  vendorName: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  infoItem: { width: '47%', backgroundColor: Colors.bgPrimary, borderRadius: Radius.md, padding: Spacing.sm },
  infoLabel: { ...Typography.label, color: Colors.textTertiary },
  infoValue: { ...Typography.bodySm, color: Colors.textPrimary, marginTop: 2 },

  /* QR */
  qrSection: { alignItems: 'center' },
  qrTitle: { ...Typography.bodySm, color: Colors.textSecondary, marginBottom: Spacing.md },
  qrCard: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center' },
  qrMeta: { ...Typography.caption, color: Colors.textSecondary, marginTop: Spacing.sm },

  /* Instructions */
  instructionsCard: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg },
  instructionsTitle: { ...Typography.bodySm, fontWeight: '500', color: Colors.textPrimary, marginBottom: Spacing.sm },
  instructionsText: { ...Typography.caption, color: Colors.textSecondary, lineHeight: 20, marginBottom: 4 },
  bold: { fontWeight: '600', color: Colors.textPrimary },

  /* Vendor contact */
  vendorCard: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg },
  vendorCardTitle: { ...Typography.bodySm, fontWeight: '500', color: Colors.textPrimary, marginBottom: Spacing.xs },
  vendorCardName: { ...Typography.headingSm, color: Colors.primary, marginBottom: Spacing.xs },
  vendorCardNote: { ...Typography.caption, color: Colors.textSecondary, lineHeight: 18 },

  /* Rate */
  rateBtn: { backgroundColor: Colors.primarySurface, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center', marginBottom: Spacing.lg },
  rateBtnText: { ...Typography.bodySm, color: Colors.primaryDark, fontWeight: '600' },
});
