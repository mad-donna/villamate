import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = 'http://192.168.219.124:3000';

interface PostDetail {
  id: string;
  title: string;
  content: string;
  isNotice: boolean;
  authorId: string;
  villaId: number;
  createdAt: string;
  author: {
    name: string;
    roomNumber: string | null;
  };
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: string;
  author: {
    name: string;
    roomNumber: string | null;
  };
}

const PostDetailScreen = ({ navigation, route }: any) => {
  const { postId, userId, userRole } = route.params as {
    postId: string;
    userId: string;
    userRole: string;
  };

  const insets = useSafeAreaInsets();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Server returned ${response.status}`);
      }
      const data = await response.json();
      setPost(data);
    } catch (err: any) {
      console.error('Fetch post detail error:', err);
      setError(err.message || '게시글을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Fetch comments error:', err);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [postId]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}년 ${parseInt(String(m))}월 ${parseInt(String(d))}일`;
    } catch {
      return dateString;
    }
  };

  const handleDelete = async () => {
    Alert.alert('삭제 확인', '게시글을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId }),
            });
            if (res.ok) {
              Alert.alert('삭제되었습니다.', '', [
                { text: '확인', onPress: () => navigation.goBack() },
              ]);
            } else {
              Alert.alert('오류', '삭제에 실패했습니다.');
            }
          } catch (err) {
            console.error('Delete post error:', err);
            Alert.alert('오류', '서버와 통신 중 문제가 발생했습니다.');
          }
        },
      },
    ]);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim(), authorId: userId }),
      });
      if (res.ok) {
        setCommentText('');
        await fetchComments();
      } else {
        Alert.alert('오류', '댓글 등록에 실패했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const canDelete = post && userId === post.authorId;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>게시글 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || '게시글을 찾을 수 없습니다.'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Notice badge */}
          {post.isNotice && (
            <View style={styles.noticeBadge}>
              <Text style={styles.noticeBadgeText}>공지</Text>
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>{post.title}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Meta row: author + date */}
          <View style={styles.metaRow}>
            <Text style={styles.metaAuthor}>
              {post.author.name}
              {post.author.roomNumber ? ` · ${post.author.roomNumber}호` : ''}
            </Text>
            <Text style={styles.metaDate}>{formatDate(post.createdAt)}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Content */}
          <Text style={styles.content}>{post.content}</Text>

          {/* Delete button - inside scroll, below content, author-only */}
          {canDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteButtonText}>삭제하기</Text>
            </TouchableOpacity>
          )}

          {/* Comment section */}
          <View style={styles.commentSection}>
            <Text style={styles.commentHeader}>댓글 {comments.length}개</Text>
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <Text style={styles.commentMeta}>
                  {comment.author.roomNumber ? `${comment.author.roomNumber}호 ` : ''}
                  {comment.author.name}
                </Text>
                <Text style={styles.commentContent}>{comment.content}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Comment input bar - sits above keyboard */}
        <View style={[styles.commentInputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <TextInput
            style={styles.commentInput}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="댓글을 입력하세요"
            placeholderTextColor="#B0B0B0"
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={handleCommentSubmit}
          />
          <TouchableOpacity
            style={[styles.commentSubmitBtn, submitting && { opacity: 0.5 }]}
            onPress={handleCommentSubmit}
            disabled={submitting}
          >
            <Text style={styles.commentSubmitText}>등록</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 15,
    color: '#3A3A3C',
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  noticeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 14,
  },
  noticeBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1E',
    lineHeight: 30,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginVertical: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaAuthor: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  metaDate: {
    fontSize: 13,
    color: '#8E8E93',
  },
  content: {
    fontSize: 16,
    color: '#3A3A3C',
    lineHeight: 26,
  },
  deleteButton: {
    marginTop: 24,
    backgroundColor: '#FF3B30',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  commentSection: {
    paddingTop: 24,
    paddingBottom: 8,
  },
  commentHeader: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  commentCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  commentMeta: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  commentInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  commentInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F2F2F2',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    marginRight: 8,
    color: '#1C1C1E',
  },
  commentSubmitBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PostDetailScreen;
