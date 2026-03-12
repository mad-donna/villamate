import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_BASE_URL } from '../config';
import { navigationRef } from './navigationRef';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor: attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Guard flag: prevents concurrent / re-entrant SUBSCRIPTION_EXPIRED redirects.
// Without this flag, navigating FROM AdminSubscription to Main causes DashboardScreen
// to mount and fire API calls that also return 403, triggering an infinite redirect loop.
let isHandlingSubscriptionExpiry = false;

// Response interceptor: handle global HTTP error codes
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.error;

    if (status === 401) {
      // Clear all auth data and redirect to Login
      await AsyncStorage.multiRemove(['token', 'userId', 'user']);
      if (navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } else if (status === 403 && errorCode === 'SUBSCRIPTION_EXPIRED') {
      // Don't re-trigger if the user is already on the subscription screen
      if (navigationRef.isReady()) {
        const currentRoute = navigationRef.getCurrentRoute();
        if (currentRoute?.name === 'AdminSubscription') {
          return Promise.reject(error);
        }
      }

      // Don't re-trigger if we are already in the middle of handling this redirect.
      // This prevents the infinite loop: AdminSubscription → goToAdminHome (Main) →
      // DashboardScreen mounts → 403 again → redirect fires again → loop.
      if (isHandlingSubscriptionExpiry) {
        return Promise.reject(error);
      }
      isHandlingSubscriptionExpiry = true;

      // Retrieve villaId from AsyncStorage to navigate to the subscription screen
      let villaId: number | undefined;
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          villaId = user?.villa?.id;
        }
        if (!villaId) {
          // Fallback: resolve villaId for admin users via raw fetch
          // (NOT api.get — avoids triggering this interceptor again in an infinite loop)
          try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('token');
            if (userId && token) {
              const r = await fetch(`${API_BASE_URL}/api/villas/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (r.ok) {
                const data = await r.json();
                // GET /api/villas/:adminId returns an array of villas
                if (Array.isArray(data) && data.length > 0) {
                  villaId = data[0].id;
                } else if (data && data.id) {
                  villaId = data.id;
                }
              }
            }
          } catch {
            // ignore — will navigate without villaId
          }
        }
      } catch {
        // ignore parse errors
      }

      Alert.alert(
        '구독 만료 알림',
        '서비스 연장을 위해 결제 화면으로 이동합니다.',
        [
          {
            text: '확인',
            onPress: () => {
              if (navigationRef.isReady()) {
                // Use reset (not navigate) so AdminSubscription has no back history.
                // index: 0 means Main is NOT in the back stack — the user cannot go
                // back to Main from here, preventing another 403 on back-press.
                navigationRef.reset({
                  index: 0,
                  routes: [
                    { name: 'AdminSubscription', params: villaId ? { villaId } : {} },
                  ],
                });
              }
              // Reset the guard after navigation has been dispatched so that a
              // fresh SUBSCRIPTION_EXPIRED error (e.g. after re-login) is handled.
              isHandlingSubscriptionExpiry = false;
            },
          },
        ],
        { cancelable: false }
      );
    }

    return Promise.reject(error);
  }
);

export default api;
