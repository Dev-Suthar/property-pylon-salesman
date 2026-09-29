import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { theme } from '../theme/colors';
import { fonts } from '../theme/typography';
import PopTabBar from '../components/design/PopTabBar';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import CompanyHistoryScreen from '../screens/CompanyHistoryScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <PopTabBar {...props} />}
      sceneContainerStyle={{ backgroundColor: theme.background }}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerShadowVisible: false,
        headerTintColor: theme.foreground,
        headerTitleStyle: {
          fontFamily: fonts.display,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerShown: false, // Dashboard has its own custom header with logout
        }}
      />
      <Tab.Screen
        name="CompanyHistory"
        component={CompanyHistoryScreen}
        options={{
          title: 'History',
          headerShown: false, // CompanyHistoryScreen has its own custom header
        }}
      />
    </Tab.Navigator>
  );
}

