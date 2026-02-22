import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import ResidentManagementScreen from '../screens/ResidentManagementScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tab.Screen 
        name="홈" 
        component={DashboardScreen} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="입주민 관리" 
        component={ResidentManagementScreen} 
        options={{ title: '입주민 관리' }}
      />
      <Tab.Screen 
        name="내 정보" 
        component={ProfileScreen} 
        options={{ title: '내 정보' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
