import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { Card, SectionHeader, StatusBadge } from '../components/SharedComponents';

export default function DashboardHome({ bookings, setActiveTab }) {
  const todayBookings = bookings.filter(b => b.date === '2026-06-05');
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed').slice(0, 3);
  const revenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.amount, 0);
  const upcomingCount = bookings.filter(b => {
    const d = new Date(b.date);
    const now = new Date();
    return d >= now && d <= new Date(now.getTime() + 7 * 86400000);
  }).length;

  const quickActions = [
    { label: 'Add Listing', icon: '＋', tab: 'listings' },
    { label: 'Bookings',    icon: '📋', tab: 'bookings' },
    { label: 'Payouts',     icon: '💰', tab: 'payouts' },
    { label: 'Reviews',     icon: '⭐', tab: 'reviews' },
  ];

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.operatorName}>Wildvora Operator</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={{ color: theme.accent, fontWeight: '700' }}>WO</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{todayBookings.length}</Text>
          <Text style={styles.statLabel}>Today's Bookings</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{upcomingCount}</Text>
          <Text style={styles.statLabel}>Upcoming (7d)</Text>
        </Card>
        <Card style={[styles.statCard, { borderColor: theme.accent + '44' }]}>
          <Text style={[styles.statValue, { color: theme.accent }]}>
            ₹{(revenue / 1000).toFixed(0)}k
          </Text>
          <Text style={styles.statLabel}>Month Revenue</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <SectionHeader title="Quick Actions" />
      <View style={styles.quickActionsRow}>
        {quickActions.map(a => (
          <TouchableOpacity
            key={a.tab}
            style={styles.quickAction}
            onPress={() => setActiveTab(a.tab)}
          >
            <Text style={styles.quickActionIcon}>{a.icon}</Text>
            <Text style={styles.quickActionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Upcoming Bookings */}
      <SectionHeader title="Upcoming Confirmed Bookings" />
      {upcomingBookings.map(b => (
        <Card key={b.id} style={{ marginBottom: 10 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.bookingTitle} numberOfLines={1}>{b.listingTitle}</Text>
            <StatusBadge status={b.status} />
          </View>
          <Text style={styles.textMuted}>{b.customerName} · {b.date}</Text>
          <Text style={styles.textMuted}>Group: {b.groupSize} · ₹{b.amount.toLocaleString()}</Text>
        </Card>
      ))}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  greeting: { color: theme.textMuted, fontSize: 13 },
  operatorName: { color: theme.text, fontSize: 20, fontWeight: '700' },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: theme.accentSoft,
    borderWidth: 1, borderColor: theme.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statValue: { color: theme.text, fontSize: 22, fontWeight: '700' },
  statLabel: { color: theme.textMuted, fontSize: 11, marginTop: 2, textAlign: 'center' },
  quickActionsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickAction: {
    flex: 1, backgroundColor: theme.card,
    borderRadius: 12, padding: 12,
    alignItems: 'center',
    borderWidth: 1, borderColor: theme.cardBorder,
  },
  quickActionIcon: { fontSize: 22 },
  quickActionLabel: { color: theme.textMuted, fontSize: 11, marginTop: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingTitle: { color: theme.text, fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
  textMuted: { color: theme.textMuted, fontSize: 13, marginTop: 2 },
});