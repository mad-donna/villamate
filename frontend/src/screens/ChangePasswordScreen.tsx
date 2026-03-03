import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../config';

const ChangePasswordScreen = ({ navigation, route }: any) => {
  const { userId } = route.params as { userId: string };
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('입력 오류', '새 비밀번호를 입력해주세요.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('입력 오류', '새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('입력 오류', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('오류', data.error || '비밀번호 변경에 실패했습니다.');
        return;
      }
      Alert.alert('완료', '비밀번호가 변경되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('오류', '서버와 통신 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>비밀번호 변경</Text>
          <Text style={styles.subtitle}>새로운 비밀번호를 설정하세요.</Text>

          <View style={styles.form}>
            <Text style={styles.label}>현재 비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="현재 비밀번호를 입력하세요"
              placeholderTextColor="#C7C7CC"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />

            <Text style={styles.label}>새 비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="6자 이상 입력하세요"
              placeholderTextColor="#C7C7CC"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <Text style={styles.label}>새 비밀번호 확인</Text>
            <TextInput
              style={styles.input}
              placeholder="새 비밀번호를 다시 입력하세요"
              placeholderTextColor="#C7C7CC"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>변경하기</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollContent: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: '800', color: '#1C1C1E', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#8E8E93', marginBottom: 32 },
  form: { marginBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', color: '#3A3A3C', marginBottom: 8, marginLeft: 4 },
  input: {
    height: 52, backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 16, fontSize: 16, color: '#1C1C1E', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  button: {
    backgroundColor: '#007AFF', height: 56, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

export default ChangePasswordScreen;
