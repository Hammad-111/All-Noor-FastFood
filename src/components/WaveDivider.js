import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing, useWindowDimensions, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../constants/theme';

const WaveDivider = ({
    fill = COLORS.background,
    customTop = -40,
    rotate = false
}) => {
    const { width } = useWindowDimensions();
    const scrollAnim = useRef(new Animated.Value(0)).current;
    const secondaryScrollAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startAnimation = () => {
            scrollAnim.setValue(0);
            Animated.loop(
                Animated.timing(scrollAnim, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.linear,
                    useNativeDriver: Platform.OS !== 'web',
                })
            ).start();

            Animated.loop(
                Animated.timing(secondaryScrollAnim, {
                    toValue: 1,
                    duration: 4500, // Slower for parallax effect
                    easing: Easing.linear,
                    useNativeDriver: Platform.OS !== 'web',
                })
            ).start();
        };

        startAnimation();
    }, []);

    const waveHeight = 20;
    const waveWidth = width;

    // Path logic from the version the user preferred
    const singleWave = `q ${waveWidth / 4} ${waveHeight}, ${waveWidth / 2} 0 t ${waveWidth / 2} 0`;
    const fullPath = `M 0 0 ${singleWave} ${singleWave} ${singleWave} v 100 h ${-waveWidth * 3} z`;

    const translateX = scrollAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -waveWidth],
    });

    const translateXSecondary = secondaryScrollAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-waveWidth, 0], // Moving opposite direction
    });

    return (
        <View style={[
            styles.container,
            { width, top: customTop },
            rotate && { transform: [{ rotate: '180deg' }] }
        ]}>
            {/* Third layer: Small contrasting wave at the bottom */}
            <Animated.View
                style={[
                    styles.waveWrapper,
                    {
                        width: waveWidth * 3,
                        transform: [{ translateX: translateXSecondary }],
                        top: 15,
                        opacity: 0.15,
                    }
                ]}
            >
                <Svg height="100" width={waveWidth * 3} viewBox={`0 -25 ${waveWidth * 3} 100`}>
                    <Path d={fullPath} fill={COLORS.accent || '#F8B400'} />
                </Svg>
            </Animated.View>

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
                    <Path d={fullPath} fill={fill} />
                </Svg>
            </Animated.View>

            {/* Background layer for depth */}
            <Animated.View
                style={[
                    styles.waveWrapper,
                    {
                        width: waveWidth * 3,
                        opacity: 0.25,
                        top: 5,
                        transform: [{ translateX }]
                    }
                ]}
            >
                <Svg height="100" width={waveWidth * 3} viewBox={`0 -25 ${waveWidth * 3} 100`}>
                    <Path d={fullPath} fill={fill} />
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
