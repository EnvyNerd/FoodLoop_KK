import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { getVendorProfile, updateVendorProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function VendorSettingsScreen({ navigation }) {
  const [vendor, setVendor] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [hours, setHours] = useState('');
  const [saving, setSaving] = useState(false);
  const [notifNewOrder, setNotifNewOrder] = useState(true);
  const [notifPickup, setNotifPickup] = useState(true);
  const [notifDaily, setNotifDaily] = useState(false);
  const { signOut } = useAuth();

  useEffect(() => {
    getVendorProfile().then(res => {
      const v = res.vendor || res;
      setVendor(v);
      setName(v.name || '');
      setAddress(v.address || '');
      setPhone(v.phone || '');
      setEmail(v.email || '');
      setHours(v.hours || '');
    }).catch(console.log);
  }, []);

  function startEdit() {
    setName(vendor?.name || '');
    setAddress(vendor?.address || '');
    setPhone(vendor?.phone || '');
    setEmail(vendor?.email || '');
    setHours(vendor?.hours || '');
    setEditing(true);
  }

  async function saveEdit() {
    if (!name.trim()) { Alert.alert('Error', 'Business name cannot be empty'); return; }
    setSaving(true);
    try {
      const res = await updateVendorProfile({
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        hours: hours.trim(),
      });
      setVendor(res.vendor || res);
      setEditing(false);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setName(vendor?.name || '');
    setAddress(vendor?.address || '');
    setPhone(vendor?.phone || '');
    setEmail(vendor?.email || '');
    setHours(vendor?.hours || '');
    setEditing(false);
  }

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  const v = vendor || {};

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={s.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView>
        {/* Business profile */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Business Profile</Text>
            {!editing && (
              <TouchableOpacity onPress={startEdit}>
                <Text style={s.editLink}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          {editing ? (
            <View style={s.editForm}>
              <Text style={s.label}>Business Name</Text>
              <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Business name" placeholderTextColor={Colors.textTertiary} />
              <Text style={s.label}>Address</Text>
              <TextInput style={s.input} value={address} onChangeText={setAddress} placeholder="Address" placeholderTextColor={Colors.textTertiary} />
              <Text style={s.label}>Phone</Text>
              <TextInput style={s.input} value={phone} onChangeText={setPhone} placeholder="Phone number" placeholderTextColor={Colors.textTertiary} keyboardType="phone-pad" />
              <Text style={s.label}>Email</Text>
              <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={Colors.textTertiary} keyboardType="email-address" autoCapitalize="none" />
              <Text style={s.label}>Business Hours</Text>
              <TextInput style={s.input} value={hours} onChangeText={setHours} placeholder="e.g. Mon-Sat 7AM-9PM" placeholderTextColor={Colors.textTertiary} />
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
            <View style={s.profileView}>
              <View style={s.profileRow}><Text style={s.profileLabel}>Name</Text><Text style={s.profileValue}>{v.name || '-'}</Text></View>
              <View style={s.profileRow}><Text style={s.profileLabel}>Address</Text><Text style={s.profileValue}>{v.address || '-'}</Text></View>
              <View style={s.profileRow}><Text style={s.profileLabel}>Phone</Text><Text style={s.profileValue}>{v.phone || '-'}</Text></View>
              <View style={s.profileRow}><Text style={s.profileLabel}>Email</Text><Text style={s.profileValue}>{v.email || '-'}</Text></View>
              <View style={s.profileRow}><Text style={s.profileLabel}>Hours</Text><Text style={s.profileValue}>{v.hours || '-'}</Text></View>
            </View>
          )}
        </View>

        {/* Notification preferences */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Notifications</Text>
          <View style={s.row}>
            <Text style={s.rowLabel}>New order alerts</Text>
            <Switch value={notifNewOrder} onValueChange={setNotifNewOrder} trackColor={{ false: Colors.gray200, true: Colors.primaryLight }} thumbColor={Colors.white} />
          </View>
          <View style={s.row}>
            <Text style={s.rowLabel}>Pickup reminders</Text>
            <Switch value={notifPickup} onValueChange={setNotifPickup} trackColor={{ false: Colors.gray200, true: Colors.primaryLight }} thumbColor={Colors.white} />
          </View>
          <View style={s.row}>
            <Text style={s.rowLabel}>Daily summary</Text>
            <Switch value={notifDaily} onValueChange={setNotifDaily} trackColor={{ false: Colors.gray200, true: Colors.primaryLight }} thumbColor={Colors.white} />
          </View>
        </View>

        {/* Account */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Account</Text>
          <TouchableOpacity style={s.row} onPress={handleSignOut}>
            <Text style={[s.rowLabel, { color: Colors.danger }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

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
  title: { ...Typography.headingSm, color: Colors.textPrimary },
  section: { marginTop: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, marginBottom: Spacing.xs },
  sectionTitle: { ...Typography.label, color: Colors.textTertiary, paddingHorizontal: Spacing.lg, marginBottom: Spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  editLink: { ...Typography.caption, color: Colors.primary, fontWeight: '500', paddingHorizontal: Spacing.lg },
  profileView: { paddingHorizontal: Spacing.lg },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight },
  profileLabel: { ...Typography.caption, color: Colors.textSecondary },
  profileValue: { ...Typography.bodySm, color: Colors.textPrimary, flex: 1, textAlign: 'right' },
  editForm: { paddingHorizontal: Spacing.lg },
  label: { ...Typography.label, color: Colors.textSecondary, marginBottom: 4, marginTop: Spacing.sm },
  input: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, ...Typography.bodySm, color: Colors.textPrimary, borderWidth: 0.5, borderColor: Colors.borderMedium },
  editActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  saveBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.sm },
  saveBtnText: { ...Typography.label, color: Colors.white, fontWeight: '600' },
  cancelBtn: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.sm, borderWidth: 0.5, borderColor: Colors.borderMedium },
  cancelBtnText: { ...Typography.label, color: Colors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight },
  rowLabel: { ...Typography.bodySm, color: Colors.textPrimary },
});
