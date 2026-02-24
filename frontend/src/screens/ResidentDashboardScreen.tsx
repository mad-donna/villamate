import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.219.112:3000';

interface InvoiceVilla {
  name: string;
  accountNumber: string;
  bankName: string;
}

interface InvoiceItem {
  name: string;
  amount: number;
}

interface InvoiceInfo {
  id: string;
  title: string;
  type: 'FIXED' | 'VARIABLE';
  totalAmount: number;
  items: InvoiceItem[] | null;
  dueDate: string;
  createdAt: string;
  villa: InvoiceVilla;
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

const ResidentDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoadingPayments(true);

      // Resolve userId from AsyncStorage
      let userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          userId = user.id;
          if (userId) await AsyncStorage.setItem('userId', userId);
        }
      }

      if (!userId) return;

      const response = await fetch(`${API_BASE_URL}/api/residents/${userId}/payments`);
      if (!response.ok) {
        throw new Error(`Failed to fetch payments: ${response.status}`);
      }

      const data = await response.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch payments error:', err);
    } finally {
      setLoadingPayments(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPayments();
    }, [fetchPayments])
  );

  const handleMarkCompleted = async (paymentId: string) => {
    setUpdatingId(paymentId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      if (!response.ok) {
        const data = await response.json();
        Alert.alert('오류', data.error || '상태 업데이트에 실패했습니다.');
        return;
      }

      // Refresh the list
      await fetchPayments();
    } catch (err) {
      console.error('handleMarkCompleted error:', err);
      Alert.alert('오류', '서버에 연결할 수 없습니다.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    } catch {
      return dateStr;
    }
  };

  const renderPaymentCard = ({ item }: { item: Payment }) => {
    const isPending = item.status === 'PENDING';
    const isUpdating = updatingId === item.id;
    const isVariable = item.invoice.type === 'VARIABLE';
    const invoiceItems: { name: string; amount: number }[] | null =
      isVariable && Array.isArray(item.invoice.items) ? item.invoice.items : null;

    return (
      <View style={styles.invoiceCard}>
        <View style={styles.invoiceCardHeader}>
          <View style={styles.invoiceTitleRow}>
            <Text style={styles.invoiceTitle}>{item.invoice.title}</Text>
            <View style={[styles.typeBadge, isVariable ? styles.typeBadgeVariable : styles.typeBadgeFixed]}>
              <Text style={styles.typeBadgeText}>
                {isVariable ? '변동 관리비' : '고정 관리비'}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              isPending ? styles.statusPending : styles.statusCompleted,
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {isPending ? '미납' : '납부완료'}
            </Text>
          </View>
        </View>

        <Text style={styles.invoiceAmount}>{item.amount.toLocaleString()} 원</Text>
        <Text style={styles.invoiceDueDate}>
          납부 기한: {formatDate(item.invoice.dueDate)}
        </Text>

        {/* VARIABLE invoice: show per-item breakdown */}
        {invoiceItems && invoiceItems.length > 0 && (
          <View style={styles.itemBreakdown}>
            <Text style={styles.itemBreakdownHeader}>청구 항목 내역</Text>
            {invoiceItems.map((entry, index) => (
              <View key={index} style={styles.itemBreakdownRow}>
                <Text style={styles.itemBreakdownName}>{entry.name}</Text>
                <Text style={styles.itemBreakdownAmount}>
                  {Number(entry.amount).toLocaleString()} 원
                </Text>
              </View>
            ))}
          </View>
        )}

        {item.invoice.villa && (
          <View style={styles.bankInfo}>
            <Text style={styles.bankInfoText}>
              {item.invoice.villa.bankName} {item.invoice.villa.accountNumber}
            </Text>
          </View>
        )}

        {isPending && (
          <TouchableOpacity
            style={[styles.payButton, isUpdating && styles.payButtonDisabled]}
            onPress={() => handleMarkCompleted(item.id)}
            disabled={isUpdating}
            activeOpacity={0.8}
          >
            {isUpdating ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.payButtonText}>송금 완료 처리</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>빌라메이트 (입주민)</Text>
          <Text style={styles.headerSubtitle}>안녕하세요!</Text>
        </View>

        {/* Payment / Invoice list section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>납부 내역</Text>
        </View>

        {loadingPayments ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>청구 내역 불러오는 중...</Text>
          </View>
        ) : payments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>발행된 청구서가 없습니다.</Text>
          </View>
        ) : (
          <FlatList
            data={payments}
            keyExtractor={(item) => item.id}
            renderItem={renderPaymentCard}
            scrollEnabled={false}
          />
        )}

        <TouchableOpacity
          style={styles.ledgerButton}
          onPress={() => navigation.navigate('Ledger')}
        >
          <Text style={styles.ledgerButtonText}>투명한 공용 장부 및 영수증 확인하기</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>* 관리비는 매달 25일에 발행됩니다.</Text>
          <Text style={styles.infoText}>* 문의사항은 동대표님께 연락주세요.</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await AsyncStorage.clear();
            navigation.replace('Login');
          }}
        >
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 15,
    color: '#8E8E93',
  },
  invoiceCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  invoiceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  invoiceTitleRow: {
    flex: 1,
    marginRight: 12,
    gap: 6,
  },
  invoiceTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 2,
  },
  typeBadgeFixed: {
    backgroundColor: '#E3F2FD',
  },
  typeBadgeVariable: {
    backgroundColor: '#FFF3E0',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3A3A3C',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusPending: {
    backgroundColor: '#FF3B30',
  },
  statusCompleted: {
    backgroundColor: '#34C759',
  },
  statusBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  invoiceAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  invoiceDueDate: {
    fontSize: 13,
    color: '#FF3B30',
    fontWeight: '600',
    marginBottom: 10,
  },
  itemBreakdown: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  itemBreakdownHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6E6E73',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  itemBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemBreakdownName: {
    fontSize: 14,
    color: '#3A3A3C',
    flex: 1,
  },
  itemBreakdownAmount: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  bankInfo: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  bankInfoText: {
    fontSize: 13,
    color: '#3A3A3C',
    fontWeight: '500',
  },
  payButton: {
    backgroundColor: '#007AFF',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  ledgerButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  ledgerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3A3C',
  },
  infoBox: {
    padding: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 20,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#8E8E93',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default ResidentDashboardScreen;
