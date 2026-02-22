
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
import { ToastProvider } from './src/context/ToastContext';
import { AuthProvider } from './src/context/AuthContext';
import TabNavigator from './src/navigation/TabNavigator';
import SettingDetailScreen from './src/screens/SettingDetailScreen';
import LoginScreen from './src/screens/LoginScreen';
import Toast from './src/components/Toast';
import { View } from 'react-native';
import { useAuth } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  const { user, loading } = useAuth();
  const [minimumSplashTimeDone, setMinimumSplashTimeDone] = React.useState(false);

  React.useEffect(() => {
    // Show splash for branding
    const timer = setTimeout(() => {
      setMinimumSplashTimeDone(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // While auth is checking OR splash is showing, STAY on SplashScreen
  const showSplash = loading || !minimumSplashTimeDone;

  return (
    <Stack.Navigator
      key={showSplash ? 'splash' : user ? 'main' : 'auth'}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      {showSplash ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : !user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
          <Stack.Screen name="SettingDetail" component={SettingDetailScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <View style={{ flex: 1, backgroundColor: COLORS.primary }}>
                <StatusBar style="light" backgroundColor={COLORS.primary} />
                <NavigationContainer
                  documentTitle={{
                    formatter: (options, route) => `Al Noor Fast Food - ${route?.name || 'Loading'}`,
                  }}
                >
                  <AppStack />
                </NavigationContainer>
                <Toast />
              </View>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
