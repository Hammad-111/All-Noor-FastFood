
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';

import WaveDivider from './WaveDivider';

const { width, height } = Dimensions.get('window');

const SplitScreen = ({ children }) => {
    return (
        <View style={styles.container}>
            <View style={styles.topHalf} />
            <View style={styles.bottomHalf}>
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
        height: height * 0.35,
        backgroundColor: COLORS.primary,
    },
    bottomHalf: {
        position: 'absolute',
        top: height * 0.33,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        zIndex: 2,
    },
});

export default SplitScreen;
