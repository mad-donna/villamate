import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

const LoginScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>빌라매니저</Text>
        <Text style={styles.subtitle}>스마트한 빌라 관리 파트너</Text>
        
        <TouchableOpacity 
          style={styles.kakaoButton}
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={styles.kakaoButtonText}>카카오 로그인 시작하기</Text>
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
  kakaoButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FEE500',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kakaoButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#191919',
  },
});

export default LoginScreen;
