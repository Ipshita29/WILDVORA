import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { operatorAPI } from '../services/api';

const BAR_MAX_H = 120;

// Build last-6-months labels
const buildMonthLabels = () => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ label: months[d.getMonth()], month: d.getMonth(), year: d.getFullYear() });
  }
  return result;
};

// Compute payout bar data from settlement history
const buildBarData = (history) => {
  const labels = buildMonthLabels();
  const totals = labels.map(({ month, year }) => {
    const sum = (history || []).reduce((acc, p) => {
      const d = new Date(p.createdAt || p.booking?.startDate);
      if (d.getMonth() === month && d.getFullYear() === year) {
        return acc + (p.amount || p.booking?.totalPrice || 0);
      }
      return acc;
    }, 0);
    return { ...labels.find(l => l.month === month && l.year === year), value: sum };
  });

  const maxVal = Math.max(...totals.map(t => t.value), 1);
  return totals.map((t, i) => ({
    label: t.label,
    pct: Math.round((t.value / maxVal) * 100) || 4,
    value: t.value > 0 ? `₹${(t.value / 1000).toFixed(1)}k` : '₹0',
    active: i === totals.length - 1,
  }));
};

const fmt = (num) => '₹' + Number(num || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export default function Payouts() {
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [earnings, setEarnings]       = useState(null);
  const [history, setHistory]         = useState([]);
  const [barData, setBarData]         = useState([]);
  const [bankAccount, setBankAccount] = useState(null);

  const [showBankModal, setShowBankModal] = useState(false);
  const [bankForm, setBankForm]           = useState({ holderName: '', accountNumber: '', ifscCode: '', bankName: '' });
  const [savingBank, setSavingBank]       = useState(false);

  const fetchPayouts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await operatorAPI.getPayouts();
      if (res.data.success) {
        setEarnings(res.data.earnings);
        setHistory(res.data.settlementHistory || []);
        setBarData(buildBarData(res.data.settlementHistory || []));
        if (res.data.bankAccount && Object.keys(res.data.bankAccount).length > 0) {
          setBankAccount(res.data.bankAccount);
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load payout data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchPayouts(); }, [fetchPayouts]);

  const onRefresh = () => { setRefreshing(true); fetchPayouts(true); };

  const openBankModal = () => {
    setBankForm({
      holderName:    bankAccount?.holderName    || '',
      accountNumber: bankAccount?.accountNumber || '',
      ifscCode:      bankAccount?.ifscCode      || '',
      bankName:      bankAccount?.bankName      || '',
    });
    setShowBankModal(true);
  };

  const handleSaveBank = async () => {
    const { holderName, accountNumber, ifscCode, bankName } = bankForm;
    if (!holderName.trim() || !accountNumber.trim() || !ifscCode.trim() || !bankName.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setSavingBank(true);
    try {
      const res = await operatorAPI.updateBankAccount(bankForm);
      if (res.data.success) {
        setBankAccount(res.data.bankAccount);
        setShowBankModal(false);
        Alert.alert('Saved', 'Bank account updated successfully!');
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update bank account.');
    } finally {
      setSavingBank(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading payout data...</Text>
      </View>
    );
  }

  const totalEarnings   = earnings?.totalEarnings   || 0;
  const pendingPayouts  = earnings?.pendingPayouts   || 0;

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
    >
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Payouts & Earnings</Text>
        <Text style={styles.pageSubtitle}>
          Manage your revenue, track performance, and update payout settings.
        </Text>
      </View>

      {/* Total Earnings card */}
      <View style={styles.earningsCard}>
        <Text style={styles.earningsLabel}>TOTAL EARNINGS</Text>
        <Text style={styles.earningsAmount}>{fmt(totalEarnings)}</Text>
        <View style={styles.earningsTrend}>
          <Feather name="trending-up" size={15} color={theme.primaryContainer} />
          <Text style={styles.earningsTrendText}>  From all confirmed & completed bookings</Text>
        </View>
      </View>

      {/* Pending payout card */}
      <View style={styles.pendingCard}>
        <Text style={styles.pendingLabel}>PENDING PAYOUT</Text>
        <Text style={styles.pendingAmount}>{fmt(pendingPayouts)}</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.pendingArrival}>Unsettled earnings awaiting release</Text>
        </View>
      </View>

      {/* Monthly Performance chart */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Monthly Performance</Text>
          <View style={styles.periodChip}>
            <Text style={styles.periodChipText}>Last 6 Months</Text>
          </View>
        </View>
        {barData.length === 0 ? (
          <View style={styles.chartEmpty}>
            <Text style={styles.chartEmptyText}>No payout data yet</Text>
          </View>
        ) : (
          <View style={styles.chartArea}>
            {barData.map((d, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (d.pct / 100) * BAR_MAX_H,
                        backgroundColor: d.active ? theme.primary : theme.primaryFixed + '99',
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, d.active && { color: theme.text, fontWeight: '700' }]}>
                  {d.label}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Recent Payouts / Settlement History */}
      <View style={styles.card}>
        <View style={[styles.rowBetween, { marginBottom: 16 }]}>
          <Text style={styles.cardTitle}>Settlement History</Text>
          <Text style={styles.countChip}>{history.length} records</Text>
        </View>

        {/* Table header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>DATE</Text>
          <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>REFERENCE</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>STATUS</Text>
          <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>AMOUNT</Text>
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={28} color={theme.outlineVariant} />
            <Text style={styles.emptyText}>No settlement records yet</Text>
          </View>
        ) : (
          history.slice(0, 10).map((p, i) => {
            const dateStr = p.createdAt
              ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'N/A';
            const ref = p._id ? `WV-${p._id.slice(-6).toUpperCase()}` : 'N/A';
            const amount = p.amount || p.booking?.totalPrice || 0;

            return (
              <View key={p._id || i} style={[styles.tableRow, i < history.slice(0, 10).length - 1 && styles.tableRowBorder]}>
                <Text style={[styles.tableCell, { flex: 1.2 }]}>{dateStr}</Text>
                <Text style={[styles.tableCellMuted, { flex: 1.5 }]}>{ref}</Text>
                <View style={{ flex: 1 }}>
                  <View style={styles.completedPill}>
                    <Text style={styles.completedPillText}>Released</Text>
                  </View>
                </View>
                <Text style={[styles.tableAmount, { flex: 1, textAlign: 'right' }]}>{fmt(amount)}</Text>
              </View>
            );
          })
        )}
      </View>

      {/* Payout Account */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Ionicons name="business-outline" size={20} color={theme.primary} />
          <Text style={styles.cardTitle}>Payout Account</Text>
        </View>

        {bankAccount && bankAccount.accountNumber ? (
          <View style={styles.bankCard}>
            <View style={styles.rowBetween}>
              <MaterialCommunityIcons name="credit-card-outline" size={32} color="#fff" />
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeText}>Primary</Text>
              </View>
            </View>
            <View style={{ marginTop: 20 }}>
              <Text style={styles.bankFieldLabel}>Account Holder</Text>
              <Text style={styles.bankFieldValue}>{bankAccount.holderName || '—'}</Text>
            </View>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.bankFieldLabel}>Account Number</Text>
                <Text style={styles.bankFieldValue}>
                  **** **** {String(bankAccount.accountNumber).slice(-4)}
                </Text>
              </View>
              <View>
                <Text style={styles.bankFieldLabel}>Bank</Text>
                <Text style={styles.bankFieldValue}>{bankAccount.bankName || '—'}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noBankCard}>
            <Ionicons name="card-outline" size={28} color={theme.outlineVariant} />
            <Text style={styles.noBankText}>No bank account linked yet</Text>
            <Text style={styles.noBankSub}>Add your bank details to receive payouts</Text>
          </View>
        )}

        <TouchableOpacity style={styles.changeBankBtn} onPress={openBankModal}>
          <Feather name="edit-2" size={15} color={theme.primary} />
          <Text style={styles.changeBankText}>
            {'  '}{bankAccount?.accountNumber ? 'Change Bank Details' : 'Add Bank Account'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.scheduleNote}>Payouts are settled automatically every 14 days</Text>
      </View>

      {/* Payout info */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color={theme.secondary} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.infoTitle}>Payout Schedule</Text>
          <Text style={styles.infoText}>
            Earnings are processed every 14 days. Transfer times vary based on your
            financial institution but typically arrive within 3–5 business days.
          </Text>
        </View>
      </View>

      {/* Bank modal */}
      <Modal visible={showBankModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update Bank Details</Text>
            {[
              { key: 'holderName',    ph: 'Account Holder Name' },
              { key: 'accountNumber', ph: 'Account Number', kt: 'numeric' },
              { key: 'ifscCode',      ph: 'IFSC Code' },
              { key: 'bankName',      ph: 'Bank Name' },
            ].map(f => (
              <TextInput
                key={f.key}
                style={[styles.input, { marginBottom: 10 }]}
                placeholder={f.ph}
                placeholderTextColor={theme.outlineVariant}
                value={bankForm[f.key]}
                onChangeText={v => setBankForm(prev => ({ ...prev, [f.key]: v }))}
                keyboardType={f.kt || 'default'}
                autoCapitalize={f.key === 'ifscCode' ? 'characters' : 'words'}
              />
            ))}
            <TouchableOpacity
              style={[styles.sendBtn, savingBank && { opacity: 0.7 }]}
              onPress={handleSaveBank}
              disabled={savingBank}
            >
              {savingBank
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.sendBtnText}>Save</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelLink} onPress={() => setShowBankModal(false)}>
              <Text style={styles.cancelLinkText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.bg, paddingHorizontal: 16, paddingTop: 8 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: theme.textLight, fontSize: 14 },

  pageHeader: { marginBottom: 16, marginTop: 4 },
  pageTitle: { color: theme.text, fontSize: 24, fontWeight: '700' },
  pageSubtitle: { color: theme.textMuted, fontSize: 14, marginTop: 4, lineHeight: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  earningsCard: {
    backgroundColor: theme.card, borderRadius: 24, padding: 22, marginBottom: 14,
    shadowColor: '#1E293B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
  },
  earningsLabel: { color: theme.textLight, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  earningsAmount: { color: theme.primary, fontSize: 36, fontWeight: '800', marginTop: 4 },
  earningsTrend: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  earningsTrendText: { color: theme.primaryContainer, fontSize: 13, fontWeight: '600' },

  pendingCard: {
    backgroundColor: theme.primary, borderRadius: 24, padding: 22, marginBottom: 14,
    shadowColor: theme.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 5,
    gap: 6,
  },
  pendingLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  pendingAmount: { color: '#FFFFFF', fontSize: 36, fontWeight: '800' },
  pendingArrival: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },

  card: {
    backgroundColor: theme.card, borderRadius: 24, padding: 20, marginBottom: 14,
    shadowColor: '#1E293B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 2,
  },
  cardTitle: { color: theme.text, fontSize: 16, fontWeight: '700' },
  periodChip: { backgroundColor: theme.surfaceContainerLow, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 6 },
  periodChipText: { color: theme.textMuted, fontSize: 12, fontWeight: '600' },
  countChip: { color: theme.textMuted, fontSize: 13, fontWeight: '600' },

  chartArea: {
    flexDirection: 'row', alignItems: 'flex-end',
    height: BAR_MAX_H + 32, marginTop: 16, gap: 6,
  },
  chartEmpty: { alignItems: 'center', paddingVertical: 28 },
  chartEmptyText: { color: theme.outlineVariant, fontSize: 13 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderTopLeftRadius: 6, borderTopRightRadius: 6, minHeight: 4 },
  barLabel: { color: theme.textLight, fontSize: 11, fontWeight: '500' },

  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  tableHeader: { marginBottom: 4 },
  tableRowBorder: { borderTopWidth: 1, borderTopColor: theme.cardBorder },
  tableHeaderText: { color: theme.textLight, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  tableCell: { color: theme.text, fontSize: 13 },
  tableCellMuted: { color: theme.textMuted, fontSize: 13 },
  tableAmount: { color: theme.text, fontSize: 15, fontWeight: '700' },
  completedPill: { backgroundColor: theme.primaryFixed + '33', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  completedPillText: { color: theme.primary, fontSize: 11, fontWeight: '600' },

  emptyState: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptyText: { color: theme.outlineVariant, fontSize: 13 },

  bankCard: {
    backgroundColor: theme.secondary, borderRadius: 18, padding: 20, gap: 12,
    shadowColor: theme.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 4,
  },
  primaryBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4 },
  primaryBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  bankFieldLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginBottom: 2 },
  bankFieldValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },

  noBankCard: {
    alignItems: 'center', paddingVertical: 24, gap: 8,
    backgroundColor: theme.surfaceContainerLow, borderRadius: 18,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: theme.outlineVariant,
  },
  noBankText: { color: theme.text, fontSize: 15, fontWeight: '600' },
  noBankSub: { color: theme.textLight, fontSize: 13 },

  changeBankBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingVertical: 12, borderWidth: 1.5, borderColor: theme.primary, borderRadius: 14 },
  changeBankText: { color: theme.primary, fontSize: 14, fontWeight: '600' },
  scheduleNote: { color: theme.textLight, fontSize: 12, textAlign: 'center', marginTop: 8 },

  infoCard: {
    backgroundColor: '#E8F4FB', borderRadius: 20, padding: 18, marginBottom: 8,
    flexDirection: 'row', alignItems: 'flex-start',
    borderWidth: 1, borderColor: '#C2E8FF',
  },
  infoTitle: { color: theme.secondary, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  infoText: { color: theme.textMuted, fontSize: 13, lineHeight: 18 },

  modalOverlay: { flex: 1, backgroundColor: '#00000055', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: theme.card, borderRadius: 24, padding: 24, margin: 16 },
  modalTitle: { color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 14 },
  input: { backgroundColor: theme.surfaceContainerLow, borderRadius: 14, padding: 14, color: theme.text, fontSize: 14 },
  sendBtn: { backgroundColor: theme.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  sendBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  cancelLink: { marginTop: 12, alignItems: 'center' },
  cancelLinkText: { color: theme.textLight, fontWeight: '600', fontSize: 14 },
});