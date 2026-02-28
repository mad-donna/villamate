import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
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
}

const PollDetailScreen = ({ navigation, route }: any) => {
  const { pollId, villaId, userId } = route.params ?? {};
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);

  const fetchPoll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/villas/${villaId}/polls`);
      if (res.ok) {
        const polls: Poll[] = await res.json();
        const found = polls.find(p => p.id === pollId);
        if (found) setPoll(found);
      }
    } catch (e) {
      console.error('Fetch poll detail error:', e);
    } finally {
      setLoading(false);
    }
  }, [pollId, villaId]);

  useFocusEffect(useCallback(() => { fetchPoll(); }, [fetchPoll]));

  const isActive = poll ? new Date(poll.endDate) > new Date() : false;
  const hasVoted = poll ? poll.options.some(o => o.votes.some(v => v.voterId === userId)) : false;
  const myOptionId = poll?.options.find(o => o.votes.some(v => v.voterId === userId))?.id ?? null;
  const totalVotes = poll ? poll.options.reduce((s, o) => s + o._count.votes, 0) : 0;

  const handleVote = async () => {
    if (!selectedOptionId) return Alert.alert('알림', '옵션을 선택해주세요.');
    setVoting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/villas/${villaId}/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId: userId, optionId: selectedOptionId }),
      });
      if (res.status === 409) {
        Alert.alert('알림', '이미 투표한 세대입니다. (1세대 1표)');
      } else if (!res.ok) {
        const err = await res.json();
        Alert.alert('오류', err.error || '투표에 실패했습니다.');
      } else {
        await fetchPoll();
      }
    } catch {
      Alert.alert('오류', '투표에 실패했습니다.');
    } finally {
      setVoting(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  if (loading || !poll) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  const showResults = hasVoted || !isActive;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header card */}
        <View style={styles.headerCard}>
          <View style={styles.headerBadgeRow}>
            <View style={[styles.badge, { backgroundColor: isActive ? '#34C75920' : '#8E8E9320' }]}>
              <Text style={[styles.badgeText, { color: isActive ? '#34C759' : '#8E8E93' }]}>
                {isActive ? `${Math.ceil((new Date(poll.endDate).getTime() - Date.now()) / 86400000)}일 남음` : '종료됨'}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: poll.isAnonymous ? '#8E8E9320' : '#007AFF20' }]}>
              <Text style={[styles.badgeText, { color: poll.isAnonymous ? '#8E8E93' : '#007AFF' }]}>
                {poll.isAnonymous ? '익명 투표' : '기명 투표'}
              </Text>
            </View>
          </View>
          <Text style={styles.pollTitle}>{poll.title}</Text>
          {poll.description ? <Text style={styles.pollDesc}>{poll.description}</Text> : null}
          <Text style={styles.pollEndDate}>종료일: {formatDate(poll.endDate)}</Text>
        </View>

        {/* Options */}
        <Text style={styles.sectionLabel}>{showResults ? '투표 결과' : '옵션 선택'}</Text>

        {showResults ? (
          // Results view
          poll.options.map(opt => {
            const count = opt._count.votes;
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isMyVote = opt.id === myOptionId;
            return (
              <View key={opt.id} style={[styles.resultCard, isMyVote && styles.resultCardHighlight]}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultOptionText}>{opt.text}</Text>
                  {isMyVote && <Ionicons name="checkmark-circle" size={18} color="#007AFF" />}
                  <Text style={styles.resultPct}>{pct}%</Text>
                  <Text style={styles.resultCount}>{count}표</Text>
                </View>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { flex: pct, backgroundColor: isMyVote ? '#007AFF' : '#34C759' }]} />
                  <View style={{ flex: 100 - pct }} />
                </View>
                {!poll.isAnonymous && opt.votes.length > 0 && (
                  <View style={styles.roomList}>
                    {opt.votes.map((v, i) => (
                      <View key={i} style={styles.roomChip}>
                        <Text style={styles.roomChipText}>{v.roomNumber}호</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        ) : (
          // Voting view
          <>
            {poll.options.map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.optionCard, selectedOptionId === opt.id && styles.optionCardSelected]}
                onPress={() => setSelectedOptionId(opt.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.radio, selectedOptionId === opt.id && styles.radioSelected]}>
                  {selectedOptionId === opt.id && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.optionText, selectedOptionId === opt.id && { color: '#007AFF', fontWeight: '700' }]}>
                  {opt.text}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.voteBtn, (!selectedOptionId || voting) && { opacity: 0.5 }]}
              onPress={handleVote}
              disabled={!selectedOptionId || voting}
            >
              {voting ? <ActivityIndicator color="#fff" /> : <Text style={styles.voteBtnText}>투표하기</Text>}
            </TouchableOpacity>
            <Text style={styles.hintText}>* 1세대 1표 원칙이 적용됩니다</Text>
          </>
        )}

        {showResults && (
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>총 {totalVotes}표 참여</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F3F7' },
  content: { padding: 20, paddingBottom: 48 },
  headerCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
  headerBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  pollTitle: { fontSize: 22, fontWeight: '800', color: '#1C1C1E', marginBottom: 8 },
  pollDesc: { fontSize: 15, color: '#3C3C43', lineHeight: 22, marginBottom: 8 },
  pollEndDate: { fontSize: 13, color: '#8E8E93' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5, marginVertical: 16 },
  // Voting options
  optionCard: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, borderWidth: 2, borderColor: 'transparent' },
  optionCardSelected: { borderColor: '#007AFF' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#C7C7CC', justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: '#007AFF' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#007AFF' },
  optionText: { fontSize: 16, color: '#1C1C1E', flex: 1 },
  voteBtn: { backgroundColor: '#007AFF', borderRadius: 16, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  voteBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  hintText: { fontSize: 12, color: '#8E8E93', textAlign: 'center', marginTop: 12 },
  // Results
  resultCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  resultCardHighlight: { borderWidth: 2, borderColor: '#007AFF20' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  resultOptionText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  resultPct: { fontSize: 15, fontWeight: '800', color: '#1C1C1E' },
  resultCount: { fontSize: 13, color: '#8E8E93', minWidth: 30, textAlign: 'right' },
  barBg: { flexDirection: 'row', height: 8, borderRadius: 4, backgroundColor: '#F2F2F7', overflow: 'hidden', marginBottom: 8 },
  barFill: { borderRadius: 4 },
  roomList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  roomChip: { backgroundColor: '#F2F2F7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  roomChipText: { fontSize: 12, color: '#3C3C43', fontWeight: '600' },
  totalRow: { alignItems: 'center', marginTop: 16 },
  totalText: { fontSize: 14, color: '#8E8E93', fontWeight: '500' },
});

export default PollDetailScreen;
