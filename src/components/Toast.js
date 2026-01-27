import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { useToast } from '../context/ToastContext';
import { COLORS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const Toast = () => {
    const { toast, hideToast } = useToast();
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (toast.visible) {
            progressAnim.setValue(0);
            // Slide Down & Fade In
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 20,
                    useNativeDriver: true,
                    friction: 8,
                    tension: 40,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(progressAnim, {
                    toValue: 1,
                    duration: 3000, // Match the auto-hide time
                    useNativeDriver: false, // width cannot use native driver
                })
            ]).start();
        } else {
            // Slide Up & Fade Out
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [toast.visible]);

    if (!toast.visible && slideAnim._value === -100) return null;

    const getBgColor = () => {
        switch (toast.type) {
            case 'error': return '#FF5252';
            case 'info': return '#2196F3';
            default: return '#2E3333'; // Premium Dark Success
        }
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'error': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '✅';
        }
    };

    return (
        <SafeAreaView pointerEvents="none" style={styles.container}>
            <Animated.View
                style={[
                    styles.toast,
                    {
                        backgroundColor: getBgColor(),
                        opacity: opacityAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                <View style={styles.content}>
                    <Text style={styles.icon}>{getIcon()}</Text>
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
                                })
                            }
                        ]}
                    />
                </View>
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        alignItems: 'center',
    },
    toast: {
        width: width * 0.85,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
        overflow: 'hidden',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        fontSize: 18,
        marginRight: 12,
    },
    message: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
        flex: 1,
    },
    progressBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FFF',
        width: '100%', // Could animate this too for a countdown feel
        opacity: 0.5,
    }
});

export default Toast;
