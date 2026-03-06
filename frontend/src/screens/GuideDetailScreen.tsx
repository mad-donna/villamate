import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import RenderHtml from 'react-native-render-html';
import { API_BASE_URL } from '../config';

const CATEGORY_COLORS: Record<string, string> = {
  '하자관리': '#FF6B6B',
  '관리비': '#4ECDC4',
  '시설관리': '#45B7D1',
  '세입자관리': '#96CEB4',
  '건물운영': '#F4D03F',
  '유지보수': '#C39BD3',
  '법/제도': '#5DADE2',
};

interface Guide {
  id: string;
  category: string;
  title: string;
  content: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  } catch {
    return iso;
  }
};

const GuideDetailScreen = ({ route, navigation }: any) => {
  const { guideId } = route.params;
  const { width } = useWindowDimensions();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/guides/${guideId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data) => setGuide(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [guideId]);

  const badgeColor = guide ? (CATEGORY_COLORS[guide.category] || '#007AFF') : '#007AFF';

  const htmlSource = { html: guide?.content ?? '' };

  const tagsStyles = {
    body: {
      fontSize: 16,
      lineHeight: 26,
      color: '#3C3C43',
    },
    p: { lineHeight: 26, color: '#3C3C43', marginBottom: 12, marginTop: 0 },
    h1: { fontSize: 26, fontWeight: 'bold' as const, color: '#1C1C1E', marginTop: 20, marginBottom: 8 },
    h2: { fontSize: 22, fontWeight: 'bold' as const, color: '#1C1C1E', marginTop: 18, marginBottom: 7 },
    h3: { fontSize: 19, fontWeight: 'bold' as const, color: '#1C1C1E', marginTop: 16, marginBottom: 6 },
    h4: { fontSize: 17, fontWeight: 'bold' as const, color: '#1C1C1E', marginTop: 14, marginBottom: 5 },
    h5: { fontSize: 15, fontWeight: 'bold' as const, color: '#3C3C43', marginTop: 12, marginBottom: 4 },
    h6: { fontSize: 13, fontWeight: 'bold' as const, color: '#6C6C70', marginTop: 10, marginBottom: 4 },
    strong: { fontWeight: 'bold' as const },
    b: { fontWeight: 'bold' as const },
    em: { fontStyle: 'italic' as const },
    i: { fontStyle: 'italic' as const },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: '#D1D5DB',
      paddingLeft: 12,
      backgroundColor: '#F3F4F6',
      marginVertical: 10,
      color: '#4B5563',
    },
    hr: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },
    ul: { marginLeft: 0, paddingLeft: 20, marginBottom: 10 },
    ol: { marginLeft: 0, paddingLeft: 20, marginBottom: 10 },
    li: { lineHeight: 24, marginBottom: 4, color: '#3C3C43' },
    a: { color: '#007AFF' },
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>가이드</Text>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : error || !guide ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>가이드를 불러오지 못했습니다.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Thumbnail */}
          {guide.thumbnailUrl ? (
            <Image
              source={{ uri: guide.thumbnailUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : null}

          <View style={styles.body}>
            {/* Category badge */}
            <View style={[styles.badge, { backgroundColor: badgeColor + '22', borderColor: badgeColor + '55' }]}>
              <Text style={[styles.badgeText, { color: badgeColor }]}>{guide.category}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{guide.title}</Text>

            {/* Date */}
            <Text style={styles.date}>{formatDate(guide.createdAt)}</Text>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Rich text content */}
            <RenderHtml
              contentWidth={width}
              source={htmlSource}
              tagsStyles={tagsStyles}
              enableExperimentalMarginCollapsing
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    gap: 8,
  },
  backButton: {
    padding: 4,
  },
  headerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  heroImage: {
    width: '100%',
    height: 240,
  },
  body: {
    padding: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1E',
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  date: {
    fontSize: 13,
    color: '#AEAEB2',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginBottom: 24,
  },
});

export default GuideDetailScreen;
