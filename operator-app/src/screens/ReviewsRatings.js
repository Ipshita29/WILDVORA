import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Modal, Alert,
} from 'react-native';
import { theme } from '../theme';
import { Card, SectionHeader, StatusBadge, PrimaryButton, GhostButton } from '../components/SharedComponents';
import { initialPayouts } from '../data/mockData';

const BANK_FIELDS = [
  { key: 'name',    placeholder: 'Account Holder Name' },
  { key: 'account', placeholder: 'Account Number', keyboardType: 'numeric' },
  { key: 'ifsc',    placeholder: 'IFSC Code' },
  { key: 'bank',    placeholder: 'Bank Name' },
];

export default function Payouts({ bookings }) {
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankForm, setBankForm]  = useState({ name: '', account: '', ifsc: '', bank: '' });
  const [savedBank, setSavedBank] = useState(null);

  const totalEarnings = initialPayouts.reduce((s, p) => s + p.amount, 0);
  const pendingAmount = (bookings || [])
  .filter(b => b.status === 'confirmed')
  .reduce((s, b) => s + b.amount, 0);

  const handleSaveBank = () => {
    if (!bankForm.account.trim() || !bankForm.ifsc.trim()) {
      Alert.alert('Error', 'Please fill in all bank details.');
      return;
    }
    setSavedBank({ ...bankForm });
    setShowBankModal(false);
    Alert.alert('Saved', 'Bank account saved successfully!');
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Payouts</Text>

      {/* Earnings Summary */}
      <Card style={{ marginBottom: 16 }}>
        <SectionHeader title="Earnings Summary" />
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.bigValue, { color: theme.accent }]}>
              ₹{totalEarnings.toLocaleString()}
            </Text>
            <Text style={styles.textMuted}>Total Earned</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.bigValue, { color: theme.warning }]}>
              ₹{pendingAmount.toLocaleString()}
            </Text>
            <Text style={styles.textMuted}>Pending Settlement</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.bigValue, { color: theme.info }]}>
              {initialPayouts.length}
            </Text>
            <Text style={styles.textMuted}>Total Payouts</Text>
          </View>
        </View>
      </Card>

      {/* Settlement History */}
      <SectionHeader title="Settlement History" />
      {initialPayouts.map(p => (
        <Card key={p.id} style={{ marginBottom: 10 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.listingTitle}>₹{p.amount.toLocaleString()}</Text>
            <StatusBadge status={p.status} />
          </View>
          <Text style={styles.textMuted}>{p.date} · {p.bookings} bookings</Text>
        </Card>
      ))}

      {/* Bank Account Settings */}
      <SectionHeader title="Bank Account Settings" />
      <Card style={{ marginBottom: 20 }}>
        {savedBank ? (
          <View>
            <Text style={styles.textMuted}>Account Holder: {savedBank.name}</Text>
            <Text style={styles.textMuted}>
              Account No: ••••{savedBank.account.slice(-4)}
            </Text>
            <Text style={styles.textMuted}>IFSC: {savedBank.ifsc}</Text>
            <Text style={styles.textMuted}>Bank: {savedBank.bank}</Text>
            <TouchableOpacity
              style={[styles.actionBtn, { marginTop: 12, alignSelf: 'flex-start' }]}
              onPress={() => setShowBankModal(true)}
            >
              <Text style={[styles.actionBtnText, { color: theme.info }]}>Edit Bank Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <PrimaryButton label="Add Bank Account" onPress={() => setShowBankModal(true)} />
        )}
      </Card>

      {/* Bank Modal */}
      <Modal visible={showBankModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Bank Account Details</Text>
            {BANK_FIELDS.map(f => (
              <TextInput
                key={f.key}
                style={[styles.input, { marginBottom: 10 }]}
                placeholder={f.placeholder}
                placeholderTextColor={theme.textMuted}
                value={bankForm[f.key]}
                onChangeText={v => setBankForm(prev => ({ ...prev, [f.key]: v }))}
                keyboardType={f.keyboardType || 'default'}
              />
            ))}
            <PrimaryButton label="Save" onPress={handleSaveBank} />
            <GhostButton label="Cancel" onPress={() => setShowBankModal(false)} style={{ marginTop: 10 }} />
          </View>
        </View>
      </Modal>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  screenTitle: { color: theme.text, fontSize: 22, fontWeight: '700', marginBottom: 16, marginTop: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { alignItems: 'center', flex: 1 },
  bigValue: { fontSize: 20, fontWeight: '700' },
  listingTitle: { color: theme.text, fontSize: 15, fontWeight: '600' },
  textMuted: { color: theme.textMuted, fontSize: 13, marginTop: 2 },
  actionBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#3B82F622' },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.cardBorder,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    color: theme.text, fontSize: 14,
  },
  modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: theme.card, borderRadius: 20, padding: 24, margin: 16,
    borderWidth: 1, borderColor: theme.cardBorder,
  },
  modalTitle: { color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 14 },
});