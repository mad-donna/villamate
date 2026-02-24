import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const API_BASE_URL = 'http://192.168.219.112:3000';
const KAKAO_CLIENT_ID = 'ba8af524bbb28a9f74ce4ed088398fdb';
const GOOGLE_CLIENT_ID = '540282711889-b5l2sg8hpnqim3a6gaoqht2o61ee4mko.apps.googleusercontent.com';
const googleRedirectUri = 'https://villamate-proxy.loca.lt/api/auth/proxy';

const LoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isTestModalVisible, setIsTestModalVisible] = useState(false);

  const redirectUri = `${API_BASE_URL}/api/auth/proxy`;

  useEffect(() => {
    console.log('Redirect URI:', redirectUri);
  }, []);

  const [request, response, promptAsync] = AuthSession.useAuthRequest({
    clientId: KAKAO_CLIENT_ID,
    redirectUri,
    responseType: 'token',
    scopes: ['profile_nickname'],
  }, { authorizationEndpoint: 'https://kauth.kakao.com/oauth/authorize' });

  const googleDiscovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
  const [googleRequest, googleResponse, promptGoogleAsync] = AuthSession.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    redirectUri: googleRedirectUri,
    responseType: 'token',
    usePKCE: false,
  }, googleDiscovery);

  useEffect(() => {
    checkAutoLogin();
  }, []);

  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (!googleResponse) return;

      if (googleResponse.type === 'success') {
        try {
          const { access_token } = googleResponse.params;
          const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: { Authorization: `Bearer ${access_token}` },
          });
          const googleUser = await userInfoResponse.json();

          const backendResponse = await fetch(`${API_BASE_URL}/api/auth/social-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: 'GOOGLE',
              providerId: String(googleUser.id),
              email: googleUser.email,
              name: googleUser.name || '구글 유저',
            }),
          });

          const user = await backendResponse.json();
          if (!backendResponse.ok) throw new Error(user.error || '백엔드 연동 실패');
          await navigateAfterLogin(user);
        } catch (error: any) {
          Alert.alert('구글 로그인 실패', error.message);
        } finally {
          setGoogleLoading(false);
        }
      } else if (googleResponse.type !== 'dismiss') {
        setGoogleLoading(false);
      }
    };
    handleGoogleResponse();
  }, [googleResponse]);

  useEffect(() => {
    const handleResponse = async () => {
      if (!response) return;
      
      console.log('Full Kakao response type:', response.type);
      
      if (response.type === 'success') {
        console.log('Kakao success params:', response.params);
        const { access_token } = response.params;
        try {
          await handleKakaoLoginSuccess(access_token);
        } catch (error: any) {
          console.error('Login processing error:', error);
          Alert.alert("카카오 로그인 실패", error.message);
        } finally {
          setKakaoLoading(false);
        }
      } else {
        // Includes 'cancel', 'error', 'dismiss'
        if (response.type !== 'dismiss') {
          console.log('Kakao login not successful:', response.type);
        }
        setKakaoLoading(false);
      }
    };
    handleResponse();
  }, [response]);

  const checkAutoLogin = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userJson = await AsyncStorage.getItem('user');
      
      if (userId && userJson) {
        const user = JSON.parse(userJson);
        
        // 1. Check if profile setup is complete
        if (!user.phone) {
          navigation.replace('ProfileSetup');
          return;
        }

        // 2. Route by role
        if (user.role === 'RESIDENT') {
          if (user.villa) {
            navigation.replace('ResidentDashboard');
          } else {
            navigation.replace('ResidentJoin');
          }
        } else {
          // ADMIN: check if they have created a villa
          const response = await fetch(`${API_BASE_URL}/api/villas/${userId}`);
          const villas = await response.json();

          if (Array.isArray(villas) && villas.length > 0) {
            navigation.replace('Main');
          } else {
            navigation.replace('Onboarding');
          }
        }
      }
    } catch (error) {
      console.error('Auto-login error:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const navigateAfterLogin = async (user: any) => {
    const existing = await AsyncStorage.getItem('user');
    const existingUser = existing ? JSON.parse(existing) : {};
    const merged = { ...existingUser, ...user };
    await AsyncStorage.setItem('user', JSON.stringify(merged));
    await AsyncStorage.setItem('userId', user.id);
    
    // 1. Check if profile setup is complete
    if (!user.phone) {
      navigation.replace('ProfileSetup');
      return;
    }

    // 2. Route by role
    if (user.role === 'RESIDENT') {
      if (user.villa) {
        navigation.replace('ResidentDashboard');
      } else {
        navigation.replace('ResidentJoin');
      }
    } else {
      // ADMIN: check if they have created a villa
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

  const handleLogin = async (role: 'ADMIN' | 'RESIDENT') => {
    if (!phone) {
      Alert.alert('알림', '휴대폰 번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone, 
          role,
          name: role === 'ADMIN' ? '동대표' : '입주민'
        }),
      });

      const user = await response.json();

      if (response.ok) {
        setIsTestModalVisible(false);
        await navigateAfterLogin(user);
      } else {
        Alert.alert('오류', user.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('오류', '서버에 연결할 수 없습니다. IP 주소를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLoginSuccess = async (accessToken: string) => {
    // 1. Fetch user info from Kakao
    const kakaoResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const kakaoData = await kakaoResponse.json();
    console.log('Kakao user info:', kakaoData);

    if (!kakaoData.id) {
      throw new Error('카카오 사용자 정보를 가져오는데 실패했습니다.');
    }

    // 2. Call our backend social-login
    const backendResponse = await fetch(`${API_BASE_URL}/api/auth/social-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'KAKAO',
        providerId: String(kakaoData.id),
        email: null,
        name: kakaoData.properties?.nickname || '카카오 사용자',
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(errorData.error || `서버 오류: ${backendResponse.statusText}`);
    }

    const user = await backendResponse.json();
    await navigateAfterLogin(user);
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'Kakao') {
      if (!request) {
        Alert.alert('알림', '로그인 세션을 초기화하는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      setKakaoLoading(true);
      try {
        // results will be handled in useEffect [response]
        promptAsync();
      } catch (error: any) {
        console.error('Kakao prompt error:', error);
        setKakaoLoading(false);
        Alert.alert("카카오 로그인 실행 오류", error.message);
      }
    } else if (provider === 'Google') {
      if (!googleRequest) return;
      setGoogleLoading(true);
      promptGoogleAsync().catch((err: any) => {
        console.error(err);
        setGoogleLoading(false);
        Alert.alert('구글 로그인 오류', err.message);
      });
    } else {
      Alert.alert('알림', `소셜 로그인(${provider}) 연동 준비 중입니다.`);
    }
  };

  if (isInitialLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>빌라메이트</Text>
          <Text style={styles.subtitle}>우리가 만드는 스마트한 빌라 생활</Text>
        </View>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: '#F2F2F2' }]}
            onPress={() => navigation.navigate('EmailLogin')}
          >
            <Ionicons name="mail" size={20} color="#191919" style={styles.socialIcon} />
            <Text style={[styles.socialButtonText, { color: '#191919' }]}>이메일로 시작하기</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: '#FEE500' }]}
            onPress={() => handleSocialLogin('Kakao')}
            disabled={kakaoLoading}
          >
            {kakaoLoading ? (
              <ActivityIndicator color="#191919" />
            ) : (
              <>
                <Ionicons name="chatbubble" size={20} color="#191919" style={styles.socialIcon} />
                <Text style={[styles.socialButtonText, { color: '#191919' }]}>카카오 로그인</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: '#03C75A' }]}
            onPress={() => handleSocialLogin('Naver')}
          >
            <Text style={[styles.socialButtonText, { color: '#FFF', fontWeight: '900' }]}>N</Text>
            <Text style={[styles.socialButtonText, { color: '#FFF', marginLeft: 8 }]}>네이버 로그인</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E5E5' }]}
            onPress={() => handleSocialLogin('Google')}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#191919" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#191919" style={styles.socialIcon} />
                <Text style={[styles.socialButtonText, { color: '#191919' }]}>Google 로그인</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.testModeButton}
          onPress={() => setIsTestModalVisible(true)}
        >
          <Text style={styles.testModeButtonText}>테스트용 전화번호로 시작하기</Text>
        </TouchableOpacity>
      </View>

      {/* 테스트 로그인 모달 */}
      <Modal
        visible={isTestModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsTestModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>테스트 로그인</Text>
                <TouchableOpacity onPress={() => setIsTestModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>휴대폰 번호</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="01012345678"
                    keyboardType="number-pad"
                    value={phone}
                    onChangeText={setPhone}
                    maxLength={11}
                  />
                </View>

                {loading ? (
                  <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} />
                ) : (
                  <View style={styles.testButtonsRow}>
                    <TouchableOpacity 
                      style={[styles.testActionButton, { backgroundColor: '#007AFF' }]}
                      onPress={() => handleLogin('ADMIN')}
                    >
                      <Text style={styles.testActionButtonText}>동대표 로그인</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.testActionButton, { backgroundColor: '#34C759' }]}
                      onPress={() => handleLogin('RESIDENT')}
                    >
                      <Text style={styles.testActionButtonText}>입주민 로그인</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                <Text style={styles.modalNote}>
                  * 실제 개발 환경에서 빠른 테스트를 위한 세션 우회용 로그인입니다.
                </Text>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#007AFF',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  socialButtonsContainer: {
    width: '100%',
    gap: 12,
  },
  socialButton: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  socialIcon: {
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  testModeButton: {
    marginTop: 40,
    padding: 10,
  },
  testModeButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    textDecorationLine: 'underline',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  inputContainer: {
    width: '100%',
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
    fontSize: 18,
    color: '#1C1C1E',
  },
  testButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  testActionButton: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  testActionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalNote: {
    marginTop: 20,
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  }
});

export default LoginScreen;
