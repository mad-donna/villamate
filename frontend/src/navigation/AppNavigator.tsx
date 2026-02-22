import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import CreateInvoiceScreen from '../screens/CreateInvoiceScreen';
import ResidentDashboardScreen from '../screens/ResidentDashboardScreen';
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
    </Stack.Navigator>
  );
};

export default AppNavigator;
