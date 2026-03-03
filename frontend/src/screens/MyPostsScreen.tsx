import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config';

interface Post {
  id: string;
  title: string;
  content: string;
  isNotice: boolean;
  category: string;
  status: string | null;
  authorId: string;
  villaId: number;
  createdAt: string;
  author: { name: string };
}

const MyPostsScreen = ({ navigation, route }: any) => {
  const { userId, userRole } = route.params as { userId: string; userRole: string };
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}/posts`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch my posts error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}.${m}.${d}`;
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (status === 'PENDING') return { label: '접수 대기', color: '#FF3B30' };
    if (status === 'IN_PROGRESS') return { label: '처리 중', color: '#FF9500' };
    if (status === 'RESOLVED') return { label: '처리 완료', color: '#34C759' };
    return null;
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate('PostDetail', { postId: item.id, userId, userRole })
      }
    >
      <View style={[styles.postCard, item.isNotice && styles.postCardNotice]}>
        <View style={styles.postTitleRow}>
          {item.isNotice && (
            <View style={styles.noticeBadge}>
              <Text style={styles.noticeBadgeText}>공지</Text>
            </View>
          )}
          {item.category === 'ISSUE' && (
            <View style={[styles.noticeBadge, { backgroundColor: '#5856D6' }]}>
              <Text style={styles.noticeBadgeText}>민원</Text>
            </View>
          )}
          {item.category === 'ISSUE' && item.status && (() => {
            const badge = getStatusBadge(item.status);
            return badge ? (
              <View style={[styles.noticeBadge, { backgroundColor: badge.color }]}>
                <Text style={styles.noticeBadgeText}>{badge.label}</Text>
              </View>
            ) : null;
          })()}
          <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
        </View>

        <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>

        <View style={styles.postMeta}>
          <Text style={styles.postMetaText}>{item.author.name}</Text>
          <Text style={styles.postMetaDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>작성한 글이 없습니다.</Text>
              <Text style={styles.emptySubText}>커뮤니티에서 첫 글을 남겨보세요!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#8E8E93', marginTop: 8 },
  listContent: { padding: 16, paddingBottom: 40 },
  postCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  postCardNotice: { backgroundColor: '#EBF5FF', borderWidth: 1, borderColor: '#B3D7FF' },
  postTitleRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap', marginBottom: 8,
  },
  noticeBadge: {
    backgroundColor: '#007AFF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start',
  },
  noticeBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  postTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1C1C1E', lineHeight: 22 },
  postContent: { fontSize: 14, color: '#3A3A3C', lineHeight: 20, marginBottom: 12 },
  postMeta: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 10,
  },
  postMetaText: { fontSize: 12, color: '#8E8E93', fontWeight: '500' },
  postMetaDate: { fontSize: 12, color: '#8E8E93' },
  emptyCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#3A3A3C', marginBottom: 6 },
  emptySubText: { fontSize: 13, color: '#8E8E93' },
});

export default MyPostsScreen;
