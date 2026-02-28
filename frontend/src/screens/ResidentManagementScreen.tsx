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
import { API_BASE_URL } from '../config';


interface Resident {
  recordId: number;
  userId: string;
  name: string;
  roomNumber: string;
  joinedAt: string;
}

const ResidentManagementScreen = ({ navigation }: any) => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [villaId, setVillaId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const resolveVillaId = useCallback(async (): Promise<number | null> => {
    // Try AsyncStorage first (resident flow stores it)
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      if (user?.villa?.id) return user.villa.id;
      // Admin: fetch via /api/villas/:adminId
      const uid = user.id;
      if (uid) {
        const res = await fetch(`${API_BASE_URL}/api/villas/${uid}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) return data[0].id;
        }
      }
    }
    return null;
  }, []);

  const fetchResidents = useCallback(async () => {
    setLoading(true);
    try {
      let vid = villaId;
      if (!vid) {
        vid = await resolveVillaId();
        if (!vid) {
          Alert.alert('오류', '빌라 정보를 불러올 수 없습니다.');
          setLoading(false);
          return;
        }
        setVillaId(vid);
      }
      const res = await fetch(`${API_BASE_URL}/api/villas/${vid}/residents`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setResidents(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert('오류', '입주민 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [villaId, resolveVillaId]);

  useFocusEffect(
    useCallback(() => {
      fetchResidents();
    }, [fetchResidents])
  );

  const handleMoveOut = (resident: Resident) => {
    Alert.alert(
      '전출 처리 확인',
      `${resident.roomNumber}호 ${resident.name} 입주민을 전출 처리하시겠습니까?\n\n전출 처리 시 해당 입주민의 빌라 접근 권한이 즉시 해제됩니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '전출 처리',
          style: 'destructive',
          onPress: async () => {
            if (!villaId) return;
            setProcessingId(resident.userId);
            try {
              const res = await fetch(
                `${API_BASE_URL}/api/villas/${villaId}/residents/${resident.userId}/move-out`,
                { method: 'POST' }
              );
              if (!res.ok) throw new Error('move-out failed');
              Alert.alert('완료', `${resident.roomNumber}호 ${resident.name} 입주민이 전출 처리되었습니다.`);
              await fetchResidents();
            } catch (e) {
              Alert.alert('오류', '전출 처리에 실패했습니다.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleInvite = async () => {
    let vid = villaId;
    if (!vid) {
      vid = await resolveVillaId();
      if (!vid) {
        Alert.alert('오류', '빌라 정보를 불러올 수 없습니다.');
        return;
      }
      setVillaId(vid);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/villas/${vid}/detail`);
      if (!res.ok) throw new Error('fetch failed');
      const villa = await res.json();
      Alert.alert(
        '입주민 초대 코드',
        `새 입주민에게 아래 초대 코드를 공유해주세요.\n\n${villa.inviteCode}\n\n입주민은 앱 가입 후 초대 코드를 입력하면 자동으로 빌라에 연결됩니다.`
      );
    } catch (e) {
      Alert.alert('오류', '초대 코드를 불러오지 못했습니다.');
    }
  };

  const renderResident = ({ item }: { item: Resident }) => {
    const isProcessing = processingId === item.userId;
    return (
      <View style={styles.residentCard}>
        <View style={styles.residentInfo}>
          <Text style={styles.roomNumber}>{item.roomNumber}호</Text>
          <Text style={styles.residentName}>{item.name}</Text>
        </View>
        <TouchableOpacity
          style={[styles.moveOutButton, isProcessing && styles.moveOutButtonDisabled]}
          onPress={() => handleMoveOut(item)}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FF3B30" />
          ) : (
            <Text style={styles.moveOutButtonText}>전출 처리</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>입주민 및 전출입 관리</Text>
        <TouchableOpacity style={styles.inviteButton} onPress={handleInvite} activeOpacity={0.85}>
          <Text style={styles.inviteButtonText}>+ 새 입주민 초대</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>입주민 목록 불러오는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={residents}
          keyExtractor={(item) => String(item.recordId)}
          renderItem={renderResident}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>등록된 입주민이 없습니다.</Text>
              <Text style={styles.emptySubText}>초대 코드를 공유하여 입주민을 초대하세요.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  inviteButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  listContent: {
    padding: 16,
  },
  residentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  residentInfo: {
    flex: 1,
    marginRight: 12,
  },
  roomNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  residentName: {
    fontSize: 14,
    color: '#8E8E93',
  },
  moveOutButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FF3B30',
    minWidth: 80,
    alignItems: 'center',
  },
  moveOutButtonDisabled: {
    borderColor: '#FFBBB8',
  },
  moveOutButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '700',
  },
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
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A3A3C',
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default ResidentManagementScreen;
