
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import SplashScreen from './src/screens/SplashScreen';
import { COLORS } from './src/constants/theme';
import { CartProvider } from './src/context/CartContext';
import { LanguageProvider } from './src/context/LanguageContext';
import TabNavigator from './src/navigation/TabNavigator';
import SettingDetailScreen from './src/screens/SettingDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <CartProvider>
          <NavigationContainer>
            <StatusBar style="light" backgroundColor={COLORS.primary} />
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.background },
              }}
              initialRouteName="Splash"
            >
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
              <Stack.Screen name="SettingDetail" component={SettingDetailScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </CartProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
