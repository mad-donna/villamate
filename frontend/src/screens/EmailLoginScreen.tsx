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
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';


const EmailLoginScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigateAfterLogin = async (user: any) => {
    const existing = await AsyncStorage.getItem('user');
    const existingUser = existing ? JSON.parse(existing) : {};

    // Start with preserved AsyncStorage data, then overlay fresh API fields.
    // Do NOT let the API response erase villa info that was stored at join time.
    let merged = { ...existingUser, ...user };

    if (!user.phone) {
      await AsyncStorage.setItem('user', JSON.stringify(merged));
      await AsyncStorage.setItem('userId', user.id);
      navigation.replace('ProfileSetup');
      return;
    }

    if (user.role === 'RESIDENT') {
      // merged.villa may already be set if this user previously joined via ResidentJoinScreen.
      // If it is missing (e.g. first login on a new device), query the backend.
      if (!merged.villa) {
        try {
          const villaRes = await fetch(`${API_BASE_URL}/api/users/${user.id}/villa`);
          const villaData = await villaRes.json();
          if (villaRes.ok && villaData.villa) {
            merged = { ...merged, villa: villaData.villa };
          }
        } catch (error) {
          console.error('Villa lookup error:', error);
        }
      }

      await AsyncStorage.setItem('user', JSON.stringify(merged));
      await AsyncStorage.setItem('userId', user.id);

      if (merged.villa) {
        navigation.replace('ResidentDashboard');
      } else {
        navigation.replace('ResidentJoin');
      }
    } else {
      await AsyncStorage.setItem('user', JSON.stringify(merged));
      await AsyncStorage.setItem('userId', user.id);

      try {
        const villaResponse = await fetch(`${API_BASE_URL}/api/villas/${user.id}`);
        const villas = await villaResponse.json();

        if (Array.isArray(villas) && villas.length > 0) {
          navigation.replace('Main');
        } else {
          navigation.replace('Onboarding');
        }
      } catch (error) {
        console.error('Villa check error:', error);
        navigation.replace('Onboarding');
      }
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/email-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const user = await response.json();

      if (!response.ok) {
        Alert.alert('오류', user.error || '로그인에 실패했습니다.');
        return;
      }

      await navigateAfterLogin(user);
    } catch (error) {
      Alert.alert('오류', '서버에 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        enableOnAndroid={true}
        extraHeight={120}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          <Text style={styles.title}>이메일 로그인</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 입력하세요"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← 다른 방법으로 로그인</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* Bottom Fixed Button */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ padding: 16, paddingBottom: Math.max(insets.bottom + 16, 24), backgroundColor: '#fff' }}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>로그인 / 회원가입</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3A3C',
    marginBottom: 8,
  },
  input: {
    height: 56,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1C1C1E',
  },
  button: {
    height: 56,
    backgroundColor: '#007AFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  backButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 15,
    color: '#8E8E93',
  },
});

export default EmailLoginScreen;
