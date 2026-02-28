import React, { useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import BoardScreen from './BoardScreen';
import { API_BASE_URL } from '../config';


/**
 * CommunityTabScreen is a thin wrapper that resolves villaId and userId
 * from AsyncStorage (for admin) and renders BoardScreen inline as a tab screen.
 * This avoids needing to pass dynamic params via initialParams at navigator creation.
 */
const CommunityTabScreen = ({ navigation }: any) => {
  const [villaId, setVillaId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const resolveParams = useCallback(async () => {
    try {
      setLoading(true);

      // Resolve userId
      let resolvedUserId = await AsyncStorage.getItem('userId');
      if (!resolvedUserId) {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          resolvedUserId = user.id;
          if (resolvedUserId) await AsyncStorage.setItem('userId', resolvedUserId);
        }
      }
      if (!resolvedUserId) return;

      setUserId(resolvedUserId);

      // Resolve villaId for admin
      const response = await fetch(`${API_BASE_URL}/api/villas/${resolvedUserId}`);
      if (!response.ok) return;

      const villas = await response.json();
      if (Array.isArray(villas) && villas.length > 0) {
        setVillaId(villas[0].id);
      }
    } catch (err) {
      console.error('CommunityTabScreen resolveParams error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      resolveParams();
    }, [resolveParams])
  );

  if (loading || villaId === null || userId === null) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <View style={styles.loadingInner}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  // Build a fake route object that BoardScreen expects
  const fakeRoute = {
    params: { villaId, userId, userRole: 'ADMIN' },
  };

  return <BoardScreen navigation={navigation} route={fakeRoute} />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  loadingInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommunityTabScreen;
