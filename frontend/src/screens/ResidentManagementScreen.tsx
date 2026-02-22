import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';

const residents = [
  { id: '1', name: '김철수', unit: '101호' },
  { id: '2', name: '이영희', unit: '202호' },
];

const ResidentManagementScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>입주민 관리</Text>
        <FlatList
          data={residents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.residentItem}>
              <Text style={styles.residentName}>{item.name}</Text>
              <Text style={styles.residentUnit}>{item.unit}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>등록된 입주민이 없습니다.</Text>}
        />
        <TouchableOpacity style={styles.inviteButton}>
          <Text style={styles.inviteButtonText}>입주민 초대하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  residentItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  residentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  residentUnit: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  inviteButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResidentManagementScreen;
