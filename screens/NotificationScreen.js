import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notifications';

const TYPE_META = {
  order_placed:  { icon: '\u{1F4E6}', color: '#E6F1FB', textColor: '#0C447C' },
  order_ready:   { icon: '\u{2705}', color: '#E1F5EE', textColor: '#085041' },
  order_collected: { icon: '\u{1F381}', color: '#FAEEDA', textColor: '#633806' },
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return Math.floor(hrs / 24) + 'd ago';
}

export default function NotificationScreen({ navigation }) {
  const [notifs, setNotifs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    setNotifs(getNotifications());
  }, []);

  useEffect(() => { load(); }, [load]);

  function onRefresh() {
    setRefreshing(true);
    load();
    setRefreshing(false);
  }

  function handleTap(n) {
    markAsRead(n.id);
    load();
  }

  function handleMarkAllRead() {
    markAllAsRead();
    load();
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={s.title}>Notifications</Text>
        {notifs.some(n => !n.read) ? (
          <TouchableOpacity onPress={handleMarkAllRead} style={s.markAllBtn}>
            <Text style={s.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 80 }} />}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {notifs.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>{'\u{1F514}'}</Text>
            <Text style={s.emptyTitle}>No notifications yet</Text>
            <Text style={s.emptyText}>When something happens, you'll see it here.</Text>
          </View>
        ) : (
          notifs.map(n => {
            const meta = TYPE_META[n.type] || { icon: '\u{1F514}', color: Colors.bgSecondary, textColor: Colors.textPrimary };
            return (
              <TouchableOpacity key={n.id} style={[s.card, !n.read && s.cardUnread]} onPress={() => handleTap(n)}>
                <View style={[s.iconWrap, { backgroundColor: meta.color }]}>
                  <Text style={s.iconText}>{meta.icon}</Text>
                </View>
                <View style={s.cardBody}>
                  <Text style={s.cardTitle}>{n.title}</Text>
                  <Text style={s.cardMsg}>{n.message}</Text>
                  <Text style={s.cardTime}>{timeAgo(n.createdAt)}</Text>
                </View>
                {!n.read && <View style={s.unreadDot} />}
              </TouchableOpacity>
            );
          })
        )}
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
  markAllBtn: { padding: Spacing.sm },
  markAllText: { ...Typography.label, color: Colors.primary },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 40, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.headingSm, color: Colors.textPrimary, marginBottom: Spacing.xs },
  emptyText: { ...Typography.caption, color: Colors.textSecondary, textAlign: 'center' },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, padding: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight },
  cardUnread: { backgroundColor: '#F0FAFF' },
  iconWrap: { width: 36, height: 36, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 16 },
  cardBody: { flex: 1 },
  cardTitle: { ...Typography.bodySm, fontWeight: '500', color: Colors.textPrimary },
  cardMsg: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2, lineHeight: 17 },
  cardTime: { ...Typography.label, fontSize: 10, color: Colors.textTertiary, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 4 },
});
