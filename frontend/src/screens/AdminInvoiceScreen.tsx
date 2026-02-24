import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const API_BASE_URL = 'http://192.168.219.112:3000';

interface InvoicePayment {
  id: string;
  residentId: string;
  amount: number;
  status: string;
  resident: {
    id: string;
    name: string;
  };
}

interface Invoice {
  id: string;
  title: string;
  type: 'FIXED' | 'VARIABLE';
  totalAmount: number;
  amountPerResident: number;
  items: any;
  dueDate: string;
  createdAt: string;
  villaId: number;
  payments: InvoicePayment[];
}

const AdminInvoiceScreen = ({ navigation }: any) => {
  const [villaId, setVillaId] = useState<number | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-billing state
  const [autoBillingDay, setAutoBillingDay] = useState('');
  const [autoBillingLoading, setAutoBillingLoading] = useState(false);

  const resolveVillaId = async (): Promise<number | null> => {
    try {
      let userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          userId = user.id;
          if (userId) await AsyncStorage.setItem('userId', userId);
        }
      }
      if (!userId) return null;

      const response = await fetch(`${API_BASE_URL}/api/villas/${userId}`);
      if (!response.ok) return null;
      const villas = await response.json();
      if (!Array.isArray(villas) || villas.length === 0) return null;
      return villas[0].id;
    } catch (err) {
      console.error('resolveVillaId error:', err);
      return null;
    }
  };

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      let id = villaId;
      if (!id) {
        id = await resolveVillaId();
        if (id) setVillaId(id);
      }
      if (!id) return;

      const response = await fetch(`${API_BASE_URL}/api/villas/${id}/invoices`);
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchInvoices error:', err);
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  useFocusEffect(
    useCallback(() => {
      fetchInvoices();
    }, [fetchInvoices])
  );

  const handleSetAutoBilling = async () => {
    const day = parseInt(autoBillingDay, 10);
    if (isNaN(day) || day < 1 || day > 28) {
      Alert.alert('입력 오류', '자동 발행일은 1~28 사이의 숫자로 입력해주세요.');
      return;
    }

    if (!villaId) {
      Alert.alert('오류', '빌라 정보를 불러올 수 없습니다.');
      return;
    }

    setAutoBillingLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/villas/${villaId}/auto-billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoBillingDay: day }),
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert('오류', data.error || '자동 발행 설정에 실패했습니다.');
        return;
      }

      Alert.alert('완료', `매월 ${day}일에 자동으로 청구서가 발행됩니다.`);
      setAutoBillingDay('');
    } catch (err) {
      console.error('handleSetAutoBilling error:', err);
      Alert.alert('오류', '서버에 연결할 수 없습니다.');
    } finally {
      setAutoBillingLoading(false);
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

  const renderPaymentRow = (payment: InvoicePayment) => (
    <View key={payment.id} style={styles.paymentRow}>
      <Text style={styles.paymentResidentName}>{payment.resident?.name || '입주민'}</Text>
      <Text style={styles.paymentAmount}>{payment.amount.toLocaleString()} 원</Text>
      <View
        style={[
          styles.statusBadge,
          payment.status === 'COMPLETED' ? styles.statusCompleted : styles.statusPending,
        ]}
      >
        <Text style={styles.statusBadgeText}>
          {payment.status === 'COMPLETED' ? '납부완료' : '미납'}
        </Text>
      </View>
    </View>
  );

  const renderInvoiceCard = ({ item }: { item: Invoice }) => {
    const paidCount = item.payments.filter((p) => p.status === 'COMPLETED').length;
    const totalCount = item.payments.length;
    const isVariable = item.type === 'VARIABLE';

    return (
      <View style={styles.invoiceCard}>
        <View style={styles.invoiceCardHeader}>
          <View style={styles.invoiceTitleRow}>
            <Text style={styles.invoiceTitle}>{item.title}</Text>
            <View style={[styles.typeBadge, isVariable ? styles.typeBadgeVariable : styles.typeBadgeFixed]}>
              <Text style={styles.typeBadgeText}>
                {isVariable ? '변동' : '고정'}
              </Text>
            </View>
          </View>
          <Text style={styles.invoiceTotalAmount}>
            {item.totalAmount.toLocaleString()} 원
          </Text>
        </View>

        <Text style={styles.invoicePerResident}>
          세대 당: {item.amountPerResident.toLocaleString()} 원
        </Text>
        <Text style={styles.invoiceDueDate}>납부 기한: {formatDate(item.dueDate)}</Text>
        <Text style={styles.invoiceProgress}>
          납부 현황: {paidCount} / {totalCount} 명
        </Text>

        {item.payments.length > 0 && (
          <View style={styles.paymentList}>
            <Text style={styles.paymentListHeader}>입주민별 납부 상태</Text>
            {item.payments.map(renderPaymentRow)}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>청구서 관리</Text>
          <Text style={styles.headerSubtitle}>청구서 발행 및 납부 현황을 확인하세요</Text>
        </View>

        {/* New Invoice Button — navigates to dedicated CreateInvoice screen */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.getParent()?.navigate('CreateInvoice')}
          activeOpacity={0.85}
        >
          <Text style={styles.createButtonText}>+ 새 청구서 만들기</Text>
        </TouchableOpacity>

        {/* Auto-billing Section */}
        <View style={styles.autoBillingCard}>
          <Text style={styles.autoBillingTitle}>자동 발행 설정</Text>
          <Text style={styles.autoBillingDesc}>
            매월 지정한 날짜에 자동으로 관리비 청구서가 발행됩니다. (1~28일)
          </Text>
          <View style={styles.autoBillingRow}>
            <TextInput
              style={styles.autoBillingInput}
              placeholder="발행일 (예: 25)"
              keyboardType="number-pad"
              value={autoBillingDay}
              onChangeText={setAutoBillingDay}
              maxLength={2}
            />
            <TouchableOpacity
              style={styles.autoBillingButton}
              onPress={handleSetAutoBilling}
              disabled={autoBillingLoading}
              activeOpacity={0.85}
            >
              {autoBillingLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.autoBillingButtonText}>설정</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Invoice List */}
        <Text style={styles.sectionTitle}>발행된 청구서</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>청구서 불러오는 중...</Text>
          </View>
        ) : invoices.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>발행된 청구서가 없습니다.</Text>
          </View>
        ) : (
          <FlatList
            data={invoices}
            keyExtractor={(item) => item.id}
            renderItem={renderInvoiceCard}
            scrollEnabled={false}
          />
        )}
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
    paddingBottom: 48,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  createButton: {
    backgroundColor: '#007AFF',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  autoBillingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  autoBillingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  autoBillingDesc: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 14,
    lineHeight: 18,
  },
  autoBillingRow: {
    flexDirection: 'row',
    gap: 10,
  },
  autoBillingInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#1C1C1E',
  },
  autoBillingButton: {
    backgroundColor: '#34C759',
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  autoBillingButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
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
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  invoiceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  invoiceTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 12,
    flexWrap: 'wrap',
  },
  invoiceTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
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
  invoiceTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  invoicePerResident: {
    fontSize: 13,
    color: '#3A3A3C',
    fontWeight: '500',
    marginBottom: 2,
  },
  invoiceDueDate: {
    fontSize: 13,
    color: '#FF3B30',
    fontWeight: '600',
    marginBottom: 4,
  },
  invoiceProgress: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 14,
  },
  paymentList: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 14,
  },
  paymentListHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6E6E73',
    marginBottom: 10,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentResidentName: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  paymentAmount: {
    fontSize: 14,
    color: '#3A3A3C',
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
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
});

export default AdminInvoiceScreen;
