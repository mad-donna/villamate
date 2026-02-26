import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.219.108:3000';

interface InvoiceVilla {
  name: string;
}

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
  const [residentUserId, setResidentUserId] = useState<string | null>(null);
  const [residentVillaId, setResidentVillaId] = useState<number | null>(null);

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

      setResidentUserId(userId);

      // Resolve villaId from stored user.villa
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const storedUser = JSON.parse(userStr);
        if (storedUser?.villa?.id) {
          setResidentVillaId(storedUser.villa.id);
        }
      }

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

  // Format 'YYYY-MM' -> 'YYYY년 M월 관리비'
  const formatBillingMonth = (billingMonth: string) => {
    try {
      const [y, m] = billingMonth.split('-');
      return `${y}년 ${parseInt(m, 10)}월 관리비`;
    } catch {
      return billingMonth;
    }
  };

  const renderPaymentCard = ({ item }: { item: Payment }) => {
    const isPending = item.status === 'PENDING';
    const isVariable = item.invoice.type === 'VARIABLE';
    const invoiceItems: { name: string; amount: number }[] | null =
      isVariable && Array.isArray(item.invoice.items) ? item.invoice.items : null;

    return (
      <View style={styles.invoiceCard}>
        <View style={styles.invoiceCardHeader}>
          <View style={styles.invoiceTitleRow}>
            <Text style={styles.invoiceTitle}>{formatBillingMonth(item.invoice.billingMonth)}</Text>
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
        {item.invoice.memo ? (
          <Text style={styles.invoiceMemo}>{item.invoice.memo}</Text>
        ) : null}

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

        {isPending && (
          <TouchableOpacity
            style={styles.pgPayButton}
            onPress={() => navigation.navigate('Payment', {
              paymentId: item.id,
              amount: item.amount,
              invoiceName: formatBillingMonth(item.invoice.billingMonth),
            })}
            activeOpacity={0.85}
          >
            <Text style={styles.pgPayButtonText}>빌라메이트로 결제하기</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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

        <TouchableOpacity
          style={styles.communityButton}
          onPress={() =>
            navigation.navigate('Board', {
              villaId: residentVillaId,
              userId: residentUserId,
              userRole: 'RESIDENT',
            })
          }
        >
          <Text style={styles.communityButtonText}>커뮤니티 게시판</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.parkingButton}
          onPress={() => {
            if (!residentVillaId) return Alert.alert('오류', '빌라 정보를 불러오는 중입니다.');
            navigation.navigate('ParkingSearch', { villaId: residentVillaId });
          }}
        >
          <Text style={styles.parkingButtonText}>주차 조회</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>* 관리비는 매달 25일에 발행됩니다.</Text>
          <Text style={styles.infoText}>* 문의사항은 관리자님께 연락주세요.</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await AsyncStorage.clear();
            navigation.dispatch(
              CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
            );
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
  invoiceMemo: {
    fontSize: 13,
    color: '#6E6E73',
    fontStyle: 'italic',
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
  pgPayButton: {
    backgroundColor: '#4CAF50',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  pgPayButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
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
    marginBottom: 12,
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
  communityButton: {
    backgroundColor: '#5856D6',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#5856D6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  communityButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  parkingButton: {
    backgroundColor: '#30B0C7',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#30B0C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  parkingButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
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
