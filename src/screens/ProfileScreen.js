
import React from 'react';

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import SplitScreen from '../components/SplitScreen';
import { COLORS, SIZES } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { t, toggleLanguage, language } = useLanguage();
    const { user, userData, logout } = useAuth();
    const { showToast } = useToast();

    const handleLanguageToggle = () => {
        toggleLanguage();
        const newLang = language === 'en' ? 'اردو' : 'English';
        showToast(language === 'en' ? `زبان تبدیل کر دی گئی ہے: ${newLang}` : `Language changed to ${newLang}`);
    };

    const handleLogout = () => {
        logout();
        showToast(language === 'ur' ? "لاگ آؤٹ ہو گیا" : "Logged out successfully", 'info');
    };

    const menuItems = [
        { id: '1', title: t('myOrders'), icon: '📦', action: () => navigation.navigate('SettingDetail', { title: t('myOrders') }) },
        { id: '2', title: t('paymentMethods'), icon: '💳', action: () => navigation.navigate('SettingDetail', { title: t('paymentMethods') }) },
        { id: '3', title: t('deliveryAddressMenu'), icon: '📍', action: () => navigation.navigate('SettingDetail', { title: t('deliveryAddressMenu') }) },
        { id: '4', title: t('changeLanguage'), icon: '🌐', value: language === 'en' ? 'Urdu' : 'Urdu (اردو)', action: handleLanguageToggle },
        { id: '5', title: t('settings'), icon: '⚙️', action: () => navigation.navigate('SettingDetail', { title: t('settings') }) },
        { id: '6', title: t('support'), icon: '🎧', action: () => navigation.navigate('SettingDetail', { title: t('support') }) },
    ];

    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const rotateAnim = React.useRef(new Animated.Value(0)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 6,
                tension: 40,
                useNativeDriver: Platform.OS !== 'web',
            })
        ]).start();

        // Logo rotation animation
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 4000,
                useNativeDriver: true,
            })
        ).start();

        // Logo pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <View style={styles.main}>
            <SplitScreen ratio={0.33}>
                <SafeAreaView style={styles.container} edges={['top']}>
                    {/* Header Section */}
                    <View style={styles.header}>
                        <Animated.View
                            style={[
                                styles.profileAvatarContainer,
                                {
                                    opacity: fadeAnim,
                                    transform: [
                                        { scale: pulseAnim },
                                        { translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }
                                    ]
                                }
                            ]}
                        >
                            <View style={styles.rotatingBorderWrapper}>
                                <Animated.View style={[styles.rotatingBorder, { transform: [{ rotate: spin }] }]}>
                                    <LinearGradient
                                        colors={[COLORS.accent, 'transparent', COLORS.primary, 'transparent']}
                                        style={styles.gradient}
                                    />
                                </Animated.View>
                                <View style={styles.avatarWrapper}>
                                    <Image
                                        source={require('../../assets/logo.jpeg')}
                                        style={styles.avatarImage}
                                        resizeMode="cover"
                                    />
                                </View>
                            </View>
                        </Animated.View>
                        <Text style={styles.userName}>{userData?.name || (user ? (language === 'ur' ? 'النور کسٹمر' : 'Al Noor Customer') : t('appName'))}</Text>
                        <View style={styles.badgeContainer}>
                            <Text style={styles.userBadge}>{user ? (language === 'ur' ? 'بہترین کسٹمر' : 'VALUED CUSTOMER') : (language === 'ur' ? 'بہترین معیار اور ذائقہ' : 'QUALITY & TASTE')}</Text>
                        </View>
                    </View>

                    {/* Content Section */}
                    <View style={styles.content}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                        >
                            <Animated.View
                                style={{
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }]
                                }}
                            >
                                <Text style={styles.sectionTitle}>{t('accountOverview')}</Text>
                            </Animated.View>

                            {menuItems.map((item, index) => (
                                <Animated.View
                                    key={item.id}
                                    style={{
                                        opacity: fadeAnim,
                                        transform: [{ translateX: slideAnim }] // Re-using slideAnim for X axis stagger simulation
                                    }}
                                >
                                    <TouchableOpacity
                                        style={styles.menuItem}
                                        onPress={item.action}
                                    >
                                        <View style={styles.menuItemLeft}>
                                            <View style={styles.iconContainer}>
                                                <Text style={styles.icon}>{item.icon}</Text>
                                            </View>
                                            <View>
                                                <Text style={styles.menuTitle}>{item.title}</Text>
                                                {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
                                            </View>
                                        </View>
                                        <Text style={styles.arrow}>›</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}


                            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                                <Text style={styles.logoutText}>{t('logout')}</Text>
                            </TouchableOpacity>

                            {/* Extra space for floating tabs */}
                            <View style={{ height: 120 }} />
                        </ScrollView>
                    </View>
                </SafeAreaView>
            </SplitScreen>
        </View>
    );
};

const styles = StyleSheet.create({
    main: { flex: 1 },
    container: { flex: 1 },
    header: {
        height: '35%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
    },
    profileAvatarContainer: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rotatingBorderWrapper: {
        width: 110,
        height: 110,
        borderRadius: 55,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 3,
    },
    rotatingBorder: {
        position: 'absolute',
        width: '150%',
        height: '150%',
    },
    gradient: {
        flex: 1,
    },
    avatarWrapper: {
        width: '100%',
        height: '100%',
        borderRadius: 55,
        backgroundColor: COLORS.secondary,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        elevation: 15,
        shadowColor: COLORS.accent,
        shadowOpacity: 0.4,
        shadowRadius: 15,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 34,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginTop: 15,
    },
    badgeContainer: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    userBadge: {
        fontSize: 10,
        color: COLORS.secondary,
        fontWeight: 'bold',
        letterSpacing: 1.2,
    },
    content: {
        flex: 1,
        marginTop: 30, // Reduced from 85 to close the gap
    },
    scrollContent: {
        paddingHorizontal: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginBottom: 15,
        marginTop: 10,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    icon: {
        fontSize: 20,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.secondary,
    },
    menuValue: {
        fontSize: 12,
        color: COLORS.accent,
        fontWeight: 'bold',
        marginTop: 2,
    },
    arrow: {
        fontSize: 22,
        color: 'rgba(255,255,255,0.2)',
    },
    logoutBtn: {
        marginTop: 30,
        backgroundColor: 'rgba(255, 82, 82, 0.15)',
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 82, 82, 0.3)',
    },
    logoutText: {
        color: '#FF5252',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default ProfileScreen;
