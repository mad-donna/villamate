import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.219.124:3000';

const ProfileSetupScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'RESIDENT' | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserId(user.id);
          setName(user.name || '');
          if (user.phone) setPhone(user.phone);
        }
      } catch (e) {
        console.error('Failed to load user data:', e);
      }
    };
    loadUserData();
  }, []);

  const handleSubmit = async () => {
    if (!name || !phone || !role) {
      Alert.alert('알림', '모든 정보를 입력하고 역할을 선택해주세요.');
      return;
    }

    if (!userId) {
      Alert.alert('오류', '사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
      navigation.replace('Login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone, role }),
      });

      const updatedUser = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        await AsyncStorage.setItem('userId', updatedUser.id);

        if (role === 'ADMIN') {
          navigation.replace('Onboarding');
        } else {
          navigation.replace('ResidentJoin');
        }
      } else {
        Alert.alert('오류', updatedUser.error || '프로필 설정이 실패했습니다.');
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      Alert.alert('오류', '서버 통신 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <View style={styles.header}>
            <Text style={styles.title}>프로필 설정하기</Text>
            <Text style={styles.subtitle}>서비스 이용을 위해 추가 정보를 입력해주세요.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>이름</Text>
              <TextInput
                style={styles.input}
                placeholder="이름을 입력해주세요"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>전화번호</Text>
              <TextInput
                style={styles.input}
                placeholder="01012345678"
                keyboardType="number-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={11}
              />
            </View>

            <Text style={styles.label}>나의 역할</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'ADMIN' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('ADMIN')}
              >
                <Text style={[
                  styles.roleButtonText,
                  role === 'ADMIN' && styles.roleButtonTextActive,
                ]}>관리자</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'RESIDENT' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('RESIDENT')}
              >
                <Text style={[
                  styles.roleButtonText,
                  role === 'RESIDENT' && styles.roleButtonTextActive,
                ]}>입주민</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>시작하기</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3A3C',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1C1C1E',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  roleButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  roleButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#007AFF',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  roleButtonTextActive: {
    color: '#007AFF',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ProfileSetupScreen;
