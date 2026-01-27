
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

const WaveDivider = () => {
    const scrollAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startAnimation = () => {
            scrollAnim.setValue(0);
            Animated.loop(
                Animated.timing(scrollAnim, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        };

        startAnimation();
    }, []);

    const waveHeight = 20;
    const waveWidth = width;

    // Path for one wave cycle (covers exactly waveWidth)
    const singleWave = `q ${waveWidth / 4} ${waveHeight}, ${waveWidth / 2} 0 t ${waveWidth / 2} 0`;

    // Use 3 segments to ensure overlap during animation
    const fullPath = `M 0 0 ${singleWave} ${singleWave} ${singleWave} v 100 h ${-waveWidth * 3} z`;

    const translateX = scrollAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -waveWidth],
    });

    return (
        <View style={styles.container}>
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
                    <Path
                        d={fullPath}
                        fill={COLORS.background}
                    />
                </Svg>
            </Animated.View>

            {/* Background layer for extra depth */}
            <Animated.View
                style={[
                    styles.waveWrapper,
                    {
                        width: waveWidth * 3,
                        opacity: 0.3,
                        top: 5,
                        transform: [{ translateX }]
                    }
                ]}
            >
                <Svg height="100" width={waveWidth * 3} viewBox={`0 -25 ${waveWidth * 3} 100`}>
                    <Path
                        d={fullPath}
                        fill={COLORS.background}
                    />
                </Svg>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: width,
        height: 80,
        position: 'absolute',
        top: -40,
        zIndex: 5,
        overflow: 'hidden',
    },
    waveWrapper: {
        flexDirection: 'row',
        width: width * 2,
        position: 'absolute',
        top: 0,
        left: 0,
    }
});

export default WaveDivider;
