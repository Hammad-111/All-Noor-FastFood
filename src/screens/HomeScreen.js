
import React, { useState, useMemo } from 'react';

import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, TextInput, Animated, Modal, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import SplitScreen from '../components/SplitScreen';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { getImage } from '../utils/imageMap';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebaseConfig';
import { doc, onSnapshot, setDoc, collection, addDoc, deleteDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../components/ProductCard';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: '0', name: 'Deals', icon: '🔥' },
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
    const { isAdmin } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('Deals'); // Default to Deals
    const [searchQuery, setSearchQuery] = useState('');
    const [prices, setPrices] = useState({});
    const [dbProducts, setDbProducts] = useState([]);
    const [deals, setDeals] = useState([]);
    const [dealCategoryName, setDealCategoryName] = useState('Deals');
    const [editingProduct, setEditingProduct] = useState(null);
    const [newPrice, setNewPrice] = useState('');
    const [savingPrice, setSavingPrice] = useState(false);

    // Add Deal States
    const [addingDeal, setAddingDeal] = useState(false);
    const [newDeal, setNewDeal] = useState({ name: '', description: '', price: '' });
    const [savingDeal, setSavingDeal] = useState(false);

    // Rename Category States
    const [renamingCategory, setRenamingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [savingCategory, setSavingCategory] = useState(false);

    React.useEffect(() => {
        const pricesRef = doc(db, 'settings', 'prices');
        const unsubscribePrices = onSnapshot(pricesRef, (docSnap) => {
            if (docSnap.exists()) {
                setPrices(docSnap.data());
            }
        });

        const configRef = doc(db, 'settings', 'store_config');
        const unsubscribeConfig = onSnapshot(configRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().dealCategoryName) {
                setDealCategoryName(docSnap.data().dealCategoryName);
            } else {
                setDealCategoryName('Deals');
            }
        });

        const productsRef = collection(db, 'products');
        const unsubscribeProducts = onSnapshot(productsRef, (snapshot) => {
            const fetchedProducts = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id // overwrite id if it exists, or provide it
            }));
            // If empty, we can fallback to old PRODUCTS temporarily so the screen doesn't break
            // before the admin clicks Seed Database.
            if (fetchedProducts.length > 0) {
                setDbProducts(fetchedProducts);
            } else {
                setDbProducts(PRODUCTS);
            }
        });

        const dealsRef = collection(db, 'special_deals');
        const unsubscribeDeals = onSnapshot(dealsRef, (snapshot) => {
            const fetchedDeals = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isSpecialDeal: true, // Mark as special deal
                category: 'Deals', // Assign to 'Deals' category
                imageKey: 'deal_01' // Default image for deals
            }));
            setDeals(fetchedDeals);
        });

        return () => {
            unsubscribePrices();
            unsubscribeDeals();
            unsubscribeConfig();
            unsubscribeProducts();
        };
    }, []);

    const handleSeedDatabase = async () => {
        Alert.alert(
            "Seed Database",
            "This will upload all local products to Firebase. Continue?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Upload", onPress: async () => {
                        try {
                            for (let prod of PRODUCTS) {
                                // Uploading using the specified ID so images map correctly
                                await setDoc(doc(db, 'products', prod.id), prod);
                            }
                            Alert.alert("Success", "All products uploaded to database!");
                        } catch (error) {
                            console.error("Seed error", error);
                            Alert.alert("Error", "Could not seed database.");
                        }
                    }
                }
            ]
        );
    };

    const finalProducts = useMemo(() => {
        return dbProducts.map(p => ({
            ...p,
            price: prices[p.id] !== undefined ? prices[p.id] : p.price
        }));
    }, [prices]);

    const filteredProducts = useMemo(() => {
        const allProducts = [...finalProducts, ...deals];
        return allProducts.filter(p =>
            p.category === selectedCategory &&
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [selectedCategory, searchQuery, finalProducts, deals]);

    const handleEditPrice = (product) => {
        setEditingProduct(product);
        setNewPrice(product.price.toString());
    };

    const handleSavePrice = async () => {
        if (!editingProduct || !newPrice) return;
        const priceNum = Number(newPrice);
        if (isNaN(priceNum) || priceNum < 0) {
            Alert.alert("Invalid Price", "Please enter a valid positive number.");
            return;
        }

        setSavingPrice(true);
        try {
            const pricesRef = doc(db, 'settings', 'prices');
            await setDoc(pricesRef, {
                [editingProduct.id]: priceNum
            }, { merge: true });
            setEditingProduct(null);
            setNewPrice('');
        } catch (error) {
            console.error("Error saving price:", error);
            Alert.alert("Error", "Could not save the price.");
        } finally {
            setSavingPrice(false);
        }
    };

    const handleSaveNewDeal = async () => {
        if (!newDeal.name || !newDeal.price || !newDeal.description) {
            Alert.alert("Missing Fields", "Please fill out all fields for the deal.");
            return;
        }

        const priceNum = Number(newDeal.price);
        if (isNaN(priceNum) || priceNum <= 0) {
            Alert.alert("Invalid Price", "Please enter a valid positive number for the deal.");
            return;
        }

        setSavingDeal(true);
        try {
            await addDoc(collection(db, 'special_deals'), {
                name: newDeal.name,
                description: newDeal.description,
                price: priceNum,
                createdAt: new Date().toISOString()
            });
            setAddingDeal(false);
            setNewDeal({ name: '', description: '', price: '' });
        } catch (error) {
            console.error("Error adding deal:", error);
            Alert.alert("Error", "Could not save the special deal.");
        } finally {
            setSavingDeal(false);
        }
    };

    const handleDeleteDeal = async (dealId) => {
        Alert.alert(
            "Delete Deal",
            "Are you sure you want to delete this special deal?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'special_deals', dealId));
                        } catch (error) {
                            console.error("Error deleting deal:", error);
                            Alert.alert("Error", "Could not delete the deal.");
                        }
                    }
                }
            ]
        );
    };

    const handleSaveCategoryName = async () => {
        if (!newCategoryName.trim()) {
            Alert.alert("Invalid Name", "Category name cannot be empty.");
            return;
        }

        setSavingCategory(true);
        try {
            const configRef = doc(db, 'settings', 'store_config');
            await setDoc(configRef, {
                dealCategoryName: newCategoryName.trim()
            }, { merge: true });
            setRenamingCategory(false);
        } catch (error) {
            console.error("Error renaming category:", error);
            Alert.alert("Error", "Could not rename category.");
        } finally {
            setSavingCategory(false);
        }
    };

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const renderCategory = ({ item, index }) => {
        const categoryDisplayName = item.id === '0' ? dealCategoryName : t(`categories.${item.name}`);
        const isSelected = selectedCategory === item.name;

        return (
            <TouchableOpacity onPress={() => setSelectedCategory(item.name)} activeOpacity={0.8}>
                {isSelected ? (
                    <LinearGradient
                        colors={COLORS.primaryGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.categoryItemSelected}
                    >
                        <Text style={styles.categoryIcon}>{item.icon}</Text>
                        <Text style={styles.categoryTextSelected}>
                            {categoryDisplayName}
                        </Text>
                    </LinearGradient>
                ) : (
                    <BlurView intensity={70} tint="dark" style={styles.categoryItem}>
                        <Text style={styles.categoryIcon}>{item.icon}</Text>
                        <Text style={styles.categoryText}>{categoryDisplayName}</Text>
                    </BlurView>
                )}
            </TouchableOpacity>
        );
    };

    const renderProduct = ({ item, index }) => {
        return (
            <View style={{ position: 'relative' }}>
                {isAdmin && item.isSpecialDeal && (
                    <TouchableOpacity onPress={() => handleDeleteDeal(item.id)} style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
                        <Text style={{ fontSize: 20 }}>🗑️</Text>
                    </TouchableOpacity>
                )}
                <ProductCard
                    item={item}
                    index={index}
                    navigation={navigation}
                    addToCart={addToCart}
                    isAdmin={isAdmin && !item.isSpecialDeal}
                    onEditPrice={handleEditPrice}
                />
            </View>
        );
    };

    return (
        <SplitScreen ratio={0.35}>
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.container}>
                    {/* Header Section */}
                    <View style={styles.header}>
                        <View style={styles.topRow}>
                            <TouchableOpacity
                                style={styles.menuIconContainer}
                                onPress={() => navigation.navigate('ProfileTab')}
                            >
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

                        {isAdmin && (
                            <TouchableOpacity
                                style={{ backgroundColor: 'red', padding: 5, borderRadius: 5, marginTop: 5, alignSelf: 'flex-end' }}
                                onPress={handleSeedDatabase}
                            >
                                <Text style={{ color: 'white', fontSize: 10 }}>[Admin] Seed DB</Text>
                            </TouchableOpacity>
                        )}

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
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                                        <Text style={styles.sectionTitle}>
                                            {selectedCategory === 'Deals' ? dealCategoryName : t(`categories.${selectedCategory}`)} {t('specials')}
                                        </Text>
                                        {isAdmin && selectedCategory === 'Deals' && (
                                            <View style={{ flexDirection: 'row' }}>
                                                <TouchableOpacity
                                                    style={[styles.addDealBtn, { backgroundColor: 'rgba(0,0,0,0.05)', marginRight: 10 }]}
                                                    onPress={() => {
                                                        setNewCategoryName(dealCategoryName);
                                                        setRenamingCategory(true);
                                                    }}
                                                >
                                                    <Text style={[styles.addDealBtnText, { color: COLORS.primary }]}>✏️</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.addDealBtn}
                                                    onPress={() => setAddingDeal(true)}
                                                >
                                                    <Text style={styles.addDealBtnText}>+ Add Deal</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
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

                {/* Admin Price Edit Modal */}
                <Modal
                    visible={!!editingProduct}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setEditingProduct(null)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalOverlay}
                    >
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Edit Price</Text>
                            {editingProduct && (
                                <Text style={styles.modalSubtitle}>{editingProduct.name}</Text>
                            )}

                            <View style={styles.priceInputContainer}>
                                <Text style={styles.currencyPrefix}>{t('rs')}</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    value={newPrice}
                                    onChangeText={setNewPrice}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#999"
                                    autoFocus
                                />
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.modalBtnCancel]}
                                    onPress={() => setEditingProduct(null)}
                                    disabled={savingPrice}
                                >
                                    <Text style={styles.modalBtnCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.modalBtnSave, savingPrice && { opacity: 0.7 }]}
                                    onPress={handleSavePrice}
                                    disabled={savingPrice}
                                >
                                    {savingPrice ? (
                                        <ActivityIndicator color={COLORS.secondary} size="small" />
                                    ) : (
                                        <Text style={styles.modalBtnSaveText}>Save</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                {/* Add Deal Modal */}
                <Modal
                    visible={addingDeal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setAddingDeal(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalOverlay}
                    >
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Add Special Deal</Text>
                            <Text style={styles.modalSubtitle}>Create a new deal for all users</Text>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    value={newDeal.name}
                                    onChangeText={(txt) => setNewDeal({ ...newDeal, name: txt })}
                                    placeholder="Deal Name (e.g. Ramadan Special)"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={[styles.inputContainer, { height: 80 }]}>
                                <TextInput
                                    style={[styles.textInput, { textAlignVertical: 'top' }]}
                                    value={newDeal.description}
                                    onChangeText={(txt) => setNewDeal({ ...newDeal, description: txt })}
                                    placeholder="Description (e.g. 2 Zinger Burgers + Fries)"
                                    placeholderTextColor="#999"
                                    multiline
                                />
                            </View>

                            <View style={styles.priceInputContainer}>
                                <Text style={styles.currencyPrefix}>{t('rs')}</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    value={newDeal.price}
                                    onChangeText={(txt) => setNewDeal({ ...newDeal, price: txt })}
                                    keyboardType="numeric"
                                    placeholder="Price"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.modalBtnCancel]}
                                    onPress={() => {
                                        setAddingDeal(false);
                                        setNewDeal({ name: '', description: '', price: '' });
                                    }}
                                    disabled={savingDeal}
                                >
                                    <Text style={styles.modalBtnCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.modalBtnSave, savingDeal && { opacity: 0.7 }]}
                                    onPress={handleSaveNewDeal}
                                    disabled={savingDeal}
                                >
                                    {savingDeal ? (
                                        <ActivityIndicator color={COLORS.secondary} size="small" />
                                    ) : (
                                        <Text style={styles.modalBtnSaveText}>Add Deal</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                {/* Rename Deals Category Modal */}
                <Modal
                    visible={renamingCategory}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setRenamingCategory(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalOverlay}
                    >
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Rename Deals</Text>
                            <Text style={styles.modalSubtitle}>Change the display name of this tab</Text>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    value={newCategoryName}
                                    onChangeText={setNewCategoryName}
                                    placeholder="e.g. Ramadan Offer"
                                    placeholderTextColor="#999"
                                    autoFocus
                                />
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.modalBtnCancel]}
                                    onPress={() => setRenamingCategory(false)}
                                    disabled={savingCategory}
                                >
                                    <Text style={styles.modalBtnCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.modalBtnSave, savingCategory && { opacity: 0.7 }]}
                                    onPress={handleSaveCategoryName}
                                    disabled={savingCategory}
                                >
                                    {savingCategory ? (
                                        <ActivityIndicator color={COLORS.secondary} size="small" />
                                    ) : (
                                        <Text style={styles.modalBtnSaveText}>Save</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </SafeAreaView>
        </SplitScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: '33%',
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
        marginHorizontal: 15,
        marginTop: 15,
        borderRadius: 20,
        paddingHorizontal: 15,
        height: 55,
        marginBottom: 5,
        backgroundColor: COLORS.glass,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        // Soft glowing shadow
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 10,
        opacity: 0.8,
    },
    searchInput: {
        flex: 1,
        color: COLORS.textDark,
        fontSize: 16,
        fontWeight: '500',
    },
    categoryList: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        overflow: 'visible', // allows shadow to be seen
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 10,
        marginRight: 12,
        borderRadius: 25,
        backgroundColor: COLORS.glass,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        height: 45,
        // Mild shadow
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryItemSelected: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 10,
        marginRight: 12,
        borderRadius: 25,
        height: 45,
        // Bold shadow for active gradient
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    categoryIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    categoryText: {
        color: COLORS.textDark,
        fontWeight: '600',
        fontSize: 15,
    },
    categoryTextSelected: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 15,
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
    },
    addDealBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
    },
    addDealBtnText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#0F172A',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    modalTitle: {
        ...FONTS.h2,
        color: COLORS.secondary,
        marginBottom: 5,
    },
    modalSubtitle: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        paddingHorizontal: 15,
        width: '100%',
        height: 50,
        marginBottom: 15,
        justifyContent: 'center',
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.secondary,
    },
    priceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        paddingHorizontal: 15,
        width: '100%',
        height: 50,
        marginBottom: 25,
    },
    currencyPrefix: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginRight: 10,
    },
    priceInput: {
        flex: 1,
        fontSize: 18,
        color: COLORS.secondary,
        fontWeight: '500',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalBtn: {
        flex: 1,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    modalBtnCancel: {
        backgroundColor: '#f5f5f5',
        marginRight: 10,
    },
    modalBtnSave: {
        backgroundColor: COLORS.primary,
        marginLeft: 10,
    },
    modalBtnCancelText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    modalBtnSaveText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default HomeScreen;
