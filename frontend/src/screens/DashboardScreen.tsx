import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config';
import RollingBanner from '../components/RollingBanner';

interface Villa {
  id: number;
  name: string;
  address: string;
  totalUnits: number;
  accountNumber: string;
  bankName: string;
  _count?: {
    residents: number;
  };
}

interface DashData {
  totalUnpaidCount: number;
  pendingExternalBillsCount: number;
  latestNotice: { id: string; title: string; createdAt: string } | null;
  activePollsCount: number;
}

interface Resident {
  recordId: string;
  userId: string;
  name: string;
  roomNumber: string;
  joinedAt: string;
}

const DashboardScreen = ({ navigation }: any) => {
  const [villaData, setVillaData] = useState<Villa | null>(null);
  const [dashData, setDashData] = useState<DashData | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);

      // Resolve userId
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
        setVillaData(null);
        return;
      }

      setAdminUserId(userId);

      // Fetch villa list
      const villaRes = await fetch(`${API_BASE_URL}/api/villas/${userId}`);
      if (!villaRes.ok) {
        setVillaData(null);
        return;
      }
      const villas = await villaRes.json();
      if (!Array.isArray(villas) || villas.length === 0) {
        setVillaData(null);
        return;
      }
      const villa = villas[0] as Villa;
      setVillaData(villa);

      // Fetch dashboard stats + residents in parallel
      const [dashRes, residentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/dashboard/${userId}?villaId=${villa.id}&role=ADMIN`),
        fetch(`${API_BASE_URL}/api/villas/${villa.id}/residents`),
      ]);

      if (dashRes.ok) {
        const dd = await dashRes.json();
        setDashData(dd);
      }

      if (residentsRes.ok) {
        const rd = await residentsRes.json();
        setResidents(Array.isArray(rd) ? rd : []);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!villaData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>환영합니다</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>등록된 빌라 정보가 없습니다</Text>
            <Text style={styles.cardSubtitle}>서비스 이용을 위해 빌라를 먼저 등록해주세요.</Text>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('Onboarding')}
            >
              <Text style={styles.registerButtonText}>빌라 등록하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const quickActions = [
    {
      label: '청구서 발행',
      icon: 'receipt-outline' as const,
      color: '#FF9500',
      onPress: () => navigation.navigate('CreateInvoice'),
    },
    {
      label: '주차 조회',
      icon: 'car-outline' as const,
      color: '#30B0C7',
      onPress: () => navigation.navigate('ParkingSearch', { villaId: villaData.id }),
    },
    {
      label: '전자투표',
      icon: 'checkbox-outline' as const,
      color: '#FF2D55',
      onPress: () => navigation.navigate('PollList', { villaId: villaData.id, userId: adminUserId, userRole: 'ADMIN' }),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Rolling banner */}
        <RollingBanner navigation={navigation} />

        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.greeting}>안녕하세요, 관리자님 👋</Text>
              <Text style={styles.villaName}>{villaData.name}</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              style={styles.bellButton}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={24} color="#1C1C1E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Widget row: 미납 관리비 + 확인 대기 */}
        <View style={styles.widgetRow}>
          <TouchableOpacity
            style={[styles.widget, styles.widgetHalf]}
            onPress={() => navigation.navigate('AdminInvoice')}
            activeOpacity={0.7}
          >
            <View style={styles.widgetHeader}>
              <Text style={styles.widgetLabel}>미납 관리비</Text>
              <Ionicons name="chevron-forward" size={14} color="#C7C7CC" />
            </View>
            <Text style={[styles.widgetNumber, { color: '#007AFF' }]}>
              {dashData?.totalUnpaidCount ?? 0}건
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.widget, styles.widgetHalf]}
            onPress={() => navigation.navigate('ExternalBilling')}
            activeOpacity={0.7}
          >
            <View style={styles.widgetHeader}>
              <Text style={styles.widgetLabel}>확인 대기</Text>
              <Ionicons name="chevron-forward" size={14} color="#C7C7CC" />
            </View>
            <Text style={[styles.widgetNumber, { color: '#FF9500' }]}>
              {dashData?.pendingExternalBillsCount ?? 0}건
            </Text>
          </TouchableOpacity>
        </View>

        {/* Full-width notice widget */}
        <TouchableOpacity
          style={styles.widget}
          onPress={() => dashData?.latestNotice && navigation.navigate('PostDetail', { postId: dashData.latestNotice.id })}
          activeOpacity={dashData?.latestNotice ? 0.7 : 1}
        >
          <View style={styles.widgetHeader}>
            <Text style={styles.widgetSmallLabel}>최근 공지</Text>
            {dashData?.latestNotice && <Ionicons name="chevron-forward" size={14} color="#C7C7CC" />}
          </View>
          {dashData?.latestNotice ? (
            <>
              <Text style={styles.noticeTitle}>{dashData.latestNotice.title}</Text>
              <Text style={styles.noticeDate}>{formatDate(dashData.latestNotice.createdAt)}</Text>
            </>
          ) : (
            <Text style={styles.noticeEmpty}>최근 공지가 없습니다</Text>
          )}
        </TouchableOpacity>

        {/* Active polls widget */}
        <TouchableOpacity
          style={styles.widget}
          onPress={() => navigation.navigate('PollList', { villaId: villaData.id, userId: adminUserId, userRole: 'ADMIN' })}
          activeOpacity={0.7}
        >
          <View style={styles.widgetHeader}>
            <Text style={styles.widgetSmallLabel}>진행중인 투표</Text>
            <Ionicons name="chevron-forward" size={14} color="#C7C7CC" />
          </View>
          <Text style={[styles.widgetNumber, { color: '#FF2D55' }]}>
            {dashData?.activePollsCount ?? 0}건
          </Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <Text style={styles.sectionLabel}>바로가기</Text>
        <View style={styles.actionRow}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={action.onPress}
              activeOpacity={0.75}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: action.color + '1A' }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Resident list */}
        <Text style={styles.sectionLabel}>입주민 명단</Text>
        {residents.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyResidentText}>아직 등록된 입주민이 없습니다.</Text>
          </View>
        ) : (
          <FlatList
            data={residents}
            keyExtractor={(item, index) => item.recordId ?? String(index)}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.residentCard}>
                <View style={styles.roomBadge}>
                  <Text style={styles.roomBadgeText}>{item.roomNumber}호</Text>
                </View>
                <View style={styles.residentInfo}>
                  <Text style={styles.residentName}>{item.name}</Text>
                </View>
              </View>
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F3F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
  },
  registerButton: {
    backgroundColor: '#007AFF',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Header
  headerSection: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextGroup: {
    flex: 1,
  },
  bellButton: {
    padding: 4,
    marginLeft: 8,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  villaName: {
    fontSize: 15,
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
  widgetLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  widgetSmallLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  widgetNumber: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },

  // Notice widget
  noticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  noticeDate: {
    fontSize: 13,
    color: '#8E8E93',
  },
  noticeEmpty: {
    fontSize: 14,
    color: '#C7C7CC',
    fontStyle: 'italic',
  },

  // Section label
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 12,
    marginTop: 24,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Quick actions
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },

  // Resident list
  emptyResidentText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 8,
  },
  residentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  roomBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 14,
    minWidth: 54,
    alignItems: 'center',
  },
  roomBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  residentInfo: {
    flex: 1,
  },
  residentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
});

export default DashboardScreen;
