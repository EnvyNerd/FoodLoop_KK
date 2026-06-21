import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { GreenPointsBanner, SectionHeader } from '../../components/common';
import { BagCard } from '../../components/buyer/BagCard';
import { getBags, getProfile } from '../../services/api';

const FILTERS = ['All', 'Halal only', 'Bakery', 'Cafe', 'Restaurant', 'Hotel'];

export default function HomeScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [bags, setBags] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const filters = buildFilters();
      const [bagsRes, profileRes] = await Promise.all([getBags(filters), getProfile()]);
      setBags(bagsRes.bags || []);
      setProfile(profileRes.profile || profileRes);
    } catch (e) {
      console.log('Error loading data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter, search]);

  function buildFilters() {
    const f = {};
    if (activeFilter === 'Halal only') f.halal = 'halal';
    else if (activeFilter !== 'All') f.category = activeFilter;
    if (search.trim()) f.search = search.trim();
    return f;
  }

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => { setLoading(true); loadData(); });
    return unsub;
  }, [navigation, loadData]);

  function onRefresh() { setRefreshing(true); loadData(); }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <View>
          <Text style={s.greeting}>Good evening, {profile?.name || 'there'}</Text>
          <Text style={s.tagline}>Save food. Save money. Help your community.</Text>
        </View>
        <TouchableOpacity style={s.locRow}>
          <Text style={s.locText}>{'\u{1F4CD}'} Tawau, Sabah</Text>
          <Text style={s.locChev}>{'\u203A'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={s.searchWrap}>
          <View style={s.searchBox}>
            <Text style={s.searchIcon}>{'\u{1F50D}'}</Text>
            <TextInput style={s.searchInput} placeholder="Search bags nearby..." placeholderTextColor={Colors.textTertiary} value={search} onChangeText={setSearch} />
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filtersScroll} contentContainerStyle={s.filtersContent}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} style={[s.chip, activeFilter === f && s.chipActive]} onPress={() => setActiveFilter(f)}>
              <Text style={[s.chipText, activeFilter === f && s.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {profile && <GreenPointsBanner meals={profile.mealsSaved} foodKg={profile.foodRescued} co2Kg={profile.co2Saved} />}
        <SectionHeader title="Available now near you" action="See map" onAction={() => navigation.navigate('Map')} />
        {!loading && bags.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>{'\u{1F6D2}'}</Text>
            <Text style={s.emptyTitle}>No bags found</Text>
            <Text style={s.emptyText}>Try a different filter or check back closer to closing time.</Text>
          </View>
        ) : (
          bags.map(bag => <BagCard key={bag.id} bag={bag} onPress={(b) => navigation.navigate('BagDetail', { bagId: b.id })} />)
        )}
        <SectionHeader title="Quick actions" />
        <View style={s.quickGrid}>
          <TouchableOpacity style={s.quickCard}><Text style={s.quickIcon}>{'\u2764\uFE0F'}</Text><Text style={s.quickTitle}>Donate a bag</Text><Text style={s.quickSub}>Support local shelter</Text></TouchableOpacity>
          <TouchableOpacity style={s.quickCard}><Text style={s.quickIcon}>{'\u{1F381}'}</Text><Text style={s.quickTitle}>Gift a bag</Text><Text style={s.quickSub}>Send to a friend</Text></TouchableOpacity>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  topBar: { backgroundColor: Colors.primary, padding: Spacing.lg, paddingBottom: Spacing.md },
  greeting: { ...Typography.headingMd, color: Colors.white, marginBottom: 2 },
  tagline: { ...Typography.caption, color: Colors.primaryMuted },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.md, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  locText: { ...Typography.caption, color: Colors.primarySurface },
  locChev: { color: Colors.primaryMuted, marginLeft: 4, fontSize: 14 },
  searchWrap: { padding: Spacing.md },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.bgSecondary, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.borderMedium, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, ...Typography.bodySm, color: Colors.textPrimary },
  filtersScroll: { marginBottom: Spacing.md },
  filtersContent: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.borderMedium, backgroundColor: Colors.bgPrimary },
  chipActive: { backgroundColor: Colors.primarySurface, borderColor: Colors.primaryLight },
  chipText: { ...Typography.label, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primaryDark },
  empty: { alignItems: 'center', padding: Spacing.xxxl },
  emptyIcon: { fontSize: 40, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.headingSm, color: Colors.textPrimary, marginBottom: Spacing.xs },
  emptyText: { ...Typography.caption, color: Colors.textSecondary, textAlign: 'center' },
  quickGrid: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  quickCard: { flex: 1, backgroundColor: Colors.bgSecondary, borderRadius: Radius.lg, padding: Spacing.md },
  quickIcon: { fontSize: 22, marginBottom: 4 },
  quickTitle: { ...Typography.bodySm, fontWeight: '500', color: Colors.textPrimary },
  quickSub: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
});
