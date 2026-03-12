import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import api from '../utils/api';

interface LedgerTransaction {
  id: number;
  villaId: number;
  date: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  hasReceipt: boolean;
  receiptUrl: string | null;
}

const LedgerScreen = ({ route }: any) => {
  const [villaId, setVillaId] = useState<number | null>(route?.params?.villaId ?? null);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Receipt modal state
  const [selectedTransaction, setSelectedTransaction] = useState<LedgerTransaction | null>(null);
  const [isReceiptModalVisible, setIsReceiptModalVisible] = useState(false);

  // Create transaction modal state
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formDate, setFormDate] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

  const resolveVillaId = async (): Promise<number | null> => {
    // 1. Check route params (passed when navigated as a stack screen)
    if (route?.params?.villaId) return Number(route.params.villaId);

    // 2. Try resident user's villa
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user?.villa?.id) return Number(user.villa.id);
      }
    } catch {
      // ignore parse errors
    }

    // 3. Try admin: fetch from API using userId
    try {
      let userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          userId = user?.id ?? null;
        }
      }
      if (userId) {
        const res = await api.get(`/api/villas/${userId}`);
        const villas = res.data;
        if (Array.isArray(villas) && villas.length > 0) return Number(villas[0].id);
      }
    } catch {
      // ignore
    }

    return null;
  };

  const fetchLedger = useCallback(async () => {
    try {
      setLoading(true);
      let id = villaId;
      if (!id) {
        id = await resolveVillaId();
        if (id) setVillaId(id);
      }
      if (!id) return;

      const res = await api.get(`/api/villas/${id}/ledger`);
      setTransactions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('fetchLedger error:', err);
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  useFocusEffect(
    useCallback(() => {
      fetchLedger();
    }, [fetchLedger])
  );

  // Compute running balance: sum of INCOME minus sum of EXPENSE
  const balance = transactions.reduce((acc, t) => {
    return t.type === 'INCOME' ? acc + t.amount : acc - t.amount;
  }, 0);

  const formatDate = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    } catch {
      return isoDate;
    }
  };

  const openReceipt = (item: LedgerTransaction) => {
    setSelectedTransaction(item);
    setIsReceiptModalVisible(true);
  };

  const openCreateModal = () => {
    // Default date to today
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setFormDate(`${y}-${m}-${d}`);
    setFormDesc('');
    setFormAmount('');
    setFormType('EXPENSE');
    setIsCreateModalVisible(true);
  };

  const handleCreate = async () => {
    if (!formDate.trim() || !formDesc.trim() || !formAmount.trim()) {
      Alert.alert('입력 오류', '날짜, 내용, 금액을 모두 입력해주세요.');
      return;
    }
    const parsedAmount = parseInt(formAmount.replace(/,/g, ''), 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('입력 오류', '금액은 양수 숫자로 입력해주세요.');
      return;
    }
    if (!villaId) {
      Alert.alert('오류', '빌라 정보를 불러올 수 없습니다.');
      return;
    }

    setCreateLoading(true);
    try {
      await api.post(`/api/villas/${villaId}/ledger`, {
        date: formDate,
        description: formDesc.trim(),
        amount: parsedAmount,
        type: formType,
        hasReceipt: false,
      });
      setIsCreateModalVisible(false);
      // Refresh the list
      await fetchLedger();
    } catch (err: any) {
      console.error('handleCreate error:', err);
      Alert.alert('오류', err.response?.data?.error || '내역을 추가할 수 없습니다.');
    } finally {
      setCreateLoading(false);
    }
  };

  const renderItem = ({ item }: { item: LedgerTransaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
        <Text style={styles.itemDesc}>{item.description}</Text>
      </View>
      <View style={styles.itemRight}>
        <Text style={[styles.itemAmount, item.type === 'EXPENSE' ? styles.expenseText : styles.incomeText]}>
          {item.type === 'INCOME' ? '+' : '-'}{item.amount.toLocaleString()}원
        </Text>
        {item.hasReceipt && (
          <TouchableOpacity style={styles.receiptButton} onPress={() => openReceipt(item)}>
            <Text style={styles.receiptButtonText}>영수증 보기</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Balance header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>우리 빌라 공용 통장</Text>
        <Text style={styles.balanceText}>
          {balance >= 0 ? '' : '-'}₩{Math.abs(balance).toLocaleString()}
        </Text>
      </View>

      {/* Transaction list */}
      <View style={styles.listContainer}>
        <View style={styles.listTitleRow}>
          <Text style={styles.listTitle}>입출금 내역</Text>
          <TouchableOpacity style={styles.addButton} onPress={openCreateModal} activeOpacity={0.85}>
            <Text style={styles.addButtonText}>+ 내역 추가</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>내역 불러오는 중...</Text>
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>등록된 내역이 없습니다</Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      {/* Receipt Modal */}
      <Modal
        visible={isReceiptModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsReceiptModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.receiptCard}>
            <Text style={styles.receiptTitle}>지출 영수증</Text>
            <View style={styles.receiptDivider} />
            <View style={styles.receiptContent}>
              <Text style={styles.receiptLabel}>항목: {selectedTransaction?.description}</Text>
              <Text style={styles.receiptLabel}>상태: 결제 완료</Text>
              {selectedTransaction?.receiptUrl ? (
                <View style={styles.fakeImage}>
                  <Text style={styles.fakeImageText}>첨부 이미지</Text>
                  <Text style={styles.fakeImageSubtext}>{selectedTransaction.receiptUrl}</Text>
                </View>
              ) : (
                <View style={styles.fakeImage}>
                  <Text style={styles.fakeImageText}>영수증 이미지 샘플</Text>
                  <Text style={styles.fakeImageSubtext}>[검증 완료]</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsReceiptModalVisible(false)}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Transaction Modal */}
      <Modal
        visible={isCreateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.createCard}>
            <Text style={styles.createCardTitle}>내역 추가</Text>
            <View style={styles.receiptDivider} />

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Type toggle */}
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[styles.typeButton, formType === 'EXPENSE' && styles.typeButtonActive]}
                  onPress={() => setFormType('EXPENSE')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.typeButtonText, formType === 'EXPENSE' && styles.typeButtonTextActive]}>
                    지출
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, formType === 'INCOME' && styles.typeButtonActiveIncome]}
                  onPress={() => setFormType('INCOME')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.typeButtonText, formType === 'INCOME' && styles.typeButtonTextActive]}>
                    수입
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>날짜</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#C7C7CC"
                value={formDate}
                onChangeText={setFormDate}
              />

              <Text style={styles.fieldLabel}>내용</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="예: 클리닝 용역비"
                placeholderTextColor="#C7C7CC"
                value={formDesc}
                onChangeText={setFormDesc}
              />

              <Text style={styles.fieldLabel}>금액 (원)</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="예: 100000"
                placeholderTextColor="#C7C7CC"
                value={formAmount}
                onChangeText={setFormAmount}
                keyboardType="number-pad"
              />
            </ScrollView>

            <View style={styles.createCardButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsCreateModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, formType === 'INCOME' && styles.submitButtonIncome]}
                onPress={handleCreate}
                disabled={createLoading}
                activeOpacity={0.85}
              >
                {createLoading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>추가</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  balanceText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '800',
  },
  listContainer: {
    flex: 1,
    padding: 20,
  },
  listTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
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
  listContent: {
    gap: 12,
  },
  transactionItem: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemLeft: {
    flex: 1,
  },
  itemDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  expenseText: {
    color: '#FF3B30',
  },
  incomeText: {
    color: '#34C759',
  },
  receiptButton: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  receiptButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  // Receipt modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  receiptCard: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  receiptDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F2F2F7',
    marginBottom: 20,
  },
  receiptContent: {
    width: '100%',
    marginBottom: 24,
  },
  receiptLabel: {
    fontSize: 15,
    color: '#3A3A3C',
    marginBottom: 8,
  },
  fakeImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  fakeImageText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '600',
  },
  fakeImageSubtext: {
    fontSize: 12,
    color: '#C7C7CC',
    marginTop: 4,
  },
  closeButton: {
    backgroundColor: '#1C1C1E',
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Create transaction modal
  createCard: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  createCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  typeButtonActive: {
    backgroundColor: '#FF3B30',
  },
  typeButtonActiveIncome: {
    backgroundColor: '#34C759',
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8E8E93',
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6E6E73',
    marginBottom: 6,
  },
  fieldInput: {
    height: 48,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#1C1C1E',
    marginBottom: 16,
  },
  createCardButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3A3C',
  },
  submitButton: {
    flex: 2,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
  },
  submitButtonIncome: {
    backgroundColor: '#34C759',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default LedgerScreen;
