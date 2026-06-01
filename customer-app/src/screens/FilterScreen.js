import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { experienceAPI } from '../services/api';

const CATEGORIES = ['All', 'Camping', 'Trekking', 'Water Sports', 'Jungle', 'Cycling', 'Climbing', 'Safari', 'Skiing'];
const DIFFICULTIES = ['All', 'Easy', 'Moderate', 'Hard', 'Expert'];
const DURATIONS = ['All', '1 day', '2-3 days', '1 week+'];

function ExperienceCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.85}>
      <View style={styles.cardImg}>
        <Text style={styles.cardImgText}>{item.category}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardMeta}>{item.location?.city}, {item.location?.country}</Text>
        <View style={styles.cardRow}>
          <Text style={styles.cardPrice}>${item.price}/person</Text>
          <Text style={styles.cardRating}>★ {item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function FilterScreen({ navigation, route }) {
  const [search, setSearch] = useState(route.params?.initialSearch || '');
  const [category, setCategory] = useState(route.params?.initialCategory || 'All');
  const [difficulty, setDifficulty] = useState('All');
  const [duration, setDuration] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [featured, setFeatured] = useState(route.params?.featured || false);
  const [trending, setTrending] = useState(route.params?.trending || false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category !== 'All') params.category = category;
      if (difficulty !== 'All') params.difficulty = difficulty;
      if (duration !== 'All') params.duration = duration;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (featured) params.featured = 'true';
      if (trending) params.trending = 'true';

      const res = await experienceAPI.getAll(params);
      setResults(res.data.experiences || []);
      setTotal(res.data.total || 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, difficulty, duration, minPrice, maxPrice, featured, trending]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setDifficulty('All');
    setDuration('All');
    setMinPrice('');
    setMaxPrice('');
    setFeatured(false);
    setTrending(false);
  };

  const goToExperience = (item) => navigation.navigate('ExperienceDetail', { experienceId: item._id });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search experiences..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchResults}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.filterToggle} onPress={() => setShowFilters(!showFilters)}>
          <Text style={styles.filterToggleText}>⚙️</Text>
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

      {/* Expandable filters */}
      {showFilters && (
        <View style={styles.filtersBox}>
          <Text style={styles.filterLabel}>Difficulty</Text>
          <View style={styles.filterRow}>
            {DIFFICULTIES.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.filterChip, difficulty === d && styles.filterChipActive]}
                onPress={() => setDifficulty(d)}
              >
                <Text style={[styles.filterChipText, difficulty === d && styles.filterChipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterLabel}>Duration</Text>
          <View style={styles.filterRow}>
            {DURATIONS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.filterChip, duration === d && styles.filterChipActive]}
                onPress={() => setDuration(d)}
              >
                <Text style={[styles.filterChipText, duration === d && styles.filterChipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterLabel}>Price Range ($)</Text>
          <View style={styles.priceRow}>
            <TextInput style={styles.priceInput} placeholder="Min" value={minPrice} onChangeText={setMinPrice} keyboardType="numeric" />
            <Text style={styles.priceDash}>—</Text>
            <TextInput style={styles.priceInput} placeholder="Max" value={maxPrice} onChangeText={setMaxPrice} keyboardType="numeric" />
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={() => { setShowFilters(false); fetchResults(); }}>
              <Text style={styles.applyBtnText}>Show {total} results</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{total} experiences found</Text>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#111" /></View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <ExperienceCard item={item} onPress={goToExperience} />}
          contentContainerStyle={{ paddingBottom: 16 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No experiences found.</Text>
              <TouchableOpacity onPress={resetFilters}><Text style={styles.emptyLink}>Clear filters</Text></TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  searchRow: { flexDirection: 'row', padding: 12, gap: 8 },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: '#FAFAFA' },
  filterToggle: { width: 44, height: 44, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
  filterToggleText: { fontSize: 18 },
  chips: { paddingHorizontal: 12, paddingBottom: 8, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#DDD', backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#111', borderColor: '#111' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  filtersBox: { marginHorizontal: 12, marginBottom: 8, backgroundColor: '#F8F8F8', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#EEE' },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#DDD', backgroundColor: '#fff' },
  filterChipActive: { backgroundColor: '#111', borderColor: '#111' },
  filterChipText: { fontSize: 12, color: '#555' },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  priceInput: { flex: 1, borderWidth: 1, borderColor: '#DDD', borderRadius: 6, padding: 8, fontSize: 13, backgroundColor: '#fff' },
  priceDash: { color: '#888', fontSize: 16 },
  filterActions: { flexDirection: 'row', gap: 8 },
  resetBtn: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#888', borderRadius: 8, alignItems: 'center' },
  resetBtnText: { fontSize: 13, color: '#333', fontWeight: '600' },
  applyBtn: { flex: 2, padding: 10, backgroundColor: '#111', borderRadius: 8, alignItems: 'center' },
  applyBtnText: { fontSize: 13, color: '#fff', fontWeight: '700' },
  resultsHeader: { paddingHorizontal: 16, paddingVertical: 8 },
  resultsCount: { fontSize: 13, color: '#888' },
  card: { marginHorizontal: 12, marginBottom: 12, flexDirection: 'row', borderWidth: 1, borderColor: '#EEE', borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff' },
  cardImg: { width: 100, height: 90, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  cardImgText: { fontSize: 11, color: '#888', fontWeight: '600', textAlign: 'center' },
  cardBody: { flex: 1, padding: 10, justifyContent: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 2 },
  cardMeta: { fontSize: 12, color: '#888', marginBottom: 6 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardPrice: { fontSize: 13, fontWeight: '600', color: '#111' },
  cardRating: { fontSize: 13, color: '#555' },
  empty: { alignItems: 'center', paddingTop: 48 },
  emptyText: { fontSize: 15, color: '#888', marginBottom: 8 },
  emptyLink: { fontSize: 14, color: '#111', textDecorationLine: 'underline' },
});