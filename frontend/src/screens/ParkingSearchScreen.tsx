import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

const API_BASE_URL = 'http://192.168.219.124:3000';

interface VehicleItem {
  id: string;
  plateNumber: string;
  modelName: string | null;
  isVisitor: boolean;
  expectedDeparture: string | null;
  owner: { name: string; roomNumber: string | null };
}

const ParkingSearchScreen = ({ route }: any) => {
  const { villaId } = route.params ?? {};

  const [query, setQuery] = useState('');
  const [allVehicles, setAllVehicles] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAllVehicles = useCallback(async () => {
    if (!villaId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/villas/${villaId}/vehicles`);
      const data = await res.json();
      setAllVehicles(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert('오류', '차량 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  useFocusEffect(
    useCallback(() => {
      fetchAllVehicles();
    }, [fetchAllVehicles])
  );

  const filteredVehicles = query.trim()
    ? allVehicles.filter((v) =>
        v.plateNumber.replace(/\s/g, '').includes(query.trim().replace(/\s/g, ''))
      )
    : allVehicles;

  const renderItem = ({ item }: { item: VehicleItem }) => {
    const ownerLabel = item.owner.roomNumber
      ? `${item.owner.roomNumber}호 · ${item.owner.name}`
      : item.owner.name;

    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Text style={styles.plateNumber}>{item.plateNumber}</Text>
          <View style={[styles.badge, item.isVisitor ? styles.badgeVisitor : styles.badgeRegular]}>
            <Text style={styles.badgeText}>{item.isVisitor ? '방문차량' : '일반차량'}</Text>
          </View>
        </View>
        {item.modelName ? (
          <Text style={styles.modelName}>{item.modelName}</Text>
        ) : null}
        <Text style={styles.ownerText}>{ownerLabel}</Text>
        {item.isVisitor && item.expectedDeparture ? (
          <Text style={styles.departureText}>출차 예정: {item.expectedDeparture}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="차량 번호 검색"
          placeholderTextColor="#C7C7CC"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCapitalize="none"
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : filteredVehicles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {query.trim() ? '검색 결과가 없습니다.' : '등록된 차량이 없습니다.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredVehicles}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  searchBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchInput: {
    height: 46,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1C1C1E',
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  plateNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeRegular: {
    backgroundColor: '#E3F2FD',
  },
  badgeVisitor: {
    backgroundColor: '#FFF3E0',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3A3A3C',
  },
  modelName: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 6,
  },
  ownerText: {
    fontSize: 15,
    color: '#3A3A3C',
    fontWeight: '500',
  },
  departureText: {
    fontSize: 13,
    color: '#FF9500',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});

export default ParkingSearchScreen;
