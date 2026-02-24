import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Animated, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS } from '../constants/theme';
import { auth, db } from '../utils/firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import WaveDivider from '../components/WaveDivider';
import BackButton from '../components/BackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: Platform.OS !== 'web'
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 6,
                useNativeDriver: Platform.OS !== 'web'
            })
        ]).start();
    }, [isRegister]);

    const handleForgotPassword = async () => {
        if (!resetEmail) {
            showToast("Please enter your email", "error");
            return;
        }
        try {
            setLoading(true);
            await sendPasswordResetEmail(auth, resetEmail);
            showToast("Password reset link sent to your email!", "success");
            setShowForgotModal(false);
            setResetEmail('');
        } catch (error) {
            console.error("Reset Error:", error);
            showToast(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAuth = async () => {
        if (!email || !password) {
            showToast("Please fill all fields", "error");
            return;
        }

        if (password.length < 6) {
            showToast("Password must be at least 6 characters", "error");
            return;
        }

        try {
            setLoading(true);
            if (isRegister) {
                if (!name) {
                    showToast("Please enter your name", "error");
                    setLoading(false);
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Save name to Firestore
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    name: name,
                    email: email,
                    createdAt: new Date().toISOString(),
                });
                showToast("Account created successfully!", "success");
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                showToast("Welcome back to Al Noor!", "success");
            }
        } catch (error) {
            console.error("Auth Error:", error);
            let msg = error.message;
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                msg = language === 'ur' ? "ای میل یا پاس ورڈ غلط ہے" : "Invalid email or password";
            } else if (error.code === 'auth/email-already-in-use') {
                msg = language === 'ur' ? "یہ ای میل پہلے سے زیر استعمال ہے" : "Email already in use";
            }
            showToast(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.main}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -30}
                style={{ flex: 1 }}
            >
                <View style={[styles.topSection, { paddingTop: insets.top }]}>
                    <View style={styles.header}>
                        {navigation.canGoBack() && <BackButton />}
                    </View>

                    <Animated.View style={[styles.brandContainer, { opacity: fadeAnim }]}>
                        <View style={styles.logoWrapper}>
                            <Image source={require('../../assets/logo.jpeg')} style={styles.logo} />
                        </View>
                        <Text style={styles.welcomeText}>AL NOOR</Text>
                        <Text style={styles.tagline}>{t('tagline')}</Text>
                    </Animated.View>
                </View>

                <View style={styles.bottomSection}>
                    <WaveDivider fill={COLORS.background} customTop={-38} />

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Animated.View style={[styles.formContainer, { transform: [{ translateY: slideAnim }] }]}>
                            <Text style={styles.formTitle}>
                                {isRegister ? (language === 'ur' ? 'نیا اکاؤنٹ بنائیں' : 'Create Account') : (language === 'ur' ? 'لاگ ان کریں' : 'Welcome Back')}
                            </Text>
                            <Text style={styles.formSub}>
                                {isRegister ? 'Join the Al Noor family for exclusive offers!' : 'Login to enjoy your favorite fast food!'}
                            </Text>

                            {isRegister && (
                                <View style={styles.inputBox}>
                                    <Icon name="person-outline" size={20} color={COLORS.accent} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder={language === 'ur' ? "آپ کا نام" : "Full Name"}
                                        placeholderTextColor="#AAA"
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>
                            )}

                            <View style={styles.inputBox}>
                                <Icon name="mail-outline" size={20} color={COLORS.accent} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="email@example.com"
                                    placeholderTextColor="#AAA"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>

                            <View style={styles.inputBox}>
                                <Icon name="lock-closed-outline" size={20} color={COLORS.accent} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••"
                                    placeholderTextColor="#AAA"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Icon
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={COLORS.accent}
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                onPress={() => setShowForgotModal(true)}
                                style={{ alignSelf: 'flex-end', marginBottom: 20, marginRight: 5 }}
                            >
                                <Text style={styles.forgotText}>{language === 'ur' ? 'پاس ورڈ بھول گئے؟' : 'Forgot Password?'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionBtn, loading && styles.btnDisabled]}
                                onPress={handleAuth}
                                disabled={loading}
                            >
                                <Text style={styles.btnText}>
                                    {loading ? '...' : (isRegister ? 'Sign Up' : 'Login')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setIsRegister(!isRegister)}
                                style={{ marginTop: 15 }}
                            >
                                <Text style={styles.toggleText}>
                                    {isRegister ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </ScrollView>
                </View>

                {/* MODAL: Forgot Password */}
                {showForgotModal && (
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>{language === 'ur' ? 'پاس ورڈ ری سیٹ کریں' : 'Reset Password'}</Text>
                            <Text style={styles.modalSub}>
                                {language === 'ur'
                                    ? 'ری سیٹ لنک حاصل کرنے کے لیے اپنا ای میل درج کریں۔'
                                    : 'Enter your email to receive a secure reset link.'}
                            </Text>

                            <View style={styles.inputBox}>
                                <Icon name="mail-outline" size={20} color={COLORS.accent} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="email@example.com"
                                    placeholderTextColor="#AAA"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={resetEmail}
                                    onChangeText={setResetEmail}
                                />
                            </View>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => setShowForgotModal(false)}
                                >
                                    <Text style={styles.cancelBtnText}>{language === 'ur' ? 'منسوخ کریں' : 'Cancel'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.resetBtn, loading && styles.btnDisabled]}
                                    onPress={handleForgotPassword}
                                    disabled={loading}
                                >
                                    <Text style={styles.resetBtnText}>{loading ? '...' : (language === 'ur' ? 'بھیجیں' : 'Send link')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    main: { flex: 1, backgroundColor: COLORS.background, overflow: 'hidden' },
    topSection: {
        alignItems: 'center',
        paddingBottom: 20,
        backgroundColor: COLORS.primary
    },
    header: { width: '100%', paddingHorizontal: 20, paddingTop: 10 },
    brandContainer: { alignItems: 'center', marginTop: 10 },
    logoWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFF',
        padding: 5,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    logo: { width: '100%', height: '100%', borderRadius: 50 },
    welcomeText: { fontSize: 28, fontWeight: 'bold', color: COLORS.secondary, marginTop: 15 },
    tagline: { fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: 2 },
    bottomSection: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 0, paddingTop: 0 },
    scrollContent: { paddingHorizontal: 30, paddingTop: 60, paddingBottom: 20 },
    formContainer: { width: '100%', alignItems: 'center' },
    formTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 10 },
    formSub: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 30, lineHeight: 20 },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.glass,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        borderRadius: 15,
        paddingHorizontal: 15,
        width: '100%',
        marginBottom: 15,
    },
    inputIcon: { marginRight: 15 },
    eyeIcon: {
        padding: 5,
    },
    input: { flex: 1, height: 55, fontSize: 16, color: COLORS.secondary },
    actionBtn: {
        width: '100%',
        height: 55,
        backgroundColor: COLORS.primary,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        marginTop: 10,
    },
    btnDisabled: { opacity: 0.7 },
    btnText: { color: COLORS.secondary, fontSize: 18, fontWeight: 'bold' },
    toggleText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
    forgotText: { color: COLORS.primary, fontSize: 13, fontWeight: '500' },
    // Modal Styles
    modalOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        paddingHorizontal: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: COLORS.background,
        borderRadius: 20,
        padding: 25,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        elevation: 10,
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 10 },
    modalSub: { fontSize: 14, color: '#888', marginBottom: 20, lineHeight: 20 },
    modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
    cancelBtn: { paddingVertical: 10, paddingHorizontal: 20, marginRight: 10 },
    cancelBtnText: { color: '#888', fontSize: 16, fontWeight: '600' },
    resetBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 12,
        elevation: 3,
    },
    resetBtnText: { color: COLORS.secondary, fontSize: 16, fontWeight: 'bold' },
});

export default LoginScreen;
