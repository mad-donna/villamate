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
import ExternalBillingScreen from '../screens/ExternalBillingScreen';
import CreatePollScreen from '../screens/CreatePollScreen';
import PollListScreen from '../screens/PollListScreen';
import PollDetailScreen from '../screens/PollDetailScreen';
import VehicleManagementScreen from '../screens/VehicleManagementScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import MyPostsScreen from '../screens/MyPostsScreen';
import GuideScreen from '../screens/GuideScreen';
import GuideLibraryScreen from '../screens/GuideLibraryScreen';
import GuideDetailScreen from '../screens/GuideDetailScreen';
import NotificationScreen from '../screens/NotificationScreen';
import SignupAgreementScreen from '../screens/SignupAgreementScreen';
import SignupProfileScreen from '../screens/SignupProfileScreen';
import SelectRoleScreen from '../screens/SelectRoleScreen';
import VillaSearchScreen from '../screens/VillaSearchScreen';
import SystemNoticeScreen from '../screens/SystemNoticeScreen';
import CustomerCenterScreen from '../screens/CustomerCenterScreen';
import ResidentInvoiceScreen from '../screens/ResidentInvoiceScreen';
import ContractDetailScreen from '../screens/ContractDetailScreen';
import AdminSubscriptionScreen from '../screens/AdminSubscriptionScreen';
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
      {/* Role selection — shown after signup profile is complete */}
      <Stack.Screen
        name="SelectRole"
        component={SelectRoleScreen}
        options={{ headerShown: false }}
      />
      {/* Resident villa search — for '일반 입주민' path */}
      <Stack.Screen
        name="VillaSearch"
        component={VillaSearchScreen}
        options={{ headerShown: false }}
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
        name="ContractDetail"
        component={ContractDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateBuildingEvent"
        component={CreateBuildingEventScreen}
        options={{ title: '이력 등록' }}
      />
      <Stack.Screen
        name="ExternalBilling"
        component={ExternalBillingScreen}
        options={{ title: '외부 청구 관리' }}
      />
      <Stack.Screen
        name="CreatePoll"
        component={CreatePollScreen}
        options={{ title: '투표 생성' }}
      />
      <Stack.Screen
        name="PollList"
        component={PollListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PollDetail"
        component={PollDetailScreen}
        options={{ title: '투표 상세' }}
      />
      <Stack.Screen
        name="VehicleManagement"
        component={VehicleManagementScreen}
        options={{ title: '내 차량 관리' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: '비밀번호 변경' }}
      />
      <Stack.Screen
        name="MyPosts"
        component={MyPostsScreen}
        options={{ title: '내가 쓴 글 / 민원 내역' }}
      />
      <Stack.Screen
        name="Guide"
        component={GuideScreen}
        options={{ title: '이용 가이드' }}
      />
      <Stack.Screen
        name="GuideLibrary"
        component={GuideLibraryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GuideDetail"
        component={GuideDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{ title: '알림함' }}
      />
      <Stack.Screen
        name="SystemNotice"
        component={SystemNoticeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CustomerCenter"
        component={CustomerCenterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignupAgreement"
        component={SignupAgreementScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignupProfile"
        component={SignupProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResidentInvoice"
        component={ResidentInvoiceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminSubscription"
        component={AdminSubscriptionScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
