import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config';


interface ExternalBill {
  id: string;
  targetName: string;
  phoneNumber: string;
  amount: number;
  description: string;
  dueDate: string;
  status: string;
  villaId: number;
  createdAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: '미납',
  PENDING_CONFIRMATION: '확인 대기',
  COMPLETED: '납부 완료',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#FF9500',
  PENDING_CONFIRMATION: '#007AFF',
  COMPLETED: '#34C759',
};

const ExternalBillingScreen = () => {
  const [villaId, setVillaId] = useState<number | null>(null);
  const [bills, setBills] = useState<ExternalBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [targetName, setTargetName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
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

      const villaRes = await fetch(`${API_BASE_URL}/api/villas/${userId}`);
      if (!villaRes.ok) return;
      const villas = await villaRes.json();
      if (!Array.isArray(villas) || villas.length === 0) return;
      const id = villas[0].id;
      setVillaId(id);

      const billsRes = await fetch(`${API_BASE_URL}/api/villas/${id}/external-bills`);
      if (!billsRes.ok) return;
      const data = await billsRes.json();
      setBills(data);
    } catch (err) {
      console.error('ExternalBillingScreen fetchData error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const handleConfirm = async (billId: string) => {
    if (!villaId) return;
    try {
      await fetch(`${API_BASE_URL}/api/villas/${villaId}/external-bills/${billId}/confirm`, {
        method: 'PATCH',
      });
      fetchData();
    } catch (err) {
      console.error('Confirm error:', err);
    }
  };

  const handleSubmit = async () => {
    if (!villaId) return;
    if (!targetName || !phoneNumber || !amount || !description || !dueDate) {
      Alert.alert('오류', '모든 항목을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/villas/${villaId}/external-bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetName,
          phoneNumber,
          amount: parseInt(amount, 10),
          description,
          dueDate,
        }),
      });
      if (!res.ok) throw new Error('Failed to create bill');
      const newBill = await res.json();
      setModalVisible(false);
      setTargetName(''); setPhoneNumber(''); setAmount(''); setDescription(''); setDueDate('');
      fetchData();
      Alert.alert(
        '청구서가 생성되었습니다',
        `결제 링크를 SMS로 전송하세요:\n${API_BASE_URL}/pay/${newBill.id}`,
        [{ text: '확인' }]
      );
    } catch (err) {
      console.error('Create bill error:', err);
      Alert.alert('오류', '청구서 생성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>외부 청구 관리</Text>
          <Text style={styles.headerSubtitle}>앱 미설치 대상자에게 웹 링크로 청구서를 발송합니다</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
        ) : bills.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>생성된 외부 청구서가 없습니다</Text>
          </View>
        ) : (
          <View style={styles.billList}>
            {bills.map((bill) => (
              <View key={bill.id} style={styles.billCard}>
                <View style={styles.billCardHeader}>
                  <Text style={styles.billTarget}>{bill.targetName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLOR[bill.status] || '#8E8E93') + '20' }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLOR[bill.status] || '#8E8E93' }]}>
                      {STATUS_LABEL[bill.status] || bill.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.billAmount}>{bill.amount.toLocaleString()}원</Text>
                <Text style={styles.billDesc}>{bill.description}</Text>
                <Text style={styles.billDue}>납부 기한: {bill.dueDate}</Text>
                <Text style={styles.billPhone}>{bill.phoneNumber}</Text>
                {bill.status === 'PENDING_CONFIRMATION' && (
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => handleConfirm(bill.id)}
                  >
                    <Text style={styles.confirmButtonText}>납부 확인</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>청구서 생성</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1C1C1E" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {[
                { label: '대상자 이름', value: targetName, setter: setTargetName, placeholder: '홍길동', keyboard: 'default' as const },
                { label: '연락처', value: phoneNumber, setter: setPhoneNumber, placeholder: '010-0000-0000', keyboard: 'phone-pad' as const },
                { label: '청구 금액 (원)', value: amount, setter: setAmount, placeholder: '50000', keyboard: 'numeric' as const },
                { label: '설명', value: description, setter: setDescription, placeholder: '9월 주차 관리비', keyboard: 'default' as const },
                { label: '납부 기한', value: dueDate, setter: setDueDate, placeholder: '2026-03-31', keyboard: 'default' as const },
              ].map((field) => (
                <View key={field.label} style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder={field.placeholder}
                    keyboardType={field.keyboard}
                    placeholderTextColor="#C7C7CC"
                  />
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitButton, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>생성하기</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 24 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1C1C1E', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: '#8E8E93' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 12, fontSize: 15, color: '#8E8E93' },
  billList: { gap: 12 },
  billCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  billCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  billTarget: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  billAmount: { fontSize: 22, fontWeight: '800', color: '#007AFF', marginBottom: 6 },
  billDesc: { fontSize: 14, color: '#3C3C43', marginBottom: 4 },
  billDue: { fontSize: 13, color: '#8E8E93', marginBottom: 2 },
  billPhone: { fontSize: 13, color: '#8E8E93' },
  confirmButton: {
    marginTop: 12, backgroundColor: '#34C759', borderRadius: 12,
    paddingVertical: 10, alignItems: 'center',
  },
  confirmButtonText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  fab: {
    position: 'absolute', bottom: 30, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContainer: {
    backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1C1C1E' },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginBottom: 6 },
  textInput: {
    backgroundColor: '#F2F2F7', borderRadius: 12, padding: 14,
    fontSize: 16, color: '#1C1C1E',
  },
  submitButton: {
    backgroundColor: '#007AFF', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
  },
  submitButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});

export default ExternalBillingScreen;
