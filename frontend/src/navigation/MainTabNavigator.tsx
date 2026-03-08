import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import CommunityTabScreen from '../screens/CommunityTabScreen';
import ManagementScreen from '../screens/ManagementScreen';
import LedgerTabScreen from '../screens/LedgerTabScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === '홈') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === '관리') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === '커뮤니티') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === '장부') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === '프로필') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="홈" component={DashboardScreen} />
      <Tab.Screen name="관리" component={ManagementScreen} />
      <Tab.Screen name="커뮤니티" component={CommunityTabScreen} />
      <Tab.Screen name="장부" component={LedgerTabScreen} />
      <Tab.Screen name="프로필" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
