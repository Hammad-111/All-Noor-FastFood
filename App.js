
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import SplashScreen from './src/screens/SplashScreen';
import { CartProvider } from './src/context/CartContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ToastProvider } from './src/context/ToastContext';
import { AuthProvider } from './src/context/AuthContext';
import TabNavigator from './src/navigation/TabNavigator';
import SettingDetailScreen from './src/screens/SettingDetailScreen';
import LoginScreen from './src/screens/LoginScreen';
import DeveloperPortfolioScreen from './src/screens/DeveloperPortfolioScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import Toast from './src/components/Toast';
import { View } from 'react-native';
import { useAuth } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  const { user, loading } = useAuth();
  const { colors } = useTheme();
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
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {showSplash ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : !user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="SettingDetail" component={SettingDetailScreen} />
          <Stack.Screen name="DeveloperPortfolio" component={DeveloperPortfolioScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const AppContent = () => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.surface,
            text: colors.text,
            border: colors.glassBorder,
            notification: colors.accent,
          },
          fonts: {
            regular: { fontFamily: 'System', fontWeight: '400' },
            medium: { fontFamily: 'System', fontWeight: '500' },
            bold: { fontFamily: 'System', fontWeight: '700' },
            heavy: { fontFamily: 'System', fontWeight: '900' },
          },
        }}
        documentTitle={{
          formatter: (options, route) => `Al Noor Fast Food - ${route?.name || 'Loading'}`,
        }}
      >
        <AppStack />
      </NavigationContainer>
      <Toast />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <CartProvider>
                <AppContent />
              </CartProvider>
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
