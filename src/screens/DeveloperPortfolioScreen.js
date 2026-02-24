
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Animated, Platform, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SplitScreen from '../components/SplitScreen';
import { COLORS } from '../constants/theme';
import BackButton from '../components/BackButton';

const { width } = Dimensions.get('window');

const DeveloperPortfolioScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const rotateAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 10000,
                    easing: (t) => t,
                    useNativeDriver: true,
                })
            ).start()
        ]).start();
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <View style={styles.mainContainer}>
            <SplitScreen ratio={0.45}>
                <View style={[styles.container, { paddingTop: insets.top }]}>
                    {/* Top Section: Branding & Avatar */}
                    <View style={styles.headerSection}>
                        <View style={styles.headerRow}>
                            <BackButton color={COLORS.secondary} />
                            <Text style={styles.headerTitle}>Developer Portfolio</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        <Animated.View
                            style={[
                                styles.avatarMainContainer,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }]
                                }
                            ]}
                        >
                            <View style={styles.glowingBorderContainer}>
                                <Animated.View style={[styles.rotatingGlow, { transform: [{ rotate: spin }] }]}>
                                    <LinearGradient
                                        colors={[COLORS.accent, 'transparent', COLORS.primary, 'transparent']}
                                        style={styles.fullSize}
                                    />
                                </Animated.View>
                                <View style={styles.avatarInner}>
                                    <Image
                                        source={require('../../assets/Developer.jpeg')}
                                        style={styles.avatarImage}
                                        resizeMode="cover"
                                    />
                                </View>
                            </View>
                            <View style={styles.verifiedBadge}>
                                <Icon name="checkmark-circle" size={24} color={COLORS.accent} />
                            </View>
                        </Animated.View>
                    </View>

                    {/* Bottom Section: Details */}
                    <View style={styles.infoSection}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 20) + 100 }]}
                        >
                            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                                <View style={styles.titleContainer}>
                                    <Text style={styles.name}>Hammad Javed</Text>
                                    <View style={styles.tagContainer}>
                                        <Text style={styles.tagText}>SOFTWARE ENGINEER</Text>
                                    </View>
                                </View>

                                <Text style={styles.sectionTitle}>About Me</Text>
                                <Text style={styles.description}>
                                    Passionate Software Engineer dedicated to crafting premium digital experiences.
                                    I specialize in building high-performance mobile applications and modern
                                    web solutions with cutting-edge aesthetics and seamless functionality.
                                </Text>

                                <View style={styles.statsRow}>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>50+</Text>
                                        <Text style={styles.statLabel}>Projects</Text>
                                    </View>
                                    <View style={styles.statDivider} />
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>100%</Text>
                                        <Text style={styles.statLabel}>Quality</Text>
                                    </View>
                                </View>

                                <Text style={styles.sectionTitle}>Connect</Text>

                                <TouchableOpacity style={styles.contactItem} activeOpacity={0.7} onPress={() => Linking.openURL('mailto:connect2hammadjaveed@gmail.com')}>
                                    <View style={styles.contactIconBox}>
                                        <Icon name="mail" size={20} color={COLORS.accent} />
                                    </View>
                                    <View style={styles.contactTextContainer}>
                                        <Text style={styles.contactLabel}>Email Address</Text>
                                        <Text style={styles.contactValue} numberOfLines={1} ellipsizeMode="tail">connect2hammadjaveed@gmail.com</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.contactItem} activeOpacity={0.7} onPress={() => Linking.openURL('tel:+923017891391')}>
                                    <View style={styles.contactIconBox}>
                                        <Icon name="call" size={20} color={COLORS.accent} />
                                    </View>
                                    <View style={styles.contactTextContainer}>
                                        <Text style={styles.contactLabel}>Phone Number</Text>
                                        <Text style={styles.contactValue}>+92 301 7891391</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.contactItem} activeOpacity={0.7} onPress={() => Linking.openURL('https://www.hammadjaved.software/')}>
                                    <View style={styles.contactIconBox}>
                                        <Icon name="globe-outline" size={20} color={COLORS.accent} />
                                    </View>
                                    <View style={styles.contactTextContainer}>
                                        <Text style={styles.contactLabel}>Personal Website</Text>
                                        <Text style={styles.contactValue} numberOfLines={1} ellipsizeMode="tail">hammadjaved.software</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.hireButton} activeOpacity={0.8} onPress={() => Linking.openURL('https://www.hammadjaved.software/')}>
                                    <LinearGradient
                                        colors={[COLORS.primary, '#600000']}
                                        style={styles.hireGradient}
                                    >
                                        <Text style={styles.hireText}>Let's Build Something Great</Text>
                                        <Icon name="arrow-forward" size={20} color={COLORS.secondary} />
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View style={{ height: 20 }} />
                            </Animated.View>
                        </ScrollView>
                    </View>
                </View>
            </SplitScreen>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    container: { flex: 1 },
    fullSize: { flex: 1 },
    headerSection: {
        paddingHorizontal: 20,
        alignItems: 'center',
        paddingBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        marginBottom: 30,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.secondary,
        letterSpacing: 1,
    },
    avatarMainContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowingBorderContainer: {
        width: 180,
        height: 180,
        borderRadius: 90,
        padding: 4,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    rotatingGlow: {
        position: 'absolute',
        width: '150%',
        height: '150%',
    },
    avatarInner: {
        width: '100%',
        height: '100%',
        borderRadius: 86,
        backgroundColor: COLORS.secondary,
        borderWidth: 3,
        borderColor: 'rgba(255,215,0,0.3)',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 5,
        right: 15,
        backgroundColor: COLORS.background,
        borderRadius: 15,
        padding: 2,
    },
    infoSection: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 25,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 25,
    },
    name: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 10,
    },
    tagContainer: {
        backgroundColor: 'rgba(255,215,0,0.1)',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.3)',
    },
    tagText: {
        fontSize: 12,
        fontWeight: '900',
        color: COLORS.accent,
        letterSpacing: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginTop: 15,
        marginBottom: 15,
    },
    description: {
        fontSize: 15,
        color: '#666',
        lineHeight: 24,
        marginBottom: 25,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 25,
        padding: 20,
        marginBottom: 25,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 5,
        fontWeight: '600',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 15,
        borderRadius: 18,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    contactIconBox: {
        width: 45,
        height: 45,
        borderRadius: 12,
        backgroundColor: 'rgba(255,215,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    contactLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    contactTextContainer: {
        flex: 1,
    },
    hireButton: {
        marginTop: 20,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    hireGradient: {
        flexDirection: 'row',
        paddingVertical: 20,
        paddingHorizontal: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hireText: {
        color: COLORS.secondary,
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 15,
    }
});

export default DeveloperPortfolioScreen;
