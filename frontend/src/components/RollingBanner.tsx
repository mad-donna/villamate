import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = 20; // matches scrollContent padding
const BANNER_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  accentColor: string;
}

const BANNERS: BannerItem[] = [
  {
    id: '1',
    title: '빌라메이트 앱 가이드',
    subtitle: '처음이신가요? 주요 기능 사용법을 확인해보세요.',
    backgroundColor: '#5856D6',
    accentColor: '#9D9BF0',
  },
  {
    id: '2',
    title: '전자투표로 의사결정',
    subtitle: '1세대 1표 원칙으로 투명하게 투표에 참여하세요.',
    backgroundColor: '#0A84FF',
    accentColor: '#7EC8FF',
  },
  {
    id: '3',
    title: '커뮤니티 게시판',
    subtitle: '이웃과 소통하고 민원을 손쉽게 접수하세요.',
    backgroundColor: '#30B0C7',
    accentColor: '#8EE0EE',
  },
  {
    id: '4',
    title: '주차 현황 실시간 조회',
    subtitle: '방문 차량 등록부터 주차 조회까지 간편하게.',
    backgroundColor: '#FF6B6B',
    accentColor: '#FFB3B3',
  },
  {
    id: '5',
    title: '청구서 & 납부 관리',
    subtitle: '관리비 청구서를 확인하고 앱에서 바로 납부하세요.',
    backgroundColor: '#34C759',
    accentColor: '#9EEDB8',
  },
];

interface Props {
  navigation: any;
}

const RollingBanner: React.FC<Props> = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<BannerItem>>(null);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % BANNERS.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      currentIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const idx = viewableItems[0].index;
        currentIndexRef.current = idx;
        setActiveIndex(idx);
      }
    },
    []
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderItem = ({ item }: { item: BannerItem }) => (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => navigation.navigate('Guide')}
      style={[styles.bannerCard, { backgroundColor: item.backgroundColor, width: BANNER_WIDTH }]}
    >
      <View style={styles.bannerContent}>
        <View style={[styles.accentDot, { backgroundColor: item.accentColor }]} />
        <Text style={styles.bannerTitle}>{item.title}</Text>
        <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        <View style={styles.bannerCta}>
          <Text style={[styles.bannerCtaText, { color: item.accentColor }]}>자세히 보기  →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={BANNERS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_WIDTH + 12}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: BANNER_WIDTH + 12,
          offset: (BANNER_WIDTH + 12) * index,
          index,
        })}
      />
      {/* Dot indicators */}
      <View style={styles.dotsContainer}>
        {BANNERS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  flatListContent: {
    gap: 12,
  },
  bannerCard: {
    borderRadius: 20,
    height: 130,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  bannerContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  accentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 10,
    opacity: 0.8,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '400',
    lineHeight: 18,
    marginBottom: 10,
  },
  bannerCta: {
    alignSelf: 'flex-start',
  },
  bannerCtaText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#5856D6',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#C7C7CC',
  },
});

export default RollingBanner;
