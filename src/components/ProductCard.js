import React from 'react';
import { View, Text, TouchableOpacity, Image, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { getImage } from '../utils/imageMap';
import { useLanguage } from '../context/LanguageContext';

const ProductCard = ({ item, index, navigation, addToCart }) => {
    const { t } = useLanguage();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const translateY = React.useRef(new Animated.Value(50)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                delay: index * 150, // More noticeable stagger
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                damping: 20, // Less bouncy
                stiffness: 80, // Slower movement
                useNativeDriver: true,
            })
        ]).start();
    }, [index]);

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetails', { product: item })}
                activeOpacity={0.9}
            >
                <View style={styles.imageWrapper}>
                    <Image
                        source={getImage(item.id, item.category)}
                        style={styles.productImage}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productDesc} numberOfLines={1}>{item.description}</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.productPrice}>{t('rs')} {item.price}</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => addToCart(item)}
                        >
                            <Text style={styles.addButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    productCard: {
        backgroundColor: COLORS.secondary,
        borderRadius: 20,
        padding: 12,
        marginBottom: 18,
        flexDirection: 'row',
        alignItems: 'center',
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 8,
    },
    imageWrapper: {
        width: 90,
        height: 90,
        borderRadius: 15,
        backgroundColor: '#F9F9F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productImage: {
        width: 80,
        height: 80,
    },
    productInfo: {
        flex: 1,
        marginLeft: 15,
    },
    productName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    productDesc: {
        fontSize: 13,
        color: '#888',
        marginVertical: 4,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    productPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.primary,
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
