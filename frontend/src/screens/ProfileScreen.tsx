import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useFocusEffect } from '@react-navigation/native';

const API_BASE_URL = 'http://192.168.219.108:3000';

interface Vehicle {
  id: string;
  plateNumber: string;
  isVisitor: boolean;
  expectedDeparture: string | null;
  createdAt: string;
}

const ProfileScreen = ({ navigation }: any) => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [villaId, setVillaId] = useState<number | null>(null);

  // Vehicle form state
  const [plateNumber, setPlateNumber] = useState('');
  const [isVisitor, setIsVisitor] = useState(false);
  const [expectedDeparture, setExpectedDeparture] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [registering, setRegistering] = useState(false);

  const loadUserData = useCallback(async () => {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      setUserName(user.name);
      setUserEmail(user.email || user.phone || '정보 없음');

      // Resolve userId
      let uid = await AsyncStorage.getItem('userId');
      if (!uid) uid = user.id;
      if (uid) {
        setUserId(uid);
        await AsyncStorage.setItem('userId', uid);
      }

      // Resolve villaId — residents store villa in AsyncStorage; admins do not
      if (user?.villa?.id) {
        setVillaId(user.villa.id);
      } else if (uid) {
        // Admin users have no villa in AsyncStorage — fetch from API
        try {
          const res = await fetch(`${API_BASE_URL}/api/users/${uid}/villa`);
          if (res.ok) {
            const data = await res.json();
            if (data?.villa?.id) setVillaId(data.villa.id);
          }
        } catch (e) {
          console.error('Failed to fetch villa for user:', e);
        }
      }
    }
  }, []);

  const fetchVehicles = useCallback(async () => {
    let uid = await AsyncStorage.getItem('userId');
    if (!uid) {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) uid = JSON.parse(userJson).id;
    }
    if (!uid) return;

    try {
      setVehicleLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/users/${uid}/vehicles`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Fetch vehicles error:', e);
    } finally {
      setVehicleLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      fetchVehicles();
    }, [loadUserData, fetchVehicles])
  );

  const handleRegisterVehicle = async () => {
    if (!plateNumber.trim()) {
      Alert.alert('입력 오류', '차량 번호를 입력해주세요.');
      return;
    }

    let uid = userId;
    if (!uid) {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) uid = JSON.parse(userJson).id;
    }

    let vid = villaId;
    if (!vid) {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const storedUser = JSON.parse(userJson);
        vid = storedUser?.villa?.id ?? null;
      }
    }

    if (!uid || !vid) {
      Alert.alert('오류', '사용자 또는 빌라 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      setRegistering(true);
      const res = await fetch(`${API_BASE_URL}/api/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plateNumber: plateNumber.trim(),
          ownerId: uid,
          villaId: vid,
          isVisitor,
          expectedDeparture: isVisitor && expectedDeparture.trim() ? expectedDeparture.trim() : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || '등록 실패');
      }

      setPlateNumber('');
      setIsVisitor(false);
      setExpectedDeparture('');
      await fetchVehicles();
      Alert.alert('등록 완료', '차량이 등록되었습니다.');
    } catch (e: any) {
      Alert.alert('오류', e.message || '차량 등록에 실패했습니다.');
    } finally {
      setRegistering(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    Alert.alert('차량 삭제', '이 차량을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}`, {
              method: 'DELETE',
            });
            if (!res.ok) throw new Error('삭제 실패');
            await fetchVehicles();
          } catch (e: any) {
            Alert.alert('오류', e.message || '차량 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
          );
        },
      },
    ]);
  };

  const formatDeparture = (dt: string | null) => {
    if (!dt) return '';
    try {
      const d = new Date(dt);
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${month}/${day} ${hours}:${mins} 출발 예정`;
    } catch {
      return dt;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile section */}
        <Text style={styles.title}>내 정보</Text>
        <View style={styles.profileCard}>
          <Text style={styles.label}>이름</Text>
          <Text style={styles.value}>{userName}</Text>

          <Text style={[styles.label, { marginTop: 20 }]}>연락처/이메일</Text>
          <Text style={styles.value}>{userEmail}</Text>
        </View>

        {/* Vehicle management section */}
        <Text style={styles.sectionTitle}>내 차량 관리</Text>

        <View style={styles.vehicleFormCard}>
          <TextInput
            style={styles.input}
            placeholder="차량 번호 입력 (예: 12가3456)"
            placeholderTextColor="#C7C7CC"
            value={plateNumber}
            onChangeText={setPlateNumber}
            autoCapitalize="none"
          />

          {/* Vehicle type toggle */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !isVisitor && styles.toggleButtonActive,
              ]}
              onPress={() => setIsVisitor(false)}
            >
              <Text style={[styles.toggleButtonText, !isVisitor && styles.toggleButtonTextActive]}>
                일반 차량
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                isVisitor && styles.toggleButtonVisitorActive,
              ]}
              onPress={() => setIsVisitor(true)}
            >
              <Text style={[styles.toggleButtonText, isVisitor && styles.toggleButtonTextActive]}>
                방문 차량
              </Text>
            </TouchableOpacity>
          </View>

          {isVisitor && (
            <TextInput
              style={styles.input}
              placeholder="출발 예정 시간 (예: 2026-02-26 18:00)"
              placeholderTextColor="#C7C7CC"
              value={expectedDeparture}
              onChangeText={setExpectedDeparture}
              autoCapitalize="none"
            />
          )}

          <TouchableOpacity
            style={[styles.registerButton, registering && styles.registerButtonDisabled]}
            onPress={handleRegisterVehicle}
            disabled={registering}
          >
            {registering ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>차량 등록</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Registered vehicles list */}
        {vehicleLoading ? (
          <ActivityIndicator size="small" color="#007AFF" style={styles.loader} />
        ) : vehicles.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>등록된 차량이 없습니다.</Text>
          </View>
        ) : (
          vehicles.map((v) => (
            <View key={v.id} style={styles.vehicleCard}>
              <View style={styles.vehicleCardLeft}>
                <Text style={styles.vehiclePlate}>{v.plateNumber}</Text>
                <View style={styles.vehicleBadgeRow}>
                  <View style={[styles.badge, v.isVisitor ? styles.badgeVisitor : styles.badgeRegular]}>
                    <Text style={styles.badgeText}>
                      {v.isVisitor ? '방문차량' : '일반차량'}
                    </Text>
                  </View>
                </View>
                {v.isVisitor && v.expectedDeparture ? (
                  <Text style={styles.vehicleDeparture}>{formatDeparture(v.expectedDeparture)}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteVehicle(v.id)}
              >
                <Text style={styles.deleteButtonText}>삭제</Text>
              </TouchableOpacity>
            </View>
          ))
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
    backgroundColor: '#F7F7F7',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 14,
  },
  vehicleFormCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1C1C1E',
    backgroundColor: '#F8F9FA',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#F8F9FA',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  toggleButtonVisitorActive: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  registerButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  registerButtonDisabled: {
    backgroundColor: '#A8C7FA',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loader: {
    marginVertical: 20,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  vehicleCardLeft: {
    flex: 1,
    marginRight: 12,
  },
  vehiclePlate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  vehicleBadgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeRegular: {
    backgroundColor: '#E3F2FD',
  },
  badgeVisitor: {
    backgroundColor: '#FFF3E0',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3A3A3C',
  },
  vehicleDeparture: {
    fontSize: 12,
    color: '#FF9500',
    marginTop: 2,
  },
  deleteButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 13,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#fff',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
