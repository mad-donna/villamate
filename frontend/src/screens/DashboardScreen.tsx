import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';

// TODO: Update this to your PC's local IP (e.g., 192.168.x.x) if testing on a physical device.
const API_BASE_URL = 'http://192.168.219.107:3000';

interface UnpaidInvoice {
  id: number;
  amount: number;
  billingMonth: string;
  dueDate: string;
}

const DashboardScreen = ({ route, navigation }: any) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [unpaidInvoices, setUnpaidInvoices] = useState<UnpaidInvoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (route.params?.registered) {
      setIsRegistered(true);
    }
  }, [route.params?.registered]);

  useEffect(() => {
    if (isRegistered) {
      fetchUnpaidInvoices();
    } else {
      setLoading(false);
    }
  }, [isRegistered]);

  const fetchUnpaidInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/v1/billing/unpaid`);
      
      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setUnpaidInvoices(data);
    } catch (err) {
      setError('서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminders = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/remind`, {
        method: 'POST',
      });
      const result = await response.json();
      Alert.alert('알림톡 발송', result.message || '알림톡 발송 요청이 완료되었습니다.');
    } catch (err) {
      Alert.alert('오류', '알림톡 발송에 실패했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSettle = async () => {
    if (unpaidInvoices.length === 0) {
      Alert.alert('알림', '정산할 미납 내역이 없습니다.');
      return;
    }

    try {
      setActionLoading(true);
      const invoiceId = unpaidInvoices[0].id;
      const response = await fetch(`${API_BASE_URL}/api/v1/banking/settlement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId }),
      });

      if (response.ok) {
        Alert.alert('정산 완료', '관리비 납부 및 정산이 성공적으로 완료되었습니다.');
        await fetchUnpaidInvoices(); // UI 업데이트를 위해 다시 불러오기
      } else {
        throw new Error('정산 실패');
      }
    } catch (err) {
      Alert.alert('오류', '정산 처리 중 문제가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  if (!isRegistered) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.header}>환영합니다</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>등록된 빌라 정보가 없습니다</Text>
            <Text style={styles.cardSubtitle}>서비스 이용을 위해 빌라를 먼저 등록해주세요.</Text>
            <TouchableOpacity 
              style={styles.settleButton}
              onPress={() => navigation.navigate('Onboarding')}
            >
              <Text style={styles.actionButtonText}>빌라 등록하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>환영합니다</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>이번 달 청구서 요약</Text>
          
          {loading ? (
            <ActivityIndicator size="small" color="#FF3B30" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>미납 금액</Text>
                <Text style={styles.unpaidAmount}>{totalUnpaid.toLocaleString()} KRW</Text>
              </View>
              {unpaidInvoices.length > 0 && (
                <Text style={styles.billingNote}>납기일: {unpaidInvoices[0].dueDate}</Text>
              )}
            </>
          )}
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.createButton]} 
            onPress={() => navigation.navigate('CreateInvoice')}
          >
            <Text style={styles.actionButtonText}>새 청구서 발행하기</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.remindButton, actionLoading && styles.disabledButton]} 
            onPress={handleSendReminders}
            disabled={actionLoading}
          >
            <Text style={styles.actionButtonText}>미납자 알림톡 발송</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.settleButton, actionLoading && styles.disabledButton]} 
            onPress={handleSettle}
            disabled={actionLoading}
          >
            <Text style={styles.actionButtonText}>관리비 납부 및 정산 (시연용)</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, styles.infoCard]}>
          <Text style={styles.cardTitle}>최근 알림</Text>
          <Text style={styles.infoText}>- 건물 엘리베이터 점검 안내 (3월 1일)</Text>
          <Text style={styles.infoText}>- 단지 내 정원 청소 작업 (3월 5일)</Text>
        </View>
      </ScrollView>
      
      {actionLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#FF3B30" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  content: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  billingLabel: {
    fontSize: 16,
    color: '#666',
  },
  unpaidAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  billingNote: {
    fontSize: 14,
    color: '#999',
  },
  actionContainer: {
    marginBottom: 20,
  },
  actionButton: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  remindButton: {
    backgroundColor: '#34C759',
  },
  createButton: {
    backgroundColor: '#FF9500',
  },
  settleButton: {
    backgroundColor: '#007AFF',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: '#fff',
  },
  infoText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DashboardScreen;
