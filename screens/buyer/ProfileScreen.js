import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { Avatar } from '../../components/common';
import { getProfile, updateProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MENU = [
  { icon: '\u2764\uFE0F', label: 'Favourite vendors', screen: 'FavouriteVendors' },
  { icon: '\u{1F514}', label: 'Notifications', screen: 'Notifications' },
  { icon: '\u{1F4B3}', label: 'Payment methods', screen: null },
  { icon: '\u{1F4E4}', label: 'Refer a vendor', screen: null },
  { icon: '\u2699\uFE0F', label: 'Settings', screen: 'Settings' },
];

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const { signOut } = useAuth();

  useEffect(() => {
    getProfile().then(res => {
      const p = res.profile || res;
      setProfile(p);
      setEditName(p.name || '');
      setEditEmail(p.email || '');
    }).catch(console.log);
  }, []);

  const u = profile || { name: '', email: '', memberSince: '', greenPoints: 0, mealsSaved: 0, foodRescued: 0, co2Saved: 0, badges: [] };

  function startEdit() {
    setEditName(u.name);
    setEditEmail(u.email);
    setEditing(true);
  }

  async function saveEdit() {
    if (!editName.trim()) { Alert.alert('Error', 'Name cannot be empty'); return; }
    setSaving(true);
    try {
      const res = await updateProfile({ name: editName.trim(), email: editEmail.trim() });
      const updated = res.profile || res;
      setProfile(updated);
      setEditing(false);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditName(u.name);
    setEditEmail(u.email);
    setEditing(false);
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <Text style={s.heading}>My profile</Text>
        <Text style={s.sub}>Account & impact</Text>
      </View>
      <ScrollView>
        {/* Profile header with edit */}
        <View style={s.profileRow}>
          <Avatar initials={u.name?.[0] || '?'} size={50} />
          <View style={s.profileInfo}>
            {editing ? (
              <View style={s.editForm}>
                <TextInput style={s.editInput} value={editName} onChangeText={setEditName} placeholder="Name" placeholderTextColor={Colors.textTertiary} />
                <TextInput style={s.editInput} value={editEmail} onChangeText={setEditEmail} placeholder="Email" placeholderTextColor={Colors.textTertiary} keyboardType="email-address" autoCapitalize="none" />
                <View style={s.editActions}>
                  <TouchableOpacity style={s.saveBtn} onPress={saveEdit} disabled={saving}>
                    <Text style={s.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.cancelBtn} onPress={cancelEdit}>
                    <Text style={s.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <Text style={s.profileName}>{u.name}</Text>
                <Text style={s.profileEmail}>{u.email}</Text>
                <Text style={s.profileSince}>Member since {u.memberSince}</Text>
                <TouchableOpacity style={s.editBtn} onPress={startEdit}>
                  <Text style={s.editBtnText}>{'\u270F\uFE0F'} Edit profile</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={s.greenBox}>
          <Text style={s.greenTitle}>{'\u{1F33F}'} Green points</Text>
          <View style={s.ptsRow}><Text style={s.ptsBig}>{u.greenPoints}</Text><Text style={s.ptsLabel}>pts</Text></View>
          <View style={s.badges}>{u.badges.map(b => (<View key={b} style={s.badgePill}><Text style={s.badgePillText}>{b}</Text></View>))}</View>
        </View>

        <View style={s.statsGrid}>
          <View style={s.statCard}><Text style={s.statVal}>{u.mealsSaved}</Text><Text style={s.statLabel}>Meals saved</Text></View>
          <View style={s.statCard}><Text style={s.statVal}>{u.foodRescued} kg</Text><Text style={s.statLabel}>Food rescued</Text></View>
          <View style={s.statCard}><Text style={s.statVal}>{u.co2Saved} kg</Text><Text style={s.statLabel}>CO₂ saved</Text></View>
        </View>

        {MENU.map(item => (
          <TouchableOpacity key={item.label} style={s.menuItem} onPress={() => item.screen ? navigation.navigate(item.screen) : null}>
            <Text style={s.menuIcon}>{item.icon}</Text>
            <Text style={s.menuLabel}>{item.label}</Text>
            <Text style={s.menuChev}>{'\u203A'}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={s.signOutBtn} onPress={signOut}>
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  topBar: { backgroundColor: Colors.primary, padding: Spacing.lg, paddingBottom: Spacing.md },
  heading: { ...Typography.headingMd, color: Colors.white },
  sub: { ...Typography.caption, color: Colors.primaryMuted, marginTop: 2 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight },
  profileInfo: { flex: 1 },
  profileName: { ...Typography.headingSm, color: Colors.textPrimary },
  profileEmail: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  profileSince: { ...Typography.label, color: Colors.primaryLight, marginTop: 3 },
  editBtn: { marginTop: 6, alignSelf: 'flex-start' },
  editBtnText: { ...Typography.caption, color: Colors.primary, fontWeight: '500' },
  editForm: { gap: Spacing.xs },
  editInput: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, ...Typography.bodySm, color: Colors.textPrimary, borderWidth: 0.5, borderColor: Colors.borderMedium },
  editActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  saveBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.sm },
  saveBtnText: { ...Typography.label, color: Colors.white, fontWeight: '600' },
  cancelBtn: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.sm, borderWidth: 0.5, borderColor: Colors.borderMedium },
  cancelBtnText: { ...Typography.label, color: Colors.textSecondary },
  greenBox: { backgroundColor: Colors.primarySurface, margin: Spacing.lg, borderRadius: Radius.lg, padding: Spacing.md },
  greenTitle: { ...Typography.bodySm, fontWeight: '500', color: Colors.primaryDark, marginBottom: Spacing.sm },
  ptsRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  ptsBig: { fontSize: 32, fontWeight: '500', color: Colors.primary },
  ptsLabel: { ...Typography.bodySm, color: Colors.primaryLight },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: Spacing.sm },
  badgePill: { backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  badgePillText: { ...Typography.label, fontSize: 11, color: Colors.primarySurface },
  statsGrid: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  statCard: { flex: 1, backgroundColor: Colors.bgSecondary, borderRadius: Radius.md, padding: Spacing.md },
  statVal: { ...Typography.headingMd, color: Colors.primary },
  statLabel: { ...Typography.label, color: Colors.textSecondary, marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight, gap: Spacing.md },
  menuIcon: { fontSize: 18, width: 24 },
  menuLabel: { ...Typography.bodySm, color: Colors.textPrimary, flex: 1 },
  menuChev: { color: Colors.textTertiary, fontSize: 18 },
  signOutBtn: { marginHorizontal: Spacing.lg, marginTop: Spacing.lg, backgroundColor: Colors.danger, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  signOutText: { ...Typography.headingSm, color: Colors.white },
});
