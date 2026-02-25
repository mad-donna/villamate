import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.219.122:3000';

const BANKS = [
  { id: '1', name: '국민은행' },
  { id: '2', name: '신한은행' },
  { id: '3', name: '우리은행' },
  { id: '4', name: '하나은행' },
  { id: '5', name: '농협은행' },
  { id: '6', name: '카카오뱅크' },
  { id: '7', name: '토스뱅크' },
];

const daumPostcodeHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        body, html, #layer { width: 100%; height: 100%; margin: 0; padding: 0; }
    </style>
</head>
<body>
    <div id="layer" style="width:100%;height:100vh;"></div>
    <script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
    <script>
        new daum.Postcode({
            oncomplete: function(data) {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(data));
                } else {
                    window.parent.postMessage(JSON.stringify(data), '*');
                }
            },
            width: '100%',
            height: '100%'
        }).embed(document.getElementById('layer'));
    </script>
</body>
</html>
`;

const OnboardingScreen = ({ navigation }: any) => {
  const [buildingName, setBuildingName] = useState('');
  const [address, setAddress] = useState('');
  const [totalUnits, setTotalUnits] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [isPostcodeVisible, setIsPostcodeVisible] = useState(false);
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    const getAdminId = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          setAdminId(userId);
        }
      } catch (e) {
        console.error('Error fetching admin ID:', e);
      }
    };
    getAdminId();
  }, []);

  const handleAddressSelect = (data: any) => {
    setAddress(data.roadAddress || data.address);
    if (data.buildingName) {
      setBuildingName(data.buildingName);
    }
    setIsPostcodeVisible(false);
  };

  const handleRegister = async () => {
    if (!buildingName || !address || !accountNumber || !bankName || !totalUnits) {
      Alert.alert('알림', '모든 필드를 입력해주세요.');
      return;
    }

    if (!adminId) {
      Alert.alert('오류', '로그인 정보가 없습니다. 다시 로그인 해주세요.');
      navigation.navigate('Login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/villas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: buildingName,
          address,
          totalUnits: Number(totalUnits),
          adminId,
          accountNumber,
          bankName,
        }),
      });

      if (response.ok) {
        const villa = await response.json();
        Alert.alert(
          '등록 완료',
          `빌라 등록이 완료되었습니다!\n\n초대 코드: ${villa.inviteCode}\n\n입주민에게 이 코드를 공유해주세요.`,
          [{ text: '확인', onPress: () => navigation.navigate('Main') }]
        );
      } else {
        const err = await response.json();
        throw new Error(err.error || '등록 실패');
      }
    } catch (err: any) {
      Alert.alert('오류', err.message || '등록 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace('Login');
    } catch (e) {
      console.error('Logout error:', e);
      Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
    }
  };

  const showGuide = () => {
    Alert.alert('안내', '서비스 가이드 노션 페이지로 이동합니다.');
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
            <Text style={styles.label}>빌라 주소</Text>
            <View style={styles.addressRow}>
              <TextInput
                style={[styles.input, styles.addressInput]}
                placeholder="주소 검색 버튼을 눌러주세요"
                value={address}
                editable={false}
              />
              <TouchableOpacity 
                style={styles.searchButton} 
                onPress={() => setIsPostcodeVisible(true)}
              >
                <Text style={styles.searchButtonText}>주소 검색</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>빌라 이름</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 테헤란 팰리스"
              value={buildingName}
              onChangeText={setBuildingName}
            />

            <Text style={styles.label}>총 세대수</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 12"
              keyboardType="number-pad"
              value={totalUnits}
              onChangeText={setTotalUnits}
            />

            <Text style={styles.label}>은행 선택</Text>
            <TouchableOpacity 
              style={styles.input} 
              onPress={() => setIsBankModalVisible(true)}
            >
              <Text style={[styles.inputText, !bankName && styles.placeholderText]}>
                {bankName || '은행을 선택해주세요'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>공용 계좌번호</Text>
            <TextInput
              style={styles.input}
              placeholder="하이픈(-) 없이 입력"
              keyboardType="number-pad"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 팁: 세무서에서 '고유번호증'을 발급받아 빌라 명의의 통장을 만들면 관리가 투명해져요!
              </Text>
              <TouchableOpacity onPress={showGuide}>
                <Text style={styles.guideLink}>[발급 가이드 보기]</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>빌라 등록 완료하기</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 주소 검색 모달 */}
      <Modal
        visible={isPostcodeVisible}
        animationType="slide"
        onRequestClose={() => setIsPostcodeVisible(false)}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>주소 검색</Text>
            <TouchableOpacity onPress={() => setIsPostcodeVisible(false)}>
              <Text style={styles.closeButton}>닫기</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{ html: daumPostcodeHtml, baseUrl: 'https://localhost' }}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                handleAddressSelect(data);
              } catch (e) {
                console.error(e);
              }
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            style={{ flex: 1 }}
          />
        </SafeAreaView>
      </Modal>

      {/* 은행 선택 모달 */}
      <Modal
        visible={isBankModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsBankModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsBankModalVisible(false)}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHeader}>
              <View style={styles.handle} />
              <Text style={styles.bottomSheetTitle}>은행 선택</Text>
            </View>
            <FlatList
              data={BANKS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.bankItem}
                  onPress={() => {
                    setBankName(item.name);
                    setIsBankModalVisible(false);
                  }}
                >
                  <Text style={styles.bankItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.bankList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 32,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3A3C',
    marginBottom: 8,
    marginLeft: 4,
  },
  addressRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  addressInput: {
    flex: 1,
    marginBottom: 0,
    backgroundColor: '#F2F2F7',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    width: 90,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
    color: '#1C1C1E',
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  placeholderText: {
    color: '#C7C7CC',
  },
  infoBox: {
    backgroundColor: '#F0F7FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 13,
    color: '#0055BB',
    lineHeight: 20,
    marginBottom: 4,
  },
  guideLink: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#007AFF',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  bottomSheetHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  handle: {
    width: 36,
    height: 5,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    marginBottom: 12,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  bankList: {
    paddingHorizontal: 20,
  },
  bankItem: {
    height: 56,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  bankItemText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  logoutButton: {
    marginTop: 20,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#8E8E93',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default OnboardingScreen;
