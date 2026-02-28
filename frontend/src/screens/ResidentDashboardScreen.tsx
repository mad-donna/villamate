import React, { useState, useCallback, useRef } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

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
  villa: { name: string };
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

interface DashData {
  myUnpaidAmount: number;
  latestNotice: { id: string; title: string; createdAt: string } | null;
  myVehicleCount: number;
  activePollsCount: number;
}

const ResidentDashboardScreen = () => {
  const navigation = useNavigation<any>();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [dashData, setDashData] = useState<DashData | null>(null);
  const [residentUserId, setResidentUserId] = useState<string | null>(null);
  const [residentVillaId, setResidentVillaId] = useState<number | null>(null);
  const [residentName, setResidentName] = useState<string>('');
  const [villaName, setVillaName] = useState<string>('');
  const scrollRef = useRef<any>(null);
  const paymentSectionY = useRef<number>(0);

  const loadAll = useCallback(async () => {
    try {
      setLoadingPayments(true);

      // Resolve userId
      let userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          userId = u.id;
          if (userId) await AsyncStorage.setItem('userId', userId);
        }
      }
      if (!userId) return;
      setResidentUserId(userId);

      // Resolve villaId + name from stored user
      let villaId: number | null = null;
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const storedUser = JSON.parse(userStr);
        if (storedUser?.villa?.id) {
          villaId = storedUser.villa.id;
        }
        if (storedUser?.name) {
          setResidentName(storedUser.name);
        }
        if (storedUser?.villa?.name) {
          setVillaName(storedUser.villa.name);
        }
      }

      // Fallback: fetch villa from server if not in storage
      if (!villaId) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/users/${userId}/villa`);
          if (res.ok) {
            const data = await res.json();
            villaId = data?.id ?? null;
            if (data?.name) setVillaName(data.name);
          }
        } catch (e) {
          console.error('Villa fallback fetch error:', e);
        }
      }

      setResidentVillaId(villaId);

      // Fetch dashboard stats + payments in parallel
      const fetches: Promise<Response>[] = [
        fetch(`${API_BASE_URL}/api/residents/${userId}/payments`),
      ];
      if (villaId) {
        fetches.push(
          fetch(`${API_BASE_URL}/api/dashboard/${userId}?villaId=${villaId}&role=RESIDENT`)
        );
      }

      const results = await Promise.all(fetches);
      const [paymentsRes, dashRes] = results;

      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(Array.isArray(data) ? data : []);
      }

      if (dashRes && dashRes.ok) {
        const dd = await dashRes.json();
        setDashData(dd);
      }
    } catch (err) {
      console.error('Resident dashboard load error:', err);
    } finally {
      setLoadingPayments(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const formatBillingMonth = (billingMonth: string) => {
    try {
      const [y, m] = billingMonth.split('-');
      return `${y}년 ${parseInt(m, 10)}월 관리비`;
    } catch {
      return billingMonth;
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
    } catch {
      return iso;
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
    );
  };

  const renderPaymentCard = ({ item }: { item: Payment }) => {
    const isPending = item.status === 'PENDING';
    const isVariable = item.invoice.type === 'VARIABLE';
    const invoiceItems: InvoiceItem[] | null =
      isVariable && Array.isArray(item.invoice.items) ? item.invoice.items : null;

    return (
      <View style={styles.invoiceCard}>
        <View style={styles.invoiceCardHeader}>
          <View style={styles.invoiceTitleRow}>
            <Text style={styles.invoiceTitle}>
              {formatBillingMonth(item.invoice.billingMonth)}
            </Text>
            <View
              style={[
                styles.typeBadge,
                isVariable ? styles.typeBadgeVariable : styles.typeBadgeFixed,
              ]}
            >
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
            <Text style={styles.statusBadgeText}>{isPending ? '미납' : '납부완료'}</Text>
          </View>
        </View>

        <Text style={styles.invoiceAmount}>{item.amount.toLocaleString()} 원</Text>
        {item.invoice.memo ? (
          <Text style={styles.invoiceMemo}>{item.invoice.memo}</Text>
        ) : null}

        {invoiceItems && invoiceItems.length > 0 && (
          <View style={styles.itemBreakdown}>
            <Text style={styles.itemBreakdownHeader}>항목 내역</Text>
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
            onPress={() =>
              navigation.navigate('Payment', {
                paymentId: item.id,
                amount: item.amount,
                invoiceName: formatBillingMonth(item.invoice.billingMonth),
              })
            }
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
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.greeting}>
            안녕하세요 👋 {residentName || '입주민'}님
          </Text>
          {villaName ? (
            <Text style={styles.villaSubtitle}>{villaName}</Text>
          ) : null}
        </View>

        {/* Top widget: 미납 관리비 — full width */}
        <TouchableOpacity
          style={styles.widget}
          onPress={() => scrollRef.current?.scrollTo({ y: paymentSectionY.current, animated: true })}
          activeOpacity={0.7}
        >
          <View style={styles.widgetHeader}>
            <Text style={styles.widgetSmallLabel}>미납 관리비</Text>
            <Ionicons name="chevron-forward" size={14} color="#C7C7CC" />
          </View>
          {dashData ? (
            dashData.myUnpaidAmount > 0 ? (
              <Text style={[styles.widgetNumber, { color: '#FF3B30' }]}>
                {dashData.myUnpaidAmount.toLocaleString()}원
              </Text>
            ) : (
              <Text style={[styles.widgetNumber, styles.widgetNumberPaid]}>
                완납 완료 ✓
              </Text>
            )
          ) : (
            <Text style={styles.widgetNumberPlaceholder}>--</Text>
          )}
        </TouchableOpacity>

        {/* Widget row: 최근 공지 + 내 차량 */}
        <View style={styles.widgetRow}>
          <TouchableOpacity
            style={[styles.widget, styles.widgetHalf]}
            onPress={() => dashData?.latestNotice && navigation.navigate('PostDetail', { postId: dashData.latestNotice.id })}
            activeOpacity={dashData?.latestNotice ? 0.7 : 1}
          >
            <View style={styles.widgetHeader}>
              <Text style={styles.widgetSmallLabel}>최근 공지</Text>
              {dashData?.latestNotice && <Ionicons name="chevron-forward" size={14} color="#C7C7CC" />}
            </View>
            {dashData?.latestNotice ? (
              <>
                <Text style={styles.noticeTitleSmall} numberOfLines={2}>
                  {dashData.latestNotice.title}
                </Text>
                <Text style={styles.noticeDate}>
                  {formatDate(dashData.latestNotice.createdAt)}
                </Text>
              </>
            ) : (
              <Text style={styles.noticeEmpty}>공지 없음</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.widget, styles.widgetHalf]}
            onPress={() => navigation.navigate('프로필')}
            activeOpacity={0.7}
          >
            <View style={styles.widgetHeader}>
              <Text style={styles.widgetSmallLabel}>내 차량</Text>
              <Ionicons name="chevron-forward" size={14} color="#C7C7CC" />
            </View>
            <Text style={[styles.widgetNumber, { color: '#30B0C7' }]}>
              {dashData?.myVehicleCount ?? 0}대
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active polls widget */}
        <TouchableOpacity
          style={styles.widget}
          onPress={() => navigation.navigate('PollList', { villaId: residentVillaId, userId: residentUserId })}
          activeOpacity={0.7}
        >
          <View style={styles.widgetHeader}>
            <Text style={styles.widgetSmallLabel}>참여 가능한 투표</Text>
            <Ionicons name="chevron-forward" size={14} color="#C7C7CC" />
          </View>
          <Text style={[styles.widgetNumber, { color: '#FF2D55' }]}>
            {dashData?.activePollsCount ?? 0}건
          </Text>
        </TouchableOpacity>

        {/* Quick actions */}
        <Text style={styles.sectionLabel}>바로가기</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={[styles.pillButton, { backgroundColor: '#30B0C7' }]}
            onPress={() => {
              if (!residentVillaId) {
                return Alert.alert('오류', '빌라 정보를 불러오는 중입니다.');
              }
              navigation.navigate('ParkingSearch', { villaId: residentVillaId });
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="car-outline" size={16} color="#fff" style={styles.pillIcon} />
            <Text style={styles.pillText}>주차 조회</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pillButton, { backgroundColor: '#5856D6' }]}
            onPress={() =>
              navigation.navigate('Board', {
                villaId: residentVillaId,
                userId: residentUserId,
                userRole: 'RESIDENT',
              })
            }
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubbles-outline" size={16} color="#fff" style={styles.pillIcon} />
            <Text style={styles.pillText}>커뮤니티</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pillButton, { backgroundColor: '#007AFF' }]}
            onPress={() => navigation.navigate('Ledger')}
            activeOpacity={0.8}
          >
            <Ionicons name="book-outline" size={16} color="#fff" style={styles.pillIcon} />
            <Text style={styles.pillText}>공용 장부</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pillButton, { backgroundColor: '#FF2D55' }]}
            onPress={() => navigation.navigate('PollList', { villaId: residentVillaId, userId: residentUserId })}
            activeOpacity={0.8}
          >
            <Ionicons name="checkbox-outline" size={16} color="#fff" style={styles.pillIcon} />
            <Text style={styles.pillText}>투표</Text>
          </TouchableOpacity>
        </View>

        {/* Payment list */}
        <Text
          style={styles.sectionLabel}
          onLayout={(e) => { paymentSectionY.current = e.nativeEvent.layout.y; }}
        >납부 내역</Text>

        {loadingPayments ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>납부 내역 불러오는 중...</Text>
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

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F3F7',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Header
  headerSection: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  villaSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },

  // Widgets
  widgetRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  widget: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 12,
  },
  widgetHalf: {
    flex: 1,
    marginBottom: 0,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  widgetSmallLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  widgetNumber: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  widgetNumberPaid: {
    color: '#34C759',
    fontSize: 22,
  },
  widgetNumberPlaceholder: {
    fontSize: 28,
    fontWeight: '800',
    color: '#C7C7CC',
  },

  // Notice sub-widget
  noticeTitleSmall: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
    lineHeight: 20,
  },
  noticeDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  noticeEmpty: {
    fontSize: 13,
    color: '#C7C7CC',
    fontStyle: 'italic',
  },

  // Section label
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Quick actions
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  pillButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  pillIcon: {
    marginRight: 4,
  },
  pillText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Loading
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

  // Empty payment state
  emptyCard: {
    backgroundColor: '#fff',
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

  // Invoice / payment cards
  invoiceCard: {
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
    color: '#fff',
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
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // Logout
  logoutButton: {
    marginTop: 16,
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
