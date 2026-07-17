import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing, useWindowDimensions, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

const WaveDivider = ({
    fill,
    customTop = -40,
    rotate = false
}) => {
    const { colors } = useTheme();
    const waveFill = fill || colors.background;
    const { width } = useWindowDimensions();
    const scrollAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startAnimation = () => {
            scrollAnim.setValue(0);
            Animated.loop(
                Animated.timing(scrollAnim, {
                    toValue: 1,
                    duration: 4500,
                    easing: Easing.linear,
                    useNativeDriver: Platform.OS !== 'web',
                })
            ).start();
        };

        startAnimation();
    }, []);

    const waveHeight = 8;
    const waveWidth = width;

    const singleWave = `q ${waveWidth / 4} ${waveHeight}, ${waveWidth / 2} 0 t ${waveWidth / 2} 0`;
    const fullPath = `M 0 0 ${Array(3).fill(singleWave).join(' ')} v 100 h ${-waveWidth * 3} z`;

    const translateX = scrollAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -waveWidth],
    });

    return (
        <View style={[
            styles.container,
            { width, top: customTop },
            rotate && { transform: [{ rotate: '180deg' }] }
        ]}>
            <Animated.View
                style={[
                    styles.waveWrapper,
                    {
                        width: waveWidth * 3,
                        transform: [{ translateX }]
                    }
                ]}
            >
                <Svg height="100" width={waveWidth * 3} viewBox={`0 -25 ${waveWidth * 3} 100`}>
                    <Path d={fullPath} fill={waveFill} />
                </Svg>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 80,
        position: 'absolute',
        zIndex: 5,
        overflow: 'hidden',
    },
    waveWrapper: {
        flexDirection: 'row',
        position: 'absolute',
        top: 0,
        left: 0,
    }
});

export default WaveDivider;
