import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { GreenPointsBanner, SectionHeader } from '../../components/common';
import { BagCard } from '../../components/buyer/BagCard';
import { getBags, getProfile } from '../../services/api';
import { getUnreadCount } from '../../services/notifications';

const FILTERS = ['All', 'Near me', 'Halal only', 'Bakery', 'Cafe', 'Restaurant', 'Hotel'];
const MAX_RECENT_SEARCHES = 5;

const TAWAU_CENTER = { lat: 4.2985, lng: 117.8831 };

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function HomeScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [bags, setBags] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchDebounce = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const filters = buildFilters();
      const [bagsRes, profileRes] = await Promise.all([getBags(filters), getProfile()]);
      let resultBags = bagsRes.bags || [];
      if (activeFilter === 'Near me') {
        resultBags = resultBags
          .map(b => ({ ...b, _dist: distanceKm(TAWAU_CENTER.lat, TAWAU_CENTER.lng, b.lat || 4.2985, b.lng || 117.8831) }))
          .sort((a, b) => a._dist - b._dist);
      }
      setBags(resultBags);
      setProfile(profileRes.profile || profileRes);
      setUnreadCount(getUnreadCount('buyer'));
    } catch (e) { console.log('Error loading data:', e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [activeFilter, search]);

  function buildFilters() {
    const f = {};
    if (activeFilter === 'Halal only') f.halal = 'halal';
    else if (activeFilter !== 'All' && activeFilter !== 'Near me') f.category = activeFilter;
    if (search.trim()) f.search = search.trim();
    return f;
  }

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => { setLoading(true); loadData(); });
    return unsub;
  }, [navigation, loadData]);

  function onRefresh() { setRefreshing(true); loadData(); }

  function handleSearchChange(text) {
    setSearch(text);
    if (text.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    // Debounce search
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setShowSuggestions(false);
      // Save to recent searches when user stops typing
      if (text.trim().length > 2) {
        saveRecentSearch(text.trim());
      }
    }, 1500);
  }

  function saveRecentSearch(term) {
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== term.toLowerCase());
      return [term, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    });
  }

  function handleRecentSearchTap(term) {
    setSearch(term);
    setShowSuggestions(false);
    saveRecentSearch(term);
  }

  function clearAllFilters() {
    setActiveFilter('All');
    setSearch('');
    setShowSuggestions(false);
  }

  function clearSearch() {
    setSearch('');
    setShowSuggestions(false);
  }

  const hasActiveFilters = activeFilter !== 'All' || search.trim().length > 0;

  // Generate suggestions from bag names and vendors
  const suggestions = search.trim().length > 0
    ? bags.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.vendor.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 4)
    : [];

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
        <TouchableOpacity style={s.bellBtn} onPress={() => navigation.navigate('Notifications')} accessibilityLabel="Notifications">
          <Text style={s.bellIcon}>{'\u{1F514}'}</Text>
          {unreadCount > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Search */}
        <View style={s.searchWrap}>
          <View style={s.searchBox}>
            <Text style={s.searchIcon}>{'\u{1F50D}'}</Text>
            <TextInput
              style={s.searchInput}
              placeholder="Search bags nearby..."
              placeholderTextColor={Colors.textTertiary}
              value={search}
              onChangeText={handleSearchChange}
              onFocus={() => { if (search.trim().length > 0 || recentSearches.length > 0) setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              accessibilityLabel="Search bags"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={clearSearch} accessibilityLabel="Clear search">
                <Text style={s.clearSearch}>{'\u2715'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Suggestions dropdown */}
          {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
            <View style={s.suggestionsBox}>
              {suggestions.length > 0 && (
                <>
                  <Text style={s.suggestionsLabel}>Suggestions</Text>
                  {suggestions.map(bag => (
                    <TouchableOpacity key={bag.id} style={s.suggestionItem} onPress={() => handleRecentSearchTap(bag.name)}>
                      <Text style={s.suggestionIcon}>{'\u{1F50D}'}</Text>
                      <View style={s.suggestionTextWrap}>
                        <Text style={s.suggestionName}>{bag.name}</Text>
                        <Text style={s.suggestionVendor}>{bag.vendor}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}
              {recentSearches.length > 0 && search.trim().length === 0 && (
                <>
                  <View style={s.suggestionsHeader}>
                    <Text style={s.suggestionsLabel}>Recent searches</Text>
                    <TouchableOpacity onPress={() => setRecentSearches([])}>
                      <Text style={s.clearRecentText}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                  {recentSearches.map((term, i) => (
                    <TouchableOpacity key={i} style={s.suggestionItem} onPress={() => handleRecentSearchTap(term)}>
                      <Text style={s.suggestionIcon}>{'\u23F0'}</Text>
                      <Text style={s.suggestionName}>{term}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </View>
          )}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filtersScroll} contentContainerStyle={s.filtersContent}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} style={[s.chip, activeFilter === f && s.chipActive]} onPress={() => setActiveFilter(f)} accessibilityLabel={`Filter by ${f}`}>
              <Text style={[s.chipText, activeFilter === f && s.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Clear filters */}
        {hasActiveFilters && (
          <TouchableOpacity style={s.clearFiltersBtn} onPress={clearAllFilters} accessibilityLabel="Clear all filters">
            <Text style={s.clearFiltersText}>Clear all filters</Text>
          </TouchableOpacity>
        )}

        {profile && <GreenPointsBanner meals={profile.mealsSaved} foodKg={profile.foodRescued} co2Kg={profile.co2Saved} />}
        <SectionHeader title="Available now near you" action="See map" onAction={() => navigation.navigate('Map')} />
        {!loading && bags.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>{'\u{1F6D2}'}</Text>
            <Text style={s.emptyTitle}>No bags found</Text>
            <Text style={s.emptyText}>Try a different filter or check back closer to closing time.</Text>
          </View>
        ) : (
          bags.map(bag => <BagCard key={bag.id} bag={bag} onPress={(b) => navigation.navigate('BagDetail', { bagId: b.id })} onVendorPress={(b) => navigation.navigate('VendorStorefront', { vendorId: b.vendorId })} />)
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
  bellBtn: { position: 'absolute', right: Spacing.lg, top: Spacing.lg, padding: 4 },
  bellIcon: { fontSize: 22 },
  badge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#EF4444', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  searchWrap: { padding: Spacing.md, zIndex: 10 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.bgSecondary, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.borderMedium, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, ...Typography.bodySm, color: Colors.textPrimary },
  clearSearch: { fontSize: 14, color: Colors.textTertiary, padding: 4 },
  suggestionsBox: { backgroundColor: Colors.bgPrimary, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.borderLight, marginTop: 4, maxHeight: 200, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 } },
  suggestionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  suggestionsLabel: { ...Typography.label, color: Colors.textTertiary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  clearRecentText: { ...Typography.caption, color: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight },
  suggestionIcon: { fontSize: 14, color: Colors.textTertiary },
  suggestionTextWrap: { flex: 1 },
  suggestionName: { ...Typography.bodySm, color: Colors.textPrimary },
  suggestionVendor: { ...Typography.caption, color: Colors.textSecondary },
  filtersScroll: { marginBottom: Spacing.md },
  filtersContent: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.borderMedium, backgroundColor: Colors.bgPrimary },
  chipActive: { backgroundColor: Colors.primarySurface, borderColor: Colors.primaryLight },
  chipText: { ...Typography.label, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primaryDark },
  clearFiltersBtn: { alignSelf: 'flex-end', paddingHorizontal: Spacing.lg, paddingVertical: 4, marginBottom: Spacing.xs },
  clearFiltersText: { ...Typography.caption, color: Colors.primary },
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
