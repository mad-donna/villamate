import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';

const ResidentDashboardScreen = () => {
  const [amount, setAmount] = useState(35000);
  const [isPaid, setIsPaid] = useState(false);

  const handlePayment = (method: string) => {
    Alert.alert('결제 안내', `${method} 결제가 완료되었습니다.`, [
      {
        text: '확인',
        onPress: () => {
          setAmount(0);
          setIsPaid(true);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>빌라매니저 (입주민)</Text>
          <Text style={styles.headerSubtitle}>반가워요, 302호님!</Text>
        </View>

        <View style={styles.billCard}>
          <Text style={styles.billLabel}>이번 달 내 관리비</Text>
          <Text style={[styles.billAmount, isPaid && styles.paidAmount]}>
            {amount.toLocaleString()} 원
          </Text>
          <Text style={styles.dueDate}>납부 기한: 2026-03-31</Text>
          
          {isPaid && (
            <View style={styles.paidBadge}>
              <Text style={styles.paidBadgeText}>납부 완료</Text>
            </View>
          )}
        </View>

        {!isPaid && (
          <View style={styles.paymentSection}>
            <TouchableOpacity
              style={[styles.paymentButton, { backgroundColor: '#FEE500' }]}
              onPress={() => handlePayment('카카오페이')}
            >
              <Text style={[styles.paymentButtonText, { color: '#191919' }]}>
                카카오페이로 납부하기
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentButton, { backgroundColor: '#3182F6' }]}
              onPress={() => handlePayment('토스페이')}
            >
              <Text style={[styles.paymentButtonText, { color: '#FFF' }]}>
                토스페이로 납부하기
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.receiptSection}>
          <Text style={styles.receiptTitle}>항목별 상세 내역</Text>
          <View style={styles.receiptItem}>
            <Text style={styles.receiptLabel}>공용 수도</Text>
            <Text style={styles.receiptValue}>15,000 원</Text>
          </View>
          <View style={styles.receiptItem}>
            <Text style={styles.receiptLabel}>청소비</Text>
            <Text style={styles.receiptValue}>20,000 원</Text>
          </View>
          <View style={[styles.receiptItem, styles.receiptTotal]}>
            <Text style={styles.totalLabel}>합계</Text>
            <Text style={styles.totalValue}>35,000 원</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>* 관리비는 매달 25일에 발행됩니다.</Text>
          <Text style={styles.infoText}>* 문의사항은 동대표님께 연락주세요.</Text>
        </View>
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
  billCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  billLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  billAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  paidAmount: {
    color: '#34C759',
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  dueDate: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
  },
  paidBadge: {
    marginTop: 12,
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paidBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  paymentSection: {
    gap: 12,
    marginBottom: 32,
  },
  paymentButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  receiptSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  receiptLabel: {
    fontSize: 14,
    color: '#666',
  },
  receiptValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  receiptTotal: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#007AFF',
  },
  infoBox: {
    padding: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 20,
  },
});

export default ResidentDashboardScreen;
