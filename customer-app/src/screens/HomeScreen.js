import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { experienceAPI } from '../services/api';

const CATEGORIES = ['All', 'Camping', 'Trekking', 'Water Sports', 'Jungle', 'Cycling'];

function ExperienceCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.85}>
      <View style={styles.cardImage}>
        <Text style={styles.cardImagePlaceholder}>{item.category}</Text>
        <View style={styles.cardBadge}><Text style={styles.cardBadgeText}>{item.difficulty}</Text></View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardMeta}>{item.location?.city}, {item.location?.country} · {item.duration}</Text>
        <View style={styles.cardRow}>
          <Text style={styles.cardPrice}>${item.price}<Text style={styles.cardPriceSub}>/person</Text></Text>
          <Text style={styles.cardRating}>★ {item.rating} ({item.reviewCount})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function HorizontalCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.hCard} onPress={() => onPress(item)} activeOpacity={0.85}>
      <View style={styles.hCardImage}><Text style={styles.hCardImageText}>{item.category}</Text></View>
      <View style={styles.hCardBody}>
        <Text style={styles.hCardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.hCardMeta}>{item.location?.city}</Text>
        <Text style={styles.hCardPrice}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [featRes, trendRes] = await Promise.all([
        experienceAPI.getAll({ featured: true, limit: 6 }),
        experienceAPI.getAll({ trending: true, limit: 6 }),
      ]);
      setFeatured(featRes.data.experiences);
      setTrending(trendRes.data.experiences);
    } catch (err) {
      // Auto-seed demo data if DB is empty
      try {
        await experienceAPI.seed();
        const [featRes, trendRes] = await Promise.all([
          experienceAPI.getAll({ featured: true, limit: 6 }),
          experienceAPI.getAll({ trending: true, limit: 6 }),
        ]);
        setFeatured(featRes.data.experiences || []);
        setTrending(trendRes.data.experiences || []);
      } catch {}
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const handleSearch = () => {
    navigation.navigate('Search', { initialSearch: search, initialCategory: category });
  };

  const goToExperience = (item) => navigation.navigate('ExperienceDetail', { experienceId: item._id });

  const filteredTrending = category === 'All'
    ? trending
    : trending.filter((e) => e.category === category);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#111" /></View>;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Wildvora</Text>
            <Text style={styles.welcome}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarBtn}>
            <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Where do you want to go?"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.filterBtn} onPress={() => navigation.navigate('Search')}>
            <Text style={styles.filterBtnText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured */}
        {featured.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Search', { featured: true })}>
                <Text style={styles.sectionLink}>View all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={featured}
              keyExtractor={(i) => i._id}
              renderItem={({ item }) => <HorizontalCard item={item} onPress={goToExperience} />}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, paddingBottom: 4 }}
            />
          </>
        )}

        {/* Trending */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending this week</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search', { trending: true })}>
            <Text style={styles.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>

        {filteredTrending.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No experiences found for this category</Text>
          </View>
        ) : (
          filteredTrending.map((item) => (
            <ExperienceCard key={item._id} item={item} onPress={goToExperience} />
          ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  logo: { fontSize: 22, fontWeight: '700', color: '#111' },
  welcome: { fontSize: 13, color: '#888', marginTop: 2 },
  avatarBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: '#FAFAFA' },
  filterBtn: { width: 44, height: 44, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
  filterBtnText: { fontSize: 18 },
  chips: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#DDD', backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#111', borderColor: '#111' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
  sectionLink: { fontSize: 13, color: '#555', textDecorationLine: 'underline' },
  // Horizontal card
  hCard: { width: 160, marginRight: 12, borderWidth: 1, borderColor: '#EEE', borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff' },
  hCardImage: { height: 90, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  hCardImageText: { fontSize: 12, color: '#888', fontWeight: '600' },
  hCardBody: { padding: 10 },
  hCardTitle: { fontSize: 13, fontWeight: '600', color: '#111', marginBottom: 2 },
  hCardMeta: { fontSize: 11, color: '#888', marginBottom: 4 },
  hCardPrice: { fontSize: 13, fontWeight: '700', color: '#111' },
  // Vertical card
  card: { marginHorizontal: 16, marginBottom: 14, borderWidth: 1, borderColor: '#EEE', borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff' },
  cardImage: { height: 160, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  cardImagePlaceholder: { fontSize: 14, color: '#888', fontWeight: '600' },
  cardBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1, borderColor: '#DDD' },
  cardBadgeText: { fontSize: 11, color: '#555' },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 3 },
  cardMeta: { fontSize: 12, color: '#888', marginBottom: 8 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: 15, fontWeight: '700', color: '#111' },
  cardPriceSub: { fontSize: 12, fontWeight: '400', color: '#888' },
  cardRating: { fontSize: 13, color: '#555' },
  emptyBox: { margin: 16, padding: 20, backgroundColor: '#F5F5F5', borderRadius: 10, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 14 },
});