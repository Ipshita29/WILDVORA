import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { theme } from '../theme';
import { PrimaryButton, GhostButton } from '../components/SharedComponents';

const CATEGORIES = ['Camping', 'Trekking', 'Water Sports', 'Safari', 'Adventure', 'Resort'];

export default function CreateEditListing({ editListing, setListings, setActiveTab }) {
  const isEdit = !!editListing;

  const [form, setForm] = useState(
    editListing
      ? { ...editListing }
      : {
          title: '',
          category: '',
          description: '',
          price: '',
          groupSizeMin: '',
          groupSizeMax: '',
          inclusions: '',
          exclusions: '',
          cancellationPolicy: '',
          status: 'draft',
        }
  );

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!form.title.trim() || !form.price) {
      Alert.alert('Error', 'Please fill in at least a title and price.');
      return;
    }
    if (isEdit) {
      setListings(prev => prev.map(l => l.id === editListing.id ? { ...l, ...form } : l));
      Alert.alert('Success', 'Listing updated!');
    } else {
      const newListing = {
        ...form,
        id: Date.now().toString(),
        photos: [],
        availability: [],
        status: 'draft',
      };
      setListings(prev => [...prev, newListing]);
      Alert.alert('Success', 'Listing saved as draft!');
    }
    setActiveTab('listings');
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={styles.screenTitle}>{isEdit ? 'Edit Listing' : 'Create New Listing'}</Text>

      {/* Title */}
      <FormField label="Title" value={form.title} onChangeText={v => set('title', v)} />

      {/* Description */}
      <FormField label="Description" value={form.description} onChangeText={v => set('description', v)} multiline />

      {/* Category */}
      <View style={{ marginBottom: 14 }}>
        <Text style={styles.fieldLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, form.category === cat && styles.chipActive]}
                onPress={() => set('category', cat)}
              >
                <Text style={[styles.chipText, form.category === cat && { color: theme.bg }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Price */}
      <FormField label="Price (₹ per person)" value={String(form.price)} onChangeText={v => set('price', v)} keyboardType="numeric" />

      {/* Group Size */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <FormField label="Min Group Size" value={String(form.groupSizeMin)} onChangeText={v => set('groupSizeMin', v)} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <FormField label="Max Group Size" value={String(form.groupSizeMax)} onChangeText={v => set('groupSizeMax', v)} keyboardType="numeric" />
        </View>
      </View>

      {/* Inclusions */}
      <FormField label="Inclusions" value={form.inclusions} onChangeText={v => set('inclusions', v)} multiline />

      {/* Exclusions */}
      <FormField label="Exclusions" value={form.exclusions} onChangeText={v => set('exclusions', v)} multiline />

      {/* Cancellation Policy */}
      <FormField label="Cancellation Policy" value={form.cancellationPolicy} onChangeText={v => set('cancellationPolicy', v)} multiline />

      {/* Photos placeholder */}
      <View style={{ marginBottom: 14 }}>
        <Text style={styles.fieldLabel}>Photos</Text>
        <TouchableOpacity style={styles.photoUpload}>
          <Text style={{ color: theme.textMuted, fontSize: 24 }}>📷</Text>
          <Text style={{ color: theme.textMuted, marginTop: 4 }}>Tap to add photos</Text>
        </TouchableOpacity>
      </View>

      <PrimaryButton label={isEdit ? 'Update Listing' : 'Save as Draft'} onPress={handleSave} />
      <GhostButton label="Cancel" onPress={() => setActiveTab('listings')} style={{ marginTop: 10 }} />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function FormField({ label, value, onChangeText, multiline, keyboardType }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={theme.textMuted}
        multiline={multiline}
        keyboardType={keyboardType || 'default'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  screenTitle: { color: theme.text, fontSize: 22, fontWeight: '700', marginBottom: 16, marginTop: 4 },
  fieldLabel: { color: theme.textMuted, fontSize: 12, marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: theme.text,
    fontSize: 14,
  },
  chip: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder,
  },
  chipActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  chipText: { color: theme.textMuted, fontSize: 13, fontWeight: '500' },
  photoUpload: {
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder,
    borderRadius: 10, borderStyle: 'dashed', height: 90,
    alignItems: 'center', justifyContent: 'center',
  },
});