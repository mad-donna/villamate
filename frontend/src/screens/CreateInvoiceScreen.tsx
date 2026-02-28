import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.219.124:3000';

type InvoiceType = 'FIXED' | 'VARIABLE';

interface VariableItem {
  name: string;
  amount: string;
}

const CreateInvoiceScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('FIXED');

  // Billing month state: separate year and month for easy increment/decrement
  const now = new Date();
  const [billingYear, setBillingYear] = useState(now.getFullYear());
  const [billingMonthNum, setBillingMonthNum] = useState(now.getMonth() + 1); // 1-12

  // Optional memo field
  const [memo, setMemo] = useState('');

  // FIXED-only field
  const [fixedAmount, setFixedAmount] = useState('');

  // VARIABLE-only field
  const [items, setItems] = useState<VariableItem[]>([{ name: '', amount: '' }]);

  // State
  const [loading, setLoading] = useState(false);
  const [villaId, setVillaId] = useState<number | null>(null);
  const [resolving, setResolving] = useState(true);

  // Resolve villaId on mount by fetching the admin's villa
  useEffect(() => {
    const resolveVillaId = async () => {
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

        if (!userId) {
          Alert.alert('오류', '로그인 정보를 찾을 수 없습니다.');
          navigation.goBack();
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/villas/${userId}`);
        if (!response.ok) throw new Error('villa fetch failed');

        const villas = await response.json();
        if (!Array.isArray(villas) || villas.length === 0) {
          Alert.alert('오류', '등록된 빌라가 없습니다.');
          navigation.goBack();
          return;
        }

        setVillaId(villas[0].id);
      } catch (err) {
        console.error('Resolve villaId error:', err);
        Alert.alert('오류', '빌라 정보를 불러오지 못했습니다');
        navigation.goBack();
      } finally {
        setResolving(false);
      }
    };

    resolveVillaId();
  }, []);

  // Billing month navigation helpers
  const decrementMonth = () => {
    if (billingMonthNum === 1) {
      setBillingYear((y) => y - 1);
      setBillingMonthNum(12);
    } else {
      setBillingMonthNum((m) => m - 1);
    }
  };

  const incrementMonth = () => {
    if (billingMonthNum === 12) {
      setBillingYear((y) => y + 1);
      setBillingMonthNum(1);
    } else {
      setBillingMonthNum((m) => m + 1);
    }
  };

  // Format billingMonth as YYYY-MM string for API
  const billingMonthString = `${billingYear}-${String(billingMonthNum).padStart(2, '0')}`;

  // VARIABLE items helpers
  const addItem = () => {
    setItems((prev) => [...prev, { name: '', amount: '' }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItemName = (index: number, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, name: value } : item)));
  };

  const updateItemAmount = (index: number, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, amount: value } : item)));
  };

  const variableTotal = items.reduce((sum, item) => {
    const n = Number(item.amount);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  const handleSubmit = async () => {
    if (!villaId) {
      Alert.alert('오류', '빌라 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (invoiceType === 'FIXED') {
      if (!fixedAmount.trim() || isNaN(Number(fixedAmount)) || Number(fixedAmount) <= 0) {
        Alert.alert('알림', '세대 당 관리비 금액을 올바르게 입력해주세요.');
        return;
      }
    } else {
      if (items.length === 0) {
        Alert.alert('알림', '항목을 하나 이상 추가해주세요.');
        return;
      }
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.name.trim()) {
          Alert.alert('알림', `${i + 1}번째 항목의 이름을 입력해주세요.`);
          return;
        }
        if (!item.amount.trim() || isNaN(Number(item.amount)) || Number(item.amount) <= 0) {
          Alert.alert('알림', `${i + 1}번째 항목의 금액을 올바르게 입력해주세요.`);
          return;
        }
      }
    }

    try {
      setLoading(true);

      const body: any = {
        billingMonth: billingMonthString,
        type: invoiceType,
        memo: memo.trim() || undefined,
      };

      if (invoiceType === 'FIXED') {
        body.fixedAmount = Number(fixedAmount);
      } else {
        body.items = items.map((item) => ({
          name: item.name.trim(),
          amount: Number(item.amount),
        }));
      }

      const response = await fetch(`${API_BASE_URL}/api/villas/${villaId}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '발행 실패');
      }

      Alert.alert('발행 완료', '청구서를 성공적으로 발행했습니다', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      console.error('Create invoice error:', err);
      Alert.alert('오류', err.message || '청구서 발행 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (resolving) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>빌라 정보 불러오는 중..</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F7' }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        enableOnAndroid={true}
        extraHeight={120}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSection}>
          <Text style={styles.screenTitle}>관리비 청구서 발행</Text>
          <Text style={styles.subtitle}>입주민에게 발행할 청구서의 정보를 입력해주세요.</Text>
        </View>

        {/* Segmented Control */}
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              invoiceType === 'FIXED' && styles.segmentButtonActive,
            ]}
            onPress={() => setInvoiceType('FIXED')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentButtonText,
                invoiceType === 'FIXED' && styles.segmentButtonTextActive,
              ]}
            >
              고정 관리비
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              invoiceType === 'VARIABLE' && styles.segmentButtonActive,
            ]}
            onPress={() => setInvoiceType('VARIABLE')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentButtonText,
                invoiceType === 'VARIABLE' && styles.segmentButtonTextActive,
              ]}
            >
              변동 관리비
            </Text>
          </TouchableOpacity>
        </View>

        {/* Common fields */}
        <View style={styles.formCard}>
          {/* Billing Month Selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>청구 월</Text>
            <View style={styles.monthSelector}>
              <TouchableOpacity
                style={styles.monthArrowButton}
                onPress={decrementMonth}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.monthArrowText}>{'<'}</Text>
              </TouchableOpacity>
              <Text style={styles.monthDisplayText}>
                {billingYear}년 {billingMonthNum}월
              </Text>
              <TouchableOpacity
                style={styles.monthArrowButton}
                onPress={incrementMonth}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.monthArrowText}>{'>'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Optional Memo */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>메모 (선택)</Text>
            <TextInput
              style={[styles.input, styles.memoInput]}
              placeholder="메모 (선택)"
              placeholderTextColor="#B0B0B0"
              value={memo}
              onChangeText={setMemo}
              multiline
              numberOfLines={3}
              returnKeyType="default"
              textAlignVertical="top"
            />
          </View>

          {/* FIXED: single amount input */}
          {invoiceType === 'FIXED' && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>세대 당 관리비 금액</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 50000"
                placeholderTextColor="#B0B0B0"
                value={fixedAmount}
                onChangeText={setFixedAmount}
                keyboardType="number-pad"
                returnKeyType="done"
              />
              {fixedAmount !== '' && !isNaN(Number(fixedAmount)) && Number(fixedAmount) > 0 && (
                <Text style={styles.amountPreview}>
                  {Number(fixedAmount).toLocaleString()} 원 / 세대
                </Text>
              )}
            </View>
          )}
        </View>

        {/* VARIABLE: dynamic items list */}
        {invoiceType === 'VARIABLE' && (
          <View style={styles.formCard}>
            <Text style={styles.sectionLabel}>청구 항목</Text>

            {items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <TextInput
                  style={[styles.input, styles.itemNameInput]}
                  placeholder="항목명"
                  placeholderTextColor="#B0B0B0"
                  value={item.name}
                  onChangeText={(v) => updateItemName(index, v)}
                  returnKeyType="next"
                />
                <TextInput
                  style={[styles.input, styles.itemAmountInput]}
                  placeholder="금액"
                  placeholderTextColor="#B0B0B0"
                  value={item.amount}
                  onChangeText={(v) => updateItemAmount(index, v)}
                  keyboardType="number-pad"
                  returnKeyType="done"
                />
                {items.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeItem(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.removeButtonText}>x</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity
              style={styles.addItemButton}
              onPress={addItem}
              activeOpacity={0.75}
            >
              <Text style={styles.addItemButtonText}>+ 항목 추가</Text>
            </TouchableOpacity>

            {/* Totals summary */}
            <View style={styles.totalsSummary}>
              <Text style={styles.totalsText}>
                총 합산 금액:{' '}
                <Text style={styles.totalsHighlight}>
                  {variableTotal.toLocaleString()} 원
                </Text>
              </Text>
              <Text style={styles.totalsSubText}>
                예상 1/N 세대 금액: 입주민 수 확인 중..
              </Text>
            </View>
          </View>
        )}
      </KeyboardAwareScrollView>

      {/* Bottom Fixed Button */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ padding: 16, paddingBottom: Math.max(insets.bottom + 16, 24), backgroundColor: '#F7F7F7' }}>
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>청구서 발행하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  headerSection: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  // Segmented control
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  segmentButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#007AFF',
  },
  segmentButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6E6E73',
  },
  segmentButtonTextActive: {
    color: '#FFFFFF',
  },
  // Form card
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6E6E73',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6E6E73',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: '#FAFAFA',
  },
  memoInput: {
    height: 80,
    paddingTop: 14,
    paddingBottom: 14,
  },
  amountPreview: {
    marginTop: 6,
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'right',
  },
  // Billing month selector
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
  },
  monthArrowButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthArrowText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  monthDisplayText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  // Variable items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  itemNameInput: {
    flex: 2,
    height: 46,
  },
  itemAmountInput: {
    flex: 1,
    height: 46,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  addItemButton: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  addItemButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },
  totalsSummary: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 14,
    gap: 4,
  },
  totalsText: {
    fontSize: 15,
    color: '#3A3A3C',
    fontWeight: '500',
  },
  totalsHighlight: {
    color: '#007AFF',
    fontWeight: '700',
  },
  totalsSubText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  // Submit button
  primaryButton: {
    backgroundColor: '#007AFF',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CreateInvoiceScreen;
