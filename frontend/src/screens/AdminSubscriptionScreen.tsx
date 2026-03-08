import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

interface BillingInfo {
  isAutoBilling: boolean;
  maskedCard: string | null;
  subscriptionExpiry: string | null;
  subscriptionStatus: string;
}

const AdminSubscriptionScreen = ({ route, navigation }: any) => {
  const { villaId } = route.params as { villaId: number };
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);

  // Card modal state
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cardPassword, setCardPassword] = useState('');
  const [cardLoading, setCardLoading] = useState(false);

  // ─── Fetch billing info on focus ────────────────────────────────────────────

  const fetchBillingInfo = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/villas/${villaId}/billing`);
      if (res.ok) {
        const data = await res.json();
        setBillingInfo(data);
      }
    } catch (e) {
      // Non-fatal — UI will just show the register button
    }
  }, [villaId]);

  useFocusEffect(
    useCallback(() => {
      fetchBillingInfo();
    }, [fetchBillingInfo])
  );

  // ─── Card number auto-format (spaces every 4 digits) ────────────────────────

  const handleCardNumberChange = (text: string) => {
    // Strip all non-digits first
    const digits = text.replace(/\D/g, '');
    // Insert space every 4 digits
    const formatted = digits.replace(/(.{4})/g, '$1 ').trimEnd();
    setCardNumber(formatted);
  };

  // ─── Expiry auto-format (MM/YY) ─────────────────────────────────────────────

  const handleExpiryChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 2) {
      setExpiry(digits);
    } else {
      setExpiry(`${digits.slice(0, 2)}/${digits.slice(2, 4)}`);
    }
  };

  // ─── Free trial handler ──────────────────────────────────────────────────────

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

  // ─── Card registration handler ───────────────────────────────────────────────

  const handleCardRegister = async () => {
    const rawCard = cardNumber.replace(/\s/g, '');
    if (rawCard.length < 15 || rawCard.length > 16) {
      Alert.alert('입력 오류', '카드번호를 올바르게 입력해주세요.');
      return;
    }
    const parts = expiry.split('/');
    if (parts.length !== 2 || parts[0].length !== 2 || parts[1].length !== 2) {
      Alert.alert('입력 오류', '유효기간을 MM/YY 형식으로 입력해주세요.');
      return;
    }
    if (cardPassword.length !== 2) {
      Alert.alert('입력 오류', '카드 비밀번호 앞 2자리를 입력해주세요.');
      return;
    }

    const expireMonth = parts[0];
    const expireYear = parts[1];

    let adminId = '';
    try {
      const raw = await AsyncStorage.getItem('user');
      if (raw) {
        const user = JSON.parse(raw);
        adminId = user.id || '';
      }
      if (!adminId) {
        adminId = (await AsyncStorage.getItem('userId')) || '';
      }
    } catch {
      // ignore
    }

    if (!adminId) {
      Alert.alert('오류', '사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.');
      return;
    }

    setCardLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/villas/${villaId}/billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: rawCard,
          expireMonth,
          expireYear,
          password: cardPassword,
          adminId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '카드 등록에 실패했습니다.');
      }

      setShowCardModal(false);
      setCardNumber('');
      setExpiry('');
      setCardPassword('');
      await fetchBillingInfo();
      Alert.alert(
        '카드 등록 완료',
        '빌링키가 발급되었습니다. 매월 19,900원이 자동 결제됩니다.'
      );
    } catch (e: any) {
      Alert.alert('오류', e.message || '카드 등록 중 오류가 발생했습니다.');
    } finally {
      setCardLoading(false);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const formatExpiryDate = (iso: string | null) => {
    if (!iso) return '-';
    return iso.slice(0, 10); // YYYY-MM-DD
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
            <Text style={styles.price}>19,900</Text>
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

        {/* Auto-billing status OR card register button */}
        {billingInfo?.isAutoBilling ? (
          <View style={styles.activeBillingCard}>
            <View style={styles.activeBillingHeader}>
              <Ionicons name="checkmark-circle" size={22} color="#34C759" />
              <Text style={styles.activeBillingTitle}>자동결제 활성화됨</Text>
            </View>
            <View style={styles.activeBillingRow}>
              <Text style={styles.activeBillingLabel}>결제수단</Text>
              <Text style={styles.activeBillingValue}>{billingInfo.maskedCard ?? '-'}</Text>
            </View>
            <View style={styles.activeBillingRow}>
              <Text style={styles.activeBillingLabel}>다음 결제일</Text>
              <Text style={styles.activeBillingValue}>
                {formatExpiryDate(billingInfo.subscriptionExpiry)}
              </Text>
            </View>
            <Text style={styles.activeBillingAmount}>매월 19,900원</Text>
          </View>
        ) : (
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.cardRegisterButton}
              onPress={() => setShowCardModal(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="card-outline" size={20} color="#fff" style={styles.trialIcon} />
              <Text style={styles.trialButtonText}>신용/체크카드 등록</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Free Trial CTA */}
        <View style={styles.ctaSection}>
          <View style={styles.couponCard}>
            <Ionicons name="gift-outline" size={22} color="#5856D6" />
            <View style={styles.couponTextGroup}>
              <Text style={styles.couponTitle}>1개월 무료 체험 쿠폰</Text>
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
            체험 종료 후 월 19,900원이 청구됩니다.{'\n'}언제든지 해지 가능합니다.
          </Text>
        </View>
      </ScrollView>

      {/* Free Trial Success Modal */}
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

      {/* Card Registration Bottom Sheet Modal */}
      <Modal visible={showCardModal} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setShowCardModal(false)}>
          <View style={styles.sheetBackdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheetContainer}
        >
          <View style={[styles.sheetContent, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
            {/* Sheet header */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetPill} />
              <View style={styles.sheetTitleRow}>
                <View>
                  <Text style={styles.sheetTitle}>카드 등록</Text>
                  <Text style={styles.sheetSubtitle}>자동결제에 사용할 카드를 등록하세요</Text>
                </View>
                <TouchableOpacity onPress={() => setShowCardModal(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={28} color="#C7C7CC" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Card number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>카드번호</Text>
              <TextInput
                style={styles.input}
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                keyboardType="numeric"
                maxLength={19}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor="#C7C7CC"
              />
            </View>

            {/* Expiry + Password row */}
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>유효기간</Text>
                <TextInput
                  style={styles.input}
                  value={expiry}
                  onChangeText={handleExpiryChange}
                  keyboardType="numeric"
                  maxLength={5}
                  placeholder="MM/YY"
                  placeholderTextColor="#C7C7CC"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>비밀번호 앞 2자리</Text>
                <TextInput
                  style={styles.input}
                  value={cardPassword}
                  onChangeText={setCardPassword}
                  keyboardType="numeric"
                  maxLength={2}
                  secureTextEntry
                  placeholder="••"
                  placeholderTextColor="#C7C7CC"
                />
              </View>
            </View>

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.sheetSubmitButton, cardLoading && styles.trialButtonDisabled]}
              onPress={handleCardRegister}
              disabled={cardLoading}
              activeOpacity={0.85}
            >
              {cardLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.sheetSubmitText}>등록하기</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.sheetDisclaimer}>
              카드 정보는 암호화되어 안전하게 처리됩니다.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F3F7' },
  scrollContent: { paddingBottom: 32 },

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

  // Auto-billing active card
  activeBillingCard: {
    backgroundColor: '#F0FFF4',
    borderWidth: 1.5,
    borderColor: '#34C759',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  activeBillingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  activeBillingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  activeBillingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeBillingLabel: {
    fontSize: 14,
    color: '#6E6E73',
  },
  activeBillingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  activeBillingAmount: {
    marginTop: 8,
    fontSize: 13,
    color: '#34C759',
    fontWeight: '600',
    textAlign: 'right',
  },

  ctaSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
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

  cardRegisterButton: {
    backgroundColor: '#007AFF',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 16,
  },

  // Free trial success modal (center modal)
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

  // Card registration bottom sheet
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  sheetPill: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5EA',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    marginBottom: 20,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },

  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6E6E73',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#1C1C1E',
  },

  sheetSubmitButton: {
    backgroundColor: '#007AFF',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  sheetSubmitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  sheetDisclaimer: {
    fontSize: 12,
    color: '#AEAEB2',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default AdminSubscriptionScreen;
