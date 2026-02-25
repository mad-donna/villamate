import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.219.122:3000';

const ResidentManagementScreen = () => {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVillaData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        const response = await fetch(`${API_BASE_URL}/api/villas/${userId}`);
        const villas = await response.json();

        if (Array.isArray(villas) && villas.length > 0) {
          const villa = villas[0];
          setInviteCode(villa.inviteCode);
          setResidents(villa.residents || []);
        }
      } catch (error) {
        console.error('Failed to fetch villa data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVillaData();
  }, []);

  const handleInvite = async () => {
    if (!inviteCode) {
      Alert.alert('오류', '초대 코드를 불러올 수 없습니다.');
      return;
    }

    const message = `우리 빌라 초대 코드: [${inviteCode}]\n앱을 설치하고 이 코드를 입력해 주세요!`;
    try {
      await Share.share({ message });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>입주민 관리</Text>

        {inviteCode && (
          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>우리 빌라 초대 코드</Text>
            <Text style={styles.codeValue}>{inviteCode}</Text>
          </View>
        )}

        <FlatList
          data={residents}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.residentItem}>
              <Text style={styles.residentName}>{item.user?.name || '입주민'}</Text>
              <Text style={styles.residentUnit}>{item.roomNumber}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>등록된 입주민이 없습니다.</Text>}
        />

        <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
          <Text style={styles.inviteButtonText}>초대 코드 공유하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  codeBox: {
    backgroundColor: '#EEF4FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C7D9FF',
  },
  codeLabel: {
    fontSize: 13,
    color: '#5E7BAA',
    marginBottom: 6,
    fontWeight: '600',
  },
  codeValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#007AFF',
    letterSpacing: 4,
  },
  residentItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  residentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  residentUnit: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  inviteButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResidentManagementScreen;
