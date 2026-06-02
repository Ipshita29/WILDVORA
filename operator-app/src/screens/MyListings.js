import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { theme } from '../theme';
import { Card, StatusBadge } from '../components/SharedComponents';

export default function MyListings({ listings, setListings, setEditListing, setActiveTab }) {
  const handleStatusChange = (id, newStatus) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Listing', 'Are you sure you want to delete this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => setListings(prev => prev.filter(l => l.id !== id)),
      },
    ]);
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.rowBetween}>
        <Text style={styles.screenTitle}>My Listings</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => { setEditListing(null); setActiveTab('create'); }}
        >
          <Text style={styles.addBtnText}>＋ Add New</Text>
        </TouchableOpacity>
      </View>

      {listings.map(listing => (
        <Card key={listing.id} style={{ marginBottom: 12 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.listingTitle} numberOfLines={1}>{listing.title}</Text>
            <StatusBadge status={listing.status} />
          </View>
          <Text style={styles.textMuted}>{listing.category} · ₹{listing.price}/person</Text>
          <Text style={styles.textMuted}>Group: {listing.groupSizeMin}–{listing.groupSizeMax} people</Text>

          <View style={[styles.rowBetween, { marginTop: 12 }]}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {listing.status !== 'live' && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.accentSoft }]}
                  onPress={() => handleStatusChange(listing.id, 'live')}
                >
                  <Text style={[styles.actionBtnText, { color: theme.accent }]}>Go Live</Text>
                </TouchableOpacity>
              )}
              {listing.status === 'live' && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#F59E0B22' }]}
                  onPress={() => handleStatusChange(listing.id, 'paused')}
                >
                  <Text style={[styles.actionBtnText, { color: theme.warning }]}>Pause</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#3B82F622' }]}
                onPress={() => { setEditListing(listing); setActiveTab('create'); }}
              >
                <Text style={[styles.actionBtnText, { color: theme.info }]}>Edit</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => handleDelete(listing.id)}>
              <Text style={{ color: theme.danger, fontSize: 18 }}>🗑</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  screenTitle: { color: theme.text, fontSize: 22, fontWeight: '700', marginBottom: 16, marginTop: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: { backgroundColor: theme.accent, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: theme.bg, fontWeight: '700', fontSize: 13 },
  listingTitle: { color: theme.text, fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  textMuted: { color: theme.textMuted, fontSize: 13, marginTop: 2 },
  actionBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: theme.cardBorder + '44' },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
});