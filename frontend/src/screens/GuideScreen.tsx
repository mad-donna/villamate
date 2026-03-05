import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GuideItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  accentColor: string;
  backgroundColor: string;
}

const GUIDE_ITEMS: GuideItem[] = [
  {
    id: '1',
    icon: '🚗',
    title: '방문 차량 등록 방법',
    description:
      '하단 탭의 프로필 화면으로 이동한 뒤 "내 차량 관리"를 선택하세요. 차량번호와 차종을 입력하고, 방문 차량 여부를 체크한 다음 "등록하기"를 누르면 완료됩니다. 등록된 차량은 주차 조회 화면에서 바로 확인할 수 있습니다.',
    accentColor: '#FF9500',
    backgroundColor: '#FFF8F0',
  },
  {
    id: '2',
    icon: '🗳️',
    title: '전자투표 참여 방법',
    description:
      '홈 화면의 "참여 가능한 투표" 위젯을 탭하거나, 바로가기 버튼에서 "전자투표"를 선택하세요. 진행 중인 투표 목록에서 원하는 투표를 선택하면 항목을 고른 뒤 투표할 수 있습니다. 1세대 1표 원칙이 적용되어 중복 투표는 불가합니다. 투표 결과는 투표 상세 화면에서 실시간으로 확인됩니다.',
    accentColor: '#FF2D55',
    backgroundColor: '#FFF0F3',
  },
  {
    id: '3',
    icon: '💬',
    title: '커뮤니티 이용 방법',
    description:
      '하단 탭의 "커뮤니티" 메뉴로 이동하면 빌라 전체 게시판을 볼 수 있습니다. 오른쪽 하단 + 버튼으로 새 게시글을 작성하세요. 일반 게시글 외에도 민원·하자 접수 유형을 선택하면 관리자가 처리 상태를 업데이트합니다. 공지사항은 목록 상단에 고정되어 표시됩니다.',
    accentColor: '#5856D6',
    backgroundColor: '#F5F4FF',
  },
  {
    id: '4',
    icon: '💳',
    title: '청구서 확인 및 납부 방법',
    description:
      '홈 화면의 "미납 관리비" 위젯을 탭하거나 아래로 스크롤하면 납부 내역 섹션이 나타납니다. 각 청구서 카드에서 청구 금액과 항목 내역을 확인할 수 있습니다. 미납 상태인 청구서에는 "빌라메이트로 결제하기" 버튼이 표시되며, 이를 탭하면 앱 내 결제 화면으로 이동합니다.',
    accentColor: '#34C759',
    backgroundColor: '#F0FFF4',
  },
  {
    id: '5',
    icon: '🅿️',
    title: '주차 관리 이용 방법',
    description:
      '홈 화면 바로가기에서 "주차 조회" 버튼을 탭하세요. 빌라 전체 등록 차량 목록이 표시되며, 상단 검색창에 차량번호 일부를 입력하면 해당 차량을 빠르게 찾을 수 있습니다. 방문 차량은 오렌지색으로 표시되며, 출차 예정 정보도 함께 확인할 수 있습니다.',
    accentColor: '#30B0C7',
    backgroundColor: '#F0FAFF',
  },
  {
    id: '6',
    icon: '📢',
    title: '공지사항 확인 방법',
    description:
      '홈 화면의 "최근 공지" 위젯에서 가장 최근 공지사항 제목을 바로 확인할 수 있습니다. 위젯을 탭하면 해당 공지 상세 내용으로 이동합니다. 모든 공지를 보려면 커뮤니티 게시판으로 이동하세요. 공지사항은 목록 최상단에 고정 표시되며, 관리자는 최대 3개까지 공지를 고정할 수 있습니다.',
    accentColor: '#007AFF',
    backgroundColor: '#F0F6FF',
  },
  {
    id: '7',
    icon: '🏢',
    title: '건물 이력 및 계약 관리 (관리자)',
    description:
      '관리 탭의 "건물 이력 및 계약 관리" 메뉴에서 공사, 수리, 계약 등의 이력을 등록하고 조회할 수 있습니다. 카테고리별 색상으로 구분되며, 날짜와 담당 업체 정보, 사진 첨부도 가능합니다. 등록된 이력은 시간순으로 정리되어 건물 관리 히스토리를 체계적으로 보관합니다.',
    accentColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
];

const GuideScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>이용 가이드</Text>
          <Text style={styles.headerSubtitle}>
            빌라메이트의 주요 기능 사용법을 안내해드립니다.
          </Text>
        </View>

        {/* Guide cards */}
        {GUIDE_ITEMS.map((item) => (
          <View
            key={item.id}
            style={[styles.guideCard, { backgroundColor: item.backgroundColor }]}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: item.accentColor + '20' }]}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <View style={styles.cardTitleSection}>
                <View style={[styles.accentBar, { backgroundColor: item.accentColor }]} />
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>
            </View>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
        ))}

        {/* Footer note */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            추가 문의사항은 커뮤니티 게시판을 이용해주세요.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F3F7',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Header
  headerSection: {
    marginBottom: 24,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
    lineHeight: 22,
  },

  // Guide cards
  guideCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 26,
  },
  cardTitleSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accentBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    flex: 1,
    lineHeight: 22,
  },
  cardDescription: {
    fontSize: 14,
    color: '#3A3A3C',
    lineHeight: 22,
    fontWeight: '400',
  },

  // Footer
  footer: {
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default GuideScreen;
