import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// ── Step indicator ─────────────────────────────────────────────────────────────
const StepIndicator = ({ current, total }: { current: number; total: number }) => (
  <View style={stepStyles.container}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          stepStyles.dot,
          i + 1 === current && stepStyles.dotActive,
          i + 1 < current && stepStyles.dotDone,
        ]}
      >
        {i + 1 < current ? (
          <Ionicons name="checkmark" size={10} color="#fff" />
        ) : (
          <Text style={[stepStyles.dotText, i + 1 === current && stepStyles.dotTextActive]}>
            {i + 1}
          </Text>
        )}
      </View>
    ))}
  </View>
);

const stepStyles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginVertical: 24 },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center', alignItems: 'center',
  },
  dotActive: { backgroundColor: '#007AFF' },
  dotDone: { backgroundColor: '#34C759' },
  dotText: { fontSize: 13, fontWeight: '700', color: '#8E8E93' },
  dotTextActive: { color: '#fff' },
});

// ── Main screen ────────────────────────────────────────────────────────────────
const SignupAgreementScreen = ({ navigation, route }: any) => {
  const { email, password } = route.params || {};

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const allAgreed = agreeTerms && agreePrivacy;

  const toggleAll = () => {
    const next = !allAgreed;
    setAgreeTerms(next);
    setAgreePrivacy(next);
  };

  const handleNext = () => {
    if (!agreeTerms || !agreePrivacy) {
      Alert.alert('알림', '필수 약관에 모두 동의해주세요.');
      return;
    }
    navigation.navigate('SignupProfile', { email, password, termsAgreed: true });
  };

  const CheckRow = ({
    checked,
    onPress,
    label,
    required,
  }: {
    checked: boolean;
    onPress: () => void;
    label: string;
    required?: boolean;
  }) => (
    <TouchableOpacity style={styles.checkRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>
      <Text style={styles.checkLabel}>
        {label}
        {required && <Text style={styles.required}> (필수)</Text>}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>

        <StepIndicator current={2} total={3} />

        <Text style={styles.title}>서비스 이용약관</Text>
        <Text style={styles.subtitle}>
          Villamate를 이용하시려면{'\n'}아래 약관에 동의해주세요.
        </Text>

        {/* All agree */}
        <TouchableOpacity style={styles.allAgreeRow} onPress={toggleAll} activeOpacity={0.8}>
          <View style={[styles.checkbox, styles.checkboxLarge, allAgreed && styles.checkboxChecked]}>
            {allAgreed && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.allAgreeText}>전체 동의</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Individual items */}
        <CheckRow
          checked={agreeTerms}
          onPress={() => setAgreeTerms((v) => !v)}
          label="이용약관 동의"
          required
        />
        <CheckRow
          checked={agreePrivacy}
          onPress={() => setAgreePrivacy((v) => !v)}
          label="개인정보 수집 및 이용 동의"
          required
        />

        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            수집되는 개인정보는 서비스 제공 목적으로만 사용되며, 제3자에게 제공되지 않습니다.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !allAgreed && styles.buttonDisabled]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 24, paddingBottom: 24 },
  backBtn: { marginTop: 8, marginLeft: -4 },
  title: { fontSize: 26, fontWeight: '800', color: '#1C1C1E', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#8E8E93', lineHeight: 22, marginBottom: 32 },

  allAgreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  allAgreeText: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },

  divider: { height: 1, backgroundColor: '#E5E5EA', marginBottom: 16 },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: '#C7C7CC',
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxLarge: { width: 26, height: 26, borderRadius: 8 },
  checkboxChecked: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  checkLabel: { flex: 1, fontSize: 15, color: '#1C1C1E', fontWeight: '500' },
  required: { color: '#007AFF', fontWeight: '600' },

  noticeBox: {
    backgroundColor: '#F0F7FF',
    borderRadius: 10,
    padding: 14,
    marginTop: 20,
  },
  noticeText: { fontSize: 13, color: '#0055BB', lineHeight: 20 },

  footer: { padding: 16, paddingBottom: 24, backgroundColor: '#fff' },
  button: {
    height: 56, backgroundColor: '#007AFF',
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  buttonDisabled: { backgroundColor: '#C7C7CC', shadowOpacity: 0 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

export default SignupAgreementScreen;
