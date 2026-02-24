import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import ProductCard from '../components/ProductCard';
import SplitScreen from '../components/SplitScreen';
import BackButton from '../components/BackButton';

const { width } = Dimensions.get('window');

const FavoritesScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { favorites, addToCart } = useCart();
    const { t, language } = useLanguage();

    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <View style={styles.headerLeft}>
                <BackButton color={COLORS.secondary} />
                <Text style={styles.headerTitle}>{t('favoritesTitle')}</Text>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
                <Text style={styles.emptyIcon}>⭐</Text>
            </View>
            <Text style={styles.emptyTitle}>{t('noFavoritesTitle')}</Text>
            <Text style={styles.emptySubtitle}>{t('noFavoritesSubtitle')}</Text>
            <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => navigation.navigate('HomeTab')}
            >
                <LinearGradient
                    colors={[COLORS.primary, '#E11D48']}
                    style={styles.browseBtnGradient}
                >
                    <Text style={styles.browseBtnText}>{t('browseMenu')}</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <SplitScreen type="favorites">
                <View style={styles.main}>
                    {renderHeader()}

                    <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                        {favorites.length > 0 ? (
                            <FlatList
                                key="favorites-list"
                                data={favorites}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item, index }) => (
                                    <ProductCard
                                        item={item}
                                        index={index}
                                        navigation={navigation}
                                        addToCart={addToCart}
                                    />
                                )}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                            />
                        ) : (
                            renderEmpty()
                        )}
                    </Animated.View>
                </View>
            </SplitScreen>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    main: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginLeft: 15,
    },
    content: {
        flex: 1,
        paddingHorizontal: 10,
    },
    listContent: {
        paddingBottom: 100,
        paddingHorizontal: 5,
    },
    cardWrapper: {
        width: '50%',
        padding: 5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    emptyIconBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyIcon: {
        fontSize: 50,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 22,
        marginBottom: 30,
    },
    browseBtn: {
        width: 200,
        height: 55,
    },
    browseBtnGradient: {
        flex: 1,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    browseBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default FavoritesScreen;
