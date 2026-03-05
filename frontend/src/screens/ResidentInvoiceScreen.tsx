import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config';

interface InvoiceItem {
  name: string;
  amount: number;
}

interface InvoiceInfo {
  id: string;
  billingMonth: string;
  memo?: string;
  type: 'FIXED' | 'VARIABLE';
  totalAmount: number;
  items: InvoiceItem[] | null;
  createdAt: string;
  villa: { name: string; bankName: string; accountNumber: string };
}

interface Payment {
  id: string;
  invoiceId: string;
  residentId: string;
  amount: number;
  status: string;
  createdAt: string;
  invoice: InvoiceInfo;
}

const formatBillingMonth = (billingMonth: string) => {
  try {
    const [y, m] = billingMonth.split('-');
    return `${y}년 ${parseInt(m, 10)}월 관리비`;
  } catch {
    return billingMonth;
  }
};

const ResidentInvoiceScreen = ({ navigation }: any) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      let userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        const raw = await AsyncStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw);
          userId = u.id;
        }
      }
      if (!userId) return;

      const res = await fetch(`${API_BASE_URL}/api/residents/${userId}/payments`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert('오류', '납부 내역을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPayments();
    }, [loadPayments])
  );

  const handleTransfer = async (payment: Payment) => {
    setConfirming(payment.id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices/${payment.invoiceId}/transfer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ residentId: payment.residentId }),
      });
      if (!res.ok) throw new Error('failed');
      Alert.alert('완료', '관리자에게 송금 완료 알림이 전달되었습니다.');
      await loadPayments();
    } catch (e) {
      Alert.alert('오류', '처리 중 문제가 발생했습니다.');
    } finally {
      setConfirming(null);
    }
  };

  const villa = payments[0]?.invoice?.villa;
  const hasBankInfo = villa?.bankName && villa?.accountNumber;

  const renderItem = ({ item }: { item: Payment }) => {
    const isVariable = item.invoice.type === 'VARIABLE';
    const invoiceItems = isVariable && Array.isArray(item.invoice.items) ? item.invoice.items : null;
    const isPending = item.status === 'PENDING';
    const isTransferred = item.status === 'TRANSFERRED';
    const isCompleted = item.status === 'COMPLETED';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleGroup}>
            <Text style={styles.cardTitle}>{formatBillingMonth(item.invoice.billingMonth)}</Text>
            <View style={[styles.typeBadge, isVariable ? styles.typeBadgeVar : styles.typeBadgeFix]}>
              <Text style={styles.typeBadgeText}>{isVariable ? '변동 관리비' : '고정 관리비'}</Text>
            </View>
          </View>
          {isCompleted && (
            <View style={[styles.statusChip, styles.chipCompleted]}>
              <Text style={styles.statusChipText}>납부 완료</Text>
            </View>
          )}
          {isTransferred && (
            <View style={[styles.statusChip, styles.chipTransferred]}>
              <Text style={styles.statusChipText}>입금 확인 중</Text>
            </View>
          )}
          {isPending && (
            <View style={[styles.statusChip, styles.chipPending]}>
              <Text style={styles.statusChipText}>미납</Text>
            </View>
          )}
        </View>

        <Text style={styles.amount}>{item.amount.toLocaleString()} 원</Text>

        {item.invoice.memo ? (
          <Text style={styles.memo}>{item.invoice.memo}</Text>
        ) : null}

        {invoiceItems && invoiceItems.length > 0 && (
          <View style={styles.breakdown}>
            <Text style={styles.breakdownHeader}>항목 내역</Text>
            {invoiceItems.map((entry, i) => (
              <View key={i} style={styles.breakdownRow}>
                <Text style={styles.breakdownName}>{entry.name}</Text>
                <Text style={styles.breakdownAmount}>{Number(entry.amount).toLocaleString()} 원</Text>
              </View>
            ))}
          </View>
        )}

        {isPending && (
          <TouchableOpacity
            style={[styles.transferBtn, confirming === item.id && styles.transferBtnDisabled]}
            onPress={() => handleTransfer(item)}
            disabled={confirming === item.id}
            activeOpacity={0.85}
          >
            {confirming === item.id ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.transferBtnText}>송금 완료 알리기</Text>
            )}
          </TouchableOpacity>
        )}

        {isTransferred && (
          <View style={styles.transferredInfo}>
            <Ionicons name="time-outline" size={15} color="#FF9500" />
            <Text style={styles.transferredInfoText}>관리자 확인 후 납부 완료 처리됩니다.</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>관리비 납부 내역</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>납부 내역 불러오는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            hasBankInfo ? (
              <View style={styles.bankCard}>
                <View style={styles.bankCardIcon}>
                  <Ionicons name="card-outline" size={22} color="#5856D6" />
                </View>
                <View style={styles.bankCardInfo}>
                  <Text style={styles.bankCardLabel}>관리비 입금 계좌</Text>
                  <Text style={styles.bankCardBank}>{villa!.bankName}</Text>
                  <Text style={styles.bankCardAccount}>{villa!.accountNumber}</Text>
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>발행된 청구서가 없습니다.</Text>
              <Text style={styles.emptySubText}>관리자가 청구서를 발행하면 여기에 표시됩니다.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F3F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backBtn: { width: 40 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#8E8E93' },

  listContent: { padding: 16, paddingBottom: 40 },

  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEEFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  bankCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bankCardInfo: { flex: 1 },
  bankCardLabel: { fontSize: 12, fontWeight: '600', color: '#5856D6', marginBottom: 2 },
  bankCardBank: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  bankCardAccount: { fontSize: 14, color: '#3A3A3C', marginTop: 2 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitleGroup: { flex: 1, marginRight: 12, gap: 6 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },

  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeBadgeFix: { backgroundColor: '#E3F2FD' },
  typeBadgeVar: { backgroundColor: '#FFF3E0' },
  typeBadgeText: { fontSize: 11, fontWeight: '700', color: '#3A3A3C' },

  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  chipPending: { backgroundColor: '#FF3B30' },
  chipTransferred: { backgroundColor: '#FF9500' },
  chipCompleted: { backgroundColor: '#34C759' },
  statusChipText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  amount: { fontSize: 24, fontWeight: '800', color: '#007AFF', marginBottom: 4 },
  memo: { fontSize: 13, color: '#6E6E73', fontStyle: 'italic', marginBottom: 10 },

  breakdown: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  breakdownHeader: { fontSize: 12, fontWeight: '600', color: '#6E6E73', marginBottom: 6, textTransform: 'uppercase' },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  breakdownName: { fontSize: 14, color: '#3A3A3C', flex: 1 },
  breakdownAmount: { fontSize: 14, color: '#1C1C1E', fontWeight: '600' },

  transferBtn: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  transferBtnDisabled: { opacity: 0.6 },
  transferBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  transferredInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: '#FFF8EE',
    borderRadius: 10,
    padding: 10,
  },
  transferredInfoText: { fontSize: 13, color: '#FF9500', flex: 1 },

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#3A3A3C', marginBottom: 6 },
  emptySubText: { fontSize: 13, color: '#8E8E93', textAlign: 'center' },
});

export default ResidentInvoiceScreen;
