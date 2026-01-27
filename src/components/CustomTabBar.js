
import React from 'react';

import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const TabItem = ({ route, options, isFocused, onPress, getIcon }) => {
    const scaleAnim = React.useRef(new Animated.Value(isFocused ? 1.15 : 1)).current;
    const translateAnim = React.useRef(new Animated.Value(isFocused ? -5 : 0)).current;
    const opacityAnim = React.useRef(new Animated.Value(isFocused ? 1 : 0.6)).current;
    const dotWidthAnim = React.useRef(new Animated.Value(isFocused ? 15 : 0)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: isFocused ? 1.15 : 1,
                useNativeDriver: true,
                friction: 5,
            }),
            Animated.spring(translateAnim, {
                toValue: isFocused ? -5 : 0,
                useNativeDriver: true,
                friction: 5,
            }),
            Animated.timing(opacityAnim, {
                toValue: isFocused ? 1 : 0.6,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(dotWidthAnim, {
                toValue: isFocused ? 15 : 0,
                duration: 200,
                useNativeDriver: false // width is not supported by native driver
            })
        ]).start();
    }, [isFocused]);

    const { t } = useLanguage();
    const label = options.tabBarLabel === 'Home' ? t('home') :
        options.tabBarLabel === 'Cart' ? t('cart') :
            options.tabBarLabel === 'Profile' ? t('profile') :
                options.tabBarLabel || route.name;

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
        >
            <Animated.View
                style={[
                    styles.iconContainer,
                    isFocused && styles.iconContainerFocused,
                    {
                        transform: [
                            { scale: scaleAnim },
                            { translateY: translateAnim }
                        ]
                    }
                ]}
            >
                <Animated.Text style={[styles.icon, { opacity: opacityAnim }]}>
                    {getIcon(route.name)}
                </Animated.Text>

                <Animated.View
                    style={[
                        styles.activeLine,
                        { width: dotWidthAnim }
                    ]}
                />
            </Animated.View>
            <Text style={[
                styles.label,
                { color: isFocused ? COLORS.accent : 'rgba(255,255,255,0.6)' }
            ]}>
                {label}
            </Text>

            {/* Badge for Cart */}
            {route.name === 'CartTab' && options.tabBarBadge > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{options.tabBarBadge}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
    return (
        <View style={styles.container}>
            {/* Background Mask to hide scrolling content */}
            <View style={styles.backgroundMask} />

            <View style={styles.tabBar}>
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
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0, // Sit at the very bottom
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 100,
        paddingBottom: 5, // Slightly more lift
        paddingHorizontal: 12, // Wider (less side padding)
    },
    backgroundMask: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70, // Lowered mask
        backgroundColor: COLORS.background, // Match screen background
        opacity: 0.98, // More solid
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        height: 60, // Slimmer height
        borderRadius: 30, // Tighter rounding
        paddingHorizontal: 15,
        paddingVertical: 10,
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        elevation: 25, // Increased elevation
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        // Ensure background is solid
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        position: 'relative',
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainerFocused: {
        // Optional: background circle for focused item
    },
    icon: {
        fontSize: 24,
    },
    activeLine: {
        height: 3,
        backgroundColor: COLORS.accent,
        borderRadius: 2,
        marginTop: 4,
    },
    label: {
        fontSize: 11,
        fontWeight: 'bold',
        marginTop: 4,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: '20%',
        backgroundColor: COLORS.accent,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    badgeText: {
        color: COLORS.primary,
        fontSize: 9,
        fontWeight: 'bold',
    }
});

export default CustomTabBar;
