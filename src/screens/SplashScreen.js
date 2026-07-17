
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Animated, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const Particle = ({ delay, startPos }) => {
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
    const moveAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(moveAnim, {
                    toValue: 1,
                    duration: 3000 + Math.random() * 2000,
                    delay: delay,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(moveAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: Platform.OS !== 'web',
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
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
    const { t } = useLanguage();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const ring1Scale = useRef(new Animated.Value(0.8)).current;
    const ring2Scale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Entrance sequence
        Animated.sequence([
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 3,
                    tension: 40,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ]),
            Animated.timing(textOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: Platform.OS !== 'web',
            })
        ]).start();

        // Loop pulse and rotate
        Animated.parallel([
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 2000,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: Platform.OS !== 'web',
                    })
                ])
            ),
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 20000,
                    useNativeDriver: Platform.OS !== 'web',
                })
            ),
            // Ring Animations
            Animated.loop(
                Animated.sequence([
                    Animated.timing(ring1Scale, {
                        toValue: 1.2,
                        duration: 4000,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                    Animated.timing(ring1Scale, {
                        toValue: 0.8,
                        duration: 4000,
                        useNativeDriver: Platform.OS !== 'web',
                    })
                ])
            ),
            Animated.loop(
                Animated.sequence([
                    Animated.timing(ring2Scale, {
                        toValue: 1.4,
                        duration: 6000,
                        delay: 1000,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                    Animated.timing(ring2Scale, {
                        toValue: 0.8,
                        duration: 6000,
                        useNativeDriver: Platform.OS !== 'web',
                    })
                ])
            )
        ]).start();

        const timer = setTimeout(() => {
            // Navigation is now handled by App.js to avoid "uninitialized navigation" errors
        }, 4000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={colors.primaryGradient}
                style={StyleSheet.absoluteFill}
            />

            {/* Background Glows */}
            <Animated.View style={[styles.glow, { transform: [{ scale: ring2Scale }] }]} />
            <Animated.View style={[styles.glowSecondary, { transform: [{ scale: ring1Scale }] }]} />

            {/* Particles */}
            {[...Array(20)].map((_, i) => (
                <Particle
                    key={i}
                    delay={i * 150}
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
                            { scale: pulseAnim },
                            {
                                rotate: rotateAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0deg', '360deg']
                                })
                            }
                        ],
                    },
                ]}
            >
                <View style={styles.logoWrapper}>
                    <Image
                        source={require('../../assets/logo.jpeg')}
                        style={styles.logo}
                        resizeMode="cover"
                    />
                </View>

                {/* Visual Ring */}
                <Animated.View style={[styles.logoRing, { transform: [{ scale: pulseAnim }] }]} />
            </Animated.View>

            <Animated.View
                style={{ opacity: textOpacity, alignItems: 'center' }}
            >
                <Text style={styles.appName}>AL NOOR</Text>
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

const createStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    glow: {
        position: 'absolute',
        width: width * 1.8,
        height: width * 1.8,
        borderRadius: width * 0.9,
        backgroundColor: 'rgba(255, 215, 0, 0.03)',
        zIndex: -1,
    },
    glowSecondary: {
        position: 'absolute',
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        zIndex: -1,
    },
    particle: {
        position: 'absolute',
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: colors.accent,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    logoWrapper: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#FFF',
        padding: 5,
        ...Platform.select({
            ios: {
                shadowColor: colors.accent,
                shadowOpacity: 0.3,
                shadowRadius: 20,
            },
            android: {
                elevation: 15,
            },
            web: {
                boxShadow: `0px 0px 20px ${colors.accent}4D` // 4D is 30% opacity
            }
        }),
        overflow: 'hidden'
    },
    logo: {
        width: '100%',
        height: '100%',
        borderRadius: 90,
    },
    logoRing: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        borderWidth: 2,
        borderColor: 'rgba(255, 215, 0, 0.2)',
        zIndex: -1,
    },
    appName: {
        fontSize: 38,
        fontWeight: 'bold',
        color: colors.secondary,
        letterSpacing: 10,
        ...Platform.select({
            ios: {
                textShadowColor: 'rgba(255, 215, 0, 0.5)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 15,
            },
            web: {
                textShadow: '0px 0px 15px rgba(255, 215, 0, 0.5)'
            }
        })
    },
    divider: {
        width: 60,
        height: 3,
        backgroundColor: colors.accent,
        marginVertical: 15,
        borderRadius: 2,
        ...Platform.select({
            ios: {
                shadowColor: colors.accent,
                shadowOpacity: 1,
                shadowRadius: 10,
            },
            web: {
                boxShadow: `0px 0px 10px ${colors.accent}`
            }
        })
    },
    subText: {
        fontSize: 14,
        color: colors.secondary,
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
        backgroundColor: colors.accent,
        marginHorizontal: 4,
        opacity: 0.5,
    },
    footerText: {
        color: colors.secondary,
        letterSpacing: 2,
        fontSize: 10,
        opacity: 0.6
    }
});

export default SplashScreen;

