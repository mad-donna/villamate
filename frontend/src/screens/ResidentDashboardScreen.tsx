import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import RollingBanner from '../components/RollingBanner';

interface DashData {
  myUnpaidAmount: number;
  latestNotice: { id: string; title: string; createdAt: string } | null;
  myVehicleCount: number;
  activePollsCount: number;
}

const ResidentDashboardScreen = () => {
  const navigation = useNavigation<any>();

  const [dashData, setDashData] = useState<DashData | null>(null);
  const [residentUserId, setResidentUserId] = useState<string | null>(null);
  const [residentVillaId, setResidentVillaId] = useState<number | null>(null);
  const [residentName, setResidentName] = useState<string>('');
  const [villaName, setVillaName] = useState<string>('');

  const loadAll = useCallback(async () => {
    try {
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

      // Fetch dashboard stats
      if (villaId) {
        const dashRes = await fetch(
          `${API_BASE_URL}/api/dashboard/${userId}?villaId=${villaId}&role=RESIDENT`
        );
        if (dashRes.ok) {
          const dd = await dashRes.json();
          setDashData(dd);
        }
      }
    } catch (err) {
      console.error('Resident dashboard load error:', err);
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

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Rolling banner */}
        <RollingBanner navigation={navigation} />

        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.greeting}>
                안녕하세요 👋 {residentName || '입주민'}님
              </Text>
              {villaName ? (
                <Text style={styles.villaSubtitle}>{villaName}</Text>
              ) : null}
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

        {/* Top widget: 미납 관리비 — full width */}
        <TouchableOpacity
          style={styles.widget}
          onPress={() => navigation.navigate('ResidentInvoice')}
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
          onPress={() => navigation.navigate('PollList', { villaId: residentVillaId, userId: residentUserId, userRole: 'RESIDENT' })}
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
