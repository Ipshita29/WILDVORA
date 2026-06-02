import React, { useState } from 'react';
import {
  View, Text, FlatList, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, Modal, Alert,
} from 'react-native';
import { theme } from '../theme';
import { Card, StatusBadge, PrimaryButton, GhostButton } from '../components/SharedComponents';

const STATUSES = ['all', 'pending', 'confirmed', 'declined'];

export default function BookingsManager({ bookings, setBookings }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [contactModal, setContactModal] = useState(null);

  const filtered = bookings.filter(b => {
    const statusMatch = filterStatus === 'all' || b.status === filterStatus;
    const dateMatch = !filterDate || b.date.includes(filterDate);
    return statusMatch && dateMatch;
  });

  const handleConfirm = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
  };

  const handleDecline = (id) => {
    Alert.alert('Decline Booking', 'Are you sure you want to decline this booking?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline', style: 'destructive',
        onPress: () => setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'declined' } : b)),
      },
    ]);
  };

  const renderBooking = ({ item: b }) => (
    <Card style={{ marginBottom: 10 }}>
      <View style={styles.rowBetween}>
        <Text style={styles.listingTitle} numberOfLines={1}>{b.listingTitle}</Text>
        <StatusBadge status={b.status} />
      </View>
      <Text style={styles.textMuted}>{b.customerName} · {b.date}</Text>
      <Text style={styles.textMuted}>Group: {b.groupSize} · ₹{b.amount.toLocaleString()}</Text>

      <View style={[styles.rowBetween, { marginTop: 10 }]}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {b.status === 'pending' && (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: theme.accentSoft }]}
                onPress={() => handleConfirm(b.id)}
              >
                <Text style={[styles.actionBtnText, { color: theme.accent }]}>✓ Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#EF444422' }]}
                onPress={() => handleDecline(b.id)}
              >
                <Text style={[styles.actionBtnText, { color: theme.danger }]}>✕ Decline</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#3B82F622' }]}
          onPress={() => setContactModal(b)}
        >
          <Text style={[styles.actionBtnText, { color: theme.info }]}>Contact</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Bookings Manager</Text>

      {/* Status Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {STATUSES.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, filterStatus === s && styles.chipActive]}
              onPress={() => setFilterStatus(s)}
            >
              <Text style={[styles.chipText, filterStatus === s && { color: theme.bg }]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Date Filter */}
      <TextInput
        style={[styles.input, { marginBottom: 12 }]}
        placeholder="Filter by date (YYYY-MM-DD)"
        placeholderTextColor={theme.textMuted}
        value={filterDate}
        onChangeText={setFilterDate}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderBooking}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[styles.textMuted, { textAlign: 'center', marginTop: 30 }]}>
            No bookings found.
          </Text>
        }
      />

      {/* Contact Modal */}
      <Modal visible={!!contactModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Contact Customer</Text>
            {contactModal && (
              <>
                <Text style={styles.modalText}>Name: {contactModal.customerName}</Text>
                <Text style={styles.modalText}>Email: {contactModal.customerEmail}</Text>
                <Text style={styles.modalText}>Booking: {contactModal.listingTitle}</Text>
                <Text style={styles.modalText}>Date: {contactModal.date}</Text>
              </>
            )}
            <PrimaryButton label="Close" onPress={() => setContactModal(null)} style={{ marginTop: 16 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  screenTitle: { color: theme.text, fontSize: 22, fontWeight: '700', marginBottom: 16, marginTop: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listingTitle: { color: theme.text, fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  textMuted: { color: theme.textMuted, fontSize: 13, marginTop: 2 },
  actionBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
  chip: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder,
  },
  chipActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  chipText: { color: theme.textMuted, fontSize: 13, fontWeight: '500' },
  input: {
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    color: theme.text, fontSize: 14,
  },
  modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: theme.card, borderRadius: 20, padding: 24, margin: 16,
    borderWidth: 1, borderColor: theme.cardBorder,
  },
  modalTitle: { color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 14 },
  modalText: { color: theme.textMuted, fontSize: 14, marginBottom: 6 },
});