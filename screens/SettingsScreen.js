import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen({ navigation }) {
  const [notifEnabled, setNotifEnabled] = useState(true);
  const { signOut } = useAuth();

  function handleBecomeVendor() {
    Alert.alert(
      'Become a vendor',
      'To list your surplus food on FoodLoop, you need a vendor account. Contact us at vendors@foodloop.app to get started.',
      [{ text: 'OK' }]
    );
  }

  function handleTerms() {
    Alert.alert('Terms of Service', 'FoodLoop Terms of Service\n\nBy using FoodLoop, you agree to our terms. This is a prototype app for demonstration purposes.');
  }

  function handlePrivacy() {
    Alert.alert('Privacy Policy', 'FoodLoop Privacy Policy\n\nWe respect your privacy. This is a prototype app. No real data is collected or shared with third parties.');
  }

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

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
        {/* Notifications */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Preferences</Text>
          <View style={s.row}>
            <Text style={s.rowIcon}>{'\u{1F514}'}</Text>
            <Text style={s.rowLabel}>Push notifications</Text>
            <Switch value={notifEnabled} onValueChange={setNotifEnabled} trackColor={{ false: Colors.gray200, true: Colors.primaryLight }} thumbColor={Colors.white} />
          </View>
        </View>

        {/* Account */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Account</Text>
          <TouchableOpacity style={s.row} onPress={handleBecomeVendor}>
            <Text style={s.rowIcon}>{'\u{1F3EA}'}</Text>
            <Text style={s.rowLabel}>Become a vendor</Text>
            <Text style={s.rowChev}>{'\u203A'}</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>About</Text>
          <TouchableOpacity style={s.row} onPress={handleTerms}>
            <Text style={s.rowIcon}>{'\u{1F4CB}'}</Text>
            <Text style={s.rowLabel}>Terms of Service</Text>
            <Text style={s.rowChev}>{'\u203A'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.row} onPress={handlePrivacy}>
            <Text style={s.rowIcon}>{'\u{1F510}'}</Text>
            <Text style={s.rowLabel}>Privacy Policy</Text>
            <Text style={s.rowChev}>{'\u203A'}</Text>
          </TouchableOpacity>
          <View style={s.row}>
            <Text style={s.rowIcon}>{'\u2139\uFE0F'}</Text>
            <Text style={s.rowLabel}>App version</Text>
            <Text style={s.rowValue}>1.5.0</Text>
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut}>
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

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
  sectionTitle: { ...Typography.label, color: Colors.textTertiary, paddingHorizontal: Spacing.lg, marginBottom: Spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, paddingHorizontal: Spacing.lg, backgroundColor: Colors.bgPrimary, borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight, gap: Spacing.md },
  rowIcon: { fontSize: 18, width: 24 },
  rowLabel: { ...Typography.bodySm, color: Colors.textPrimary, flex: 1 },
  rowChev: { color: Colors.textTertiary, fontSize: 18 },
  rowValue: { ...Typography.caption, color: Colors.textSecondary },
  signOutBtn: { marginHorizontal: Spacing.lg, marginTop: Spacing.xl, backgroundColor: Colors.danger, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  signOutText: { ...Typography.headingSm, color: Colors.white },
});
