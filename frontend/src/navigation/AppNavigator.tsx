import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import EmailLoginScreen from '../screens/EmailLoginScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import CreateInvoiceScreen from '../screens/CreateInvoiceScreen';
import AdminInvoiceScreen from '../screens/AdminInvoiceScreen';
import PaymentScreen from '../screens/PaymentScreen';
import ResidentJoinScreen from '../screens/ResidentJoinScreen';
import LedgerScreen from '../screens/LedgerScreen';
import AdminInvoiceDetailScreen from '../screens/AdminInvoiceDetailScreen';
import BoardScreen from '../screens/BoardScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import ResidentManagementScreen from '../screens/ResidentManagementScreen';
import ParkingSearchScreen from '../screens/ParkingSearchScreen';
import BuildingHistoryScreen from '../screens/BuildingHistoryScreen';
import CreateBuildingEventScreen from '../screens/CreateBuildingEventScreen';
import MainTabNavigator from './MainTabNavigator';
import ResidentTabNavigator from './ResidentTabNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EmailLogin"
        component={EmailLoginScreen}
        options={{ title: '이메일 로그인', headerShown: false }}
      />
      <Stack.Screen
        name="ProfileSetup"
        component={ProfileSetupScreen}
        options={{ title: '프로필 설정', headerShown: false }}
      />
      {/* Admin tab navigator */}
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      {/* Resident tab navigator — all existing 'ResidentDashboard' navigations land here */}
      <Stack.Screen
        name="ResidentDashboard"
        component={ResidentTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ title: '빌라 등록' }}
      />
      <Stack.Screen
        name="CreateInvoice"
        component={CreateInvoiceScreen}
        options={{ title: '청구서 발행' }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResidentJoin"
        component={ResidentJoinScreen}
        options={{ title: '빌라 입장' }}
      />
      <Stack.Screen
        name="Ledger"
        component={LedgerScreen}
        options={{ title: '공용 장부' }}
      />
      <Stack.Screen
        name="AdminInvoice"
        component={AdminInvoiceScreen}
        options={{ title: '청구서 관리' }}
      />
      <Stack.Screen
        name="AdminInvoiceDetail"
        component={AdminInvoiceDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Board"
        component={BoardScreen}
        options={{ title: '커뮤니티' }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ title: '게시글 작성' }}
      />
      <Stack.Screen
        name="ResidentManagement"
        component={ResidentManagementScreen}
        options={{ title: '입주민 관리' }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ title: '게시글' }}
      />
      <Stack.Screen
        name="ParkingSearch"
        component={ParkingSearchScreen}
        options={{ title: '주차 조회' }}
      />
      <Stack.Screen
        name="BuildingHistory"
        component={BuildingHistoryScreen}
        options={{ title: '건물 이력 및 계약 관리' }}
      />
      <Stack.Screen
        name="CreateBuildingEvent"
        component={CreateBuildingEventScreen}
        options={{ title: '이력 등록' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
