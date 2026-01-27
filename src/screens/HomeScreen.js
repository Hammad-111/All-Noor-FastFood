
import React, { useState, useMemo } from 'react';

import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, TextInput, Animated } from 'react-native';
import SplitScreen from '../components/SplitScreen';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { getImage } from '../utils/imageMap';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: '1', name: 'Burgers', icon: '🍔' },
    { id: '2', name: 'Pizza', icon: '🍕' },
    { id: '3', name: 'Karahi', icon: '🥘' },
    { id: '4', name: 'Shawarma', icon: '🌯' },
    { id: '5', name: 'Rice', icon: '🍚' },
    { id: '6', name: 'Chicken', icon: '🍗' },
    { id: '7', name: 'Soup/Salad', icon: '🥣' },
    { id: '8', name: 'Drinks/Sides', icon: '🥤' },
];

const PRODUCTS = [
    // Burger's Zone
    { id: 'b1', name: 'Petty Burger', price: 140, category: 'Burgers', imageKey: 'burger_01', description: 'Classic petty burger.' },
    { id: 'b2', name: 'Zinger Burger', price: 150, category: 'Burgers', imageKey: 'burger_01', description: 'Crispy zinger fillet.' },
    { id: 'b2_p', name: 'Zinger Burger (Cheese)', price: 170, category: 'Burgers', imageKey: 'burger_01', description: 'Zinger burger with extra cheese.' },
    { id: 'b3', name: 'Big Zinger Burger', price: 180, category: 'Burgers', imageKey: 'burger_01', description: 'Classic big zinger.' },
    { id: 'b3_p', name: 'Big Zinger (Cheese)', price: 220, category: 'Burgers', imageKey: 'burger_01', description: 'Big zinger with extra cheese.' },
    { id: 'b4', name: 'Smokey Burger', price: 190, category: 'Burgers', imageKey: 'burger_01', description: 'Hickory smoked flavor.' },
    { id: 'b5', name: 'Tower Burger', price: 250, category: 'Burgers', imageKey: 'burger_01', description: 'Massive multi-layer zinger.' },
    { id: 'b6', name: 'Al Noor Special Burger', price: 260, category: 'Burgers', imageKey: 'burger_special', description: 'Signature home style burger.' },
    { id: 'b7', name: 'Chapli Kabab Burger', price: 200, category: 'Burgers', imageKey: 'burger_01', description: 'Traditional chapli kabab patty.' },

    // Pizza
    { id: 'p1', name: 'Chicken Tikka Pizza', price: 1200, category: 'Pizza', imageKey: 'pizza_01', description: 'Traditional Tikka chunks.' },
    { id: 'p2', name: 'Chicken Fajita Pizza', price: 1200, category: 'Pizza', imageKey: 'pizza_fajita', description: 'Mexican-style Fajita flavors.' },
    { id: 'p3', name: 'Al Noor Special Pizza', price: 1400, category: 'Pizza', imageKey: 'pizza_01', description: 'Full loaded with extra toppings.' },

    // Karahi Special
    { id: 'k1_h', name: 'Chicken Karahi (Half)', price: 400, category: 'Karahi', imageKey: 'karahi_01', description: 'Spicy chicken karahi.' },
    { id: 'k1_f', name: 'Chicken Karahi (Full)', price: 750, category: 'Karahi', imageKey: 'karahi_01', description: 'Spicy chicken karahi.' },
    { id: 'k2_h', name: 'Chicken Handi (Half)', price: 500, category: 'Karahi', imageKey: 'handi_01', description: 'Creamy chicken handi.' },
    { id: 'k2_f', name: 'Chicken Handi (Full)', price: 900, category: 'Karahi', imageKey: 'handi_01', description: 'Creamy chicken handi.' },
    { id: 'k3_h', name: 'White Handi (Half)', price: 550, category: 'Karahi', imageKey: 'handi_01', description: 'Rich white cream handi.' },
    { id: 'k3_f', name: 'White Handi (Full)', price: 950, category: 'Karahi', imageKey: 'handi_01', description: 'Rich white cream handi.' },
    { id: 'k4_h', name: 'White Karahi (Half)', price: 500, category: 'Karahi', imageKey: 'karahi_01', description: 'Traditional white karahi.' },
    { id: 'k4_f', name: 'White Karahi (Full)', price: 900, category: 'Karahi', imageKey: 'karahi_01', description: 'Traditional white karahi.' },
    { id: 'k5_h', name: 'Achari Handi (Half)', price: 400, category: 'Karahi', imageKey: 'handi_01', description: 'Tangy achari flavor.' },
    { id: 'k5_f', name: 'Achari Handi (Full)', price: 750, category: 'Karahi', imageKey: 'handi_01', description: 'Tangy achari flavor.' },
    { id: 'k6', name: 'Badami Handi (Full)', price: 900, category: 'Karahi', imageKey: 'handi_01', description: 'Handi with almond paste.' },
    { id: 'k7', name: 'Murgh Makhni (Full)', price: 900, category: 'Karahi', imageKey: 'karahi_01', description: 'Butter chicken special.' },

    // Shawarma's
    { id: 's1', name: 'Chicken Shawarma', price: 90, category: 'Shawarma', imageKey: 'shawarma_01', description: 'Grilled chicken shawarma.' },
    { id: 's2', name: 'Zinger Shawarma', price: 150, category: 'Shawarma', imageKey: 'shawarma_01', description: 'Crispy zinger shawarma.' },
    { id: 's3', name: 'Paratha Roll', price: 120, category: 'Shawarma', imageKey: 'roll_01', description: 'Classic chicken paratha roll.' },
    { id: 's4', name: 'Zinger Paratha', price: 150, category: 'Shawarma', imageKey: 'roll_01', description: 'Crispy zinger wrapped in paratha.' },

    // Rice
    { id: 'r1_s', name: 'Masala Rice (Small)', price: 220, category: 'Rice', imageKey: 'rice_01', description: 'Spicy platter masala rice.' },
    { id: 'r1_l', name: 'Masala Rice (Large)', price: 320, category: 'Rice', imageKey: 'rice_01', description: 'Large platter masala rice.' },
    { id: 'r2_s', name: 'Egg Fried Rice (Small)', price: 220, category: 'Rice', imageKey: 'rice_01', description: 'Classic egg fried rice.' },
    { id: 'r2_l', name: 'Egg Fried Rice (Large)', price: 320, category: 'Rice', imageKey: 'rice_01', description: 'Large egg fried rice.' },
    { id: 'r3', name: 'Plain Rice', price: 150, category: 'Rice', imageKey: 'rice_01', description: 'Simple steamed rice.' },

    // Chicken Broast & More
    { id: 'c1', name: 'Chicken Leg Piece', price: 130, category: 'Chicken', imageKey: 'chicken_01', description: 'Deep fried leg piece.' },
    { id: 'c2', name: 'Chicken Chest Piece', price: 140, category: 'Chicken', imageKey: 'chicken_01', description: 'Deep fried chest piece.' },
    { id: 'c3', name: 'Chicken Sajji', price: 800, category: 'Chicken', imageKey: 'chicken_01', description: 'Whole roasted Sajji.' },
    { id: 'c4_5', name: 'Hot Wings (5 pcs)', price: 150, category: 'Chicken', imageKey: 'chicken_01', description: 'Spicy buffalo wings.' },
    { id: 'c4_10', name: 'Hot Wings (10 pcs)', price: 280, category: 'Chicken', imageKey: 'chicken_01', description: 'Large serving wings.' },
    { id: 'c5', name: 'Hot Shot (12 pcs)', price: 200, category: 'Chicken', imageKey: 'chicken_01', description: 'Popcorn chicken chunks.' },
    { id: 'c6_5', name: 'Nuggets (5 pcs)', price: 140, category: 'Chicken', imageKey: 'chicken_01', description: 'Golden breaded nuggets.' },
    { id: 'c6_10', name: 'Nuggets (10 pcs)', price: 260, category: 'Chicken', imageKey: 'chicken_01', description: 'Large serving nuggets.' },

    // Soups & Salads
    { id: 'sl1', name: 'Fruit Salad', price: 200, category: 'Soup/Salad', imageKey: 'salad_01', description: 'Refreshing mix of fruits.' },
    { id: 'sl2', name: 'Russian Salad', price: 200, category: 'Soup/Salad', imageKey: 'salad_01', description: 'Creamy vegetable salad.' },
    { id: 'sl3', name: 'Fresh Salad', price: 50, category: 'Soup/Salad', imageKey: 'salad_01', description: 'Seasonal fresh veggies.' },
    { id: 'sl4', name: 'Kachumar Salad', price: 70, category: 'Soup/Salad', imageKey: 'salad_01', description: 'Traditional chopped kachumar.' },
    { id: 'sp1_s', name: 'Hot & Sour Soup (S)', price: 200, category: 'Soup/Salad', imageKey: 'soup_01', description: 'Spicy chicken hot & sour.' },
    { id: 'sp1_l', name: 'Hot & Sour Soup (L)', price: 300, category: 'Soup/Salad', imageKey: 'soup_01', description: 'Large hot & sour soup.' },
    { id: 'sp2_s', name: 'Corn Soup (S)', price: 200, category: 'Soup/Salad', imageKey: 'soup_01', description: 'Creamy chicken corn soup.' },
    { id: 'sp2_l', name: 'Corn Soup (L)', price: 300, category: 'Soup/Salad', imageKey: 'soup_01', description: 'Large corn soup.' },
    { id: 'sp3_s', name: 'Al Noor Special Soup (S)', price: 250, category: 'Soup/Salad', imageKey: 'soup_01', description: 'Signature thick soup.' },
    { id: 'sp3_l', name: 'Al Noor Special Soup (L)', price: 400, category: 'Soup/Salad', imageKey: 'soup_01', description: 'Signature thick soup.' },

    // Sides & Drinks
    { id: 'sd1_r', name: 'French Fries (Reg)', price: 100, category: 'Drinks/Sides', imageKey: 'sides_01', description: 'Crispy salted fries.' },
    { id: 'sd1_l', name: 'French Fries (Large)', price: 180, category: 'Drinks/Sides', imageKey: 'sides_01', description: 'Large portion fries.' },
    { id: 'd1_r', name: 'Cold Drink (Reg)', price: 30, category: 'Drinks/Sides', imageKey: 'drink_01', description: 'Regular serving drink.' },
    { id: 'd1_500', name: 'Cold Drink (500ml)', price: 60, category: 'Drinks/Sides', imageKey: 'drink_01', description: '500ml drink bottle.' },
    { id: 'd1_1', name: 'Cold Drink (1 Ltr)', price: 80, category: 'Drinks/Sides', imageKey: 'drink_01', description: '1 Liter drink bottle.' },
    { id: 'd1_15', name: 'Cold Drink (1.5 Ltr)', price: 100, category: 'Drinks/Sides', imageKey: 'drink_01', description: '1.5 Liter drink bottle.' },
    { id: 'w_s', name: 'Mineral Water (S)', price: 40, category: 'Drinks/Sides', imageKey: 'drink_01', description: 'Small water bottle.' },
    { id: 'w_l', name: 'Mineral Water (L)', price: 70, category: 'Drinks/Sides', imageKey: 'drink_01', description: 'Large water bottle.' },
];

const HomeScreen = () => {
    const navigation = useNavigation();
    const { addToCart, cart } = useCart();
    const { t } = useLanguage();
    const [selectedCategory, setSelectedCategory] = useState('Burgers');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = useMemo(() => {
        return PRODUCTS.filter(p =>
            p.category === selectedCategory &&
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [selectedCategory, searchQuery]);

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const renderCategory = ({ item, index }) => {
        // Simple fade in for categories
        return (
            <TouchableOpacity
                style={[
                    styles.categoryItem,
                    selectedCategory === item.name && styles.categoryItemSelected
                ]}
                onPress={() => setSelectedCategory(item.name)}
            >
                <Text style={styles.categoryIcon}>{item.icon}</Text>
                <Text style={[
                    styles.categoryText,
                    selectedCategory === item.name && styles.categoryTextSelected
                ]}>{t(`categories.${item.name}`)}</Text>
            </TouchableOpacity>
        );
    };

    const renderProduct = ({ item, index }) => {
        return (
            <ProductCard
                item={item}
                index={index}
                navigation={navigation}
                addToCart={addToCart}
            />
        );
    };

    return (
        <SplitScreen>
            <View style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.topRow}>
                        <TouchableOpacity style={styles.menuIconContainer}>
                            <View style={styles.menuBar} />
                            <View style={[styles.menuBar, { width: 15 }]} />
                            <View style={styles.menuBar} />
                        </TouchableOpacity>

                        <View style={styles.titleWrapper}>
                            <Text style={styles.appTitle}>AL-NOOR</Text>
                            <View style={styles.goldLine} />
                        </View>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('CartTab')}
                            style={styles.cartBtn}
                        >
                            <Text style={styles.cartBtnEmoji}>🛒</Text>
                            {cartItemCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{cartItemCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder={t('searchPlaceholder')}
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <FlatList
                        data={CATEGORIES}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={renderCategory}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.categoryList}
                    />
                </View>

                {/* Content Section */}
                <View style={styles.productListContainer}>
                    <FlatList
                        ListHeaderComponent={
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>{t(`categories.${selectedCategory}`)} {t('specials')}</Text>
                                <TouchableOpacity>
                                    <Text style={styles.seeAll}>{t('seeAll')}</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        data={filteredProducts}
                        renderItem={renderProduct}
                        keyExtractor={item => item.id}
                        contentContainerStyle={[styles.productList, { paddingBottom: 150 }]}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptySearch}>
                                <Text style={styles.emptyEmoji}>😕</Text>
                                <Text style={styles.emptyText}>{t('noItemsFound')} for "{searchQuery}"</Text>
                            </View>
                        }
                    />
                </View>
            </View>
        </SplitScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: '40%',
        paddingTop: 50,
        paddingHorizontal: SIZES.padding,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    menuBar: {
        height: 3,
        width: 25,
        backgroundColor: COLORS.secondary,
        marginVertical: 2,
        borderRadius: 2,
    },
    titleWrapper: {
        alignItems: 'center',
    },
    appTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.accent,
        letterSpacing: 2,
    },
    goldLine: {
        height: 2,
        width: 30,
        backgroundColor: COLORS.accent,
        marginTop: -2,
    },
    cartBtn: {
        width: 45,
        height: 45,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBtnEmoji: {
        fontSize: 22,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: COLORS.accent,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        paddingHorizontal: 4,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    badgeText: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: COLORS.secondary,
        fontSize: 15,
        fontWeight: '500',
    },
    categoryList: {
        paddingVertical: 10,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        height: 40,
    },
    categoryItemSelected: {
        backgroundColor: COLORS.accent,
        borderColor: COLORS.accent,
    },
    categoryIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    categoryText: {
        color: COLORS.secondary,
        fontWeight: '600',
    },
    categoryTextSelected: {
        color: COLORS.primary,
    },
    productListContainer: {
        flex: 1,
        marginTop: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        marginBottom: 15,
    },
    sectionTitle: {
        ...FONTS.h2,
        color: COLORS.textDark,
    },
    seeAll: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    productList: {
        paddingHorizontal: SIZES.padding,
    },
    emptySearch: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyEmoji: {
        fontSize: 50,
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    }
});

export default HomeScreen;
