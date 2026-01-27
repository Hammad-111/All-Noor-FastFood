
import React from 'react';

import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Animated, Easing } from 'react-native';
import SplitScreen from '../components/SplitScreen';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { getImage } from '../utils/imageMap';
import { useCart } from '../context/CartContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';

const { width } = Dimensions.get('window');

const ProductDetailsScreen = ({ route }) => {
    const insets = useSafeAreaInsets();
    const { product } = route.params;
    const { addToCart, toggleFavorite, isFavorite } = useCart();
    const navigation = useNavigation();

    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const imageScale = React.useRef(new Animated.Value(0.5)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                padding: 100, // delay replacement
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.spring(imageScale, {
                toValue: 1,
                friction: 6,
                tension: 50,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const handleAddToCart = () => {
        addToCart(product);
        // Optional: show a small animation or feedback
    };

    return (
        <View style={styles.mainContainer}>
            <SplitScreen ratio={0.42}>
                <SafeAreaView style={[styles.container, { paddingBottom: Math.max(insets.bottom, 15) }]} edges={['top']}>
                    {/* Top Section: Header & Image */}
                    <View style={styles.imageSection}>
                        <View style={styles.headerRow}>
                            <BackButton color={COLORS.secondary} />
                            <Text style={styles.headerTitle}>Details</Text>
                            <TouchableOpacity
                                onPress={() => toggleFavorite(product)}
                                style={[styles.iconBtn, isFavorite(product.id) && styles.favActive]}
                            >
                                <Text style={styles.iconText}>{isFavorite(product.id) ? '❤️' : '🤍'}</Text>
                            </TouchableOpacity>
                        </View>

                        <Animated.View
                            style={[
                                styles.imageWrapper,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ scale: imageScale }]
                                }
                            ]}
                        >
                            <Image
                                source={getImage(product.id, product.category)}
                                style={styles.productImage}
                                resizeMode="contain"
                            />
                        </Animated.View>
                    </View>

                    {/* Bottom Section: Info */}
                    <View style={styles.infoSection}>
                        <Animated.View
                            style={[
                                styles.infoContent,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }]
                                }
                            ]}
                        >
                            <View style={styles.titleRow}>
                                <Text style={styles.productName}>{product.name}</Text>
                                <View style={styles.ratingBadge}>
                                    <Text style={styles.ratingText}>⭐ 4.8</Text>
                                </View>
                            </View>

                            <Text style={styles.categoryLabel}>{product.category}</Text>

                            <Text style={styles.sectionHeading}>Description</Text>
                            <ScrollView showsVerticalScrollIndicator={false} style={styles.descScroll}>
                                <Text style={styles.description}>{product.description}</Text>
                                <Text style={styles.description}>
                                    Our {product.name} is prepared fresh daily with the finest ingredients.
                                    Perfect for any occasion, whether it's a quick lunch or a family dinner.
                                </Text>
                            </ScrollView>

                            <View style={styles.footer}>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.priceLabel}>Total Price</Text>
                                    <Text
                                        style={styles.priceValue}
                                    >
                                        Rs. {product.price}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.buyButton}
                                    onPress={handleAddToCart}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.buyButtonText}>Add to Cart</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                </SafeAreaView>
            </SplitScreen>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    imageSection: {
        height: '42%',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
    },
    iconBtn: {
        width: 45,
        height: 45,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    favActive: {
        backgroundColor: 'rgba(255,0,0,0.2)',
    },
    iconText: {
        color: COLORS.secondary,
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    imageWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productImage: {
        width: width * 0.7,
        height: width * 0.7,
    },
    infoSection: {
        flex: 1,
        paddingTop: 50, // Space for the wave
        paddingHorizontal: 25,
    },
    infoContent: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    ratingBadge: {
        backgroundColor: '#FFF9E5',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    ratingText: {
        color: '#FFB800',
        fontWeight: 'bold',
    },
    categoryLabel: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
        marginTop: 5,
    },
    sectionHeading: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginTop: 25,
        marginBottom: 10,
    },
    descScroll: {
        flex: 1,
    },
    description: {
        fontSize: 15,
        color: '#777',
        lineHeight: 22,
        marginBottom: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    priceContainer: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 14,
        color: '#999',
    },
    priceValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    buyButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 18,
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    buyButtonText: {
        color: COLORS.secondary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProductDetailsScreen;
