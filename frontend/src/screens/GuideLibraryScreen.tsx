import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

const CATEGORIES = ['전체', '하자관리', '관리비', '시설관리', '세입자관리', '건물운영', '유지보수', '법/제도'];

const CATEGORY_COLORS: Record<string, string> = {
  '전체': '#007AFF',
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

const GuideLibraryScreen = ({ navigation }: any) => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [loading, setLoading] = useState(true);

  const loadGuides = useCallback(async () => {
    try {
      setLoading(true);
      const url =
        selectedCategory === '전체'
          ? `${API_BASE_URL}/api/guides`
          : `${API_BASE_URL}/api/guides?category=${encodeURIComponent(selectedCategory)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setGuides(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('GuideLibrary load error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useFocusEffect(
    useCallback(() => {
      loadGuides();
    }, [loadGuides])
  );

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`;
    } catch {
      return iso;
    }
  };

  const renderGuideCard = ({ item, index }: { item: Guide; index: number }) => {
    const badgeColor = CATEGORY_COLORS[item.category] || '#007AFF';
    const isFeatured = index === 0;
    const hasThumbnail = !!item.thumbnailUrl;

    return (
      <TouchableOpacity
        style={[styles.card, isFeatured && styles.featuredCard]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('GuideDetail', { guideId: item.id })}
      >
        {hasThumbnail && (
          <Image
            source={{ uri: item.thumbnailUrl! }}
            style={isFeatured ? styles.featuredImage : styles.cardImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.cardBody}>
          <View style={[styles.categoryBadge, { backgroundColor: badgeColor + '22', borderColor: badgeColor + '55' }]}>
            <Text style={[styles.categoryBadgeText, { color: badgeColor }]}>
              {item.category}
            </Text>
          </View>
          <Text style={[styles.cardTitle, isFeatured && styles.featuredTitle]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
            <View style={styles.readMoreRow}>
              <Text style={styles.readMoreText}>자세히 보기</Text>
              <Ionicons name="chevron-forward" size={12} color="#007AFF" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerTitle}>관리자 가이드</Text>
          <Text style={styles.headerSubtitle}>건물 관리 노하우를 확인하세요</Text>
        </View>
      </View>

      {/* Category tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            const activeColor = CATEGORY_COLORS[cat] || '#007AFF';
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.tab,
                  isActive && { backgroundColor: activeColor, borderColor: activeColor },
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : guides.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyTitle}>가이드가 없습니다</Text>
          <Text style={styles.emptySubtitle}>이 카테고리에 등록된 가이드가 아직 없어요</Text>
        </View>
      ) : (
        <FlatList
          data={guides}
          keyExtractor={(item) => item.id}
          renderItem={renderGuideCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F3F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
  },
  backButton: {
    padding: 4,
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 1,
  },
  tabsWrapper: {
    paddingBottom: 4,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    paddingVertical: 4,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6C6C70',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  separator: {
    height: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    width: CARD_WIDTH,
  },
  featuredCard: {
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  featuredImage: {
    width: '100%',
    height: 210,
  },
  cardBody: {
    padding: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    lineHeight: 22,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  featuredTitle: {
    fontSize: 18,
    lineHeight: 26,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 12,
    color: '#AEAEB2',
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default GuideLibraryScreen;
