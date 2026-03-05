import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config';

interface BuildingEvent {
  id: string;
  title: string;
  description: string | null;
  category: string;
  eventDate: string;
  contractorName: string | null;
  contactNumber: string | null;
  attachmentUrl: string | null;
  isPublic: boolean;
  cost: number | null;
  createdAt: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  '하자보수': { bg: '#FFF3E0', text: '#E65100' },
  '정기점검': { bg: '#E8F5E9', text: '#2E7D32' },
  '유지계약': { bg: '#E3F2FD', text: '#1565C0' },
  '청소': { bg: '#F3E5F5', text: '#6A1B9A' },
  '기타': { bg: '#F5F5F5', text: '#424242' },
};

const getCategoryStyle = (category: string) =>
  CATEGORY_COLORS[category] ?? { bg: '#F5F5F5', text: '#424242' };

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const resolveImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const ContractDetailScreen = ({ navigation, route }: any) => {
  const event: BuildingEvent = route.params?.event;

  if (!event) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
            <Text style={styles.backText}>뒤로 가기</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>데이터를 불러올 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const catStyle = getCategoryStyle(event.category);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
          <Text style={styles.backText}>뒤로 가기</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title section */}
        <View style={styles.titleSection}>
          <View style={styles.badgeRow}>
            <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
              <Text style={[styles.categoryText, { color: catStyle.text }]}>{event.category}</Text>
            </View>
            <View style={[styles.visibilityBadge, event.isPublic ? styles.publicBadge : styles.privateBadge]}>
              <Text style={[styles.visibilityText, event.isPublic ? styles.publicText : styles.privateText]}>
                {event.isPublic ? '공개' : '비공개'}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.dateText}>{event.eventDate}</Text>
        </View>

        {/* Cost card */}
        {event.cost !== null && event.cost !== undefined && event.cost > 0 && (
          <View style={styles.costCard}>
            <Text style={styles.costLabel}>총 비용</Text>
            <Text style={styles.costValue}>{event.cost.toLocaleString()}원</Text>
          </View>
        )}

        {/* Details card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>상세 정보</Text>

          {event.description ? (
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>{event.description}</Text>
            </View>
          ) : (
            <Text style={styles.emptyField}>내용 없음</Text>
          )}
        </View>

        {/* Contractor card */}
        {(event.contractorName || event.contactNumber) && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>업체 정보</Text>
            {event.contractorName && (
              <DetailRow label="업체명" value={event.contractorName} />
            )}
            {event.contactNumber && (
              <DetailRow label="연락처" value={event.contactNumber} />
            )}
          </View>
        )}

        {/* Image */}
        {event.attachmentUrl && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>첨부 사진</Text>
            <Image
              source={{ uri: resolveImageUrl(event.attachmentUrl) ?? '' }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Meta */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>등록일: {new Date(event.createdAt).toLocaleDateString('ko-KR')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 2,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  titleSection: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryText: { fontSize: 13, fontWeight: '700' },
  visibilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  publicBadge: { backgroundColor: '#E8F5E9' },
  privateBadge: { backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E5E5EA' },
  visibilityText: { fontSize: 12, fontWeight: '700' },
  publicText: { color: '#2E7D32' },
  privateText: { color: '#AEAEB2' },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1E',
    lineHeight: 32,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },

  costCard: {
    backgroundColor: '#5856D6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  costValue: { fontSize: 24, color: '#fff', fontWeight: '800' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  descriptionBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 14,
  },
  descriptionText: {
    fontSize: 15,
    color: '#3A3A3C',
    lineHeight: 22,
  },
  emptyField: {
    fontSize: 14,
    color: '#C7C7CC',
    fontStyle: 'italic',
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  detailLabel: { fontSize: 14, color: '#8E8E93', fontWeight: '500' },
  detailValue: { fontSize: 14, color: '#1C1C1E', fontWeight: '600', maxWidth: '60%', textAlign: 'right' },

  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },

  metaRow: {
    alignItems: 'center',
    paddingTop: 8,
  },
  metaText: { fontSize: 12, color: '#C7C7CC' },

  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#8E8E93' },
});

export default ContractDetailScreen;
