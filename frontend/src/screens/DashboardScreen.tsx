import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config';
import RollingBanner from '../components/RollingBanner';
import { useAppMode } from '../context/AppModeContext';

interface Villa {
  id: number;
  name: string;
  address: string;
  totalUnits: number;
  accountNumber: string;
  bankName: string;
  status?: string;
  subscriptionStatus?: string;
  subscriptionExpiry?: string;
  roomNumbers?: string[];
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
  const { setAppMode } = useAppMode();
  const [villaData, setVillaData] = useState<Villa | null>(null);
  const [dashData, setDashData] = useState<DashData | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [villaRoomNumbers, setVillaRoomNumbers] = useState<string[]>([]);
  const [roomMgmtVisible, setRoomMgmtVisible] = useState(false);
  const [newRoomInput, setNewRoomInput] = useState('');

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
      if (villa.roomNumbers) {
        setVillaRoomNumbers(villa.roomNumbers);
      }

      // Check subscription status
      const isExpired = villa.subscriptionExpiry
        ? new Date(villa.subscriptionExpiry) < new Date()
        : false;
      if (!villa.subscriptionStatus || villa.subscriptionStatus !== 'ACTIVE' || isExpired) {
        navigation.navigate('AdminSubscription', { villaId: villa.id });
        setLoading(false);
        return;
      }

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

  const handleSaveRooms = async () => {
    if (!villaData) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/villas/${villaData.id}/rooms`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomNumbers: villaRoomNumbers }),
      });
      if (res.ok) {
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
    setVillaRoomNumbers(prev => [...prev, trimmed].sort());
    setNewRoomInput('');
  };

  const handleSwitchToResidentMode = async () => {
    if (!villaData) {
      Alert.alert('알림', '빌라 정보가 없습니다. 빌라를 먼저 등록하거나 불러오세요.');
      return;
    }
    try {
      const userJson = await AsyncStorage.getItem('user');
      const storedUser = userJson ? JSON.parse(userJson) : {};
      const updated = {
        ...storedUser,
        villa: { id: villaData.id, name: villaData.name, accountNumber: villaData.accountNumber, bankName: villaData.bankName },
      };
      await AsyncStorage.setItem('user', JSON.stringify(updated));
      setAppMode('RESIDENT');
      navigation.navigate('ResidentDashboard');
    } catch (e) {
      console.error('Switch to resident mode error:', e);
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {villaData?.status === 'PENDING' && (
        <View style={styles.pendingBanner}>
          <Text style={styles.pendingBannerText}>
            🚧 현재 단지 승인 대기 중입니다. 관리자 확인 후 정식 서비스 이용이 가능합니다.
          </Text>
        </View>
      )}
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

        {/* ── Resident Mode Switch ── */}
        <TouchableOpacity
          style={styles.switchModeCard}
          onPress={handleSwitchToResidentMode}
          activeOpacity={0.75}
        >
          <View style={styles.switchModeRow}>
            <Ionicons name="swap-horizontal-outline" size={22} color="#5856D6" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.switchModeTitle}>🔄 입주민 모드로 전환</Text>
              <Text style={styles.switchModeSub}>내 관리비 납부 및 투표 참여를 입주민 시점으로 확인합니다</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
          </View>
        </TouchableOpacity>

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

        {/* Resident list */}
        <Text style={styles.sectionLabel}>입주민 명단</Text>

        {/* Room Numbers Management */}
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
                  {villaRoomNumbers.map(room => (
                    <TouchableOpacity
                      key={room}
                      style={styles.roomChipItem}
                      onPress={() => setVillaRoomNumbers(prev => prev.filter(r => r !== room))}
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
    backgroundColor: '#F2F3F7',
  },
  pendingBanner: {
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  pendingBannerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
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
  switchModeCard: {
    backgroundColor: '#F0EEFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DDD8FF',
  },
  switchModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchModeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5856D6',
    marginBottom: 2,
  },
  switchModeSub: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
  },
  roomMgmtCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  roomMgmtTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  roomMgmtSub: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  roomAddRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  roomAddInput: {
    flex: 1, height: 48, backgroundColor: '#F2F2F7',
    borderRadius: 10, paddingHorizontal: 14, fontSize: 16,
  },
  roomAddBtn: {
    width: 48, height: 48, backgroundColor: '#007AFF',
    borderRadius: 10, justifyContent: 'center', alignItems: 'center',
  },
  roomAddBtnText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  roomEmptyText: { textAlign: 'center', color: '#C7C7CC', fontSize: 15, marginTop: 32 },
  roomChipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 16 },
  roomChipItem: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#E8F0FF', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  roomChipItemText: { fontSize: 14, color: '#007AFF', fontWeight: '600' },
  roomChipItemClose: { fontSize: 16, color: '#007AFF', fontWeight: '700' },
  saveBtn: {
    backgroundColor: '#007AFF', borderRadius: 14, height: 52,
    justifyContent: 'center', alignItems: 'center', marginTop: 12,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default DashboardScreen;
