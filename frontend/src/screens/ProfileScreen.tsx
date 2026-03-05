import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config';

const ProfileScreen = ({ navigation }: any) => {
  const [userName, setUserName] = useState('');
  const [userContact, setUserContact] = useState('');
  const [userRole, setUserRole] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [pushEnabled, setPushEnabled] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const userJson = await AsyncStorage.getItem('user');
        if (!userJson) return;
        const user = JSON.parse(userJson);
        setUserName(user.name || '');
        setUserContact(user.email || user.phone || '');
        setUserRole(user.role || 'RESIDENT');
        setRoomNumber(user.roomNumber || user.villa?.roomNumber || '');

        let uid = await AsyncStorage.getItem('userId');
        if (!uid) uid = user.id;
        if (uid) setUserId(uid);
      };
      load();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }));
        },
      },
    ]);
  };

  const handleWithdraw = () => {
    Alert.alert(
      '회원 탈퇴',
      '정말로 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴하기',
          style: 'destructive',
          onPress: async () => {
            if (!userId) return;
            try {
              const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, { method: 'DELETE' });
              if (!res.ok) throw new Error('탈퇴 처리 실패');
              await AsyncStorage.clear();
              navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }));
            } catch (e: any) {
              Alert.alert('오류', e.message || '탈퇴 처리에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const roleLabel = userRole === 'ADMIN' ? '관리자' : '입주민';
  const avatarInitial = userName ? userName.charAt(0) : '?';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
          <Text style={styles.headerName}>{userName || '이름 없음'}</Text>
          <View style={styles.headerMeta}>
            {roomNumber ? (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{roomNumber}호</Text>
              </View>
            ) : null}
            <View style={[styles.chip, userRole === 'ADMIN' ? styles.chipAdmin : styles.chipResident]}>
              <Text style={[styles.chipText, { color: '#fff' }]}>{roleLabel}</Text>
            </View>
          </View>
          {userContact ? <Text style={styles.headerContact}>{userContact}</Text> : null}
        </View>

        {/* ── Section 2: My Home ── */}
        <Text style={styles.sectionLabel}>내 집</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('VehicleManagement')}
          >
            <View style={[styles.rowIcon, { backgroundColor: '#007AFF' }]}>
              <Ionicons name="car" size={18} color="#fff" />
            </View>
            <Text style={styles.rowLabel}>내 차량 관리</Text>
            <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('MyPosts', { userId, userRole })}
          >
            <View style={[styles.rowIcon, { backgroundColor: '#5856D6' }]}>
              <Ionicons name="document-text" size={18} color="#fff" />
            </View>
            <Text style={styles.rowLabel}>내가 쓴 글 / 민원 내역</Text>
            <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* ── Section 3: Account Info ── */}
        <Text style={styles.sectionLabel}>계정 정보</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('ChangePassword', { userId })}
          >
            <View style={[styles.rowIcon, { backgroundColor: '#34C759' }]}>
              <Ionicons name="lock-closed" size={18} color="#fff" />
            </View>
            <Text style={styles.rowLabel}>비밀번호 변경</Text>
            <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* ── Section 4: App Settings ── */}
        <Text style={styles.sectionLabel}>앱 설정</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: '#FF9500' }]}>
              <Ionicons name="notifications" size={18} color="#fff" />
            </View>
            <Text style={styles.rowLabel}>푸시 알림 설정</Text>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* ── Section 5: Support & Legal ── */}
        <Text style={styles.sectionLabel}>고객센터 & 약관</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('SystemNotice')}
          >
            <View style={[styles.rowIcon, { backgroundColor: '#007AFF' }]}>
              <Ionicons name="megaphone" size={18} color="#fff" />
            </View>
            <Text style={styles.rowLabel}>공지사항</Text>
            <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('CustomerCenter')}
          >
            <View style={[styles.rowIcon, { backgroundColor: '#34C759' }]}>
              <Ionicons name="help-circle" size={18} color="#fff" />
            </View>
            <Text style={styles.rowLabel}>고객센터 (자주 묻는 질문)</Text>
            <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.row}
            onPress={() => Alert.alert('준비 중입니다. (웹사이트 연동 예정)')}
          >
            <View style={[styles.rowIcon, { backgroundColor: '#8E8E93' }]}>
              <Ionicons name="document" size={18} color="#fff" />
            </View>
            <Text style={styles.rowLabel}>이용약관</Text>
            <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.row}
            onPress={() => Alert.alert('준비 중입니다. (웹사이트 연동 예정)')}
          >
            <View style={[styles.rowIcon, { backgroundColor: '#8E8E93' }]}>
              <Ionicons name="shield-checkmark" size={18} color="#fff" />
            </View>
            <Text style={styles.rowLabel}>개인정보처리방침</Text>
            <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* ── Section 6: Danger Zone ── */}
        <Text style={styles.sectionLabel}>계정 관리</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <View style={[styles.rowIcon, { backgroundColor: '#FF3B30' }]}>
              <Ionicons name="log-out" size={18} color="#fff" />
            </View>
            <Text style={[styles.rowLabel, { color: '#FF3B30' }]}>로그아웃</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.row} onPress={handleWithdraw}>
            <View style={[styles.rowIcon, { backgroundColor: '#8E8E93' }]}>
              <Ionicons name="person-remove" size={18} color="#fff" />
            </View>
            <Text style={[styles.rowLabel, { color: '#8E8E93' }]}>회원 탈퇴</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Villamate v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollContent: { paddingBottom: 48 },

  // Header
  header: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  headerName: { fontSize: 22, fontWeight: '800', color: '#1C1C1E', marginBottom: 10 },
  headerMeta: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: '#E5E5EA',
  },
  chipAdmin: { backgroundColor: '#007AFF' },
  chipResident: { backgroundColor: '#5856D6' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#3A3A3C' },
  headerContact: { fontSize: 14, color: '#8E8E93', marginTop: 4 },

  // Sections
  sectionLabel: {
    fontSize: 13, fontWeight: '600', color: '#8E8E93',
    paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  rowIcon: {
    width: 32, height: 32, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  rowLabel: { flex: 1, fontSize: 16, color: '#1C1C1E', fontWeight: '500' },
  separator: { height: 1, backgroundColor: '#F2F2F7', marginLeft: 62 },

  version: {
    textAlign: 'center', fontSize: 12, color: '#C7C7CC', marginTop: 32,
  },
});

export default ProfileScreen;
