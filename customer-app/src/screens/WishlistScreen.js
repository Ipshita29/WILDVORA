import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userAPI } from '../services/api';

export default function WishlistScreen({ navigation }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await userAPI.getProfile();
        setWishlist(res.data.user.wishlist || []);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleRemove = async (id) => {
    await userAPI.toggleWishlist(id);
    setWishlist((prev) => prev.filter((e) => e._id !== id));
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#111" /></View>;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.title}>My Wishlist</Text>
        <View style={{ width: 30 }} />
      </View>
      <FlatList
        data={wishlist}
        keyExtractor={(i) => i._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ExperienceDetail', { experienceId: item._id })}
            activeOpacity={0.85}
          >
            <View style={styles.cardImg}><Text style={styles.cardImgText}>{item.category || '📍'}</Text></View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardMeta}>{item.location?.city}, {item.location?.country}</Text>
              <Text style={styles.cardPrice}>${item.price}/person</Text>
            </View>
            <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item._id)}>
              <Text style={styles.removeBtnText}>❤️</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No saved experiences</Text>
            <Text style={styles.emptyText}>Tap the heart icon on any experience to save it here.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#EEE' },
  back: { fontSize: 22, color: '#111' },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  card: { flexDirection: 'row', marginHorizontal: 12, marginBottom: 12, marginTop: 4, borderWidth: 1, borderColor: '#EEE', borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff', alignItems: 'center' },
  cardImg: { width: 90, height: 80, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  cardImgText: { fontSize: 11, color: '#888', fontWeight: '600', textAlign: 'center' },
  cardBody: { flex: 1, padding: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 2 },
  cardMeta: { fontSize: 12, color: '#888', marginBottom: 4 },
  cardPrice: { fontSize: 13, fontWeight: '600', color: '#111' },
  removeBtn: { paddingHorizontal: 14 },
  removeBtnText: { fontSize: 20 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20 },
});