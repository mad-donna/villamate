import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Switch, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config';

const CreatePollScreen = ({ navigation, route }: any) => {
  const { villaId, userId } = route.params ?? {};
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const handleAddOption = () => setOptions([...options, '']);
  const handleRemoveOption = (idx: number) => setOptions(options.filter((_, i) => i !== idx));
  const handleOptionChange = (text: string, idx: number) => {
    const next = [...options];
    next[idx] = text;
    setOptions(next);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return Alert.alert('오류', '투표 제목을 입력해주세요.');
    const filled = options.filter(o => o.trim());
    if (filled.length < 2) return Alert.alert('오류', '옵션을 최소 2개 입력해주세요.');
    if (endDate <= new Date()) return Alert.alert('오류', '종료일은 미래여야 합니다.');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/villas/${villaId}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, endDate: endDate.toISOString(), isAnonymous, creatorId: userId, options: filled }),
      });
      if (!res.ok) throw new Error('failed');
      navigation.goBack();
    } catch {
      Alert.alert('오류', '투표 생성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>투표 제목</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="투표 제목을 입력하세요" placeholderTextColor="#C7C7CC" />

          <Text style={styles.sectionTitle}>설명 (선택)</Text>
          <TextInput style={[styles.input, styles.multilineInput]} value={description} onChangeText={setDescription} placeholder="투표에 대한 설명을 입력하세요" placeholderTextColor="#C7C7CC" multiline numberOfLines={3} textAlignVertical="top" />

          <Text style={styles.sectionTitle}>투표 옵션</Text>
          {options.map((opt, idx) => (
            <View key={idx} style={styles.optionRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={opt}
                onChangeText={t => handleOptionChange(t, idx)}
                placeholder={`옵션 ${idx + 1}`}
                placeholderTextColor="#C7C7CC"
              />
              {options.length > 2 && (
                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveOption(idx)}>
                  <Ionicons name="close-circle" size={22} color="#FF3B30" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addOptionBtn} onPress={handleAddOption}>
            <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.addOptionText}>옵션 추가</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>투표 종료일</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={18} color="#007AFF" />
            <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={new Date()}
              onChange={(_: any, d?: Date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (d) setEndDate(d);
              }}
            />
          )}

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>익명 투표</Text>
            <Switch value={isAnonymous} onValueChange={setIsAnonymous} trackColor={{ true: '#007AFF' }} />
          </View>

          <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>투표 생성</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F3F7' },
  content: { padding: 20, paddingBottom: 48 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 20 },
  input: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1C1C1E', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  multilineInput: { height: 88, paddingTop: 14 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  removeBtn: { padding: 4 },
  addOptionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 },
  addOptionText: { color: '#007AFF', fontWeight: '600', fontSize: 15 },
  dateButton: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  dateButtonText: { fontSize: 16, color: '#1C1C1E', fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  switchLabel: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  submitBtn: { backgroundColor: '#007AFF', borderRadius: 16, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});

export default CreatePollScreen;
