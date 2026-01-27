
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Animated } from 'react-native';
import { COLORS } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

const Particle = ({ delay, startPos }) => {
    const moveAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(moveAnim, {
                    toValue: 1,
                    duration: 3000 + Math.random() * 2000,
                    delay: delay,
                    useNativeDriver: true,
                }),
                Animated.timing(moveAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, []);

    const translateY = moveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -100 - Math.random() * 100],
    });

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    left: startPos,
                    bottom: 0,
                    opacity: moveAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0.4, 0]
                    }),
                    transform: [{ translateY }]
                }
            ]}
        />
    );
};

const SplashScreen = () => {
    const navigation = useNavigation();
    const { t } = useLanguage();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Entrance sequence
        Animated.sequence([
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 3,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(textOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();

        // Loop pulse
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

        const timer = setTimeout(() => {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
        }, 4000);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            {/* Background Glows */}
            <View style={styles.glow} />

            {/* Particles */}
            {[...Array(15)].map((_, i) => (
                <Particle
                    key={i}
                    delay={i * 200}
                    startPos={Math.random() * width}
                />
            ))}

            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: opacityAnim,
                        transform: [
                            { scale: scaleAnim },
                            { scale: pulseAnim }
                        ],
                    },
                ]}
            >
                <Image
                    source={require('../../assets/logo_extracted.png')}
                    style={styles.logo}
                />

                {/* Visual Ring */}
                <View style={styles.logoRing} />
            </Animated.View>

            <Animated.View
                style={{ opacity: textOpacity, alignItems: 'center' }}
            >
                <Text style={styles.appName}>{t('appName')}</Text>
                <View style={styles.divider} />
                <Text style={styles.subText}>{t('tagline')}</Text>
            </Animated.View>

            <Animated.View style={[styles.loader, { opacity: textOpacity }]}>
                <View style={styles.dotContainer}>
                    {[0, 1, 2].map((i) => (
                        <View key={i} style={styles.dot} />
                    ))}
                </View>
                <Text style={styles.footerText}>{t('loading')}</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    glow: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width,
        backgroundColor: 'rgba(255, 215, 0, 0.05)',
        zIndex: -1,
    },
    particle: {
        position: 'absolute',
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.accent,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    logo: {
        width: 250,
        height: 150,
        resizeMode: 'contain',
    },
    logoRing: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: 'rgba(251, 215, 0, 0.1)',
        zIndex: -1,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.accent,
        letterSpacing: 8,
    },
    divider: {
        width: 40,
        height: 3,
        backgroundColor: COLORS.accent,
        marginVertical: 10,
        borderRadius: 2,
    },
    subText: {
        fontSize: 14,
        color: COLORS.secondary,
        letterSpacing: 3,
        opacity: 0.8,
    },
    loader: {
        position: 'absolute',
        bottom: 60,
        alignItems: 'center',
    },
    dotContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.accent,
        marginHorizontal: 4,
        opacity: 0.5,
    },
    footerText: {
        color: COLORS.secondary,
        letterSpacing: 2,
        fontSize: 10,
        opacity: 0.6
    }
});

export default SplashScreen;

