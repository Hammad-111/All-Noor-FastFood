
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

import WaveDivider from './WaveDivider';

const { width, height } = Dimensions.get('window');

const SplitScreen = ({ children, ratio = 0.35 }) => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={COLORS.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.topHalf, { height: height * ratio }]}
            />
            <View style={[styles.bottomHalf, { top: height * ratio }]}>
                <WaveDivider />
            </View>

            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topHalf: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        zIndex: 0,
    },
    bottomHalf: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.background,
        zIndex: 0,
    },
    content: {
        flex: 1,
        zIndex: 2,
    },
});

export default SplitScreen;
