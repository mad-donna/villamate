import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import api from '../utils/api';

interface Resident {
  recordId: number;
  userId: string;
  name: string;
  roomNumber: string;
  joinedAt: string;
  residentType: string;
}

type UnitRow = {
  roomNumber: string;
  residents: Resident[];
};

type FilterType = '전체' | '입주중' | '공실' | '세대주' | '세입자';
const FILTER_OPTIONS: FilterType[] = ['전체', '입주중', '공실', '세대주', '세입자'];

const ResidentManagementScreen = ({ navigation }: any) => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [villaId, setVillaId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [villaRoomNumbers, setVillaRoomNumbers] = useState<string[]>([]);
  const [roomMgmtVisible, setRoomMgmtVisible] = useState(false);
  const [newRoomInput, setNewRoomInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('전체');

  const resolveVillaId = useCallback(async (): Promise<{ id: number; roomNumbers: string[] } | null> => {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      if (user?.villa?.id) return { id: user.villa.id, roomNumbers: [] };
      const uid = user.id;
      if (uid) {
        const res = await api.get(`/api/villas/${uid}`);
        const data = res.data;
        if (Array.isArray(data) && data.length > 0) {
          return { id: data[0].id, roomNumbers: data[0].roomNumbers ?? [] };
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
        const resolved = await resolveVillaId();
        if (!resolved) {
          Alert.alert('오류', '빌라 정보를 불러올 수 없습니다.');
          setLoading(false);
          return;
        }
        vid = resolved.id;
        setVillaId(vid);
        setVillaRoomNumbers(resolved.roomNumbers);
      }
      const res = await api.get(`/api/villas/${vid}/residents`);
      const data = res.data;
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

  // Build merged unit rows: all registered rooms + any unregistered resident rooms
  const allUnitRows = useMemo((): UnitRow[] => {
    const registeredSet = new Set(villaRoomNumbers);
    const rowMap = new Map<string, Resident[]>();

    // Seed with all pre-registered rooms
    for (const room of villaRoomNumbers) {
      rowMap.set(room, []);
    }

    // Place residents into their rooms
    for (const resident of residents) {
      const existing = rowMap.get(resident.roomNumber);
      if (existing !== undefined) {
        existing.push(resident);
      } else {
        // Room not in pre-registered list — create a row for backwards compatibility
        rowMap.set(resident.roomNumber, [resident]);
      }
    }

    // Convert to array and sort numerically
    const rows: UnitRow[] = Array.from(rowMap.entries()).map(([roomNumber, res]) => ({
      roomNumber,
      residents: res,
    }));

    rows.sort((a, b) => {
      const numA = parseInt(a.roomNumber, 10);
      const numB = parseInt(b.roomNumber, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.roomNumber.localeCompare(b.roomNumber);
    });

    return rows;
  }, [villaRoomNumbers, residents]);

  // Apply filter + search on top of the merged unit rows
  const filteredUnitRows = useMemo((): UnitRow[] => {
    let rows = allUnitRows;

    // Apply filter chip
    if (activeFilter === '입주중') {
      rows = rows.filter((u) => u.residents.length > 0);
    } else if (activeFilter === '공실') {
      rows = rows.filter((u) => u.residents.length === 0);
    } else if (activeFilter === '세대주') {
      rows = rows
        .map((u) => ({
          ...u,
          residents: u.residents.filter((r) => r.residentType === 'HEAD'),
        }))
        .filter((u) => u.residents.length > 0);
    } else if (activeFilter === '세입자') {
      rows = rows
        .map((u) => ({
          ...u,
          residents: u.residents.filter((r) => r.residentType === 'MEMBER'),
        }))
        .filter((u) => u.residents.length > 0);
    }

    // Apply search query on top
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (u) =>
          u.roomNumber.toLowerCase().includes(q) ||
          u.residents.some((r) => r.name.toLowerCase().includes(q))
      );
    }

    return rows;
  }, [allUnitRows, activeFilter, searchQuery]);

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
              await api.post(`/api/villas/${villaId}/residents/${resident.userId}/move-out`);
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
      const resolved = await resolveVillaId();
      if (!resolved) {
        Alert.alert('오류', '빌라 정보를 불러올 수 없습니다.');
        return;
      }
      vid = resolved.id;
      setVillaId(vid);
      setVillaRoomNumbers(resolved.roomNumbers);
    }
    try {
      const res = await api.get(`/api/villas/${vid}/detail`);
      const villa = res.data;
      const code: string = villa.inviteCode;
      Alert.alert(
        '입주민 초대 코드',
        `새 입주민에게 아래 초대 코드를 공유해주세요.\n\n${code}\n\n입주민은 앱 가입 후 초대 코드를 입력하면 자동으로 빌라에 연결됩니다.`,
        [
          { text: '닫기', style: 'cancel' },
          {
            text: '복사하기',
            onPress: async () => {
              await Clipboard.setStringAsync(code);
              Alert.alert('복사 완료', '초대 코드가 클립보드에 복사되었습니다.');
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert('오류', '초대 코드를 불러오지 못했습니다.');
    }
  };

  const handleSaveRooms = async () => {
    if (!villaId) return;
    try {
      await api.put(`/api/villas/${villaId}/rooms`, { roomNumbers: villaRoomNumbers });
    {
        Alert.alert('저장 완료', '세대 호수 목록이 저장되었습니다.');
        setRoomMgmtVisible(false);
      }
    } catch {
      Alert.alert('오류', '저장에 실패했습니다.');
    }
  };

  const handleAddNewRoom = () => {
    const trimmed = newRoomInput.trim();
    if (!trimmed || villaRoomNumbers.includes(trimmed)) return;
    setVillaRoomNumbers((prev) => [...prev, trimmed].sort());
    setNewRoomInput('');
  };

  const renderResidentTypeBadge = (residentType: string) => {
    const isHead = residentType === 'HEAD';
    return (
      <View style={[styles.typeBadge, isHead ? styles.typeBadgeHead : styles.typeBadgeMember]}>
        <Text style={styles.typeBadgeText}>{isHead ? '세대주' : '세입자'}</Text>
      </View>
    );
  };

  const renderUnitCard = ({ item }: { item: UnitRow }) => {
    const isVacant = item.residents.length === 0;
    return (
      <View style={styles.unitCard}>
        {/* Unit header */}
        <View style={styles.unitHeader}>
          <View style={styles.roomBadge}>
            <Text style={styles.roomBadgeText}>{item.roomNumber}호</Text>
          </View>
          {isVacant && (
            <View style={styles.vacantBadge}>
              <Text style={styles.vacantBadgeText}>공실</Text>
            </View>
          )}
        </View>

        {/* Residents inside the unit */}
        {item.residents.map((resident) => {
          const isProcessing = processingId === resident.userId;
          return (
            <View key={resident.userId} style={styles.residentRow}>
              <View style={styles.residentRowLeft}>
                {renderResidentTypeBadge(resident.residentType)}
                <Text style={styles.residentRowName}>{resident.name}</Text>
              </View>
              <TouchableOpacity
                style={[styles.moveOutButton, isProcessing && styles.moveOutButtonDisabled]}
                onPress={() => handleMoveOut(resident)}
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
        })}
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="이름 또는 호수로 검색"
          placeholderTextColor="#C7C7CC"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={18} color="#C7C7CC" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTER_OPTIONS.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Summary line */}
      <Text style={styles.summaryText}>
        {filteredUnitRows.length}개 세대 표시 중 (전체 {allUnitRows.length}세대)
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Fixed page header */}
      <View style={styles.header}>
        <Text style={styles.title}>입주민 및 전출입 관리</Text>
        <TouchableOpacity style={styles.inviteButton} onPress={handleInvite} activeOpacity={0.85}>
          <Text style={styles.inviteButtonText}>+ 새 입주민 초대</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.roomMgmtCard}
          onPress={() => setRoomMgmtVisible(true)}
          activeOpacity={0.75}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 16 }}>🏠</Text>
              <View>
                <Text style={styles.roomMgmtTitle}>세대 호수 관리</Text>
                <Text style={styles.roomMgmtSub}>
                  {villaRoomNumbers.length > 0
                    ? `${villaRoomNumbers.length}개 세대 등록됨`
                    : '세대 호수를 미리 등록해주세요'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>입주민 목록 불러오는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUnitRows}
          keyExtractor={(item) => item.roomNumber}
          renderItem={renderUnitCard}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="home-outline" size={40} color="#C7C7CC" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>
                {searchQuery || activeFilter !== '전체'
                  ? '조건에 맞는 세대가 없습니다.'
                  : '등록된 입주민이 없습니다.'}
              </Text>
              <Text style={styles.emptySubText}>
                {searchQuery || activeFilter !== '전체'
                  ? '검색어나 필터를 변경해보세요.'
                  : '초대 코드를 공유하여 입주민을 초대하세요.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Room Management Modal */}
      <Modal
        visible={roomMgmtVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setRoomMgmtVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>세대 호수 관리</Text>
              <TouchableOpacity onPress={() => setRoomMgmtVisible(false)}>
                <Ionicons name="close" size={24} color="#1C1C1E" />
              </TouchableOpacity>
            </View>
            <View style={styles.roomAddRow}>
              <TextInput
                style={styles.roomAddInput}
                placeholder="호수 입력 (예: 101)"
                value={newRoomInput}
                onChangeText={setNewRoomInput}
                returnKeyType="done"
                onSubmitEditing={handleAddNewRoom}
              />
              <TouchableOpacity style={styles.roomAddBtn} onPress={handleAddNewRoom}>
                <Text style={styles.roomAddBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }}>
              {villaRoomNumbers.length === 0 ? (
                <Text style={styles.roomEmptyText}>등록된 호수가 없습니다.</Text>
              ) : (
                <View style={styles.roomChipWrap}>
                  {villaRoomNumbers.map((room) => (
                    <TouchableOpacity
                      key={room}
                      style={styles.roomChipItem}
                      onPress={() => setVillaRoomNumbers((prev) => prev.filter((r) => r !== room))}
                    >
                      <Text style={styles.roomChipItemText}>{room}호</Text>
                      <Text style={styles.roomChipItemClose}>×</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveRooms}>
              <Text style={styles.saveBtnText}>저장하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 10,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  roomMgmtCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 14,
  },
  roomMgmtTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  roomMgmtSub: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
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
  // Search bar
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1E',
    padding: 0,
  },
  // Filter chips
  filterRow: {
    paddingBottom: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#C7C7CC',
    backgroundColor: '#fff',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  summaryText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
  },
  // Unit card
  unitCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  roomBadge: {
    backgroundColor: '#E8F0FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roomBadgeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#007AFF',
  },
  vacantBadge: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  vacantBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },
  // Resident row inside unit card
  residentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  residentRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  residentRowName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    flexShrink: 1,
  },
  // ResidentType badges
  typeBadge: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  typeBadgeHead: {
    backgroundColor: '#007AFF',
  },
  typeBadgeMember: {
    backgroundColor: '#FF9500',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  moveOutButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FF3B30',
    minWidth: 76,
    alignItems: 'center',
  },
  moveOutButtonDisabled: {
    borderColor: '#FFBBB8',
  },
  moveOutButtonText: {
    color: '#FF3B30',
    fontSize: 13,
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
  // Room management modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  roomAddRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  roomAddInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  roomAddBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomAddBtnText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  roomEmptyText: { textAlign: 'center', color: '#C7C7CC', fontSize: 15, marginTop: 32 },
  roomChipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 16 },
  roomChipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F0FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  roomChipItemText: { fontSize: 14, color: '#007AFF', fontWeight: '600' },
  roomChipItemClose: { fontSize: 16, color: '#007AFF', fontWeight: '700' },
  saveBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default ResidentManagementScreen;
