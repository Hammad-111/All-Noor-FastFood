import React from 'react';

import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const TabItem = ({ route, options, isFocused, onPress, getIcon }) => {
    const scaleAnim = React.useRef(new Animated.Value(isFocused ? 1.2 : 1)).current;

    React.useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: isFocused ? 1.2 : 1,
            useNativeDriver: Platform.OS !== 'web',
            friction: 8,
            tension: 40,
        }).start();
    }, [isFocused]);

    const { t, language } = useLanguage();
    const label = options.tabBarLabel === 'Home' ? t('home') :
        options.tabBarLabel === 'Cart' ? t('cart') :
            options.tabBarLabel === 'Profile' ? t('profile') :
                options.tabBarLabel === 'Favorites' ? (t('favorites') || (language === 'ur' ? 'پسندیدہ' : 'Favorites')) :
                    options.tabBarLabel || route.name;

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={1}
        >
            <Animated.View
                style={[
                    styles.iconContainer,
                    { transform: [{ scale: scaleAnim }] }
                ]}
            >
                <Text style={[
                    styles.icon,
                    { color: isFocused ? COLORS.secondary : 'rgba(255,255,255,0.4)' }
                ]}>
                    {getIcon(route.name)}
                </Text>
            </Animated.View>
            {isFocused && (
                <Text style={styles.label}>
                    {label}
                </Text>
            )}

            {route.name === 'CartTab' && options.tabBarBadge > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{options.tabBarBadge}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();
    const translateX = React.useRef(new Animated.Value(0)).current;
    const rotateAnim = React.useRef(new Animated.Value(0)).current;

    const tabCount = state.routes.length;
    const paddingHorizontal = 15;
    const availableWidth = (width - 24) - (paddingHorizontal * 2);
    const tabWidth = availableWidth / tabCount;

    React.useEffect(() => {
        // Sliding animation with bouncy spring
        Animated.spring(translateX, {
            toValue: state.index * tabWidth,
            useNativeDriver: true,
            friction: 7,
            tension: 60,
        }).start();

        // Border rotation animation
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 6000,
                useNativeDriver: true,
            })
        ).start();
    }, [state.index, tabWidth]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            {/* Animated Masterpiece Border Wrapper */}
            <View style={styles.tabBarMainWrapper}>
                <Animated.View style={[styles.rotatingBorder, { transform: [{ rotate: spin }] }]}>
                    <LinearGradient
                        colors={['transparent', 'rgba(255, 215, 0, 0.25)', 'transparent', 'rgba(255, 255, 255, 0.15)', 'transparent']}
                        style={styles.fullSize}
                    />
                </Animated.View>

                <BlurView intensity={95} tint="dark" style={styles.tabBar}>
                    {/* Sliding Plasma Glow Indicator */}
                    <Animated.View
                        style={[
                            styles.slidingGlowContainer,
                            {
                                width: tabWidth,
                                transform: [{ translateX }]
                            }
                        ]}
                    >
                        <LinearGradient
                            colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 215, 0, 0.18)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.glowGradient}
                        />
                        <View style={styles.plasmaGlow} />
                    </Animated.View>

                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

                        const getIcon = (name) => {
                            switch (name) {
                                case 'HomeTab': return '🏠';
                                case 'FavoritesTab': return '⭐';
                                case 'CartTab': return '🛒';
                                case 'ProfileTab': return '👤';
                                default: return '❓';
                            }
                        };

                        return (
                            <TabItem
                                key={route.key}
                                route={route}
                                options={options}
                                isFocused={isFocused}
                                onPress={onPress}
                                getIcon={getIcon}
                            />
                        );
                    })}
                </BlurView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1000,
        paddingHorizontal: 12,
    },
    tabBarMainWrapper: {
        width: '100%',
        borderRadius: 35,
        overflow: 'hidden',
        padding: 1.5, // The border thickness
        backgroundColor: 'rgba(255,255,255,0.05)',
        elevation: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    rotatingBorder: {
        position: 'absolute',
        width: '200%',
        height: '200%',
        top: '-50%',
        left: '-50%',
    },
    fullSize: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        height: 68,
        paddingHorizontal: 15,
        backgroundColor: 'rgba(10, 15, 30, 0.75)',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderRadius: 33.5, // Slightly smaller than wrapper
        overflow: 'hidden',
    },
    slidingGlowContainer: {
        position: 'absolute',
        height: 48,
        top: 10,
        left: 15,
        borderRadius: 24,
        overflow: 'hidden',
        // Outer plasma glow
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    plasmaGlow: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.2)',
    },
    glowGradient: {
        flex: 1,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 22,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.accent,
        marginTop: 2,
    },
    badge: {
        position: 'absolute',
        top: 12,
        right: '20%',
        backgroundColor: COLORS.accent,
        borderRadius: 9,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1E293B',
    },
    badgeText: {
        color: '#000',
        fontSize: 10,
        fontWeight: '900',
    }
});

export default CustomTabBar;
