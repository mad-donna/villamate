import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config';

const AdminSubscriptionScreen = ({ route, navigation }: any) => {
  const { villaId } = route.params as { villaId: number };
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFreeTrial = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/villas/${villaId}/subscribe`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('failed');
      setShowSuccess(true);
    } catch (e) {
      Alert.alert('오류', '구독 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessDismiss = () => {
    setShowSuccess(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <Ionicons name="business" size={28} color="#5856D6" />
        </View>
        <Text style={styles.headerTitle}>빌라메이트 Pro</Text>
        <Text style={styles.headerSubtitle}>스마트한 빌라 관리의 시작</Text>
      </View>

      {/* Pricing Card */}
      <View style={styles.pricingCard}>
        <View style={styles.pricingBadge}>
          <Text style={styles.pricingBadgeText}>현재 플랜</Text>
        </View>
        <Text style={styles.planName}>프로 플랜</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>14,900</Text>
          <Text style={styles.priceSuffix}>원 / 월</Text>
        </View>
        <Text style={styles.pricingNote}>VAT 포함 · 매월 자동 갱신</Text>

        <View style={styles.featureList}>
          {[
            '관리비 청구 및 납부 관리',
            '입주민 커뮤니티',
            '건물 이력 및 계약 관리',
            '주차 및 차량 관리',
            '전자투표',
            '공용 장부',
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color="#34C759" />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Free Trial CTA */}
      <View style={styles.ctaSection}>
        <View style={styles.couponCard}>
          <Ionicons name="gift-outline" size={22} color="#5856D6" />
          <View style={styles.couponTextGroup}>
            <Text style={styles.couponTitle}>🎁 1개월 무료 체험 쿠폰</Text>
            <Text style={styles.couponDesc}>첫 달 무료 · 결제 정보 없이 시작</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.trialButton, loading && styles.trialButtonDisabled]}
          onPress={handleFreeTrial}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="gift" size={20} color="#fff" style={styles.trialIcon} />
              <Text style={styles.trialButtonText}>1개월 무료 체험 시작 (0원 결제)</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.trialNote}>
          체험 종료 후 월 14,900원이 청구됩니다.{'\n'}언제든지 해지 가능합니다.
        </Text>
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="checkmark-circle" size={56} color="#34C759" />
            </View>
            <Text style={styles.modalTitle}>결제가 완료되었습니다!</Text>
            <Text style={styles.modalBody}>
              1개월 무료 체험이 시작됩니다.{'\n'}빌라메이트 Pro의 모든 기능을 이용해보세요.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSuccessDismiss}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>시작하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F3F7' },

  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#EEEEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
  },

  pricingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    marginBottom: 16,
  },
  pricingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEEEFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  pricingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5856D6',
  },
  planName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  price: {
    fontSize: 36,
    fontWeight: '900',
    color: '#5856D6',
  },
  priceSuffix: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 6,
    marginLeft: 4,
  },
  pricingNote: {
    fontSize: 12,
    color: '#AEAEB2',
    marginBottom: 20,
  },
  featureList: { gap: 10 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 15,
    color: '#3A3A3C',
  },

  ctaSection: {
    paddingHorizontal: 16,
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEEFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    gap: 12,
  },
  couponTextGroup: { flex: 1 },
  couponTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  couponDesc: {
    fontSize: 13,
    color: '#5856D6',
  },

  trialButton: {
    backgroundColor: '#5856D6',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5856D6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 14,
  },
  trialButtonDisabled: { opacity: 0.7 },
  trialIcon: { marginRight: 8 },
  trialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  trialNote: {
    fontSize: 12,
    color: '#AEAEB2',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  modalIconWrap: { marginBottom: 16 },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 15,
    color: '#6E6E73',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#5856D6',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
});

export default AdminSubscriptionScreen;
