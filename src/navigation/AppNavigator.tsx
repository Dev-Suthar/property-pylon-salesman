import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme/colors';

// Screens
import LoginScreen from '../screens/LoginScreen';
import OnboardCompanyScreen from '../screens/OnboardCompanyScreen';
import CompanyDetailsScreen from '../screens/CompanyDetailsScreen';

// Navigation
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('user');
      const isAuth = !!(authToken && userData);
      
      setIsAuthenticated((prev) => {
        if (prev !== isAuth) {
          console.log('Auth state changed:', isAuth);
          return isAuth;
        }
        return prev;
      });
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    const interval = setInterval(checkAuth, 500);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || isAuthenticated === null) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="OnboardCompany"
              component={OnboardCompanyScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="CompanyDetails"
              component={CompanyDetailsScreen}
              options={{ presentation: 'card' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

