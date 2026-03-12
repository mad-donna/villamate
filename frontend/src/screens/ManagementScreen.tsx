import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';


interface MenuItem {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  color: string;
  onPress: () => void;
}

const ManagementScreen = () => {
  const navigation = useNavigation<any>();
  const [villaId, setVillaId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);

  const fetchVillaId = useCallback(async () => {
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
      setUserId(userId);

      const response = await api.get(`/api/villas/${userId}`);
      const villas = response.data;
      if (Array.isArray(villas) && villas.length > 0) {
        const villa = villas[0];
        setVillaId(villa.id);

        // Check subscription status — status field is the single source of truth
        const ALLOWED_STATUSES = ['ACTIVE', 'FREE_TRIAL'];
        const statusOk = villa?.subscriptionStatus && ALLOWED_STATUSES.includes(villa.subscriptionStatus);
        setIsSubscriptionExpired(!statusOk);
      }
    } catch (err) {
      console.error('ManagementScreen fetchVillaId error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchVillaId();
    }, [fetchVillaId])
  );

  // IDs of menu items that require an active subscription to create/use
  const SUBSCRIPTION_GATED_IDS = new Set(['invoice', 'poll', 'external-billing']);

  const menuItems: MenuItem[] = [
    {
      id: 'invoice',
      label: '새 청구서 발행하기',
      sublabel: '이번 달 관리비 청구서를 발행합니다',
      icon: 'receipt-outline',
      color: '#FF9500',
      onPress: () => {
        if (isSubscriptionExpired) {
          if (villaId) navigation.getParent()?.navigate('AdminSubscription', { villaId });
          return;
        }
        navigation.navigate('CreateInvoice');
      },
    },
    {
      id: 'residents',
      label: '입주민 및 전출입 관리',
      sublabel: '입주민 전출 처리 및 초대 코드를 관리합니다',
      icon: 'people-outline',
      color: '#34C759',
      onPress: () => navigation.navigate('ResidentManagement'),
    },
    {
      id: 'building',
      label: '건물 이력 및 계약 관리',
      sublabel: '하자보수, 정기점검, 계약 이력을 기록합니다',
      icon: 'construct-outline',
      color: '#5856D6',
      onPress: () => navigation.navigate('BuildingHistory'),
    },
    {
      id: 'poll',
      label: '전자 투표 관리',
      sublabel: '투표 생성, 진행 현황 및 결과를 관리합니다',
      icon: 'checkbox-outline',
      color: '#FF2D55',
      onPress: () => {
        if (isSubscriptionExpired) {
          if (villaId) navigation.getParent()?.navigate('AdminSubscription', { villaId });
          return;
        }
        navigation.navigate('PollList', { villaId, userId, userRole: 'ADMIN' });
      },
    },
    {
      id: 'external-billing',
      label: '외부 청구서 발송',
      sublabel: '앱 미설치 대상자에게 웹 링크로 청구합니다',
      icon: 'link-outline',
      color: '#FF3B30',
      onPress: () => {
        if (isSubscriptionExpired) {
          if (villaId) navigation.getParent()?.navigate('AdminSubscription', { villaId });
          return;
        }
        navigation.navigate('ExternalBilling');
      },
    },
    {
      id: 'tickets',
      label: '민원 및 수리 요청',
      sublabel: '입주민이 접수한 민원 및 수리 요청을 처리합니다',
      icon: 'hammer-outline',
      color: '#FF9500',
      onPress: () =>
        navigation.navigate('TicketList', { villaId, userId, userRole: 'ADMIN' }),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>관리</Text>
          <Text style={styles.headerSubtitle}>빌라 운영의 주요 기능들을 이용하세요</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <View style={styles.menuList}>
            {menuItems.map((item) => {
              const isLocked = isSubscriptionExpired && SUBSCRIPTION_GATED_IDS.has(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, isLocked && styles.menuItemLocked]}
                  onPress={item.onPress}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.menuIconWrapper,
                      { backgroundColor: isLocked ? '#AEAEB218' : item.color + '18' },
                    ]}
                  >
                    <Ionicons
                      name={(isLocked ? 'lock-closed-outline' : item.icon) as any}
                      size={26}
                      color={isLocked ? '#AEAEB2' : item.color}
                    />
                  </View>
                  <View style={styles.menuTextWrapper}>
                    <Text style={[styles.menuLabel, isLocked && styles.menuLabelLocked]}>
                      {item.label}
                    </Text>
                    <Text style={styles.menuSublabel}>
                      {isLocked ? '구독 만료 — 결제 후 이용 가능' : item.sublabel}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 28,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  menuList: {
    gap: 12,
  },
  menuItem: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItemLocked: {
    backgroundColor: '#F2F2F7',
    shadowOpacity: 0.02,
    elevation: 1,
  },
  menuLabelLocked: {
    color: '#AEAEB2',
  },
  menuIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextWrapper: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 3,
  },
  menuSublabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
});

export default ManagementScreen;
