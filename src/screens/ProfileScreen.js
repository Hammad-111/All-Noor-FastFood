import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Image, Platform, Alert, Modal, ActivityIndicator, TextInput, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SplitScreen from '../components/SplitScreen';
import { COLORS, SIZES } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebaseConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { doc, setDoc } from 'firebase/firestore';
import { BlurView } from 'expo-blur';

const ProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { t, toggleLanguage, language } = useLanguage();
    const { user, userData, logout, deleteAccount } = useAuth();
    const { showToast } = useToast();
    const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);

    // Edit Profile States
    const [editModalVisible, setEditModalVisible] = React.useState(false);
    const [editName, setEditName] = React.useState(userData?.name || '');
    const [editPhone, setEditPhone] = React.useState(userData?.phoneNumber || '');
    const [savingProfile, setSavingProfile] = React.useState(false);

    const handleLanguageToggle = () => {
        toggleLanguage();
        const newLang = language === 'en' ? 'اردو' : 'English';
        showToast(language === 'en' ? `زبان تبدیل کر دی گئی ہے: ${newLang}` : `Language changed to ${newLang}`);
    };

    const handleLogout = () => {
        logout();
        showToast(t('loggedOut'), 'info');
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        try {
            setSavingProfile(true);
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                name: editName,
                phoneNumber: editPhone,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            showToast(t('profileUpdated'), 'success');
            setEditModalVisible(false);
        } catch (error) {
            console.error("Save profile error:", error);
            showToast(t('errorOccurred'), 'error');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleEditProfile = () => {
        setEditName(userData?.name || '');
        setEditPhone(userData?.phoneNumber || '');
        setEditModalVisible(true);
    };

    const handleDeleteAccount = async () => {
        try {
            setDeleting(true);
            await deleteAccount();
            setDeleteModalVisible(false);
            showToast(t('accountDeleted'), 'success');
        } catch (error) {
            console.error("Delete account error:", error);
            if (error.code === 'auth/requires-recent-login') {
                showToast(t('reLoginRequired'), 'error');
            } else {
                showToast(t('deleteError'), 'error');
            }
        } finally {
            setDeleting(false);
        }
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
                <View style={[styles.container, { paddingTop: insets.top }]}>
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
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.userName}>{userData?.name || (user ? t('alNoorCustomer') : t('appName'))}</Text>
                            {user && (
                                <TouchableOpacity onPress={handleEditProfile} style={{ marginLeft: 8 }}>
                                    <Icon name="pencil" size={16} color={COLORS.accent} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.badgeContainer}>
                            <Text style={styles.userBadge}>{user ? t('valuedCustomer') : t('qualityTaste')}</Text>
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


                            {/* Developer Credits - Professional Method */}
                            <TouchableOpacity
                                activeOpacity={0.9}
                                style={styles.devCardWrapper}
                                onPress={() => navigation.navigate('DeveloperPortfolio')}
                            >
                                <LinearGradient
                                    colors={['rgba(255, 215, 0, 0.05)', 'rgba(255, 215, 0, 0.1)']}
                                    style={styles.devCard}
                                >
                                    <View style={styles.devHeader}>
                                        <View style={styles.devIconBox}>
                                            <Image
                                                source={require('../../assets/Developer.jpeg')}
                                                style={styles.devAvatarSmall}
                                                resizeMode="cover"
                                            />
                                        </View>
                                        <View>
                                            <Text style={styles.devName}>Hammad Javed</Text>
                                            <Text style={styles.devRole}>Software Engineer</Text>
                                        </View>
                                    </View>

                                    <View style={styles.devBadgeContainer}>
                                        <Text style={styles.devBadgeText}>DEVELOPER</Text>
                                    </View>

                                    <View style={styles.devClickHint}>
                                        <Text style={styles.devClickText}>{language === 'ur' ? 'پورٹ فولیو دیکھیں' : 'VIEW PORTFOLIO'}</Text>
                                        <Icon name="chevron-forward" size={12} color={COLORS.accent} />
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                                <Text style={styles.logoutText}>{t('logout')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{ marginTop: 20, alignSelf: 'center', padding: 10 }}
                                onPress={() => setDeleteModalVisible(true)}
                            >
                                <Text style={{ color: 'rgba(255, 82, 82, 0.6)', fontSize: 13, textDecorationLine: 'underline' }}>
                                    {t('deleteAccount')}
                                </Text>
                            </TouchableOpacity>


                            {/* Edit Profile Modal */}
                            <Modal transparent visible={editModalVisible} animationType="slide">
                                <KeyboardAvoidingView
                                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                    style={styles.modalOverlay}
                                >
                                    <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                                    <View style={styles.editModalContent}>
                                        <Text style={styles.editModalTitle}>{t('editProfile')}</Text>

                                        <View style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>{t('fullName')}</Text>
                                            <TextInput
                                                style={styles.editInput}
                                                value={editName}
                                                onChangeText={setEditName}
                                                placeholder={t('enterName')}
                                                placeholderTextColor="rgba(255,255,255,0.3)"
                                            />
                                        </View>

                                        <View style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>{t('phoneNumber')}</Text>
                                            <TextInput
                                                style={styles.editInput}
                                                value={editPhone}
                                                onChangeText={setEditPhone}
                                                placeholder={t('enterPhone')}
                                                placeholderTextColor="rgba(255,255,255,0.3)"
                                                keyboardType="phone-pad"
                                            />
                                        </View>

                                        <View style={[styles.modalButtonsRow, { marginTop: 10 }]}>
                                            <TouchableOpacity
                                                style={styles.modalCancelBtn}
                                                onPress={() => setEditModalVisible(false)}
                                                disabled={savingProfile}
                                            >
                                                <Text style={styles.modalCancelText}>{t('cancel')}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.modalSaveBtn}
                                                onPress={handleSaveProfile}
                                                disabled={savingProfile}
                                            >
                                                {savingProfile ? (
                                                    <ActivityIndicator color="white" size="small" />
                                                ) : (
                                                    <Text style={styles.modalSaveText}>{t('saveChanges')}</Text>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </KeyboardAvoidingView>
                            </Modal>

                            {/* Delete Account Modal */}
                            <Modal transparent visible={deleteModalVisible} animationType="fade">
                                <View style={styles.modalOverlay}>
                                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                                    <Animated.View style={styles.deleteModalContent}>
                                        <View style={styles.warningIconContainer}>
                                            <Icon name="warning" size={40} color="#FF5252" />
                                        </View>
                                        <Text style={styles.deleteModalTitle}>{t('deleteAccountTitle')}</Text>
                                        <Text style={styles.deleteModalDescription}>{t('deleteAccountDesc')}</Text>
                                        <View style={styles.modalButtonsRow}>
                                            <TouchableOpacity
                                                style={styles.modalCancelBtn}
                                                onPress={() => setDeleteModalVisible(false)}
                                                disabled={deleting}
                                            >
                                                <Text style={styles.modalCancelText}>{t('cancel')}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.modalDeleteBtn}
                                                onPress={handleDeleteAccount}
                                                disabled={deleting}
                                            >
                                                {deleting ? (
                                                    <ActivityIndicator color="white" size="small" />
                                                ) : (
                                                    <Text style={styles.modalDeleteText}>{t('deleteConfirm')}</Text>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </Animated.View>
                                </View>
                            </Modal>

                            <View style={{ height: 120 }} />
                        </ScrollView>
                    </View>
                </View>
            </SplitScreen>
        </View>
    );
};

const styles = StyleSheet.create({
    main: { flex: 1 },
    container: { flex: 1 },
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 20,
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
        elevation: 5,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.2,
        shadowRadius: 10,
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
    },
    // Developer Card Styles
    devCardWrapper: {
        marginTop: 40,
        borderRadius: 25,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.2)',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    devCard: {
        padding: 20,
    },
    devHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    devIconBox: {
        width: 45,
        height: 45,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    devAvatarSmall: {
        width: '100%',
        height: '100%',
    },
    devName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    devRole: {
        fontSize: 13,
        color: COLORS.accent,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    devDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 15,
    },
    devInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    devInfoText: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
        marginLeft: 10,
    },
    devBadgeContainer: {
        position: 'absolute',
        top: 20,
        right: 15,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    devBadgeText: {
        fontSize: 8,
        fontWeight: '900',
        color: COLORS.accent,
        letterSpacing: 1,
    },
    devClickHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    devClickText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.accent,
        marginRight: 5,
        letterSpacing: 1,
    },
    // Custom Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    deleteModalContent: {
        width: '90%',
        backgroundColor: '#1E293B',
        borderRadius: 30,
        padding: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    warningIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 82, 82, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    deleteModalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.secondary,
        textAlign: 'center',
        marginBottom: 10,
    },
    deleteModalDescription: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    modalButtonsRow: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
    },
    modalCancelBtn: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalCancelText: {
        color: COLORS.secondary,
        fontWeight: '600',
    },
    modalDeleteBtn: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 15,
        backgroundColor: '#FF5252',
        alignItems: 'center',
        shadowColor: "#FF5252",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    modalDeleteText: {
        color: 'white',
        fontWeight: 'bold',
    },
    // Edit Modal Specifics
    editModalContent: {
        width: '90%',
        backgroundColor: '#1E293B',
        borderRadius: 30,
        padding: 25,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    editModalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginBottom: 25,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 8,
        marginLeft: 4,
    },
    editInput: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 12,
        color: 'white',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalSaveBtn: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 15,
        backgroundColor: COLORS.accent,
        alignItems: 'center',
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    modalSaveText: {
        color: 'black',
        fontWeight: 'bold',
    },
});

export default ProfileScreen;
