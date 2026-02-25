import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const API_BASE_URL = 'http://192.168.219.122:3000';

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

const DashboardScreen = ({ navigation }: any) => {
  const [villaData, setVillaData] = useState<Villa | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [residents, setResidents] = useState<any[]>([]);
  const [villaInfo, setVillaInfo] = useState<any>(null);
  const [loadingResidents, setLoadingResidents] = useState(false);

  const fetchVillaData = useCallback(async () => {
    try {
      setLoading(true);
      let userId = await AsyncStorage.getItem('userId');
      
      // 폴백: userId 키가 없으면 user 객체에서 시도
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

      console.log(`Fetching villas for adminId: ${userId}`);
      const response = await fetch(`${API_BASE_URL}/api/villas/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const villas = await response.json();
      console.log('Villas received:', villas);

      if (Array.isArray(villas) && villas.length > 0) {
        setVillaData(villas[0]);
      } else {
        setVillaData(null);
      }
    } catch (err) {
      console.error('Fetch villa error:', err);
      // 네트워크 오류 시 사용자에게 알림 (개발 중에는 주석 해제하여 확인 가능)
      // Alert.alert('연결 오류', '서버 주소와 실행 상태를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchVillaData();
    }, [fetchVillaData])
  );

  // Fetch the resident list whenever the villa is loaded
  useEffect(() => {
    const fetchResidents = async () => {
      try {
        setLoadingResidents(true);

        // Resolve userId (same fallback logic as fetchVillaData)
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

        // 1. Fetch the villa list to get the villa id
        const villaResponse = await fetch(`${API_BASE_URL}/api/villas/${userId}`);
        if (!villaResponse.ok) return;

        const villas = await villaResponse.json();
        if (!Array.isArray(villas) || villas.length === 0) return;

        const firstVilla = villas[0];
        setVillaInfo(firstVilla);

        // 2. Fetch residents for that villa
        const residentsResponse = await fetch(
          `${API_BASE_URL}/api/villas/${firstVilla.id}/residents`
        );
        if (!residentsResponse.ok) return;

        const data = await residentsResponse.json();
        setResidents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fetch residents error:', err);
      } finally {
        setLoadingResidents(false);
      }
    };

    fetchResidents();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!villaData) {
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
        <Text style={styles.header}>{villaData.name}</Text>
        
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>주소</Text>
            <Text style={styles.infoValue}>{villaData.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>총 세대수</Text>
            <Text style={styles.infoValue}>{villaData.totalUnits}세대</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>관리 중인 세대</Text>
            <Text style={styles.infoValue}>{villaData._count?.residents || 0}세대</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>공용 계좌 정보</Text>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>{villaData.bankName}</Text>
            <Text style={styles.accountNumber}>{villaData.accountNumber}</Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.createButton]}
            onPress={() => navigation.navigate('CreateInvoice')}
          >
            <Text style={styles.actionButtonText}>새 청구서 발행하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.remindButton]}
            onPress={() => navigation.navigate('ResidentManagement')}
          >
            <Text style={styles.actionButtonText}>입주민 관리</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.settleButton]}
            onPress={() => navigation.navigate('Ledger')}
          >
            <Text style={styles.actionButtonText}>장부 내역 확인</Text>
          </TouchableOpacity>
        </View>

        {/* 입주민 명부 섹션 */}
        <View style={styles.residentSection}>
          <Text style={styles.sectionTitle}>입주민 명부</Text>
          {loadingResidents ? (
            <ActivityIndicator size="small" color="#007AFF" style={styles.residentLoader} />
          ) : residents.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyResidentText}>아직 연동된 입주민이 없습니다.</Text>
            </View>
          ) : (
            <FlatList
              data={residents}
              keyExtractor={(item, index) => item.id ?? String(index)}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.residentCard}>
                  <View style={styles.roomBadge}>
                    <Text style={styles.roomBadgeText}>{item.roomNumber}호</Text>
                  </View>
                  <View style={styles.residentInfo}>
                    <Text style={styles.residentName}>{item.name}</Text>
                    {item.phone ? (
                      <Text style={styles.residentPhone}>{item.phone}</Text>
                    ) : null}
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  infoValue: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 20,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billingLabel: {
    fontSize: 16,
    color: '#666',
  },
  accountNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
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
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  residentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  residentLoader: {
    marginTop: 16,
  },
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    marginBottom: 2,
  },
  residentPhone: {
    fontSize: 13,
    color: '#8E8E93',
  },
});

export default DashboardScreen;
