import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

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

const SignupProfileScreen = ({ navigation, route }: any) => {
  const { email, password, termsAgreed } = route.params || {};

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('알림', '이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: name.trim(),
          phoneNumber: phoneNumber.trim() || undefined,
          termsAgreed,
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        Alert.alert('오류', '이미 가입된 이메일입니다. 로그인해주세요.', [
          { text: '확인', onPress: () => navigation.navigate('EmailLogin') },
        ]);
        return;
      }

      if (!response.ok) {
        Alert.alert('오류', data.error || '회원가입에 실패했습니다.');
        return;
      }

      // Save user session
      await AsyncStorage.setItem('user', JSON.stringify(data));
      await AsyncStorage.setItem('userId', data.id);

      // New admin user → go to villa setup (Onboarding)
      navigation.replace('Onboarding');
    } catch (error) {
      Alert.alert('오류', '서버에 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </TouchableOpacity>

          <StepIndicator current={3} total={3} />

          <Text style={styles.title}>프로필 설정</Text>
          <Text style={styles.subtitle}>
            마지막 단계입니다.{'\n'}기본 정보를 입력해주세요.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>이름 <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="실명을 입력해주세요"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              휴대전화 번호 <Text style={styles.optional}>(선택)</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="010-0000-0000"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              returnKeyType="done"
            />
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={16} color="#0055BB" />
            <Text style={styles.infoText}>
              휴대전화 번호는 관리자 연락 및 알림 발송에 사용됩니다.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>가입 완료</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 24, paddingBottom: 24 },
  backBtn: { marginTop: 8, marginLeft: -4 },
  title: { fontSize: 26, fontWeight: '800', color: '#1C1C1E', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#8E8E93', lineHeight: 22, marginBottom: 32 },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#3A3A3C', marginBottom: 8 },
  required: { color: '#FF3B30' },
  optional: { color: '#8E8E93', fontWeight: '400' },
  input: {
    height: 56, backgroundColor: '#F2F2F7',
    borderRadius: 12, paddingHorizontal: 16,
    fontSize: 16, color: '#1C1C1E',
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0F7FF',
    borderRadius: 10,
    padding: 14,
    marginTop: 4,
  },
  infoText: { flex: 1, fontSize: 13, color: '#0055BB', lineHeight: 20 },

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

export default SignupProfileScreen;
