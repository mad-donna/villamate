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

const API_BASE_URL = 'http://192.168.219.124:3000';

interface PostAuthor {
  name: string;
  roomNumber: string | null;
}

interface Post {
  id: string;
  title: string;
  content: string;
  isNotice: boolean;
  authorId: string;
  villaId: number;
  createdAt: string;
  author: PostAuthor;
}

const BoardScreen = ({ navigation, route }: any) => {
  const { villaId, userId, userRole } = route.params ?? {};
  const isAdmin = userRole === 'ADMIN';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/villas/${villaId}/posts`);
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch posts error:', err);
      Alert.alert('오류', '게시글을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  const handleToggleNotice = async (item: Post) => {
    const newIsNotice = !item.isNotice;
    setTogglingId(item.id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${item.id}/notice`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isNotice: newIsNotice, villaId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('오류', errorData.message || '처리 중 문제가 발생했습니다.');
        return;
      }

      // Refresh list on success
      await fetchPosts();
    } catch (err) {
      console.error('Toggle notice error:', err);
      Alert.alert('오류', '서버와 통신 중 문제가 발생했습니다.');
    } finally {
      setTogglingId(null);
    }
  };

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

  const renderPost = ({ item }: { item: Post }) => {
    const isToggling = togglingId === item.id;
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.getParent()?.navigate('PostDetail', {
            postId: item.id,
            userId,
            userRole,
          })
        }
        activeOpacity={0.85}
      >
      <View style={[styles.postCard, item.isNotice && styles.postCardNotice]}>
        <View style={styles.postCardHeader}>
          <View style={styles.postTitleRow}>
            {item.isNotice && (
              <View style={styles.noticeBadge}>
                <Text style={styles.noticeBadgeText}>공지</Text>
              </View>
            )}
            <Text style={styles.postTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
          {isAdmin && (
            <TouchableOpacity
              style={[
                styles.noticeToggleButton,
                item.isNotice ? styles.noticeToggleButtonActive : styles.noticeToggleButtonInactive,
              ]}
              onPress={() => handleToggleNotice(item)}
              disabled={isToggling}
              activeOpacity={0.75}
            >
              {isToggling ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.noticeToggleButtonText}>
                  {item.isNotice ? '공지 해제' : '공지 등록'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.postContent} numberOfLines={3}>
          {item.content}
        </Text>

        <View style={styles.postMeta}>
          <Text style={styles.postMetaText}>
            {item.author.name}
            {item.author.roomNumber ? ` · ${item.author.roomNumber}호` : ''}
          </Text>
          <Text style={styles.postMetaDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.inner}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>게시글 불러오는 중...</Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={renderPost}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>아직 게시글이 없습니다.</Text>
                <Text style={styles.emptySubText}>첫 번째 글을 작성해보세요!</Text>
              </View>
            }
          />
        )}

        {/* FAB: write post */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.getParent()?.navigate('CreatePost', { villaId, userId, userRole })}
          activeOpacity={0.85}
        >
          <Text style={styles.fabText}>글쓰기</Text>
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
  inner: {
    flex: 1,
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
    marginTop: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 88,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  postCardNotice: {
    backgroundColor: '#EBF5FF',
    borderWidth: 1,
    borderColor: '#B3D7FF',
  },
  postCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  postTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flexWrap: 'wrap',
  },
  noticeBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  noticeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  postTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    lineHeight: 22,
  },
  noticeToggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeToggleButtonActive: {
    backgroundColor: '#8E8E93',
  },
  noticeToggleButtonInactive: {
    backgroundColor: '#007AFF',
  },
  noticeToggleButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  postContent: {
    fontSize: 14,
    color: '#3A3A3C',
    lineHeight: 20,
    marginBottom: 12,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 10,
  },
  postMetaText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  postMetaDate: {
    fontSize: 12,
    color: '#8E8E93',
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
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#007AFF',
    height: 52,
    paddingHorizontal: 22,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default BoardScreen;
