import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import EmailLoginScreen from '../screens/EmailLoginScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import CreateInvoiceScreen from '../screens/CreateInvoiceScreen';
import AdminInvoiceScreen from '../screens/AdminInvoiceScreen';
import ResidentDashboardScreen from '../screens/ResidentDashboardScreen';
import PaymentScreen from '../screens/PaymentScreen';
import ResidentJoinScreen from '../screens/ResidentJoinScreen';
import LedgerScreen from '../screens/LedgerScreen';
import MainTabNavigator from './MainTabNavigator';

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
      <Stack.Screen 
        name="Main" 
        component={MainTabNavigator} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="ResidentDashboard" 
        component={ResidentDashboardScreen} 
        options={{ title: '마이 홈' }} 
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
        options={{ title: '결제하기' }} 
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
    </Stack.Navigator>
  );
};

export default AppNavigator;
