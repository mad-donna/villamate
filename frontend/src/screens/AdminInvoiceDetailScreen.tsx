import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config';


interface PaymentRecord {
  id: string;
  invoiceId: string;
  residentId: string;
  amount: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
    roomNumber: string;
  };
}

const formatBillingMonth = (bm: string) => {
  const [year, month] = bm.split('-');
  return `${year}년 ${parseInt(month)}월 관리비`;
};

const AdminInvoiceDetailScreen = ({ route, navigation }: any) => {
  const { invoiceId, billingMonth } = route.params as {
    invoiceId: string;
    billingMonth: string;
  };

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/invoices/${invoiceId}/payments`
      );
      if (!response.ok) throw new Error('Failed to fetch payments');
      const data = await response.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchPayments error:', err);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useFocusEffect(
    useCallback(() => {
      fetchPayments();
    }, [fetchPayments])
  );

  const totalCollected = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalUnpaid = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);

  const renderItem = ({ item }: { item: PaymentRecord }) => {
    const isPaid = item.status === 'COMPLETED';
    return (
      <View style={styles.paymentCard}>
        <View style={styles.paymentCardLeft}>
          <Text style={styles.roomNumber}>{item.user.roomNumber}호</Text>
          <Text style={styles.residentName}>{item.user.name}</Text>
        </View>
        <View style={styles.paymentCardRight}>
          <Text style={styles.paymentAmount}>
            {item.amount.toLocaleString()}원
          </Text>
          <View
            style={[
              styles.statusBadge,
              isPaid ? styles.statusCompleted : styles.statusPending,
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {isPaid ? '납부 완료' : '미납 대기'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{formatBillingMonth(billingMonth)}</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>납부 현황 불러오는 중..</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={
            <View>
              {/* Summary cards */}
              <View style={styles.summaryRow}>
                <View style={[styles.summaryCard, styles.summaryCardCollected]}>
                  <Text style={styles.summaryLabel}>총 수금액</Text>
                  <Text style={[styles.summaryAmount, styles.summaryAmountCollected]}>
                    {totalCollected.toLocaleString()}원
                  </Text>
                </View>
                <View style={[styles.summaryCard, styles.summaryCardUnpaid]}>
                  <Text style={styles.summaryLabel}>미납액</Text>
                  <Text style={[styles.summaryAmount, styles.summaryAmountUnpaid]}>
                    {totalUnpaid.toLocaleString()}원
                  </Text>
                </View>
              </View>

              {/* Section label */}
              <Text style={styles.sectionTitle}>입주민별 납부 현황</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>납부 기록이 없습니다.</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  backButtonText: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  listContent: {
    padding: 20,
    paddingBottom: 48,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryCardCollected: {
    backgroundColor: '#E8F5E9',
  },
  summaryCardUnpaid: {
    backgroundColor: '#FFEBEE',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6E6E73',
    fontWeight: '600',
    marginBottom: 6,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '800',
  },
  summaryAmountCollected: {
    color: '#2E7D32',
  },
  summaryAmountUnpaid: {
    color: '#C62828',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  paymentCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  paymentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#007AFF',
  },
  residentName: {
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  paymentCardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusCompleted: {
    backgroundColor: '#34C759',
  },
  statusPending: {
    backgroundColor: '#FF3B30',
  },
  statusBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#8E8E93',
  },
});

export default AdminInvoiceDetailScreen;
