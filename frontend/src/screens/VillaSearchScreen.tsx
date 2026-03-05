import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

interface VillaResult {
  id: number;
  name: string;
  address: string;
  totalUnits: number;
}

const VillaSearchScreen = ({ navigation }: any) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VillaResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const [selectedVilla, setSelectedVilla] = useState<VillaResult | null>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [joining, setJoining] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSearch = useCallback(async () => {
    if (query.trim().length < 2) {
      Alert.alert('알림', '검색어를 2자 이상 입력해주세요.');
      return;
    }
    setSearching(true);
    setSearched(false);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/villas/search?q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '검색 실패');
      setResults(Array.isArray(data) ? data : []);
    } catch (err: any) {
      Alert.alert('오류', err.message || '서버에 연결할 수 없습니다.');
      setResults([]);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  }, [query]);

  const handleSelectVilla = (villa: VillaResult) => {
    setSelectedVilla(villa);
    setRoomNumber('');
    setModalVisible(true);
  };

  const handleJoin = async () => {
    if (!roomNumber.trim()) {
      Alert.alert('알림', '호수를 입력해주세요.');
      return;
    }
    if (!selectedVilla) return;

    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      Alert.alert('오류', '로그인 정보를 찾을 수 없습니다.');
      navigation.replace('Login');
      return;
    }

    setJoining(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/villas/${selectedVilla.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roomNumber: roomNumber.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('오류', data.error || '가입에 실패했습니다.');
        return;
      }

      const updatedUser = { ...data.user, villa: data.villa };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      setModalVisible(false);
      navigation.replace('ResidentDashboard');
    } catch {
      Alert.alert('오류', '서버에 연결할 수 없습니다.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>단지 검색</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>거주하시는 단지를{'\n'}검색해주세요.</Text>
        <Text style={styles.subtitle}>단지명 또는 주소로 검색하세요.</Text>

        {/* Search input */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="예: 행복 빌라, 서울 강남구..."
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            autoFocus
          />
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={handleSearch}
            disabled={searching}
          >
            {searching ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="search" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Results */}
        {searched && results.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>검색 결과가 없습니다.{'\n'}관리자에게 문의해주세요.</Text>
          </View>
        )}

        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultCard}
              onPress={() => handleSelectVilla(item)}
              activeOpacity={0.75}
            >
              <View style={styles.resultIcon}>
                <Ionicons name="business-outline" size={20} color="#007AFF" />
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultAddress}>{item.address}</Text>
                <Text style={styles.resultUnits}>{item.totalUnits}세대</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Room number modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{selectedVilla?.name}</Text>
            <Text style={styles.modalSubtitle}>{selectedVilla?.address}</Text>

            <Text style={styles.modalLabel}>호수 입력</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="예: 101호"
              value={roomNumber}
              onChangeText={setRoomNumber}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleJoin}
            />

            <TouchableOpacity
              style={[styles.joinBtn, joining && { opacity: 0.6 }]}
              onPress={handleJoin}
              disabled={joining}
            >
              {joining ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.joinBtnText}>이 단지로 가입하기</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelBtnText}>취소</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1C1C1E' },

  content: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#1C1C1E', lineHeight: 32, marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#8E8E93', marginBottom: 20 },

  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  searchInput: {
    flex: 1,
    height: 52,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1C1C1E',
  },
  searchBtn: {
    width: 52,
    height: 52,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyBox: {
    backgroundColor: '#F2F3F7',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyText: { fontSize: 14, color: '#8E8E93', textAlign: 'center', lineHeight: 22 },

  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F3F7',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E5F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', marginBottom: 2 },
  resultAddress: { fontSize: 13, color: '#8E8E93', marginBottom: 2 },
  resultUnits: { fontSize: 12, color: '#AEAEB2' },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  modalSubtitle: { fontSize: 14, color: '#8E8E93', marginBottom: 24 },
  modalLabel: { fontSize: 14, fontWeight: '600', color: '#3A3A3C', marginBottom: 8 },
  modalInput: {
    height: 56,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1C1C1E',
    marginBottom: 16,
  },
  joinBtn: {
    height: 56,
    backgroundColor: '#007AFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  joinBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  cancelBtn: { height: 44, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { color: '#8E8E93', fontSize: 15 },
});

export default VillaSearchScreen;
