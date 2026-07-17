import React from 'react';
import { View, Text, TouchableOpacity, Image, Animated, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { getImage } from '../utils/imageMap';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Ionicons as Icon } from '@expo/vector-icons';

const getDealCode = (item) => {
    const number = item.name?.match(/\d+/)?.[0] || item.id?.match(/\d+/)?.[0];
    return number ? `D-${number.padStart(2, '0')}` : 'DEAL';
};

const ProductCard = ({ item, index, addToCart, isAdmin, onEditPrice, onDelete }) => {
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
    const { t } = useLanguage();
    const { toggleFavorite, isFavorite } = useCart();
    const favorite = isFavorite(item.id);
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
                useNativeDriver: Platform.OS !== 'web',
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
            <View style={styles.productCardWrapper}>
                <View style={styles.animatedBorderContainer}>
                    <Animated.View style={[
                        styles.rotatingGradientContainer,
                        { transform: [{ rotate: spin }] }
                    ]}>
                        <LinearGradient
                            colors={['transparent', colors.accent, 'transparent', colors.primary, 'transparent']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.gradientLine}
                        />
                    </Animated.View>
                    <BlurView intensity={70} tint="dark" style={styles.productCard}>
                        <View style={styles.imageWrapper}>
                            {item.category === 'Deals' ? (
                                <LinearGradient
                                    colors={['rgba(255, 215, 0, 0.18)', 'rgba(255, 215, 0, 0.04)']}
                                    style={styles.dealProfessionalBadge}
                                >
                                    <Icon name="pricetag-outline" size={21} color={colors.accent} />
                                    <Text style={styles.dealBadgeLabel}>SPECIAL</Text>
                                    <Text style={styles.dealBadgeCode}>{getDealCode(item)}</Text>
                                </LinearGradient>
                            ) : item.isSpecialDeal || item.isDynamic || !item.imageKey ? (
                                <View style={[styles.dealIconWrapper, item.isDynamic && { backgroundColor: colors.accent }]}>
                                    <Text style={[styles.dealIconLetter, item.isDynamic && { color: colors.secondary }]}>
                                        {item.name ? item.name.charAt(0).toUpperCase() : 'P'}
                                    </Text>
                                </View>
                            ) : (
                                <Image
                                    source={getImage(item.imageKey || item.id, item.category)}
                                    style={styles.productImage}
                                    resizeMode="contain"
                                />
                            )}
                        </View>
                        <View style={styles.productInfo}>
                            <View style={styles.titleRow}>
                                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                                <TouchableOpacity
                                    style={[
                                        styles.favoriteButton,
                                        favorite && styles.favoriteButtonActive
                                    ]}
                                    onPress={() => toggleFavorite(item)}
                                    activeOpacity={0.7}
                                    accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                    <Icon
                                        name={favorite ? 'heart' : 'heart-outline'}
                                        size={19}
                                        color={favorite ? '#FF4D67' : colors.textLight}
                                    />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.productDesc} numberOfLines={1}>{item.description}</Text>
                            <View style={styles.priceRow}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={styles.priceBadge}>
                                        {item.sizes && <Text style={styles.fromText}>{t('from')} </Text>}
                                        <Text style={styles.currencyText}>{t('rs')}</Text>
                                        <Text style={styles.productPrice}>{item.sizes ? item.sizes[0].price : item.price}</Text>
                                    </View>
                                    {isAdmin && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                                            {!item.isSpecialDeal && (
                                                <TouchableOpacity onPress={() => onEditPrice(item)} style={{ marginRight: 8 }}>
                                                    <Text style={{ color: colors.primary, fontSize: 13, textDecorationLine: 'underline' }}>Edit</Text>
                                                </TouchableOpacity>
                                            )}
                                            {(item.isDynamic || item.isSpecialDeal) && (
                                                <TouchableOpacity onPress={() => onDelete(item)}>
                                                    <Text style={{ color: '#FF5252', fontSize: 13, textDecorationLine: 'underline' }}>Delete</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    )}
                                </View>
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => addToCart(item)}
                                >
                                    <Text style={[styles.addButtonText, item.sizes && { fontSize: 13, letterSpacing: 0.5 }]}>
                                        {item.sizes ? t('selectSize') : '+'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </BlurView>
                </View>
            </View>
        </Animated.View>
    );
};

const createStyles = (colors) => StyleSheet.create({
    productCardWrapper: {
        marginBottom: 18,
        borderRadius: 20,
        overflow: 'hidden',
        // Glassmorphism soft glowing shadow - platform aware
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            },
            web: {
                boxShadow: `0px 10px 20px ${colors.primary}26` // 26 is ~15% opacity
            }
        })
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
        backgroundColor: colors.glass,
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
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
            },
            android: {
                elevation: 5,
            },
            web: {
                boxShadow: `0px 4px 5px ${colors.primary}4D` // 4D is ~30% opacity
            }
        })
    },
    dealIconLetter: {
        fontSize: 35,
        fontWeight: '900',
        color: colors.secondary,
        fontStyle: 'italic',
    },
    dealProfessionalBadge: {
        width: 72,
        height: 72,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dealBadgeLabel: {
        color: colors.textLight,
        fontSize: 8,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginTop: 3,
    },
    dealBadgeCode: {
        color: colors.accent,
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 0.8,
        textAlign: 'center',
    },
    productInfo: {
        flex: 1,
        marginLeft: 15,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    productName: {
        flex: 1,
        fontSize: 17,
        fontWeight: 'bold',
        color: colors.textDark, // this is now light grey
    },
    favoriteButton: {
        width: 32,
        height: 32,
        marginLeft: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    favoriteButtonActive: {
        backgroundColor: 'rgba(255, 77, 103, 0.14)',
        borderColor: 'rgba(255, 77, 103, 0.35)',
    },
    productDesc: {
        fontSize: 13,
        color: colors.textLight,
        marginVertical: 4,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
        gap: 8,
        paddingRight: 5,
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
    fromText: {
        fontSize: 10,
        color: colors.accent,
        fontWeight: '400',
        marginRight: 2,
        opacity: 0.6,
    },
    currencyText: {

        fontSize: 12,
        color: colors.accent,
        fontWeight: '600',
        marginRight: 4,
        opacity: 0.8,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.accent,
        ...Platform.select({
            ios: {
                textShadowColor: 'rgba(255, 215, 0, 0.4)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
            },
            android: {
                elevation: 0, // Text shadow not supported on Android naturally
            },
            web: {
                textShadow: '0px 2px 4px rgba(255, 215, 0, 0.4)'
            }
        })
    },
    addButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 10,
    },
    addButtonText: {
        color: colors.secondary,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ProductCard;
