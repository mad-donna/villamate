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
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';


const ResidentJoinScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [inviteCode, setInviteCode] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);
  const [roomsLoaded, setRoomsLoaded] = useState(false);
  const [roomPickerVisible, setRoomPickerVisible] = useState(false);
  const [fetchingRooms, setFetchingRooms] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => setUserId(id));
  }, []);

  const fetchRooms = async (code: string) => {
    if (code.length !== 6) return;
    setFetchingRooms(true);
    try {
      const res = await api.get(`/api/villas/join/rooms?inviteCode=${code.trim().toUpperCase()}`);
      setAvailableRooms(res.data.roomNumbers || []);
      setRoomsLoaded(true);
    } catch {
      setAvailableRooms([]);
    } finally {
      setFetchingRooms(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode || !roomNumber) {
      Alert.alert('알림', '초대 코드와 호수를 모두 입력해주세요.');
      return;
    }

    if (!userId) {
      Alert.alert('오류', '로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
      navigation.replace('Login');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/villas/join', {
        userId,
        inviteCode: inviteCode.trim().toUpperCase(),
        roomNumber,
      });
      const data = response.data;

      const updatedUser = { ...data.user, villa: data.villa, residentType: data.residentType };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      navigation.replace('ResidentDashboard');
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
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>빌라 가입하기</Text>
            <Text style={styles.subtitle}>관리자에게 받은 초대 코드를 입력해주세요.</Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>초대 코드 (6자리)</Text>
            <TextInput
              style={styles.input}
              placeholder="예: VILA9X"
              value={inviteCode}
              onChangeText={(text) => {
                const upper = text.trim().toUpperCase();
                setInviteCode(upper);
                if (upper.length === 6) fetchRooms(upper);
                else { setAvailableRooms([]); setRoomsLoaded(false); }
              }}
              autoCapitalize="characters"
              maxLength={6}
            />

            <Text style={styles.label}>호수 선택</Text>
            {fetchingRooms ? (
              <ActivityIndicator color="#007AFF" style={{ marginBottom: 20 }} />
            ) : availableRooms.length > 0 ? (
              <TouchableOpacity
                style={[styles.input, { justifyContent: 'center' }]}
                onPress={() => setRoomPickerVisible(true)}
              >
                <Text style={{ fontSize: 16, color: roomNumber ? '#1C1C1E' : '#C7C7CC' }}>
                  {roomNumber ? `${roomNumber}호` : '호수를 선택해주세요'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="예: 101"
                value={roomNumber}
                onChangeText={setRoomNumber}
                keyboardType="default"
              />
            )}
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              await AsyncStorage.clear();
              navigation.replace('Login');
            }}
          >
            <Text style={styles.logoutButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* Bottom Fixed Button */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ padding: 16, paddingBottom: Math.max(insets.bottom + 16, 24), backgroundColor: '#fff' }}>
          <TouchableOpacity
            style={[styles.joinButton, loading && styles.disabledButton]}
            onPress={handleJoin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.joinButtonText}>빌라 가입하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Room Picker Modal */}
      <Modal
        visible={roomPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRoomPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setRoomPickerVisible(false)}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>호수 선택</Text>
            <FlatList
              data={availableRooms}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.roomItem,
                    roomNumber === item && styles.roomItemSelected,
                  ]}
                  onPress={() => {
                    setRoomNumber(item);
                    setRoomPickerVisible(false);
                  }}
                >
                  <Text style={[
                    styles.roomItemText,
                    roomNumber === item && styles.roomItemTextSelected,
                  ]}>
                    {item}호
                  </Text>
                  {roomNumber === item && (
                    <Text style={{ color: '#007AFF', fontSize: 18 }}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: 32 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '70%',
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
    textAlign: 'center',
  },
  roomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  roomItemSelected: {
    backgroundColor: '#F0F7FF',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  roomItemText: {
    fontSize: 17,
    color: '#1C1C1E',
  },
  roomItemTextSelected: {
    color: '#007AFF',
    fontWeight: '700',
  },
});

export default ResidentJoinScreen;
