import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

const API_BASE_URL = 'http://192.168.219.107:3000';

interface ExpenseItem {
  id: string;
  label: string;
  amount: string;
}

const CreateInvoiceScreen = ({ navigation }: any) => {
  const [mode, setMode] = useState<'variable' | 'fixed'>('variable');
  const [items, setItems] = useState<ExpenseItem[]>([
    { id: '1', label: '수도광열비', amount: '' },
    { id: '2', label: '건물 청소비', amount: '' },
    { id: '3', label: '엘리베이터 유지비', amount: '' },
  ]);
  const [fixedAmountPerUnit, setFixedAmountPerUnit] = useState('');
  const [loading, setLoading] = useState(false);

  const totalAmount = useMemo(() => {
    if (mode === 'variable') {
      return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    } else {
      return (Number(fixedAmountPerUnit) || 0) * 10; // Assuming 10 units
    }
  }, [mode, items, fixedAmountPerUnit]);

  const addItem = () => {
    const newId = (items.length + 1).toString();
    setItems([...items, { id: newId, label: '기타 항목', amount: '' }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: 'label' | 'amount', value: string) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const loadLastMonth = () => {
    setItems(
      items.map((item) => {
        if (item.label === '건물 청소비') return { ...item, amount: '50000' };
        if (item.label === '엘리베이터 유지비') return { ...item, amount: '30000' };
        return item;
      })
    );
    Alert.alert('알림', '지난달 고정비용을 불러왔습니다.');
  };

  const handleAIScan = () => {
    Alert.alert('AI 고지서 촬영', '카메라가 실행되어 고지서 금액을 자동 인식합니다.', [
      {
        text: '확인',
        onPress: () => {
          setItems(
            items.map((item) =>
              item.label === '수도광열비' ? { ...item, amount: '45000' } : item
            )
          );
          Alert.alert('인식 완료', '수도광열비 45,000원이 자동으로 입력되었습니다.');
        },
      },
    ]);
  };

  const handleIssueInvoices = async () => {
    if (totalAmount === 0) {
      Alert.alert('알림', '금액을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/billing/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buildingId: 1,
          totalAmount,
          billingMonth: '2026-03',
          dueDate: '2026-03-31',
        }),
      });

      if (response.ok) {
        Alert.alert('발행 완료', '청구서가 성공적으로 발행되었습니다.', [
          { text: '확인', onPress: () => navigation.goBack() },
        ]);
      } else {
        throw new Error('발행 실패');
      }
    } catch (err) {
      Alert.alert('오류', '청구서 발행 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, mode === 'variable' && styles.activeTab]}
          onPress={() => setMode('variable')}
        >
          <Text style={[styles.tabText, mode === 'variable' && styles.activeTabText]}>
            변동비 1/N 정산
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === 'fixed' && styles.activeTab]}
          onPress={() => setMode('fixed')}
        >
          <Text style={[styles.tabText, mode === 'fixed' && styles.activeTabText]}>
            고정 관리비 부과
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>
            {mode === 'variable' ? '변동비 정산' : '고정 관리비'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'variable'
              ? '이번 달 실제 지출된 비용을 입주민수대로 나눕니다.'
              : '세대마다 매달 정해진 금액을 부과합니다.'}
          </Text>
        </View>

        {mode === 'variable' ? (
          <>
            <View style={styles.shortcutRow}>
              <TouchableOpacity style={styles.shortcutButton} onPress={loadLastMonth}>
                <Text style={styles.shortcutText}>지난달 불러오기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shortcutButton} onPress={handleAIScan}>
                <Text style={[styles.shortcutText, { color: '#34C759' }]}>AI 촬영 인식</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dynamicList}>
              {items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemLabelCol}>
                    <TextInput
                      style={styles.labelInput}
                      value={item.label}
                      onChangeText={(val) => updateItem(item.id, 'label', val)}
                    />
                  </View>
                  <View style={styles.itemAmountCol}>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0"
                      keyboardType="number-pad"
                      value={item.amount}
                      onChangeText={(val) => updateItem(item.id, 'amount', val)}
                    />
                  </View>
                  <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeButton}>
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={addItem}>
                <Text style={styles.addButtonText}>+ 항목 추가</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.fixedForm}>
            <Text style={styles.label}>세대당 월 정액 요금 (원)</Text>
            <TextInput
              style={styles.largeInput}
              placeholder="예: 30000"
              keyboardType="number-pad"
              value={fixedAmountPerUnit}
              onChangeText={setFixedAmountPerUnit}
            />
            <Text style={styles.infoText}>* 총 10세대에 대해 자동으로 계산됩니다.</Text>
          </View>
        )}

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>총 합계 금액</Text>
          <Text style={styles.totalValue}>{totalAmount.toLocaleString()} KRW</Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.disabledButton]}
          onPress={handleIssueInvoices}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {mode === 'variable' ? '1/N 청구서 발행하기' : '고정 관리비 발행하기'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F2F2F7',
  },
  tab: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#007AFF',
  },
  scrollContent: {
    padding: 24,
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  shortcutButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shortcutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  dynamicList: {
    marginBottom: 32,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  itemLabelCol: {
    flex: 1.5,
  },
  itemAmountCol: {
    flex: 2,
  },
  labelInput: {
    height: 45,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  amountInput: {
    height: 45,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'right',
  },
  removeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FF3B30',
    fontSize: 18,
  },
  addButton: {
    height: 45,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  fixedForm: {
    marginBottom: 32,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginBottom: 12,
  },
  largeInput: {
    height: 60,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  infoText: {
    marginTop: 12,
    color: '#8E8E93',
    fontSize: 13,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    marginBottom: 32,
  },
  totalLabel: {
    fontSize: 18,
    color: '#666',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CreateInvoiceScreen;
