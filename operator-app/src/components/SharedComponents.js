import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme';

export const StatusBadge = ({ status }) => {
  const map = {
    live:       { bg: '#16A34A22', text: '#22C55E', label: 'Live' },
    draft:      { bg: '#6B728022', text: '#9CA3AF', label: 'Draft' },
    paused:     { bg: '#F59E0B22', text: '#F59E0B', label: 'Paused' },
    confirmed:  { bg: '#16A34A22', text: '#22C55E', label: 'Confirmed' },
    pending:    { bg: '#F59E0B22', text: '#F59E0B', label: 'Pending' },
    declined:   { bg: '#EF444422', text: '#EF4444', label: 'Declined' },
    settled:    { bg: '#16A34A22', text: '#22C55E', label: 'Settled' },
    processing: { bg: '#3B82F622', text: '#3B82F6', label: 'Processing' },
  };
  const s = map[status] || map.draft;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.text }]}>{s.label}</Text>
    </View>
  );
};

export const StarRating = ({ rating }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Text key={i} style={{ color: i <= rating ? '#F59E0B' : '#374151', fontSize: 14 }}>★</Text>
    ))}
  </View>
);

export const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

export const SectionHeader = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

export const PrimaryButton = ({ label, onPress, style }) => (
  <TouchableOpacity style={[styles.primaryBtn, style]} onPress={onPress}>
    <Text style={styles.primaryBtnText}>{label}</Text>
  </TouchableOpacity>
);

export const GhostButton = ({ label, onPress, style }) => (
  <TouchableOpacity style={[styles.ghostBtn, style]} onPress={onPress}>
    <Text style={styles.ghostBtnText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  sectionHeader: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: theme.bg,
    fontWeight: '700',
    fontSize: 15,
  },
  ghostBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  ghostBtnText: {
    color: theme.textMuted,
    fontWeight: '600',
    fontSize: 15,
  },
});