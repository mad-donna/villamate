import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import AdminInvoiceScreen from '../screens/AdminInvoiceScreen';
import ResidentManagementScreen from '../screens/ResidentManagementScreen';
import LedgerScreen from '../screens/LedgerScreen';
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
          } else if (route.name === '청구') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === '입주민') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === '공용 장부') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === '프로필') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="홈" component={DashboardScreen} />
      <Tab.Screen name="청구" component={AdminInvoiceScreen} />
      <Tab.Screen name="입주민" component={ResidentManagementScreen} />
      <Tab.Screen name="공용 장부" component={LedgerScreen} />
      <Tab.Screen name="프로필" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
