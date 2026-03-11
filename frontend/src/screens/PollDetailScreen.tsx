import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

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
  totalVotes: number;
  totalEligibleVoters: number;
}

const PollDetailScreen = ({ navigation, route }: any) => {
  const { pollId, villaId, userId, userRole } = route.params ?? {};
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [reminding, setReminding] = useState(false);
  const [residentType, setResidentType] = useState<string>('HEAD');

  const fetchPoll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/villas/${villaId}/polls`, { params: { userId } });
      const polls: Poll[] = res.data;
      const found = polls.find(p => p.id === pollId);
      if (found) {
        setPoll(found);
        // Pre-select the option the user previously voted for when the poll is still active
        const prevOptionId = found.options.find(o =>
          o.votes.some(v => v.voterId === userId || (userRole === 'ADMIN' && v.roomNumber === 'admin'))
        )?.id ?? null;
        if (prevOptionId && new Date(found.endDate) > new Date()) {
          setSelectedOptionId(prevOptionId);
        }
      }
    } catch (e) {
      console.error('Fetch poll detail error:', e);
    } finally {
      setLoading(false);
    }
  }, [pollId, villaId, userId, userRole]);

  useFocusEffect(useCallback(() => { fetchPoll(); }, [fetchPoll]));

  useEffect(() => {
    AsyncStorage.getItem('user').then(json => {
      if (json) {
        const u = JSON.parse(json);
        setResidentType(u.residentType || 'HEAD');
      }
    });
  }, []);

  const isActive = poll ? new Date(poll.endDate) > new Date() : false;
  // hasVoted: match by voterId (works for residents) OR by the 'admin' sentinel roomNumber (for admins)
  const hasVoted = poll
    ? poll.options.some(o =>
        o.votes.some(v => v.voterId === userId || (userRole === 'ADMIN' && v.roomNumber === 'admin'))
      )
    : false;
  const myOptionId = poll?.options.find(o =>
    o.votes.some(v => v.voterId === userId || (userRole === 'ADMIN' && v.roomNumber === 'admin'))
  )?.id ?? null;
  const totalVotes = poll ? (poll.totalVotes ?? poll.options.reduce((s, o) => s + o._count.votes, 0)) : 0;
  const totalEligibleVoters = poll?.totalEligibleVoters ?? 0;
  const participationPct = totalEligibleVoters > 0 ? Math.round((totalVotes / totalEligibleVoters) * 100) : 0;

  const handleVote = async () => {
    if (!selectedOptionId) return Alert.alert('알림', '옵션을 선택해주세요.');
    const isModifying = hasVoted && isActive;
    setVoting(true);
    try {
      try {
        await api.post(`/api/villas/${villaId}/polls/${pollId}/vote`, { voterId: userId, optionId: selectedOptionId });
        await fetchPoll();
        if (isModifying) {
          Alert.alert('완료', '투표가 수정되었습니다.');
        }
      } catch (voteErr: any) {
        const status = voteErr.response?.status;
        if (status === 403) {
          Alert.alert('투표 불가', '해당 빌라의 구성원이 아닙니다. 빌라 등록 상태를 확인해 주세요.');
        } else {
          Alert.alert('오류', voteErr.response?.data?.error || '투표에 실패했습니다.');
        }
      }
    } catch {
      Alert.alert('오류', '투표에 실패했습니다.');
    } finally {
      setVoting(false);
    }
  };

  const handleRemind = async () => {
    setReminding(true);
    try {
      const remindRes = await api.post(`/api/polls/${pollId}/remind`, { adminId: userId });
      const data = remindRes.data;
      Alert.alert('발송 완료', `미참여자 ${data.nonVoterCount}명에게 알림을 발송했습니다!`);
    } catch {
      Alert.alert('오류', '알림 발송에 실패했습니다.');
    } finally {
      setReminding(false);
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
            {hasVoted && (
              <View style={styles.votedBadge}>
                <Text style={styles.votedBadgeText}>투표 완료</Text>
              </View>
            )}
          </View>
          <Text style={styles.pollTitle}>{poll.title}</Text>
          {poll.description ? <Text style={styles.pollDesc}>{poll.description}</Text> : null}
          <Text style={styles.pollEndDate}>종료일: {formatDate(poll.endDate)}</Text>
        </View>

        {/* Participation progress bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>현재 투표율</Text>
            <Text style={styles.progressPct}>{participationPct}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${participationPct}%` as any }]} />
          </View>
          <Text style={styles.progressSubLabel}>
            {totalVotes}/{totalEligibleVoters > 0 ? totalEligibleVoters : '?'}명 참여
          </Text>
        </View>

        {/* Admin reminder button */}
        {userRole === 'ADMIN' && isActive && (
          <TouchableOpacity
            style={[styles.remindBtn, reminding && { opacity: 0.6 }]}
            onPress={handleRemind}
            disabled={reminding}
            activeOpacity={0.75}
          >
            {reminding
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.remindBtnText}>🔔 미참여자에게 알림 보내기</Text>
            }
          </TouchableOpacity>
        )}

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
            {userRole !== 'ADMIN' && residentType === 'MEMBER' ? (
              <>
                <View style={[styles.voteBtn, { opacity: 0.4, backgroundColor: '#8E8E93' }]}>
                  <Text style={styles.voteBtnText}>투표하기</Text>
                </View>
                <View style={styles.memberNoticeBox}>
                  <Text style={styles.memberNoticeText}>투표권은 세대주에게만 있습니다.</Text>
                </View>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.voteBtn, (!selectedOptionId || voting) && { opacity: 0.5 }]}
                  onPress={handleVote}
                  disabled={!selectedOptionId || voting}
                >
                  {voting
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.voteBtnText}>{hasVoted ? '투표 수정하기' : '투표하기'}</Text>
                  }
                </TouchableOpacity>
                <Text style={styles.hintText}>* 1세대 1표 원칙이 적용됩니다</Text>
              </>
            )}
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
  headerBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  votedBadge: { backgroundColor: '#34C759', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  votedBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
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
  // Participation progress bar
  progressCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 13, fontWeight: '700', color: '#8E8E93' },
  progressPct: { fontSize: 18, fontWeight: '800', color: '#007AFF' },
  progressBarBg: { height: 10, borderRadius: 5, backgroundColor: '#F2F2F7', overflow: 'hidden', marginBottom: 6 },
  progressBarFill: { height: 10, borderRadius: 5, backgroundColor: '#007AFF' },
  progressSubLabel: { fontSize: 12, color: '#8E8E93', textAlign: 'right' },
  remindBtn: {
    backgroundColor: '#FF9500',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  remindBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  memberNoticeBox: { backgroundColor: '#FFF3CD', borderRadius: 12, padding: 14, marginTop: 12, alignItems: 'center' },
  memberNoticeText: { fontSize: 14, color: '#856404', fontWeight: '600' },
});

export default PollDetailScreen;
