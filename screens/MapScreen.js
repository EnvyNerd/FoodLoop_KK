import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { getBags } from '../services/api';

export default function MapScreen({ navigation }) {
  const [bags, setBags] = useState([]);
  const [selectedBag, setSelectedBag] = useState(null);

  useEffect(() => {
    getBags({}).then(res => setBags(res.bags || [])).catch(console.log);
  }, []);

  // Default region: Tawau, Sabah
  const initialRegion = {
    latitude: 4.2985,
    longitude: 117.8831,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Center region on bags if available
  const getRegion = () => {
    if (bags.length === 0) return initialRegion;
    const lats = bags.map(b => b.lat || 4.2985);
    const lngs = bags.map(b => b.lng || 117.8831);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(0.02, (maxLat - minLat) * 1.5),
      longitudeDelta: Math.max(0.02, (maxLng - minLng) * 1.5),
    };
  };

  function openDirections(bag) {
    const url = Platform.select({
      ios: `maps:0,0?q=${bag.lat},${bag.lng}`,
      android: `geo:0,0?q=${bag.lat},${bag.lng}(${bag.vendor})`,
    });
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url);
    });
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.backText}>{'\u2039'} Back</Text></TouchableOpacity>
        <Text style={s.heading}>Map View</Text>
        <View style={{ width: 50 }} />
      </View>

      <MapView
        style={s.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={getRegion()}
        showsUserLocation
        showsMyLocationButton
      >
        {bags.map(bag => (
          <Marker
            key={bag.id}
            coordinate={{
              latitude: bag.lat || 4.2985,
              longitude: bag.lng || 117.8831,
            }}
            title={bag.name}
            description={`${bag.vendor} · RM ${bag.priceNow} · ${bag.pickupStart}–${bag.pickupEnd}`}
            pinColor={bag.imageColor}
            onPress={() => setSelectedBag(bag)}
          />
        ))}
      </MapView>

      {/* Selected bag info card */}
      {selectedBag && (
        <View style={s.card}>
          <View style={s.cardRow}>
            <View style={[s.colorBar, { backgroundColor: selectedBag.imageColor }]} />
            <View style={s.cardInfo}>
              <Text style={s.cardName} numberOfLines={1}>{selectedBag.name}</Text>
              <Text style={s.cardMeta}>{selectedBag.vendor} · RM {selectedBag.priceNow} · {selectedBag.pickupStart}–{selectedBag.pickupEnd}</Text>
              <Text style={s.cardDist}>{selectedBag.distance} km away · {selectedBag.quantityLeft} left</Text>
            </View>
          </View>
          <View style={s.cardActions}>
            <TouchableOpacity style={s.cardBtn} onPress={() => { navigation.navigate('BagDetail', { bagId: selectedBag.id }); setSelectedBag(null); }}>
              <Text style={s.cardBtnText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.cardBtn, s.cardBtnDir]} onPress={() => openDirections(selectedBag)}>
              <Text style={[s.cardBtnText, s.cardBtnDirText]}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedBag(null)}>
              <Text style={s.cardClose}>{'\u2715'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  topBar: { backgroundColor: Colors.primary, padding: Spacing.lg, paddingBottom: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backText: { color: Colors.white, ...Typography.bodySm, width: 50 },
  heading: { ...Typography.headingMd, color: Colors.white, textAlign: 'center' },
  map: { flex: 1 },
  card: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: Colors.bgPrimary,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.borderLight,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardRow: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  colorBar: { width: 6, height: 44, borderRadius: 3, marginRight: 10 },
  cardInfo: { flex: 1 },
  cardName: { ...Typography.bodySm, fontWeight: '500', color: Colors.textPrimary },
  cardMeta: { ...Typography.caption, color: Colors.textSecondary, marginTop: 1 },
  cardDist: { ...Typography.label, color: Colors.textTertiary, marginTop: 2 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  cardBtn: { backgroundColor: Colors.bgSecondary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.sm },
  cardBtnText: { ...Typography.label, color: Colors.textSecondary },
  cardBtnDir: { backgroundColor: Colors.primary },
  cardBtnDirText: { color: Colors.white },
  cardClose: { color: Colors.textTertiary, fontSize: 16, padding: 4, marginLeft: 4 },
});
