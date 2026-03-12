import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  villaId: number;
  residentId: string;
}

const STATUS_CONFIG: Record<
  Ticket['status'],
  { label: string; bg: string; text: string }
> = {
  PENDING: { label: '접수 대기', bg: '#FFF9E6', text: '#B8860B' },
  IN_PROGRESS: { label: '처리 중', bg: '#E3F2FD', text: '#1565C0' },
  RESOLVED: { label: '처리 완료', bg: '#E8F5E9', text: '#2E7D32' },
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  COMMON_FACILITY: { bg: '#FFF3E0', text: '#E65100' },
  PARKING:         { bg: '#E3F2FD', text: '#1565C0' },
  NOISE_COMPLAINT: { bg: '#FCE4EC', text: '#880E4F' },
  ETC:             { bg: '#F5F5F5', text: '#424242' },
  // legacy keys (backwards compat)
  '누수':  { bg: '#E3F2FD', text: '#1565C0' },
  '전기':  { bg: '#FFF9E6', text: '#B8860B' },
  '보일러': { bg: '#FFF3E0', text: '#E65100' },
  '기타':  { bg: '#F5F5F5', text: '#424242' },
};

const CATEGORY_LABELS: Record<string, string> = {
  COMMON_FACILITY: '공용시설',
  PARKING: '주차/차량',
  NOISE_COMPLAINT: '층간소음',
  ETC: '기타',
  // legacy keys (backwards compat)
  '누수': '누수',
  '전기': '전기',
  '보일러': '보일러',
  '기타': '기타',
};

const getCategoryStyle = (category: string | null) =>
  category && CATEGORY_COLORS[category]
    ? CATEGORY_COLORS[category]
    : { bg: '#F5F5F5', text: '#424242' };

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
};

const TicketListScreen = ({ navigation, route }: any) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [villaId, setVillaId] = useState<number | null>(route.params?.villaId ?? null);
  const [userId, setUserId] = useState<string | null>(route.params?.userId ?? null);
  const [userRole, setUserRole] = useState<'ADMIN' | 'RESIDENT' | null>(
    route.params?.userRole ?? null
  );

  const resolveVillaId = useCallback(async (): Promise<{
    vid: number | null;
    uid: string | null;
    role: 'ADMIN' | 'RESIDENT';
  }> => {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      const uid: string | null = user.id ?? null;
      const role: 'ADMIN' | 'RESIDENT' = user.role === 'RESIDENT' ? 'RESIDENT' : 'ADMIN';

      // Resident: villaId stored in user.villa.id
      if (user?.villa?.id) return { vid: user.villa.id, uid, role };

      // Admin: fetch via /api/villas/:adminId
      if (uid) {
        try {
          const res = await api.get(`/api/villas/${uid}`);
          const data = res.data;
          if (Array.isArray(data) && data.length > 0) {
            return { vid: data[0].id, uid, role };
          }
        } catch {
          // fall through
        }
      }
      return { vid: null, uid, role };
    }
    return { vid: null, uid: null, role: 'ADMIN' };
  }, []);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      let vid = villaId;
      let uid = userId;
      let role = userRole;

      if (!vid || !uid || !role) {
        const resolved = await resolveVillaId();
        vid = resolved.vid;
        uid = resolved.uid;
        role = resolved.role;
        if (vid) setVillaId(vid);
        if (uid) setUserId(uid);
        if (role) setUserRole(role);
      }

      if (!vid) {
        Alert.alert('오류', '빌라 정보를 불러올 수 없습니다.');
        setLoading(false);
        return;
      }

      const res = await api.get(`/api/villas/${vid}/tickets`);
      let data: Ticket[] = Array.isArray(res.data) ? res.data : [];

      // Residents see only their own tickets
      if (role === 'RESIDENT' && uid) {
        data = data.filter((t) => t.residentId === uid);
      }

      setTickets(data);
    } catch (e) {
      Alert.alert('오류', '요청 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [villaId, userId, userRole, resolveVillaId]);

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [fetchTickets])
  );

  const handleStatusChange = (ticket: Ticket) => {
    const options = ['처리 중으로 변경', '처리 완료로 변경', '취소'];
    const statusValues: Array<'IN_PROGRESS' | 'RESOLVED'> = ['IN_PROGRESS', 'RESOLVED'];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 2,
          destructiveButtonIndex: undefined,
          title: ticket.title,
        },
        async (buttonIndex) => {
          if (buttonIndex === 2) return;
          await applyStatusChange(ticket.id, statusValues[buttonIndex]);
        }
      );
    } else {
      Alert.alert(ticket.title, '상태를 변경하세요.', [
        {
          text: '처리 중으로 변경',
          onPress: () => applyStatusChange(ticket.id, 'IN_PROGRESS'),
        },
        {
          text: '처리 완료로 변경',
          onPress: () => applyStatusChange(ticket.id, 'RESOLVED'),
        },
        { text: '취소', style: 'cancel' },
      ]);
    }
  };

  const applyStatusChange = async (
    ticketId: string,
    status: 'IN_PROGRESS' | 'RESOLVED'
  ) => {
    try {
      await api.patch(`/api/villas/${villaId}/tickets/${ticketId}/status`, { status });
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
      );
    } catch (e) {
      Alert.alert('오류', '상태 변경에 실패했습니다.');
    }
  };

  const handleAdd = async () => {
    let vid = villaId;
    if (!vid) {
      const resolved = await resolveVillaId();
      vid = resolved.vid;
      if (vid) setVillaId(vid);
    }
    if (!vid) {
      Alert.alert('오류', '빌라 정보를 불러올 수 없습니다.');
      return;
    }
    navigation.navigate('CreateTicket', { villaId: vid });
  };

  const renderTicket = ({ item }: { item: Ticket }) => {
    const statusCfg = STATUS_CONFIG[item.status];
    const catStyle = getCategoryStyle(item.category);
    const isAdmin = userRole === 'ADMIN';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={isAdmin ? () => handleStatusChange(item) : undefined}
        activeOpacity={isAdmin ? 0.75 : 1}
      >
        <View style={styles.cardHeader}>
          <View style={styles.badgeRow}>
            {item.category ? (
              <View style={[styles.badge, { backgroundColor: catStyle.bg }]}>
                <Text style={[styles.badgeText, { color: catStyle.text }]}>
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </Text>
              </View>
            ) : null}
            <View style={[styles.badge, { backgroundColor: statusCfg.bg }]}>
              <Text style={[styles.badgeText, { color: statusCfg.text }]}>
                {statusCfg.label}
              </Text>
            </View>
          </View>
          <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>

        {item.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {isAdmin && (
          <View style={styles.adminHint}>
            <Ionicons name="create-outline" size={13} color="#8E8E93" />
            <Text style={styles.adminHintText}>탭하여 상태 변경</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>민원 및 수리 요청</Text>
        <Text style={styles.subtitle}>
          {userRole === 'ADMIN'
            ? '접수된 민원 및 수리 요청을 확인하고 처리하세요'
            : '민원 및 수리 요청 내역을 확인하세요'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          renderItem={renderTicket}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="construct-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyText}>
                {userRole === 'ADMIN' ? '접수된 민원이 없습니다' : '접수한 민원이 없습니다'}
              </Text>
              <Text style={styles.emptySubText}>
                {userRole === 'RESIDENT'
                  ? '아래 + 버튼을 눌러 민원을 접수하세요.'
                  : '입주민이 접수한 민원 및 수리 요청이 표시됩니다.'}
              </Text>
            </View>
          }
        />
      )}

      {/* FAB — shown for all roles (residents request, admins can also add manually) */}
      <TouchableOpacity style={styles.fab} onPress={handleAdd} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#1C1C1E', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#8E8E93' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#8E8E93' },
  listContent: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  cardDate: { fontSize: 13, color: '#8E8E93' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#3A3A3C', lineHeight: 20, marginBottom: 4 },
  adminHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  adminHintText: { fontSize: 12, color: '#8E8E93' },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#3A3A3C' },
  emptySubText: { fontSize: 13, color: '#8E8E93', textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default TicketListScreen;
