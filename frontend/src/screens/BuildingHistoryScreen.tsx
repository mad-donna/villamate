import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.219.124:3000';

interface BuildingEvent {
  id: string;
  title: string;
  description: string | null;
  category: string;
  eventDate: string;
  contractorName: string | null;
  contactNumber: string | null;
  attachmentUrl: string | null;
  createdAt: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  '하자보수': { bg: '#FFF3E0', text: '#E65100' },
  '정기점검': { bg: '#E8F5E9', text: '#2E7D32' },
  '유지계약': { bg: '#E3F2FD', text: '#1565C0' },
  '청소': { bg: '#F3E5F5', text: '#6A1B9A' },
  '기타': { bg: '#F5F5F5', text: '#424242' },
};

const getCategoryStyle = (category: string) =>
  CATEGORY_COLORS[category] ?? { bg: '#F5F5F5', text: '#424242' };

const BuildingHistoryScreen = ({ navigation }: any) => {
  const [events, setEvents] = useState<BuildingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [villaId, setVillaId] = useState<number | null>(null);

  const resolveVillaId = useCallback(async (): Promise<number | null> => {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      if (user?.villa?.id) return user.villa.id;
      const uid = user.id;
      if (uid) {
        const res = await fetch(`${API_BASE_URL}/api/villas/${uid}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) return data[0].id;
        }
      }
    }
    return null;
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      let vid = villaId;
      if (!vid) {
        vid = await resolveVillaId();
        if (!vid) {
          Alert.alert('오류', '빌라 정보를 불러올 수 없습니다.');
          setLoading(false);
          return;
        }
        setVillaId(vid);
      }
      const res = await fetch(`${API_BASE_URL}/api/villas/${vid}/building-events`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert('오류', '이력을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [villaId, resolveVillaId]);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents])
  );

  const handleAdd = async () => {
    let vid = villaId;
    if (!vid) {
      vid = await resolveVillaId();
      if (!vid) {
        Alert.alert('오류', '빌라 정보를 불러올 수 없습니다.');
        return;
      }
      setVillaId(vid);
    }
    navigation.navigate('CreateBuildingEvent', { villaId: vid });
  };

  const renderEvent = ({ item }: { item: BuildingEvent }) => {
    const catStyle = getCategoryStyle(item.category);
    return (
      <View style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
            <Text style={[styles.categoryText, { color: catStyle.text }]}>{item.category}</Text>
          </View>
          <Text style={styles.eventDate}>{item.eventDate}</Text>
        </View>
        <Text style={styles.eventTitle}>{item.title}</Text>
        {item.description ? (
          <Text style={styles.eventDesc}>{item.description}</Text>
        ) : null}
        {(item.contractorName || item.contactNumber) ? (
          <View style={styles.contractorRow}>
            {item.contractorName ? (
              <Text style={styles.contractorText}>업체: {item.contractorName}</Text>
            ) : null}
            {item.contactNumber ? (
              <Text style={styles.contractorText}>연락처: {item.contactNumber}</Text>
            ) : null}
          </View>
        ) : null}
        {item.attachmentUrl ? (
          <Image
            source={{ uri: item.attachmentUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>건물 이력 및 계약 관리</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd} activeOpacity={0.85}>
          <Text style={styles.addButtonText}>+ 이력 등록</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>이력 불러오는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>등록된 이력이 없습니다.</Text>
              <Text style={styles.emptySubText}>하자보수, 정기점검, 계약 등을 기록해보세요.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#1C1C1E', marginBottom: 12 },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#8E8E93' },
  listContent: { padding: 16 },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: { fontSize: 12, fontWeight: '700' },
  eventDate: { fontSize: 13, color: '#8E8E93' },
  eventTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  eventDesc: { fontSize: 14, color: '#3A3A3C', lineHeight: 20, marginBottom: 8 },
  contractorRow: { marginTop: 8, gap: 2 },
  contractorText: { fontSize: 13, color: '#8E8E93' },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#3A3A3C', marginBottom: 6 },
  emptySubText: { fontSize: 13, color: '#8E8E93', textAlign: 'center' },
  thumbnail: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginTop: 10,
  },
});

export default BuildingHistoryScreen;
