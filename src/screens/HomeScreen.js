
import React, { useState, useMemo } from 'react';

import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, TextInput, Animated, Modal, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import SplitScreen from '../components/SplitScreen';
import { FONTS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { getImage } from '../utils/imageMap';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebaseConfig';
import { doc, onSnapshot, setDoc, collection, addDoc, deleteDoc } from 'firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductCard from '../components/ProductCard';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: '0', name: 'Deals', icon: '🔥' },
    { id: '1', name: 'Burgers', icon: '🍔' },
    { id: '2', name: 'Pizza', icon: '🍕' },
    { id: '3', name: 'Shawarma', icon: '🌯' },
    { id: '4', name: 'Paratha Rolls', icon: '🌯' },
    { id: '5', name: 'Pasta', icon: '🍝' },
    { id: '6', name: 'Chicken', icon: '🍗' },
    { id: '7', name: 'Rice', icon: '🍚' },
    { id: '8', name: 'Fries', icon: '🍟' },
    { id: '9', name: 'Wings', icon: '🍗' },
    { id: '10', name: 'Drinks', icon: '🥤' },
    { id: '11', name: 'Special Items', icon: '✨' },
];


const PRODUCTS = [
    // --- PIZZAS ---
    {
        id: 'p_ans',
        name: 'Al Noor Special Pizza',
        category: 'Pizza',
        imageKey: 'pizza_special',
        description: 'Our signature blend of premium toppings and secret sauces.',
        sizes: [
            { name: 'S', price: 700 },
            { name: 'M', price: 1100 },
            { name: 'L', price: 1600 }
        ]
    },
    {
        id: 'p_cc',
        name: 'Crown Crust Pizza',
        category: 'Pizza',
        imageKey: 'pizza_crown',
        description: 'Majestic crust with a royal blend of cheese and toppings.',
        sizes: [
            { name: 'M', price: 1100 },
            { name: 'L', price: 1700 }
        ]
    },
    {
        id: 'p_ex',
        name: 'Extreme Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'A fiery explosion of spices and overloaded ingredients.',
        sizes: [
            { name: 'S', price: 700 },
            { name: 'M', price: 1250 },
            { name: 'L', price: 1700 }
        ]
    },
    {
        id: 'p_sc',
        name: 'Stuff Crust Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Deliciously melted cheese overflowing from every edge.',
        sizes: [
            { name: 'S', price: 700 },
            { name: 'M', price: 1250 },
            { name: 'L', price: 1700 }
        ]
    },
    {
        id: 'p_ch',
        name: 'Cheesy Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'A paradise for cheese lovers with a double layer of mozzarella.',
        sizes: [
            { name: 'S', price: 700 },
            { name: 'M', price: 1250 },
            { name: 'L', price: 1700 }
        ]
    },
    {
        id: 'p_sk',
        name: 'Seekh Kabab Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Traditional seekh kababs paired with garden fresh veggies.',
        sizes: [
            { name: 'S', price: 650 },
            { name: 'M', price: 1100 },
            { name: 'L', price: 1500 }
        ]
    },
    {
        id: 'p_gm',
        name: 'Green Malai Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Velvety malai sauce with fresh green herbs and chicken.',
        sizes: [
            { name: 'S', price: 700 },
            { name: 'M', price: 1250 },
            { name: 'L', price: 1700 }
        ]
    },
    {
        id: 'p_cr',
        name: 'Crispy Chicken Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Golden fried chicken strips for a perfect crunch in every bite.',
        sizes: [
            { name: 'S', price: 800 },
            { name: 'M', price: 1300 },
            { name: 'L', price: 1900 }
        ]
    },
    {
        id: 'p_sh',
        name: 'Shawarma Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Authentic shawarma-style chicken with a local twist.',
        sizes: [
            { name: 'S', price: 700 },
            { name: 'M', price: 1250 },
            { name: 'L', price: 1700 }
        ]
    },
    {
        id: 'p_cm',
        name: 'Creamy Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Smooth, rich white sauce for a luxurious pizza experience.',
        sizes: [
            { name: 'S', price: 700 },
            { name: 'M', price: 1250 },
            { name: 'L', price: 1700 }
        ]
    },
    {
        id: 'p_bf',
        name: 'Bonfire Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Hickory-smoked chicken for that authentic campfire aroma.',
        sizes: [
            { name: 'S', price: 700 },
            { name: 'M', price: 1250 },
            { name: 'L', price: 1700 }
        ]
    },
    {
        id: 'p_lz',
        name: 'Lazania Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Inspired by lasagna layers, overflowing with sauce and cheese.',
        sizes: [
            { name: 'S', price: 700 },
            { name: 'M', price: 1250 },
            { name: 'L', price: 1700 }
        ]
    },
    {
        id: 'p_rc',
        name: 'Royal Crust Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Fluffy, stuffed golden crust with a touch of royalty.',
        sizes: [
            { name: 'M', price: 1000 },
            { name: 'L', price: 1400 }
        ]
    },
    {
        id: 'p_stk',
        name: 'Stick Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Unique thin crust sticks topped with premium ingredients.',
        sizes: [
            { name: 'M', price: 1000 },
            { name: 'L', price: 1500 }
        ]
    },
    {
        id: 'p_nw',
        name: 'Nawabi Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Exquisite aromatic spices for a truly royal Nawabi treat.',
        sizes: [
            { name: 'M', price: 1000 },
            { name: 'L', price: 1500 }
        ]
    },
    {
        id: 'p_shi',
        name: 'Shahi Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Royal shahi sauce with marinated chicken chunks.',
        sizes: [
            { name: 'M', price: 1200 },
            { name: 'L', price: 1600 }
        ]
    },
    {
        id: 'p_gb',
        name: 'Grill Bite Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Juicy flame-grilled chicken chunks for a smokey bite.',
        sizes: [
            { name: 'M', price: 1200 },
            { name: 'L', price: 1600 }
        ]
    },
    {
        id: 'p_czs',
        name: 'Cheezy Stik Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Loaded with cheese sticks for the ultimate stretch.',
        sizes: [
            { name: 'M', price: 1200 },
            { name: 'L', price: 1600 }
        ]
    },
    {
        id: 'p_mu',
        name: 'Mughlai Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Rich Mughal-inspired flavors with a savory kick.',
        sizes: [
            { name: 'M', price: 1200 },
            { name: 'L', price: 1600 }
        ]
    },
    {
        id: 'p_hs',
        name: 'Hostan Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'A special blend of secret spices and tender meat.',
        sizes: [
            { name: 'M', price: 1200 },
            { name: 'L', price: 1600 }
        ]
    },
    {
        id: 'p_cs',
        name: 'City Special Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'The local favorite with balanced spices and fresh dough.',
        sizes: [
            { name: 'M', price: 1200 },
            { name: 'L', price: 1600 }
        ]
    },
    {
        id: 'p_sz',
        name: 'Sazilan Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Sizzling spicy chicken with a hint of garlic and herbs.',
        sizes: [
            { name: 'M', price: 1200 },
            { name: 'L', price: 1600 }
        ]
    },
    {
        id: 'p_dn',
        name: 'Donnat Pizza',
        price: 1100,
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Fun donut-shaped crust with extra toppings and cheese.',
    },
    {
        id: 'p_tk',
        name: 'Chicken Tikka Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Char-grilled tikka chunks for that authentic Lahori taste.',
        sizes: [
            { name: 'S', price: 550 },
            { name: 'M', price: 1000 },
            { name: 'L', price: 1400 }
        ]
    },
    {
        id: 'p_fj',
        name: 'Fajita Pizza',
        category: 'Pizza',
        imageKey: 'pizza_fajita',
        description: 'Bell peppers, onions, and marinated chicken for a Mexican punch.',
        sizes: [
            { name: 'S', price: 550 },
            { name: 'M', price: 1000 },
            { name: 'L', price: 1400 }
        ]
    },
    {
        id: 'p_hs_pr',
        name: 'Hot & Spicy Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'A kick of red chilies and hot spices for the brave.',
        sizes: [
            { name: 'S', price: 550 },
            { name: 'M', price: 1000 },
            { name: 'L', price: 1400 }
        ]
    },
    {
        id: 'p_sup',
        name: 'Supream Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'A grand feast of olives, pepperoni, and fresh veggies.',
        sizes: [
            { name: 'S', price: 550 },
            { name: 'M', price: 1000 },
            { name: 'L', price: 1400 }
        ]
    },
    {
        id: 'p_ms',
        name: 'Mushroom Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Earthy mushrooms and mozzarella on a golden crust.',
        sizes: [
            { name: 'S', price: 550 },
            { name: 'M', price: 1000 },
            { name: 'L', price: 1400 }
        ]
    },
    {
        id: 'p_it',
        name: 'Italian Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'The essence of Italy with basil, oregano, and olive oil.',
        sizes: [
            { name: 'S', price: 550 },
            { name: 'M', price: 1000 },
            { name: 'L', price: 1400 }
        ]
    },
    {
        id: 'p_ach',
        name: 'Achari Pizza',
        category: 'Pizza',
        imageKey: 'pizza_01',
        description: 'Pickle-infused spices for a uniquely tangy experience.',
        sizes: [
            { name: 'S', price: 550 },
            { name: 'M', price: 1000 },
            { name: 'L', price: 1400 }
        ]
    },


    // --- BURGERS ---
    { id: 'b_ans', name: 'Al Noor Special Burger', price: 550, category: 'Burgers', imageKey: 'burger_special', description: 'Double stack of juicy patties with our secret house sauce.' },
    { id: 'b_lv', name: 'Lava Burger', price: 600, category: 'Burgers', imageKey: 'burger_lava', description: 'Experience the eruption of molten cheese in every spicy bite.' },
    { id: 'b_zg', name: 'Zinger Burger', price: 390, category: 'Burgers', imageKey: 'burger_zinger_premium', description: 'Golden crispy chicken fillet with fresh lettuce and mayo.' },
    { id: 'b_zgc', name: 'Zinger Burger with Cheese', price: 440, category: 'Burgers', imageKey: 'burger_zinger_premium', description: 'The famous crispy zinger topped with a slice of premium cheddar.' },
    { id: 'b_sm', name: 'Smoky Burger', price: 500, category: 'Burgers', imageKey: 'burger_01', description: 'Flame-kissed patty with a rich, wood-fired smoky aroma.' },
    { id: 'b_tw', name: 'Tower Burger', price: 500, category: 'Burgers', imageKey: 'burger_01', description: 'A massive stack of crispy fillets for the ultimate hunger.' },
    { id: 'b_pz', name: 'Pizza Burger', price: 550, category: 'Burgers', imageKey: 'burger_01', description: 'Unique burger stuffed with olives, mushrooms, and pizza sauce.' },
    { id: 'b_gr', name: 'Grill Burger', price: 400, category: 'Burgers', imageKey: 'burger_01', description: 'Healthy and tender flame-grilled chicken for a lighter bite.' },
    { id: 'b_ch', name: 'Chicken Burger', price: 300, category: 'Burgers', imageKey: 'burger_01', description: 'Soft bun with a savory, lightly seasoned chicken patty.' },
    { id: 'b_ex_ch', name: 'Extra Cheese (Burger)', price: 50, category: 'Burgers', imageKey: 'sides_01', description: 'Add extra slice of cheese.' },


    // --- SHAWARMA ---
    { id: 's_ch', name: 'Chicken Shawarma', price: 250, category: 'Shawarma', imageKey: 'shawarma_01', description: 'Thinly sliced grilled chicken wrapped in soft pita bread.' },
    { id: 's_chc', name: 'Chicken Cheese Shawarma', price: 300, category: 'Shawarma', imageKey: 'shawarma_01', description: 'Juicy shawarma chunks mixed with creamy melted cheese.' },
    { id: 's_zg', name: 'Zinger Shawarma', price: 350, category: 'Shawarma', imageKey: 'shawarma_01', description: 'The crunch of zinger in a traditional pita wrap.' },
    { id: 's_zgc', name: 'Zinger Cheese Shawarma', price: 390, category: 'Shawarma', imageKey: 'shawarma_01', description: 'Crunchy zinger chunks with a cheesy layer of goodness.' },
    { id: 's_kb', name: 'Kebab Shawarma', price: 390, category: 'Shawarma', imageKey: 'shawarma_01', description: 'Authentic grilled seekh kebab wrapped with desi sauces.' },
    { id: 's_pl', name: 'Platter Shawarma', price: 390, category: 'Shawarma', imageKey: 'shawarma_01', description: 'Open-style shawarma served with extra bread and fries.' },
    { id: 's_cw', name: 'Crispy Wrap', price: 500, category: 'Shawarma', imageKey: 'shawarma_01', description: 'A tortilla wrap filled with extra crispy chicken strips.' },


    // --- PARATHA ROLLS ---
    { id: 'pr_ch', name: 'Chicken Paratha Roll', price: 300, category: 'Paratha Rolls', imageKey: 'roll_01', description: 'Crispy flaky paratha filled with tender spice-rubbed chicken.' },
    { id: 'pr_zg', name: 'Zinger Paratha Roll', price: 390, category: 'Paratha Rolls', imageKey: 'roll_01', description: 'Spicy zinger strips tucked inside a freshly made flaky paratha.' },
    { id: 'pr_kb', name: 'Kebab Paratha Roll', price: 390, category: 'Paratha Rolls', imageKey: 'roll_01', description: 'Traditional charcoal seekh kabab wrapped in a golden paratha.' },
    { id: 'pr_tk', name: 'Tikka Paratha Roll', price: 300, category: 'Paratha Rolls', imageKey: 'roll_01', description: 'Smoky barbecued tikka chunks with onions and चटनी.' },
    { id: 'pr_bh', name: 'Bihari Roll', price: 600, category: 'Paratha Rolls', imageKey: 'roll_01', description: 'Beefy Bihari boti melting in your mouth with every bite.' },
    { id: 'pr_ex_ch', name: 'Extra Cheese (Roll)', price: 50, category: 'Paratha Rolls', imageKey: 'sides_01', description: 'Add extra cheese.' },


    // --- PASTA ---
    {
        id: 'ps_tk',
        name: 'Tikka Pasta',
        category: 'Pasta',
        imageKey: 'pasta_01',
        description: 'Tender pasta tossed in a robust tikka-spiced red sauce.',
        sizes: [
            { name: 'Half', price: 500 },
            { name: 'Full', price: 750 }
        ]
    },
    {
        id: 'ps_m',
        name: 'Chicken Cheese Macroni',
        category: 'Pasta',
        imageKey: 'pasta_01',
        description: 'Creamy macaroni loaded with chicken and melted mozzarella.',
        sizes: [
            { name: 'Half', price: 500 },
            { name: 'Full', price: 750 }
        ]
    },
    {
        id: 'ps_cr',
        name: 'Chicken Crispy Pasta',
        category: 'Pasta',
        imageKey: 'pasta_01',
        description: 'Silky pasta topped with golden crispy chicken bits.',
        sizes: [
            { name: 'Half', price: 550 },
            { name: 'Full', price: 850 }
        ]
    },


    // --- CHICKEN BROAST ---
    { id: 'c_lp', name: 'Chicken Leg Piece', price: 370, category: 'Chicken', imageKey: 'chicken_01', description: 'Juicy, deep-fried leg piece with a spicy Lahori crunch.' },
    { id: 'c_cp', name: 'Chicken Chest Piece', price: 450, category: 'Chicken', imageKey: 'chicken_01', description: 'Tender chicken chest piece fried to golden perfection.' },

    // --- RICE ---
    { id: 'r_ms', name: 'Masala Rice', price: 600, category: 'Rice', imageKey: 'rice_01', description: 'Fragrant basmati rice cooked with aromatic desi spices.' },
    { id: 'r_cr', name: 'Crispy Rice', price: 650, category: 'Rice', imageKey: 'rice_01', description: 'Savory rice platter topped with spicy crispy chicken chunks.' },
    { id: 'r_ef', name: 'Egg Fried Rice', price: 600, category: 'Rice', imageKey: 'rice_01', description: 'Wok-tossed rice with fluffy eggs and garden fresh veggies.' },
    { id: 'r_ans', name: 'Al Noor Special Rice', price: 690, category: 'Rice', imageKey: 'rice_special', description: 'Our signature rice platter with a blend of special spices.' },

    // --- FRIES ---
    { id: 'f_ld', name: 'Loader Fries', price: 390, category: 'Fries', imageKey: 'sides_01', description: 'Fries drenched in cheese sauce, olives, and jalapeños.' },
    { id: 'f_ch', name: 'Cheese Fries', price: 350, category: 'Fries', imageKey: 'sides_01', description: 'Crispy hot fries smothered in warm, melted cheddar cheese.' },
    { id: 'f_gr', name: 'Garlic Fries', price: 350, category: 'Fries', imageKey: 'sides_01', description: 'Classic fries tossed in a fragrant garlic and herb seasoning.' },
    { id: 'f_lg', name: 'Fries (Large)', price: 400, category: 'Fries', imageKey: 'sides_01', description: 'A massive portion of our signature crispy golden fries.' },
    { id: 'f_rg', name: 'Regular Fries', price: 300, category: 'Fries', imageKey: 'sides_01', description: 'The classic golden-fried potato sticks you know and love.' },

    // --- WINGS & NUGGETS ---
    { id: 'w_ht_6', name: 'Hot Wings (6 pcs)', price: 450, category: 'Wings', imageKey: 'chicken_01', description: 'Bite-sized chicken wings tossed in a fiery buffalo sauce.' },
    { id: 'w_ht_12', name: 'Hot Wings (12 pcs)', price: 850, category: 'Wings', imageKey: 'chicken_01', description: 'Double the spice! A large serving of fiery buffalo wings.' },
    { id: 'w_bbq_6', name: 'BBQ Wings (6 pcs)', price: 450, category: 'Wings', imageKey: 'chicken_01', description: 'Wings glazed in a sweet and tangy hickory BBQ sauce.' },
    { id: 'w_bbq_12', name: 'BBQ Wings (12 pcs)', price: 850, category: 'Wings', imageKey: 'chicken_01', description: 'Piping hot wings drowned in a sweet and smoky BBQ glaze.' },
    { id: 'w_jc_6', name: 'Juicy Wings (6 pcs)', price: 450, category: 'Wings', imageKey: 'chicken_01', description: 'Succulent wings lightly seasoned and fried to tenderness.' },
    { id: 'w_jc_12', name: 'Juicy Wings (12 pcs)', price: 850, category: 'Wings', imageKey: 'chicken_01', description: 'Succulent and tender chicken wings, perfectly fried for sharing.' },
    { id: 'n_6', name: 'Nuggets (6 pcs)', price: 300, category: 'Wings', imageKey: 'chicken_01', description: 'Classic golden-brown breaded chicken nuggets.' },
    { id: 'n_12', name: 'Nuggets (12 pcs)', price: 550, category: 'Wings', imageKey: 'chicken_01', description: 'A family-sized portion of crispy, golden-fried chicken nuggets.' },

    // --- COLD DRINKS ---
    { id: 'd_rg', name: 'Regular Drink', price: 70, category: 'Drinks', imageKey: 'drink_01', description: 'Your choice of chilled carbonated soft drink.' },
    { id: 'd_500', name: 'Drink (500ml)', price: 120, category: 'Drinks', imageKey: 'drink_01', description: 'Stay refreshed with a chilled 500ml bottle of your favorite soda.' },
    { id: 'd_1', name: 'Drink (1 Ltr)', price: 150, category: 'Drinks', imageKey: 'drink_01', description: 'Perfect for sharing! Chilled 1 Liter bottle of soft drink.' },
    { id: 'd_15', name: 'Drink (1.5 Ltr)', price: 220, category: 'Drinks', imageKey: 'drink_01', description: 'Maximum refreshment! Large 1.5 Liter bottle for the whole family.' },
    { id: 'w_lg', name: 'Mineral Water (L)', price: 150, category: 'Drinks', imageKey: 'drink_01', description: 'Refreshing, pure mineral water to quench your thirst.' },
    { id: 'w_sm', name: 'Mineral Water (S)', price: 90, category: 'Drinks', imageKey: 'drink_01', description: 'Stay hydrated on the go with our pure mineral water.' },

    // --- SPECIAL ITEMS ---
    { id: 'sp_sj', name: 'Chicken Sajji', price: 1500, category: 'Special Items', imageKey: 'chicken_sajji', description: 'Whole marinated chicken roasted on coal for hours.' },
    { id: 'sp_mp', name: 'Matka Pizza', price: 700, category: 'Special Items', imageKey: 'pizza_matka', description: 'Indulge in a unique clay-pot baked cheesy pizza experience.' },

];





const HomeScreen = () => {
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { addToCart, cart } = useCart();
    const { t } = useLanguage();
    const { isAdmin } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('Deals'); // Default to Deals
    const [searchQuery, setSearchQuery] = useState('');
    const [prices, setPrices] = useState({});
    const [dynamicProducts, setDynamicProducts] = useState([]);
    const [dealCategoryName, setDealCategoryName] = useState('Deals');
    const [editingProduct, setEditingProduct] = useState(null);
    const [newPrice, setNewPrice] = useState('');
    const [newSizes, setNewSizes] = useState({}); // { 'S': '700', 'M': '1100' }
    const [savingPrice, setSavingPrice] = useState(false);

    // Add Item / Deal States
    const [addingItem, setAddingItem] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: 'Burgers' });
    const [savingItem, setSavingItem] = useState(false);

    // Rename Category States
    const [renamingCategory, setRenamingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [savingCategory, setSavingCategory] = useState(false);

    // Size Selection Modal States
    const [selectedProductForSize, setSelectedProductForSize] = useState(null);
    const [isSizeModalVisible, setIsSizeModalVisible] = useState(false);

    React.useEffect(() => {

        const pricesRef = doc(db, 'settings', 'prices');
        const unsubscribePrices = onSnapshot(pricesRef, (docSnap) => {
            if (docSnap.exists()) {
                setPrices(docSnap.data());
            }
        }, (error) => {
            console.warn("Firestore Prices Sync Error:", error.message);
        });

        const configRef = doc(db, 'settings', 'store_config');
        const unsubscribeConfig = onSnapshot(configRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().dealCategoryName) {
                const savedName = docSnap.data().dealCategoryName.trim();
                const isOldRamadanOffer = /ram(a|za)dan\s+offer/i.test(savedName);
                setDealCategoryName(isOldRamadanOffer ? 'Deals' : savedName);
            } else {
                setDealCategoryName('Deals');
            }
        }, (error) => {
            console.warn("Firestore Config Sync Error:", error.message);
        });

        // REMOVED fetch from 'products' collection to use hardcoded PRODUCTS
        // This ensures the app works on slow internet.
        // We only fetch 'settings/prices' to keep prices updated.

        const productsRef = collection(db, 'products');
        const unsubscribeProducts = onSnapshot(productsRef, (snapshot) => {
            const fetchedProducts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isDynamic: true // Mark as dynamic for letter icon rendering
            }));
            setDynamicProducts(fetchedProducts);
        }, (error) => {
            // Handle permission denied or other errors gracefully
            console.warn("Firestore Products Sync Error:", error.message);
        });

        return () => {
            unsubscribePrices();
            unsubscribeConfig();
            unsubscribeProducts();
        };
    }, []);


    const filteredProducts = useMemo(() => {
        // Base products are hardcoded for speed, merged with dynamic ones
        let baseProducts = [...PRODUCTS, ...dynamicProducts];

        // Apply updated prices from Firestore if they exist
        const productsWithLivePrices = baseProducts.map(p => {
            if (p.sizes && p.sizes.length > 0) {
                return {
                    ...p,
                    sizes: p.sizes.map(s => ({
                        ...s,
                        price: prices[`${p.id}_${s.name}`] || s.price
                    }))
                };
            }
            return {
                ...p,
                price: prices[p.id] || p.price
            };
        });

        return productsWithLivePrices.filter(p =>
            p.category === selectedCategory &&
            (p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [selectedCategory, searchQuery, prices, dynamicProducts]);

    const handleEditPrice = (product) => {
        setEditingProduct(product);
        if (product.sizes) {
            const sizePrices = {};
            product.sizes.forEach(s => {
                sizePrices[s.name] = (prices[`${product.id}_${s.name}`] || s.price).toString();
            });
            setNewSizes(sizePrices);
        } else {
            setNewPrice((prices[product.id] || product.price).toString());
        }
    };

    const handleSavePrice = async () => {
        if (!editingProduct) return;

        setSavingPrice(true);
        try {
            const pricesRef = doc(db, 'settings', 'prices');
            const priceUpdates = {};

            if (editingProduct.sizes) {
                Object.keys(newSizes).forEach(sizeName => {
                    const priceNum = Number(newSizes[sizeName]);
                    if (!isNaN(priceNum) && priceNum > 0) {
                        priceUpdates[`${editingProduct.id}_${sizeName}`] = priceNum;
                    }
                });
            } else {
                const priceNum = Number(newPrice);
                if (!isNaN(priceNum) && priceNum > 0) {
                    priceUpdates[editingProduct.id] = priceNum;
                }
            }

            if (Object.keys(priceUpdates).length > 0) {
                await setDoc(pricesRef, priceUpdates, { merge: true });
            }
            setEditingProduct(null);
            setNewPrice('');
            setNewSizes({});
        } catch (error) {
            console.error("Error saving price:", error);
            Alert.alert("Error", "Could not save the price.");
        } finally {
            setSavingPrice(false);
        }
    };

    const handleSaveNewItem = async () => {
        if (!newItem.name || !newItem.price || !newItem.description) {
            Alert.alert("Missing Fields", "Please fill out all fields.");
            return;
        }

        const priceNum = Number(newItem.price);
        if (isNaN(priceNum) || priceNum <= 0) {
            Alert.alert("Invalid Price", "Please enter a valid positive number.");
            return;
        }

        setSavingItem(true);
        try {
            await addDoc(collection(db, 'products'), {
                name: newItem.name,
                description: newItem.description,
                price: priceNum,
                category: newItem.category,
                createdAt: new Date().toISOString()
            });
            setAddingItem(false);
            setNewItem({ name: '', description: '', price: '', category: 'Burgers' });
        } catch (error) {
            console.error("Error saving item:", error);
            Alert.alert("Error", "Could not save the item. Check your database permissions.");
        } finally {
            setSavingItem(false);
        }
    };

    const handleDeleteProduct = (product) => {
        Alert.alert(
            "Delete Item",
            `Are you sure you want to delete "${product.name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const coll = product.isSpecialDeal ? 'special_deals' : 'products';
                            await deleteDoc(doc(db, coll, product.id));
                        } catch (e) {
                            Alert.alert("Error", "Could not delete item.");
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
            <TouchableOpacity
                onPress={() => setSelectedCategory(item.name)}
                activeOpacity={0.7}
                style={{ overflow: 'hidden', borderRadius: 25, marginRight: 12 }}
            >
                {isSelected ? (
                    <LinearGradient
                        colors={colors.primaryGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.categoryItemSelected, { marginRight: 0 }]}
                    >
                        <Text style={styles.categoryIcon}>{item.icon}</Text>
                        <Text style={styles.categoryTextSelected}>
                            {categoryDisplayName}
                        </Text>
                    </LinearGradient>
                ) : (
                    <BlurView intensity={30} tint="dark" style={[styles.categoryItem, { marginRight: 0 }]}>
                        <Text style={styles.categoryIcon}>{item.icon}</Text>
                        <Text style={styles.categoryText}>{categoryDisplayName}</Text>
                    </BlurView>
                )}
            </TouchableOpacity>
        );
    };

    const handleAddToCart = (product) => {
        if (product.sizes && product.sizes.length > 0) {
            setSelectedProductForSize(product);
            setIsSizeModalVisible(true);
        } else {
            addToCart(product);
        }
    };

    const handleSelectSizeAndAdd = (size) => {
        addToCart(selectedProductForSize, size);
        setIsSizeModalVisible(false);
        setSelectedProductForSize(null);
    };

    const renderProduct = ({ item, index }) => {
        return (
            <ProductCard
                item={item}
                index={index}
                addToCart={handleAddToCart}
                isAdmin={isAdmin}
                onEditPrice={handleEditPrice}
                onDelete={handleDeleteProduct}
            />
        );
    };

    return (
        <SplitScreen ratio={0.35} >
            <View style={[styles.container, { paddingTop: insets.top }]}>
                {/* ... existing header ... */}

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

                        <View style={styles.headerLogoContainer}>
                            <View style={styles.logoCircle}>
                                <Image
                                    source={require('../../assets/logo.jpeg')}
                                    style={styles.headerLogo}
                                    resizeMode="cover"
                                />
                            </View>
                            <View style={styles.titleWrapper}>
                                <Text style={styles.appTitle}>AL-NOOR</Text>
                                <View style={styles.goldLine} />
                            </View>
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
                            underlineColorAndroid="transparent"
                            autoComplete="off"
                            autoCorrect={false}
                            importantForAutofill="no"
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
                                    {isAdmin && (
                                        <View style={{ flexDirection: 'row' }}>
                                            {selectedCategory === 'Deals' && (
                                                <TouchableOpacity
                                                    style={[styles.addDealBtn, { backgroundColor: 'rgba(0,0,0,0.05)', marginRight: 10 }]}
                                                    onPress={() => {
                                                        setNewCategoryName(dealCategoryName);
                                                        setRenamingCategory(true);
                                                    }}
                                                >
                                                    <Text style={[styles.addDealBtnText, { color: colors.primary }]}>✏️</Text>
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity
                                                style={styles.addDealBtn}
                                                onPress={() => {
                                                    setAddingItem(true);
                                                    setNewItem({
                                                        name: '',
                                                        description: '',
                                                        price: '',
                                                        category: selectedCategory
                                                    });
                                                }}
                                            >
                                                <Text style={styles.addDealBtnText}>+ {selectedCategory === 'Deals' ? t('addDeal') : 'Add Item'}</Text>
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

                        {editingProduct && editingProduct.sizes ? (
                            <ScrollView style={{ maxHeight: 300, width: '100%' }}>
                                {editingProduct.sizes.map((s, idx) => (
                                    <View key={idx} style={[styles.priceInputContainer, { marginBottom: 15 }]}>
                                        <Text style={[styles.currencyPrefix, { minWidth: 60 }]}>{s.name}:</Text>
                                        <TextInput
                                            style={styles.priceInput}
                                            value={newSizes[s.name]}
                                            onChangeText={(val) => setNewSizes(prev => ({ ...prev, [s.name]: val }))}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor="#999"
                                        />
                                    </View>
                                ))}
                            </ScrollView>
                        ) : (
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
                        )}

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
                                    <ActivityIndicator color={colors.secondary} size="small" />
                                ) : (
                                    <Text style={styles.modalBtnSaveText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal >

            {/* Rename Deals Category Modal */}
            < Modal
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
                                placeholder="e.g. Weekend Specials"
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
                                    <ActivityIndicator color={colors.secondary} size="small" />
                                ) : (
                                    <Text style={styles.modalBtnSaveText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Add Item/Deal Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={addingItem}
                onRequestClose={() => setAddingItem(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{newItem.category === 'Deals' ? t('addDeal') : 'Add New Item'}</Text>
                        <Text style={styles.modalSubtitle}>Target Category: {newItem.category}</Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Item Name"
                                placeholderTextColor="#666"
                                value={newItem.name}
                                onChangeText={(txt) => setNewItem({ ...newItem, name: txt })}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Description"
                                placeholderTextColor="#666"
                                value={newItem.description}
                                onChangeText={(txt) => setNewItem({ ...newItem, description: txt })}
                            />
                        </View>

                        <View style={styles.priceInputContainer}>
                            <Text style={styles.currencyPrefix}>Rs.</Text>
                            <TextInput
                                style={styles.priceInput}
                                placeholder="0"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                value={newItem.price}
                                onChangeText={(txt) => setNewItem({ ...newItem, price: txt })}
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnCancel]}
                                onPress={() => setAddingItem(false)}
                            >
                                <Text style={styles.modalBtnCancelText}>{t('cancel')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnSave]}
                                onPress={handleSaveNewItem}
                                disabled={savingItem}
                            >
                                {savingItem ? (
                                    <ActivityIndicator color={colors.secondary} size="small" />
                                ) : (
                                    <Text style={styles.modalBtnSaveText}>{t('saveChanges')}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
            {/* Size Selection Modal */}
            <Modal
                visible={isSizeModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsSizeModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsSizeModalVisible(false)}
                >
                    <BlurView intensity={80} tint="dark" style={styles.sizeModalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalBar} />
                            <Text style={styles.sizeModalTitle}>{t('selectSize')}</Text>
                            {selectedProductForSize && (
                                <Text style={styles.sizeModalProductName}>{selectedProductForSize.name}</Text>
                            )}
                        </View>

                        <View style={styles.sizesContainer}>
                            {selectedProductForSize?.sizes?.map((size, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.sizeOption}
                                    onPress={() => handleSelectSizeAndAdd(size)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.sizeInfo}>
                                        <View style={styles.sizeLabelCircle}>
                                            <Text style={styles.sizeName}>
                                                {(size.name === 'Small' || size.name === 'S') ? 'S' :
                                                    (size.name === 'Medium' || size.name === 'M') ? 'M' :
                                                        (size.name === 'Large' || size.name === 'L') ? 'L' :
                                                            size.name.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                        <View style={styles.sizeTextContainer}>
                                            <Text style={styles.sizeFullLabel}>{t(size.name.toLowerCase()) || size.name}</Text>
                                            <Text style={styles.sizePrice}>Rs. {size.price}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.sizeAddIcon}>
                                        <Text style={styles.sizeAddText}>+</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>


                        <TouchableOpacity
                            style={styles.closeModalBtn}
                            onPress={() => setIsSizeModalVisible(false)}
                        >
                            <Text style={styles.closeModalBtnText}>{t('cancel')}</Text>
                        </TouchableOpacity>
                    </BlurView>
                </TouchableOpacity>
            </Modal>
        </SplitScreen >
    );
};

const createStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
    },
    // ... existing styles ...
    sizeModalContent: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 45 : 30,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 215, 0, 0.2)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -10 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
            },
            android: {
                elevation: 20,
            },
            web: {
                boxShadow: '0px -10px 40px rgba(0, 0, 0, 0.5)'
            }
        })
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 25,
    },
    modalBar: {
        width: 50,
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 3,
        marginBottom: 20,
    },
    sizeModalTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: colors.secondary,
        letterSpacing: 1,
    },
    sizeModalProductName: {
        fontSize: 15,
        color: colors.accent,
        marginTop: 6,
        fontWeight: '600',
        opacity: 0.9,
    },
    sizesContainer: {
        marginBottom: 25,
    },
    sizeOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 22,
        borderRadius: 20,
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.08)',
        // Shadow for premium depth
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
            },
            android: {
                elevation: 4,
            }
        })
    },
    sizeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sizeLabelCircle: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: `${colors.primary}33`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    sizeName: {
        fontSize: 22,
        fontWeight: '900',
        color: colors.primary,
    },
    sizeTextContainer: {
        justifyContent: 'center',
    },
    sizeFullLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.secondary,
    },
    sizePrice: {
        fontSize: 16,
        color: colors.accent,
        marginTop: 2,
        fontWeight: '700',
    },
    sizeAddIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sizeAddText: {
        color: colors.secondary,
        fontSize: 24,
        fontWeight: 'bold',
    },
    closeModalBtn: {
        alignItems: 'center',
        padding: 10,
    },
    closeModalBtnText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },


    header: {
        paddingHorizontal: SIZES.padding,
        paddingBottom: 10,
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
        backgroundColor: colors.secondary,
        marginVertical: 2,
        borderRadius: 2,
    },
    headerLogoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.secondary,
        marginRight: 10,
        padding: 2,
        borderWidth: 1,
        borderColor: colors.accent,
        overflow: 'hidden',
    },
    headerLogo: {
        width: '100%',
        height: '100%',
        borderRadius: 18,
    },
    titleWrapper: {
        alignItems: 'flex-start',
    },
    appTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.secondary,
        letterSpacing: 1.5,
    },
    goldLine: {
        height: 2,
        width: 25,
        backgroundColor: colors.accent,
        marginTop: -1,
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
        backgroundColor: colors.accent,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        paddingHorizontal: 4,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    badgeText: {
        color: colors.primary,
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
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.22)',
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 10,
        opacity: 0.8,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        paddingVertical: 0,
        paddingHorizontal: 0,
        margin: 0,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderWidth: 0,
        borderColor: 'transparent',
        borderRadius: 0,
        outlineStyle: 'none',
        boxShadow: 'none',
        color: colors.textDark,
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
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        height: 45,
    },
    categoryItemSelected: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 10,
        marginRight: 12,
        borderRadius: 25,
        height: 45,
        // Bold shadow for active gradient - platform aware
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: `0px 4px 6px ${colors.primary}33` // 33 is 20% opacity
            }
        })
    },
    categoryIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    categoryText: {
        color: colors.textDark,
        fontWeight: '600',
        fontSize: 15,
    },
    categoryTextSelected: {
        color: colors.secondary,
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
        color: colors.textDark,
    },
    seeAll: {
        color: colors.primary,
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
        backgroundColor: colors.primary,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
    },
    addDealBtnText: {
        color: colors.secondary,
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
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 15,
            },
            android: {
                elevation: 10,
            },
            web: {
                boxShadow: `0px 10px 15px ${colors.primary}33`
            }
        })
    },
    modalTitle: {
        ...FONTS.h2,
        color: colors.secondary,
        marginBottom: 5,
    },
    modalSubtitle: {
        fontSize: 14,
        color: colors.textLight,
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
        color: colors.secondary,
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
        color: colors.primary,
        marginRight: 10,
    },
    priceInput: {
        flex: 1,
        fontSize: 18,
        color: colors.secondary,
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
        backgroundColor: colors.primary,
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
