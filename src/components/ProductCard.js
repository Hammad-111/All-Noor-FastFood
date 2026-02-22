import React from 'react';
import { View, Text, TouchableOpacity, Image, Animated, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';
import { getImage } from '../utils/imageMap';
import { useLanguage } from '../context/LanguageContext';

const ProductCard = ({ item, index, navigation, addToCart, isAdmin, onEditPrice }) => {
    const { t } = useLanguage();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const translateY = React.useRef(new Animated.Value(50)).current;
    const rotationAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                delay: index * 150, // More noticeable stagger
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.spring(translateY, {
                toValue: 0,
                damping: 20, // Less bouncy
                stiffness: 80, // Slower movement
                useNativeDriver: Platform.OS !== 'web',
            })
        ]).start();

        // Continuous rotation for moving border
        Animated.loop(
            Animated.timing(rotationAnim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            })
        ).start();
    }, [index]);

    const spin = rotationAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    // We no longer need borderOpacity or borderColor interpolation for the breathing effect
    // since we're using a rotating gradient now.

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
            <TouchableOpacity
                style={styles.productCardWrapper}
                onPress={() => navigation.navigate('ProductDetails', { product: item })}
                activeOpacity={0.8}
            >
                <View style={styles.animatedBorderContainer}>
                    <Animated.View style={[
                        styles.rotatingGradientContainer,
                        { transform: [{ rotate: spin }] }
                    ]}>
                        <LinearGradient
                            colors={['transparent', COLORS.accent, 'transparent', COLORS.primary, 'transparent']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.gradientLine}
                        />
                    </Animated.View>
                    <BlurView intensity={70} tint="dark" style={styles.productCard}>
                        <View style={styles.imageWrapper}>
                            {item.isSpecialDeal ? (
                                <View style={styles.dealIconWrapper}>
                                    <Text style={styles.dealIconLetter}>
                                        {item.name ? item.name.charAt(0).toUpperCase() : 'D'}
                                    </Text>
                                </View>
                            ) : (
                                <Image
                                    source={getImage(item.id, item.category)}
                                    style={styles.productImage}
                                    resizeMode="contain"
                                />
                            )}
                        </View>
                        <View style={styles.productInfo}>
                            <Text style={styles.productName}>{item.name}</Text>
                            <Text style={styles.productDesc} numberOfLines={1}>{item.description}</Text>
                            <View style={styles.priceRow}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={styles.priceBadge}>
                                        <Text style={styles.currencyText}>{t('rs')}</Text>
                                        <Text style={styles.productPrice}>{item.price}</Text>
                                    </View>
                                    {isAdmin && !item.isSpecialDeal && (
                                        <TouchableOpacity onPress={() => onEditPrice(item)} style={{ marginLeft: 10 }}>
                                            <Text style={{ color: COLORS.primary, fontSize: 13, textDecorationLine: 'underline' }}>Edit</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => addToCart(item)}
                                >
                                    <Text style={styles.addButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </BlurView>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    productCardWrapper: {
        marginBottom: 18,
        borderRadius: 20,
        overflow: 'hidden',
        // Glassmorphism soft glowing shadow
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    animatedBorderContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        padding: 1.5, // This creates the thickness of the moving line
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    rotatingGradientContainer: {
        position: 'absolute',
        top: '-100%',
        left: '-100%',
        right: '-100%',
        bottom: '-100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradientLine: {
        width: '200%',
        height: '200%',
    },
    productCard: {
        backgroundColor: COLORS.glass,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 18.5, // Slightly smaller than container for smooth look
    },
    imageWrapper: {
        width: 90,
        height: 90,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Frosted inner for dark mode
        justifyContent: 'center',
        alignItems: 'center',
    },
    productImage: {
        width: 80,
        height: 80,
    },
    dealIconWrapper: {
        width: 70,
        height: 70,
        borderRadius: 25,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    dealIconLetter: {
        fontSize: 35,
        fontWeight: '900',
        color: COLORS.secondary,
        fontStyle: 'italic',
    },
    productInfo: {
        flex: 1,
        marginLeft: 15,
    },
    productName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: COLORS.textDark, // this is now light grey
    },
    productDesc: {
        fontSize: 13,
        color: COLORS.textLight,
        marginVertical: 4,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    priceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)', // Subtle Gold tint
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    currencyText: {
        fontSize: 12,
        color: COLORS.accent,
        fontWeight: '600',
        marginRight: 4,
        opacity: 0.8,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.accent,
        textShadowColor: 'rgba(255, 215, 0, 0.4)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 10,
    },
    addButtonText: {
        color: COLORS.secondary,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ProductCard;
