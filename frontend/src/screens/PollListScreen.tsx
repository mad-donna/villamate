import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config';

interface PollOption {
  id: string;
  text: string;
  _count: { votes: number };
  votes: { roomNumber: string; voterId: string }[];
}

interface Poll {
  id: string;
  title: string;
  description: string | null;
  endDate: string;
  isAnonymous: boolean;
  options: PollOption[];
  _count: { votes: number };
  createdAt: string;
}

const PollListScreen = ({ navigation, route }: any) => {
  const { villaId, userId } = route.params ?? {};
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolls = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/villas/${villaId}/polls`);
      if (res.ok) setPolls(await res.json());
    } catch (e) {
      console.error('Fetch polls error:', e);
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  useFocusEffect(useCallback(() => { fetchPolls(); }, [fetchPolls]));

  const getDaysLeft = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>전자투표</Text>
          <Text style={styles.headerSub}>입주민 전자투표 현황을 확인하세요</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
        ) : polls.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="checkbox-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>등록된 투표가 없습니다</Text>
          </View>
        ) : (
          polls.map(poll => {
            const daysLeft = getDaysLeft(poll.endDate);
            const isActive = daysLeft > 0;
            return (
              <TouchableOpacity
                key={poll.id}
                style={styles.card}
                onPress={() => navigation.navigate('PollDetail', { pollId: poll.id, villaId, userId })}
                activeOpacity={0.75}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{poll.title}</Text>
                  <View style={[styles.badge, { backgroundColor: poll.isAnonymous ? '#8E8E9320' : '#007AFF20' }]}>
                    <Text style={[styles.badgeText, { color: poll.isAnonymous ? '#8E8E93' : '#007AFF' }]}>
                      {poll.isAnonymous ? '익명' : '기명'}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <View style={[styles.statusBadge, { backgroundColor: isActive ? '#34C75920' : '#8E8E9320' }]}>
                    <Text style={[styles.statusText, { color: isActive ? '#34C759' : '#8E8E93' }]}>
                      {isActive ? `D-${daysLeft}일 남음` : '종료됨'}
                    </Text>
                  </View>
                  <Text style={styles.voteCount}>총 {poll._count.votes}표</Text>
                  <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreatePoll', { villaId, userId })}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F3F7' },
  content: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 24 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1C1C1E', marginBottom: 4 },
  headerSub: { fontSize: 14, color: '#8E8E93' },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 12, fontSize: 15, color: '#8E8E93' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  voteCount: { flex: 1, fontSize: 13, color: '#8E8E93', textAlign: 'right', marginRight: 4 },
  fab: { position: 'absolute', bottom: 30, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
});

export default PollListScreen;
