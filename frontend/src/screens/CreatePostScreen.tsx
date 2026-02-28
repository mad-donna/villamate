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
import { API_BASE_URL } from '../config';


const CreatePostScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { villaId, userId, userRole } = route.params ?? {};

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/villas/${villaId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          authorId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '등록 실패');
      }

      Alert.alert('등록 완료', '게시글이 등록되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      console.error('Create post error:', err);
      Alert.alert('오류', err.message || '게시글 등록 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#F7F7F7' }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        enableOnAndroid={true}
        extraHeight={120}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSection}>
          <Text style={styles.screenTitle}>게시글 작성</Text>
          <Text style={styles.subtitle}>커뮤니티에 공유할 내용을 입력해주세요.</Text>
        </View>

        <View style={styles.formCard}>
          {/* Title field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>제목</Text>
            <TextInput
              style={styles.input}
              placeholder="제목을 입력하세요"
              placeholderTextColor="#B0B0B0"
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
              maxLength={100}
            />
          </View>

          {/* Content field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>내용</Text>
            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="내용을 입력하세요"
              placeholderTextColor="#B0B0B0"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={5}
              returnKeyType="default"
              textAlignVertical="top"
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* Bottom Fixed Button */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={{
            padding: 16,
            paddingBottom: Math.max(insets.bottom + 16, 24),
            backgroundColor: '#F7F7F7',
          }}
        >
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>등록하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
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
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6E6E73',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
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
  contentInput: {
    height: 130,
    paddingTop: 14,
    paddingBottom: 14,
  },
  primaryButton: {
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
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CreatePostScreen;
