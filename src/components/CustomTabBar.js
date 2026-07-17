import React from 'react';

import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons as Icon } from '@expo/vector-icons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const getTabIcon = (routeName, isFocused) => {
    const icons = {
        HomeTab: isFocused ? 'home' : 'home-outline',
        FavoritesTab: isFocused ? 'heart' : 'heart-outline',
        CartTab: isFocused ? 'bag-handle' : 'bag-handle-outline',
        ProfileTab: isFocused ? 'person' : 'person-outline',
    };
    return icons[routeName] || 'ellipse-outline';
};

const TabItem = ({ route, options, isFocused, onPress }) => {
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
    const scaleAnim = React.useRef(new Animated.Value(isFocused ? 1.08 : 1)).current;

    React.useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: isFocused ? 1.08 : 1,
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
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
        >
            <Animated.View
                style={[
                    styles.iconContainer,
                    { transform: [{ scale: scaleAnim }] }
                ]}
            >
                <Icon
                    name={getTabIcon(route.name, isFocused)}
                    size={21}
                    color={isFocused ? colors.accent : colors.muted}
                />
            </Animated.View>
            <Text
                style={[
                    styles.label,
                    { color: isFocused ? colors.accent : colors.muted }
                ]}
                numberOfLines={1}
            >
                {label}
            </Text>

            {route.name === 'CartTab' && options.tabBarBadge > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{options.tabBarBadge}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
    const insets = useSafeAreaInsets();
    const translateX = React.useRef(new Animated.Value(0)).current;
    const rotateAnim = React.useRef(new Animated.Value(0)).current;

    const [containerWidth, setContainerWidth] = React.useState(0);
    const tabCount = state.routes.length;
    const paddingHorizontal = 15;

    // Calculate tabWidth based on actual measured container width
    const tabWidth = containerWidth > 0 ? (containerWidth - (paddingHorizontal * 2)) / tabCount : 0;


    React.useEffect(() => {
        Animated.spring(translateX, {
            toValue: state.index * tabWidth,
            useNativeDriver: Platform.OS !== 'web',
            friction: 7,
            tension: 60,
        }).start();
    }, [state.index, tabWidth]);

    React.useEffect(() => {
        const borderAnimation = Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 6000,
                useNativeDriver: Platform.OS !== 'web',
            })
        );
        borderAnimation.start();
        return () => borderAnimation.stop();
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <View
                pointerEvents="none"
                style={[styles.bottomScrim, { height: 118 + insets.bottom }]}
            >
                <LinearGradient
                    colors={['transparent', colors.glassDark, colors.background]}
                    locations={[0, 0.48, 1]}
                    style={styles.fullSize}
                />
            </View>

            <View style={styles.tabBarMainWrapper}>
                <Animated.View style={[styles.rotatingBorder, { transform: [{ rotate: spin }] }]}>
                    <LinearGradient
                        colors={['transparent', `${colors.accent}40`, 'transparent', colors.subtle, 'transparent']}
                        style={styles.fullSize}
                    />
                </Animated.View>

                <BlurView
                    intensity={95}
                    tint="dark"
                    style={styles.tabBar}
                    onLayout={(e) => {
                        const { width } = e.nativeEvent.layout;
                        if (width !== containerWidth) {
                            setContainerWidth(width);
                        }
                    }}
                >

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
                            colors={[colors.subtle, `${colors.accent}2E`]}
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

                        return (
                            <TabItem
                                key={route.key}
                                route={route}
                                options={options}
                                isFocused={isFocused}
                                onPress={onPress}
                            />
                        );
                    })}
                </BlurView>
            </View>
        </View>
    );
};

const createStyles = (colors) => StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1000,
        paddingHorizontal: 12,
    },
    bottomScrim: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    tabBarMainWrapper: {
        width: '100%',
        borderRadius: 35,
        overflow: 'hidden',
        padding: 1.5, // The border thickness
        backgroundColor: colors.subtle,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            },
            android: {
                elevation: 12,
            },
            web: {
                boxShadow: '0px 6px 10px rgba(0,0,0,0.3)'
            }
        })
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
        height: 66,
        paddingHorizontal: 15,
        backgroundColor: colors.glassDark,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderRadius: 33.5, // Slightly smaller than wrapper
        overflow: 'hidden',
    },
    slidingGlowContainer: {
        position: 'absolute',
        height: 46,
        top: 9,
        left: 15,
        borderRadius: 24,
        overflow: 'hidden',
        // Outer plasma glow
        ...Platform.select({
            ios: {
                shadowColor: colors.accent,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
            },
            web: {
                boxShadow: `0px 0px 6px ${colors.accent}4D` // 4D is 30% opacity
            }
        }),
    },
    plasmaGlow: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: `${colors.accent}33`,
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
        height: 25,
    },
    label: {
        maxWidth: '92%',
        fontSize: 9,
        fontWeight: '700',
        marginTop: 1,
        letterSpacing: 0.2,
    },
    badge: {
        position: 'absolute',
        top: 12,
        right: '20%',
        backgroundColor: colors.accent,
        borderRadius: 9,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.surfaceElevated,
    },
    badgeText: {
        color: '#000',
        fontSize: 10,
        fontWeight: '900',
    }
});

export default CustomTabBar;
