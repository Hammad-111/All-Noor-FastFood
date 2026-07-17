import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const Toast = () => {
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
    const { toast, hideToast } = useToast();
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Internal state to keep the component mounted during exit animation
    const [renderVisible, setRenderVisible] = React.useState(false);

    useEffect(() => {
        if (toast.visible) {
            setRenderVisible(true);
            progressAnim.setValue(0);

            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 20,
                    useNativeDriver: Platform.OS !== 'web',
                    friction: 8,
                    tension: 40,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(progressAnim, {
                    toValue: 1,
                    duration: 2500, // Slightly shorter than auto-hide for buffer
                    useNativeDriver: false,
                })
            ]).start();
        } else {
            // Slide Up & Fade Out
            if (renderVisible) {
                Animated.parallel([
                    Animated.timing(slideAnim, {
                        toValue: -100,
                        duration: 300,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                ]).start(() => {
                    setRenderVisible(false);
                });
            }
        }
    }, [toast.visible]);

    if (!renderVisible) return null;

    const getBorderColor = () => {
        switch (toast.type) {
            case 'error': return 'rgba(255, 82, 82, 0.4)';
            case 'info': return 'rgba(33, 150, 243, 0.4)';
            default: return 'rgba(255, 215, 0, 0.4)';
        }
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'error': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '✨';
        }
    };

    return (
        <SafeAreaView style={[styles.container, { pointerEvents: 'none' }]}>
            <Animated.View
                style={[
                    styles.toastWrapper,
                    {
                        opacity: opacityAnim,
                        transform: [{ translateY: slideAnim }],
                        borderColor: getBorderColor(),
                    },
                ]}
            >
                <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
                    <View style={styles.content}>
                        <View style={[styles.iconBadge, { backgroundColor: toast.type === 'error' ? 'rgba(255, 82, 82, 0.2)' : 'rgba(255, 215, 0, 0.1)' }]}>
                            <Text style={styles.icon}>{getIcon()}</Text>
                        </View>
                        <Text style={styles.message}>{toast.message}</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                        <Animated.View
                            style={[
                                styles.progressBar,
                                {
                                    width: progressAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['100%', '0%']
                                    }),
                                    backgroundColor: toast.type === 'error' ? '#FF5252' : colors.accent,
                                }
                            ]}
                        />
                    </View>
                </BlurView>
            </Animated.View>
        </SafeAreaView>
    );
};

const createStyles = (colors) => StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        alignItems: 'center',
    },
    toastWrapper: {
        width: width * 0.75, // Narrower
        borderRadius: 25, // More rounded/capsule
        borderWidth: 1,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 10,
            },
            web: {
                boxShadow: '0px 4px 8px rgba(0,0,0,0.3)'
            }
        }),
    },
    blurContainer: {
        paddingVertical: 8, // More compact
        paddingHorizontal: 15,
        backgroundColor: 'rgba(15, 23, 42, 0.8)', // Sleeker dark slate
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBadge: {
        width: 26, // Smaller icon container
        height: 26,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    icon: {
        fontSize: 14, // Smaller emoji
    },
    message: {
        color: '#FFF',
        fontSize: 13, // Smaller, sharper text
        fontWeight: '500',
        flex: 1,
        letterSpacing: 0.2,
    },
    progressBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2.5, // Thinner line
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    progressBar: {
        height: '100%',
        opacity: 0.8,
    }
});

export default Toast;
