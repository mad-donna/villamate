import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const TRANSACTIONS = [
  { id: '1', date: '2026-03-02', desc: '크린탑 청소용역', amount: -100000, type: 'expense', hasReceipt: true },
  { id: '2', date: '2026-03-02', desc: '현대엘리베이터 유지보수', amount: -150000, type: 'expense', hasReceipt: true },
  { id: '3', date: '2026-03-01', desc: '101호 관리비 입금', amount: 35000, type: 'income', hasReceipt: false },
];

const LedgerScreen = () => {
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openReceipt = (desc: string) => {
    setSelectedReceipt(desc);
    setIsModalVisible(true);
  };

  const renderItem = ({ item }: { item: typeof TRANSACTIONS[0] }) => (
    <View style={styles.transactionItem}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemDate}>{item.date}</Text>
        <Text style={styles.itemDesc}>{item.desc}</Text>
      </View>
      <View style={styles.itemRight}>
        <Text style={[styles.itemAmount, item.type === 'expense' ? styles.expenseText : styles.incomeText]}>
          {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}원
        </Text>
        {item.hasReceipt && (
          <TouchableOpacity style={styles.receiptButton} onPress={() => openReceipt(item.desc)}>
            <Text style={styles.receiptButtonText}>영수증 보기</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>우리 빌라 공용 통장</Text>
        <Text style={styles.balanceText}>₩ 1,250,000</Text>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>입출금 내역</Text>
        <FlatList
          data={TRANSACTIONS}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.receiptCard}>
            <Text style={styles.receiptTitle}>지출 영수증</Text>
            <View style={styles.receiptDivider} />
            <View style={styles.receiptContent}>
              <Text style={styles.receiptLabel}>항목: {selectedReceipt}</Text>
              <Text style={styles.receiptLabel}>상태: 결제 완료</Text>
              <View style={styles.fakeImage}>
                <Text style={styles.fakeImageText}>영수증 이미지 샘플</Text>
                <Text style={styles.fakeImageSubtext}>[인증 완료]</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
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
});

export default LedgerScreen;
