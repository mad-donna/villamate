import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.219.112:3000';

const ResidentJoinScreen = ({ navigation }: any) => {
  const [inviteCode, setInviteCode] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => setUserId(id));
  }, []);

  const handleJoin = async () => {
    if (!inviteCode || !roomNumber) {
      Alert.alert('알림', '초대 코드와 동/호수를 모두 입력해주세요.');
      return;
    }

    if (!userId) {
      Alert.alert('오류', '로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
      navigation.replace('Login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/villas/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          inviteCode: inviteCode.trim().toUpperCase(),
          roomNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('오류', data.error || '빌라 입장에 실패했습니다.');
        return;
      }

      const updatedUser = { ...data.user, villa: data.villa };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      navigation.replace('ResidentDashboard');
    } catch (error) {
      Alert.alert('오류', '서버에 연결할 수 없습니다.');
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
            <Text style={styles.title}>빌라 입장하기</Text>
            <Text style={styles.subtitle}>동대표님께 받은 초대 코드를 입력해주세요.</Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>초대 코드 (6자리)</Text>
            <TextInput
              style={styles.input}
              placeholder="예: VILA9X"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
              maxLength={6}
            />

            <Text style={styles.label}>동/호수 (예: 101호)</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 101호"
              value={roomNumber}
              onChangeText={setRoomNumber}
            />
          </View>

          <TouchableOpacity
            style={[styles.joinButton, loading && styles.disabledButton]}
            onPress={handleJoin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.joinButtonText}>빌라 입장하기</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              await AsyncStorage.clear();
              navigation.replace('Login');
            }}
          >
            <Text style={styles.logoutButtonText}>로그아웃</Text>
          </TouchableOpacity>
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
    padding: 24,
    justifyContent: 'center',
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
  inputSection: {
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3A3C',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F2F2F7',
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
    color: '#1C1C1E',
  },
  joinButton: {
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
  disabledButton: {
    opacity: 0.6,
  },
  logoutButton: {
    marginTop: 20,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#8E8E93',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default ResidentJoinScreen;
