import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import api from '../utils/api';

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
  villa: { name: string; bankName: string; accountNumber: string };
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

const formatBillingMonth = (billingMonth: string) => {
  try {
    const [y, m] = billingMonth.split('-');
    return `${y}년 ${parseInt(m, 10)}월 관리비`;
  } catch {
    return billingMonth;
  }
};

const ResidentInvoiceScreen = ({ navigation }: any) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState<string>('');

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      let userId = await AsyncStorage.getItem('userId');
      let room = '';
      if (!userId) {
        const raw = await AsyncStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw);
          userId = u.id;
          room = u.villa?.roomNumber ?? u.roomNumber ?? '';
        }
      } else {
        const raw = await AsyncStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw);
          room = u.villa?.roomNumber ?? u.roomNumber ?? '';
        }
      }
      if (room) setRoomNumber(room);
      if (!userId) return;

      const res = await api.get(`/api/residents/${userId}/payments`);
      const data = res.data;
      setPayments(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert('오류', '납부 내역을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadPDF = useCallback(async (payment: Payment) => {
    setGeneratingPdf(payment.id);
    try {
      const invoice = payment.invoice;
      const villaName = invoice.villa?.name ?? '빌라';
      const billingLabel = formatBillingMonth(invoice.billingMonth);
      const amountFormatted = payment.amount.toLocaleString('ko-KR');
      const totalFormatted = invoice.totalAmount.toLocaleString('ko-KR');
      const isCompleted = payment.status === 'COMPLETED';
      const isTransferred = payment.status === 'TRANSFERRED';
      const statusLabel = isCompleted ? '납부 완료' : isTransferred ? '입금 확인 중' : '미납';
      const statusColor = isCompleted ? '#34C759' : isTransferred ? '#FF9500' : '#FF3B30';
      const isVariable = invoice.type === 'VARIABLE';
      const invoiceItems = isVariable && Array.isArray(invoice.items) ? invoice.items : [];

      const itemsHtml = invoiceItems.length > 0
        ? `
          <table class="breakdown">
            <thead>
              <tr>
                <th>항목</th>
                <th class="right">금액</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceItems.map((it) =>
                `<tr>
                  <td>${it.name}</td>
                  <td class="right">${Number(it.amount).toLocaleString('ko-KR')}원</td>
                </tr>`
              ).join('')}
              <tr class="total-row">
                <td><strong>합계</strong></td>
                <td class="right"><strong>${totalFormatted}원</strong></td>
              </tr>
            </tbody>
          </table>`
        : '';

      const memoHtml = invoice.memo
        ? `<p class="memo">비고: ${invoice.memo}</p>`
        : '';

      const now = new Date();
      const generatedAt = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5; padding: 24px; color: #1c1c1e; }
    .page { background: #fff; max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .top-accent { height: 6px; background: linear-gradient(90deg, #007AFF, #5856D6); }
    .inner { padding: 36px 32px 28px; }
    .doc-label { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #8e8e93; margin-bottom: 6px; }
    .doc-title { font-size: 26px; font-weight: 800; color: #007AFF; margin-bottom: 24px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
    .info-cell { background: #f8f9fa; border-radius: 10px; padding: 12px 14px; }
    .info-label { font-size: 11px; color: #8e8e93; font-weight: 600; margin-bottom: 4px; }
    .info-value { font-size: 15px; color: #1c1c1e; font-weight: 700; }
    .status-badge { display: inline-block; background: ${statusColor}; color: #fff; border-radius: 20px; padding: 4px 14px; font-size: 13px; font-weight: 700; }
    .divider { border: none; border-top: 1px solid #e5e5ea; margin: 20px 0; }
    .amount-section { text-align: center; padding: 20px 0; }
    .amount-label { font-size: 13px; color: #8e8e93; margin-bottom: 6px; }
    .amount-value { font-size: 38px; font-weight: 900; color: #007AFF; letter-spacing: -1px; }
    .amount-won { font-size: 22px; }
    table.breakdown { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 16px; font-size: 14px; }
    table.breakdown th { background: #f2f3f7; padding: 10px 12px; font-size: 11px; font-weight: 700; color: #8e8e93; text-align: left; text-transform: uppercase; letter-spacing: 0.5px; }
    table.breakdown td { padding: 10px 12px; border-bottom: 1px solid #f2f2f7; color: #3a3a3c; }
    table.breakdown tr.total-row td { border-bottom: none; border-top: 2px solid #e5e5ea; color: #1c1c1e; padding-top: 12px; }
    .right { text-align: right; }
    .memo { font-size: 13px; color: #6e6e73; font-style: italic; margin-bottom: 16px; }
    .footer { margin-top: 28px; padding-top: 16px; border-top: 1px solid #f2f2f7; display: flex; justify-content: space-between; align-items: center; }
    .footer-brand { font-size: 12px; color: #8e8e93; font-weight: 700; }
    .footer-ts { font-size: 11px; color: #aeaeb2; }
  </style>
</head>
<body>
  <div class="page">
    <div class="top-accent"></div>
    <div class="inner">
      <div class="doc-label">Official Document</div>
      <div class="doc-title">관리비 청구서</div>

      <div class="info-grid">
        <div class="info-cell">
          <div class="info-label">빌라명</div>
          <div class="info-value">${villaName}</div>
        </div>
        <div class="info-cell">
          <div class="info-label">호수</div>
          <div class="info-value">${roomNumber ? roomNumber + '호' : '-'}</div>
        </div>
        <div class="info-cell">
          <div class="info-label">청구기간</div>
          <div class="info-value">${billingLabel}</div>
        </div>
        <div class="info-cell">
          <div class="info-label">납부상태</div>
          <div class="info-value"><span class="status-badge">${statusLabel}</span></div>
        </div>
      </div>

      <hr class="divider" />

      <div class="amount-section">
        <div class="amount-label">청구 금액</div>
        <div class="amount-value">${amountFormatted}<span class="amount-won">원</span></div>
      </div>

      ${itemsHtml ? `<hr class="divider" />${itemsHtml}` : ''}
      ${memoHtml}

      <div class="footer">
        <div class="footer-brand">빌라메이트</div>
        <div class="footer-ts">발행일시: ${generatedAt}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

      const { uri } = await Print.printToFileAsync({ html, base64: false });

      // Generate a descriptive filename
      const [bmYear, bmMonth] = invoice.billingMonth.split('-');
      const year = bmYear ?? String(new Date().getFullYear());
      const month = bmMonth ?? String(new Date().getMonth() + 1);
      const sanitizedVillaName = villaName.replace(/\s+/g, '_').replace(/[^\uAC00-\uD7A3\w\-]/g, '');
      const sanitizedRoom = roomNumber.replace(/\s+/g, '_').replace(/[^\uAC00-\uD7A3\w\-]/g, '');
      const filename = `${sanitizedVillaName}_${sanitizedRoom}호_${year}년_${String(month).padStart(2, '0')}월_관리비청구서.pdf`;
      const newUri = (FileSystem.cacheDirectory ?? '') + filename;
      await FileSystem.moveAsync({ from: uri, to: newUri });

      await Sharing.shareAsync(newUri, {
        mimeType: 'application/pdf',
        dialogTitle: filename,
        UTI: 'com.adobe.pdf',
      });
    } catch (e) {
      Alert.alert('오류', 'PDF 생성에 실패했습니다.');
    } finally {
      setGeneratingPdf(null);
    }
  }, [roomNumber]);

  useFocusEffect(
    useCallback(() => {
      loadPayments();
    }, [loadPayments])
  );

  const handleTransfer = async (payment: Payment) => {
    setConfirming(payment.id);
    try {
      await api.patch(`/api/invoices/${payment.invoiceId}/transfer`, { residentId: payment.residentId });
      Alert.alert('완료', '관리자에게 송금 완료 알림이 전달되었습니다.');
      await loadPayments();
    } catch (e) {
      Alert.alert('오류', '처리 중 문제가 발생했습니다.');
    } finally {
      setConfirming(null);
    }
  };

  const villa = payments[0]?.invoice?.villa;
  const hasBankInfo = villa?.bankName && villa?.accountNumber;

  const renderItem = ({ item }: { item: Payment }) => {
    const isVariable = item.invoice.type === 'VARIABLE';
    const invoiceItems = isVariable && Array.isArray(item.invoice.items) ? item.invoice.items : null;
    const isPending = item.status === 'PENDING';
    const isTransferred = item.status === 'TRANSFERRED';
    const isCompleted = item.status === 'COMPLETED';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleGroup}>
            <Text style={styles.cardTitle}>{formatBillingMonth(item.invoice.billingMonth)}</Text>
            <View style={[styles.typeBadge, isVariable ? styles.typeBadgeVar : styles.typeBadgeFix]}>
              <Text style={styles.typeBadgeText}>{isVariable ? '변동 관리비' : '고정 관리비'}</Text>
            </View>
          </View>
          {isCompleted && (
            <View style={[styles.statusChip, styles.chipCompleted]}>
              <Text style={styles.statusChipText}>납부 완료</Text>
            </View>
          )}
          {isTransferred && (
            <View style={[styles.statusChip, styles.chipTransferred]}>
              <Text style={styles.statusChipText}>입금 확인 중</Text>
            </View>
          )}
          {isPending && (
            <View style={[styles.statusChip, styles.chipPending]}>
              <Text style={styles.statusChipText}>미납</Text>
            </View>
          )}
        </View>

        <Text style={styles.amount}>{item.amount.toLocaleString()} 원</Text>

        {item.invoice.memo ? (
          <Text style={styles.memo}>{item.invoice.memo}</Text>
        ) : null}

        {invoiceItems && invoiceItems.length > 0 && (
          <View style={styles.breakdown}>
            <Text style={styles.breakdownHeader}>항목 내역</Text>
            {invoiceItems.map((entry, i) => (
              <View key={i} style={styles.breakdownRow}>
                <Text style={styles.breakdownName}>{entry.name}</Text>
                <Text style={styles.breakdownAmount}>{Number(entry.amount).toLocaleString()} 원</Text>
              </View>
            ))}
          </View>
        )}

        {isPending && (
          <TouchableOpacity
            style={[styles.transferBtn, confirming === item.id && styles.transferBtnDisabled]}
            onPress={() => handleTransfer(item)}
            disabled={confirming === item.id}
            activeOpacity={0.85}
          >
            {confirming === item.id ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.transferBtnText}>송금 완료 알리기</Text>
            )}
          </TouchableOpacity>
        )}

        {isTransferred && (
          <View style={styles.transferredInfo}>
            <Ionicons name="time-outline" size={15} color="#FF9500" />
            <Text style={styles.transferredInfoText}>관리자 확인 후 납부 완료 처리됩니다.</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.pdfBtn, generatingPdf === item.id && styles.pdfBtnDisabled]}
          onPress={() => downloadPDF(item)}
          disabled={generatingPdf === item.id}
          activeOpacity={0.85}
        >
          {generatingPdf === item.id ? (
            <ActivityIndicator color="#007AFF" size="small" />
          ) : (
            <>
              <Ionicons name="download-outline" size={16} color="#007AFF" style={styles.pdfBtnIcon} />
              <Text style={styles.pdfBtnText}>PDF로 저장 / 공유</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>관리비 납부 내역</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>납부 내역 불러오는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            hasBankInfo ? (
              <View style={styles.bankCard}>
                <View style={styles.bankCardIcon}>
                  <Ionicons name="card-outline" size={22} color="#5856D6" />
                </View>
                <View style={styles.bankCardInfo}>
                  <Text style={styles.bankCardLabel}>관리비 입금 계좌</Text>
                  <Text style={styles.bankCardBank}>{villa!.bankName}</Text>
                  <Text style={styles.bankCardAccount}>{villa!.accountNumber}</Text>
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>발행된 청구서가 없습니다.</Text>
              <Text style={styles.emptySubText}>관리자가 청구서를 발행하면 여기에 표시됩니다.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F3F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backBtn: { width: 40 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#8E8E93' },

  listContent: { padding: 16, paddingBottom: 40 },

  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEEFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  bankCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bankCardInfo: { flex: 1 },
  bankCardLabel: { fontSize: 12, fontWeight: '600', color: '#5856D6', marginBottom: 2 },
  bankCardBank: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  bankCardAccount: { fontSize: 14, color: '#3A3A3C', marginTop: 2 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitleGroup: { flex: 1, marginRight: 12, gap: 6 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },

  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeBadgeFix: { backgroundColor: '#E3F2FD' },
  typeBadgeVar: { backgroundColor: '#FFF3E0' },
  typeBadgeText: { fontSize: 11, fontWeight: '700', color: '#3A3A3C' },

  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  chipPending: { backgroundColor: '#FF3B30' },
  chipTransferred: { backgroundColor: '#FF9500' },
  chipCompleted: { backgroundColor: '#34C759' },
  statusChipText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  amount: { fontSize: 24, fontWeight: '800', color: '#007AFF', marginBottom: 4 },
  memo: { fontSize: 13, color: '#6E6E73', fontStyle: 'italic', marginBottom: 10 },

  breakdown: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  breakdownHeader: { fontSize: 12, fontWeight: '600', color: '#6E6E73', marginBottom: 6, textTransform: 'uppercase' },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  breakdownName: { fontSize: 14, color: '#3A3A3C', flex: 1 },
  breakdownAmount: { fontSize: 14, color: '#1C1C1E', fontWeight: '600' },

  transferBtn: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  transferBtnDisabled: { opacity: 0.6 },
  transferBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  transferredInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: '#FFF8EE',
    borderRadius: 10,
    padding: 10,
  },
  transferredInfoText: { fontSize: 13, color: '#FF9500', flex: 1 },

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#3A3A3C', marginBottom: 6 },
  emptySubText: { fontSize: 13, color: '#8E8E93', textAlign: 'center' },

  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
    marginTop: 10,
  },
  pdfBtnDisabled: { opacity: 0.5 },
  pdfBtnIcon: { marginRight: 6 },
  pdfBtnText: { color: '#007AFF', fontSize: 14, fontWeight: '700' },
});

export default ResidentInvoiceScreen;
