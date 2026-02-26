import React, { useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import BoardScreen from './BoardScreen';

/**
 * ResidentCommunityTabScreen resolves villaId and userId for residents
 * from AsyncStorage (user.villa.id) then renders BoardScreen as a tab.
 */
const ResidentCommunityTabScreen = ({ navigation }: any) => {
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

      // Resolve villaId from stored user.villa
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const storedUser = JSON.parse(userStr);
        if (storedUser?.villa?.id) {
          setVillaId(storedUser.villa.id);
        }
      }
    } catch (err) {
      console.error('ResidentCommunityTabScreen resolveParams error:', err);
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

  const fakeRoute = {
    params: { villaId, userId, userRole: 'RESIDENT' },
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

export default ResidentCommunityTabScreen;
