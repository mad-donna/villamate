import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

const CATEGORIES: { key: string; label: string }[] = [
  { key: 'COMMON_FACILITY', label: '공용시설 파손/고장' },
  { key: 'PARKING',         label: '주차/차량 문제' },
  { key: 'NOISE_COMPLAINT', label: '층간소음/이웃 민원' },
  { key: 'ETC',             label: '기타' },
];

const CreateTicketScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { villaId } = route.params ?? {};

  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!category) {
      Alert.alert('알림', '카테고리를 선택해주세요.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    let residentId: string | null = null;
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) residentId = JSON.parse(userJson).id ?? null;
    if (!residentId) {
      Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/api/villas/${villaId}/tickets`, {
        title: title.trim(),
        description: description.trim(),
        category,
        residentId,
      });
      Alert.alert('접수 완료', '민원이 접수되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('오류', e.message || '요청 접수 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#F7F7F7' }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        enableOnAndroid
        extraHeight={120}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSection}>
          <Text style={styles.screenTitle}>민원 및 수리 요청 접수</Text>
          <Text style={styles.subtitle}>불편사항이나 수리가 필요한 내용을 알려주세요.</Text>
        </View>

        <View style={styles.formCard}>
          {/* Category */}
          <Text style={styles.label}>카테고리</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryChip,
                  category === cat.key && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat.key)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat.key && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Title */}
          <Text style={[styles.label, { marginTop: 20 }]}>제목</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 1층 공동현관 센서등 고장"
            placeholderTextColor="#B0B0B0"
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            maxLength={100}
          />

          {/* Description */}
          <Text style={[styles.label, { marginTop: 16 }]}>내용</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="예: 1층 공동현관 센서등이 어젯밤부터 켜지지 않습니다. 조치 부탁드립니다."
            placeholderTextColor="#B0B0B0"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>
      </KeyboardAwareScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={{
            padding: 16,
            paddingBottom: Math.max(insets.bottom + 16, 24),
            backgroundColor: '#F7F7F7',
          }}
        >
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>접수하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerSection: { marginBottom: 24, paddingHorizontal: 8 },
  screenTitle: { fontSize: 26, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#8E8E93', lineHeight: 20 },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6E6E73',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    backgroundColor: '#F8F9FA',
  },
  categoryChipActive: { backgroundColor: '#FF9500', borderColor: '#FF9500' },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: '#8E8E93' },
  categoryChipTextActive: { color: '#fff' },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: '#FAFAFA',
  },
  textArea: { height: 120, paddingTop: 14, paddingBottom: 14 },
  submitButton: {
    backgroundColor: '#FF9500',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold', letterSpacing: 0.3 },
});

export default CreateTicketScreen;
