
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import CustomTabBar from '../components/CustomTabBar';
import { useCart } from '../context/CartContext';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    const { cart } = useCart();
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                }}
            />
            <Tab.Screen
                name="FavoritesTab"
                component={FavoritesScreen}
                options={{
                    tabBarLabel: 'Favorites',
                }}
            />
            <Tab.Screen
                name="CartTab"
                component={CheckoutScreen}
                options={{
                    tabBarLabel: 'Cart',
                    tabBarBadge: cartItemCount > 0 ? cartItemCount : null,
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;
