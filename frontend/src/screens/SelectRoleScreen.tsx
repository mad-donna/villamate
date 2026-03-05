import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SelectRoleScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>어떤 자격으로{'\n'}시작하시겠습니까?</Text>
          <Text style={styles.subtitle}>선택하신 유형에 따라 서비스 이용 방식이 달라집니다.</Text>
        </View>

        <View style={styles.cards}>
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('VillaSearch')}
          >
            <Text style={styles.cardEmoji}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.cardTitle}>일반 입주민</Text>
            <Text style={styles.cardDesc}>기존 단지 검색 및 참여</Text>
            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={18} color="#007AFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.cardPrimary]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Onboarding')}
          >
            <Text style={styles.cardEmoji}>👑</Text>
            <Text style={[styles.cardTitle, styles.cardTitlePrimary]}>동대표</Text>
            <Text style={[styles.cardDesc, styles.cardDescPrimary]}>새로운 단지 신규 등록</Text>
            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await AsyncStorage.clear();
            navigation.replace('Login');
          }}
        >
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F3F7' },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 24 },

  header: { marginBottom: 40 },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1C1C1E',
    lineHeight: 38,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
  },

  cards: { gap: 16 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  cardPrimary: {
    backgroundColor: '#007AFF',
  },
  cardEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  cardTitlePrimary: { color: '#fff' },
  cardDesc: {
    fontSize: 14,
    color: '#8E8E93',
  },
  cardDescPrimary: { color: 'rgba(255,255,255,0.8)' },
  cardArrow: {
    position: 'absolute',
    right: 20,
    top: '50%',
  },

  logoutBtn: {
    marginTop: 'auto',
    paddingTop: 24,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 14,
    color: '#8E8E93',
    textDecorationLine: 'underline',
  },
});

export default SelectRoleScreen;
