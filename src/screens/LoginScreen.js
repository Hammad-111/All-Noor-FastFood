import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Animated, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS } from '../constants/theme';
import { auth, db } from '../utils/firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import WaveDivider from '../components/WaveDivider';
import BackButton from '../components/BackButton';

const LoginScreen = ({ navigation }) => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);

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
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <SafeAreaView style={styles.topSection} edges={['top']}>
                    <View style={styles.header}>
                        <BackButton />
                    </View>

                    <Animated.View style={[styles.brandContainer, { opacity: fadeAnim }]}>
                        <View style={styles.logoWrapper}>
                            <Image source={require('../../assets/logo.jpeg')} style={styles.logo} />
                        </View>
                        <Text style={styles.welcomeText}>AL NOOR</Text>
                        <Text style={styles.tagline}>{t('tagline')}</Text>
                    </Animated.View>
                </SafeAreaView>

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
                                    <Text style={styles.inputIcon}>👤</Text>
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
                                <Text style={styles.inputIcon}>📧</Text>
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
                                <Text style={styles.inputIcon}>🔒</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••"
                                    placeholderTextColor="#AAA"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>

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
                                style={{ marginTop: 25 }}
                            >
                                <Text style={styles.toggleText}>
                                    {isRegister ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    main: { flex: 1, backgroundColor: COLORS.primary, overflow: 'hidden' },
    topSection: { height: '35%', alignItems: 'center' },
    header: { width: '100%', paddingHorizontal: 20, paddingTop: 10 },
    brandContainer: { alignItems: 'center', marginTop: 10 },
    logoWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFF',
        padding: 5,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    logo: { width: '100%', height: '100%', borderRadius: 50 },
    welcomeText: { fontSize: 28, fontWeight: 'bold', color: COLORS.secondary, marginTop: 15 },
    tagline: { fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: 2 },
    bottomSection: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 0, paddingTop: 0 },
    scrollContent: { paddingHorizontal: 30, paddingTop: 60, paddingBottom: 40 },
    formContainer: { width: '100%', alignItems: 'center' },
    formTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 10 },
    formSub: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 30, lineHeight: 20 },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 15,
        paddingHorizontal: 15,
        width: '100%',
        marginBottom: 15,
    },
    inputIcon: { fontSize: 18, marginRight: 10 },
    input: { flex: 1, height: 55, fontSize: 16, color: COLORS.textDark },
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
    toggleText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 }
});

export default LoginScreen;
