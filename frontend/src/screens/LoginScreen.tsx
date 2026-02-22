import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

const LoginScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>빌라매니저</Text>
        <Text style={styles.subtitle}>스마트한 빌라 관리 파트너</Text>
        
        <TouchableOpacity 
          style={[styles.loginButton, { backgroundColor: '#007AFF' }]}
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={styles.loginButtonText}>동대표로 시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.loginButton, { backgroundColor: '#FEE500', marginTop: 12 }]}
          onPress={() => navigation.navigate('ResidentDashboard')}
        >
          <Text style={[styles.loginButtonText, { color: '#191919' }]}>입주민으로 시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 50,
  },
  loginButton: {
    width: '100%',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default LoginScreen;
