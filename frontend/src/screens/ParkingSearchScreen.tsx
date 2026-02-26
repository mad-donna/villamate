import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE_URL = 'http://192.168.219.108:3000';

interface SearchResult {
  id: string;
  plateNumber: string;
  isVisitor: boolean;
  expectedDeparture: string | null;
  owner: { name: string; roomNumber: string | null };
}

const ParkingSearchScreen = ({ route, navigation }: any) => {
  const { villaId } = route.params ?? {};

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!villaId) return Alert.alert('오류', '빌라 정보를 불러올 수 없습니다.');
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/villas/${villaId}/vehicles/search?query=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch (e) {
      Alert.alert('오류', '검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDeparture = (dt: string | null) => {
    if (!dt) return '';
    try {
      const d = new Date(dt);
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${month}/${day} ${hours}:${mins}`;
    } catch {
      return dt;
    }
  };

  const renderResult = ({ item }: { item: SearchResult }) => {
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
        <Text style={styles.ownerText}>{ownerLabel}</Text>
        {item.isVisitor && item.expectedDeparture ? (
          <Text style={styles.departureText}>출발 예정: {formatDeparture(item.expectedDeparture)}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="차량 번호 검색"
          placeholderTextColor="#C7C7CC"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.searchButtonText}>검색</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Results */}
      {!searched ? (
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>차량 번호를 검색하세요</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderResult}
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
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1C1C1E',
    backgroundColor: '#F8F9FA',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#A8C7FA',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
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
    marginBottom: 8,
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
  instructionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#8E8E93',
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
