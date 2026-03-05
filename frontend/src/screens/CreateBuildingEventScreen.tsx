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
  Image,
  Switch,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../config';


const CATEGORIES = ['하자보수', '정기점검', '유지계약', '청소', '기타'];

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const CreateBuildingEventScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { villaId } = route.params ?? {};

  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [contractorName, setContractorName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [cost, setCost] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    const formData = new FormData();
    const filename = uri.split('/').pop() ?? 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('file', { uri, name: filename, type } as any);

    const res = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('이미지 업로드 실패');
    const data = await res.json();
    return data.fileUrl;
  };

  const handleSubmit = async () => {
    if (!category) {
      Alert.alert('알림', '카테고리를 선택해주세요.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    let creatorId: string | null = null;
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) creatorId = JSON.parse(userJson).id;
    if (!creatorId) {
      Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      setLoading(true);

      let attachmentUrl: string | null = null;
      if (imageUri) {
        attachmentUrl = await uploadImage(imageUri);
      }

      const res = await fetch(`${API_BASE_URL}/api/villas/${villaId}/building-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          category,
          eventDate: formatDate(eventDate),
          contractorName: contractorName.trim() || null,
          contactNumber: contactNumber.trim() || null,
          creatorId,
          attachmentUrl,
          isPublic,
          cost: cost ? Number(cost.replace(/[^0-9]/g, '')) : 0,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '등록 실패');
      }
      Alert.alert('등록 완료', '이력이 등록되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('오류', e.message || '이력 등록 중 문제가 발생했습니다.');
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
          <Text style={styles.screenTitle}>이력 등록</Text>
          <Text style={styles.subtitle}>건물 관련 이력과 계약 정보를 기록하세요.</Text>
        </View>

        <View style={styles.formCard}>
          {/* Category */}
          <Text style={styles.label}>카테고리</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.75}
              >
                <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Title */}
          <Text style={[styles.label, { marginTop: 20 }]}>제목</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 엘리베이터 정기점검 완료"
            placeholderTextColor="#B0B0B0"
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            maxLength={100}
          />

          {/* Description */}
          <Text style={[styles.label, { marginTop: 16 }]}>상세 내용 (선택)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="점검 내용, 특이사항 등을 기록하세요."
            placeholderTextColor="#B0B0B0"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Event Date */}
          <Text style={[styles.label, { marginTop: 16 }]}>날짜</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.datePickerText}>{formatDate(eventDate)}</Text>
            <Text style={styles.datePickerIcon}>📅</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={eventDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) setEventDate(selectedDate);
              }}
            />
          )}

          {/* Contractor */}
          <Text style={[styles.label, { marginTop: 16 }]}>업체명 (선택)</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 한국엘리베이터서비스"
            placeholderTextColor="#B0B0B0"
            value={contractorName}
            onChangeText={setContractorName}
            returnKeyType="next"
            maxLength={100}
          />

          {/* Contact */}
          <Text style={[styles.label, { marginTop: 16 }]}>업체 연락처 (선택)</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 02-1234-5678"
            placeholderTextColor="#B0B0B0"
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
            returnKeyType="done"
            maxLength={20}
          />

          {/* Cost */}
          <Text style={[styles.label, { marginTop: 16 }]}>비용 (원)</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 150000"
            placeholderTextColor="#B0B0B0"
            value={cost}
            onChangeText={setCost}
            keyboardType="numeric"
            returnKeyType="done"
            maxLength={12}
          />

          {/* Public Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelGroup}>
              <Text style={styles.toggleLabel}>입주민에게 공개</Text>
              <Text style={styles.toggleSub}>공개 시 입주민 앱에서 이 이력이 보입니다.</Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#fff"
            />
          </View>

          {/* Image Upload */}
          <Text style={[styles.label, { marginTop: 16 }]}>사진 첨부 (선택)</Text>
          <TouchableOpacity style={styles.imagePickerButton} onPress={handlePickImage} activeOpacity={0.8}>
            <Text style={styles.imagePickerText}>
              {imageUri ? '사진 변경' : '사진 선택'}
            </Text>
          </TouchableOpacity>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
          ) : null}
        </View>
      </KeyboardAwareScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ padding: 16, paddingBottom: Math.max(insets.bottom + 16, 24), backgroundColor: '#F7F7F7' }}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>이력 등록하기</Text>
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
  label: { fontSize: 13, fontWeight: '600', color: '#6E6E73', marginBottom: 8, letterSpacing: 0.3 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    backgroundColor: '#F8F9FA',
  },
  categoryChipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
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
  textArea: { height: 100, paddingTop: 14, paddingBottom: 14 },
  datePickerButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerText: { fontSize: 16, color: '#1C1C1E' },
  datePickerIcon: { fontSize: 18 },
  imagePickerButton: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F6FF',
  },
  imagePickerText: { fontSize: 15, color: '#007AFF', fontWeight: '600' },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginTop: 12,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold', letterSpacing: 0.3 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  toggleLabelGroup: { flex: 1, marginRight: 12 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#1C1C1E', marginBottom: 2 },
  toggleSub: { fontSize: 12, color: '#8E8E93' },
});

export default CreateBuildingEventScreen;
