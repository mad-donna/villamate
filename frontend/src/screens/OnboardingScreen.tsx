import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

// TODO: Update this to your PC's local IP (e.g., 192.168.x.x) if testing on a physical device.
const API_BASE_URL = 'http://192.168.219.107:3000';

const OnboardingScreen = ({ navigation }: any) => {
  const [buildingName, setBuildingName] = useState('');
  const [address, setAddress] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!buildingName || !address || !accountNumber || !bankName) {
      Alert.alert('알림', '모든 필드를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      // POST /api/v1/banking/account
      const response = await fetch(`${API_BASE_URL}/api/v1/banking/account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buildingId: 1, // Mock buildingId as requested
          accountNumber,
          bankName,
        }),
      });

      if (response.ok) {
        Alert.alert('등록 완료', '빌라 등록 및 계좌 연동이 완료되었습니다. 고유번호증 발급 신청이 접수되었습니다.', [
          { text: '확인', onPress: () => navigation.navigate('Main', { screen: '홈', params: { registered: true } }) }
        ]);
      } else {
        throw new Error('등록 실패');
      }
    } catch (err) {
      Alert.alert('오류', '등록 중 문제가 발생했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>빌라 등록</Text>
          <Text style={styles.subtitle}>대표자 정보를 입력하여 서비스를 시작하세요.</Text>

          <View style={styles.form}>
            <Text style={styles.label}>빌라 이름</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 청담빌라"
              value={buildingName}
              onChangeText={setBuildingName}
            />

            <Text style={styles.label}>빌라 주소</Text>
            <TextInput
              style={styles.input}
              placeholder="도로명 주소를 입력하세요"
              value={address}
              onChangeText={setAddress}
            />

            <Text style={styles.label}>공용 계좌번호</Text>
            <TextInput
              style={styles.input}
              placeholder="하이픈(-) 없이 입력"
              keyboardType="number-pad"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            <Text style={styles.label}>은행명</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 신한은행"
              value={bankName}
              onChangeText={setBankName}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>빌라 등록 및 고유번호증 발급 신청</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default OnboardingScreen;
