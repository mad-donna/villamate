import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config';

interface Faq {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

const CustomerCenterScreen = ({ navigation }: any) => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/faqs`)
      .then((r) => r.json())
      .then((data) => setFaqs(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>고객센터</Text>
          <View style={{ width: 40 }} />
        </View>
        <ActivityIndicator style={{ flex: 1 }} color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>고객센터</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.introBox}>
        <Text style={styles.introTitle}>자주 묻는 질문</Text>
        <Text style={styles.introSub}>항목을 탭하면 답변을 확인할 수 있습니다.</Text>
      </View>

      {faqs.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="help-circle-outline" size={48} color="#C7C7CC" />
          <Text style={styles.emptyText}>등록된 FAQ가 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={faqs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isExpanded = expandedId === item.id;
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.7}
              >
                {/* Question row */}
                <View style={styles.questionRow}>
                  <Text style={styles.qMark}>Q</Text>
                  <Text style={styles.questionText}>{item.question}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#8E8E93"
                  />
                </View>

                {/* Answer (expanded) */}
                {isExpanded && (
                  <View style={styles.answerRow}>
                    <Text style={styles.aMark}>A</Text>
                    <Text style={styles.answerText}>{item.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1C1C1E' },
  introBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  introTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  introSub: { fontSize: 13, color: '#8E8E93' },
  list: { padding: 16, gap: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  questionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  qMark: {
    fontSize: 13, fontWeight: '800', color: '#007AFF',
    backgroundColor: '#EBF4FF', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
    overflow: 'hidden',
  },
  questionText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1C1C1E', lineHeight: 22 },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  aMark: {
    fontSize: 13, fontWeight: '800', color: '#34C759',
    backgroundColor: '#EDFAF1', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
    overflow: 'hidden',
  },
  answerText: { flex: 1, fontSize: 14, color: '#3A3A3C', lineHeight: 22 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 15, color: '#8E8E93' },
});

export default CustomerCenterScreen;
