import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';

const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>내 정보</Text>
        <View style={styles.profileCard}>
          <Text style={styles.label}>이름</Text>
          <Text style={styles.value}>홍길동 (대표자)</Text>
          
          <Text style={[styles.label, { marginTop: 20 }]}>이메일</Text>
          <Text style={styles.value}>admin@villamate.com</Text>
        </View>
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
  profileCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    color: '#1C1C1E',
    fontWeight: '500',
  },
});

export default ProfileScreen;
