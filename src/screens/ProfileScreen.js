
import React from 'react';

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Image } from 'react-native';
import SplitScreen from '../components/SplitScreen';
import { COLORS, SIZES } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { t, toggleLanguage, language } = useLanguage();
    const { showToast } = useToast();

    const handleLanguageToggle = () => {
        toggleLanguage();
        const newLang = language === 'en' ? 'اردو' : 'English';
        showToast(language === 'en' ? `زبان تبدیل کر دی گئی ہے: ${newLang}` : `Language changed to ${newLang}`);
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

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <View style={styles.main}>
            <SplitScreen ratio={0.33}>
                <SafeAreaView style={styles.container} edges={['top']}>
                    {/* Header Section */}
                    <View style={styles.header}>
                        <Animated.View
                            style={[
                                styles.profileAvatar,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ scale: fadeAnim }]
                                }
                            ]}
                        >
                            <Image
                                source={require('../../assets/logo.jpeg')}
                                style={styles.avatarImage}
                                resizeMode="cover"
                            />
                        </Animated.View>
                        <Text style={styles.userName}>{t('appName')} {t('tagline').includes('SPECIALIST') ? 'Fast Food' : ''}</Text>
                        <Text style={styles.userEmail}>{language === 'ur' ? 'بہترین معیار اور ذائقہ' : 'Serving Quality & Taste'}</Text>
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


                            <TouchableOpacity style={styles.logoutBtn}>
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
        height: '30%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 0,
    },
    profileAvatar: {
        width: 85,
        height: 85,
        borderRadius: 42.5,
        backgroundColor: COLORS.secondary,
        borderWidth: 3,
        borderColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: COLORS.accent,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        overflow: 'hidden',
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
    userEmail: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
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
        color: COLORS.textDark,
        marginBottom: 15,
        marginTop: 10,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F2',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: '#F7F7F7',
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
        color: COLORS.textDark,
    },
    menuValue: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: 'bold',
        marginTop: 2,
    },
    arrow: {
        fontSize: 22,
        color: '#DDD',
    },
    logoutBtn: {
        marginTop: 30,
        backgroundColor: '#FFF5F5',
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFEAEA',
    },
    logoutText: {
        color: '#FF5252',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default ProfileScreen;
