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
import { API_BASE_URL } from '../config';


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
  const [loading, setLoading] = useState(true);

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

      const response = await fetch(`${API_BASE_URL}/api/villas/${userId}`);
      if (!response.ok) return;

      const villas = await response.json();
      if (Array.isArray(villas) && villas.length > 0) {
        setVillaId(villas[0].id);
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

  const menuItems: MenuItem[] = [
    {
      id: 'invoice',
      label: '새 청구서 발행하기',
      sublabel: '이번 달 관리비 청구서를 발행합니다',
      icon: 'receipt-outline',
      color: '#FF9500',
      onPress: () => navigation.navigate('CreateInvoice'),
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
      id: 'ledger',
      label: '납부 내역 확인',
      sublabel: '공용 납부 및 영수증을 확인합니다',
      icon: 'book-outline',
      color: '#007AFF',
      onPress: () => navigation.navigate('Ledger'),
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
      id: 'external-billing',
      label: '외부 청구서 발송',
      sublabel: '앱 미설치 대상자에게 웹 링크로 청구합니다',
      icon: 'link-outline',
      color: '#FF3B30',
      onPress: () => navigation.navigate('ExternalBilling'),
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
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.75}
              >
                <View style={[styles.menuIconWrapper, { backgroundColor: item.color + '18' }]}>
                  <Ionicons name={item.icon as any} size={26} color={item.color} />
                </View>
                <View style={styles.menuTextWrapper}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSublabel}>{item.sublabel}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            ))}
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
