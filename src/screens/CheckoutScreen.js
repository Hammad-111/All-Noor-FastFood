import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Linking, Animated } from 'react-native';
import SplitScreen from '../components/SplitScreen';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';

const CheckoutScreen = ({ navigation }) => {
    const { cart, removeFromCart, clearCart, updateQuantity, getDefaultAddress } = useCart();
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const defaultAddr = getDefaultAddress();
        if (defaultAddr && !address) {
            setAddress(defaultAddr.address);
        }
    }, [getDefaultAddress]);
    const btnScale = useRef(new Animated.Value(1)).current;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 50;
    const total = subtotal + (subtotal > 0 ? deliveryFee : 0);

    const handlePressIn = () => {
        Animated.spring(btnScale, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(btnScale, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const handlePlaceOrder = async () => {
        if (cart.length === 0) {
            showToast("Your cart is empty!", 'error');
            return;
        }
        if (!address) {
            showToast("Please enter delivery address!", 'error');
            return;
        }

        try {
            setLoading(true); // Using handleDevBypass style or common loading

            // 1. Prepare WhatsApp Message
            let message = `🧾 *AL NOOR FAST FOOD - RECEIPT* 🧾\n`;
            message += `--------------------------------\n`;
            message += `📅 *Date:* ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
            message += `📍 *Delivery Address:*\n${address}\n`;
            message += `--------------------------------\n\n`;

            message += `🍽️ *ORDER ITEMS:*\n`;
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                message += `▪️ ${item.quantity}x ${item.name} \n   └ Rs. ${item.price} x ${item.quantity} = Rs. ${itemTotal}\n`;
            });

            message += `\n--------------------------------\n`;
            message += `💵 *Subtotal:* Rs. ${subtotal}\n`;
            message += `🛵 *Delivery:* Rs. ${deliveryFee}\n`;
            message += `--------------------------------\n`;
            message += `💰 *TOTAL AMOUNT: Rs. ${total}*\n`;
            message += `--------------------------------\n`;
            message += `\n🚀 _Please confirm my order!_`;

            const phoneNumber = "923017891391";
            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            // 2. SAVE TO FIRESTORE FIRST
            if (user) {
                await addDoc(collection(db, 'users', user.uid, 'orders'), {
                    items: cart,
                    total: total,
                    subtotal: subtotal,
                    deliveryFee: deliveryFee,
                    address: address,
                    createdAt: serverTimestamp(),
                    status: 'Processing',
                    userEmail: user.email || ''
                });
            }

            // 3. Open WhatsApp and Clear Cart
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
                showToast("Order saved! Redirecting to WhatsApp...", "success");
                clearCart();
                navigation.navigate('HomeTab');
            } else {
                Alert.alert("Error", "Could not open WhatsApp. Please check if it's installed.");
            }
        } catch (error) {
            console.error("Order Error:", error);
            showToast("Failed to place order. Try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemMain}>
                <View style={styles.qtyBox}>
                    <Text style={styles.qtyText}>{item.quantity}x</Text>
                </View>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>Rs. {item.price * item.quantity}</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                >
                    <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                    <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
                    <Text style={styles.removeBtnText}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderFooter = () => (
        <View style={styles.footerSection}>
            {/* Address Section */}
            <View style={styles.inputWrapper}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionIcon}>📍</Text>
                    <Text style={styles.label}>{t('deliveryAddress')}</Text>
                </View>
                <TextInput
                    style={styles.input}
                    placeholder={t('addressPlaceholder')}
                    placeholderTextColor="#999"
                    value={address}
                    onChangeText={setAddress}
                    multiline
                />
            </View>

            {/* Payment Method Section */}
            <View style={styles.inputWrapper}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionIcon}>💳</Text>
                    <Text style={styles.label}>{t('paymentMethod')}</Text>
                </View>
                <View style={styles.paymentMethodCard}>
                    <Text style={styles.paymentIcon}>💵</Text>
                    <View style={styles.paymentDetails}>
                        <Text style={styles.paymentTitle}>{t('cashOnDelivery')}</Text>
                        <Text style={styles.paymentSub}>{t('totalBill')}: {t('rs')} {total}</Text>
                    </View>
                    <View style={styles.checkCircle}>
                        <View style={styles.checkDot} />
                    </View>
                </View>
            </View>

            {/* Bill Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>📄</Text>
                <Text style={styles.label}>{t('billSummary')}</Text>
            </View>
            <View style={styles.billBox}>
                <View style={styles.billRow}>
                    <Text style={styles.billLabel}>{t('subtotal')}</Text>
                    <Text style={styles.billValue}>{t('rs')} {subtotal}</Text>
                </View>
                <View style={styles.billRow}>
                    <Text style={styles.billLabel}>{t('deliveryFee')}</Text>
                    <Text style={styles.billValue}>{t('rs')} {deliveryFee}</Text>
                </View>
                <View style={[styles.billRow, styles.totalRow]}>
                    <Text style={styles.totalBillLabel}>{t('totalBill')}</Text>
                    <Text style={styles.totalBillValue}>{t('rs')} {total}</Text>
                </View>
            </View>

            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={handlePlaceOrder}
                    style={[styles.orderBtn, loading && styles.btnDisabled]}
                    disabled={loading}
                >
                    <View style={styles.btnContent}>
                        <Text style={styles.orderBtnEmoji}>{loading ? '⏳' : '💬'}</Text>
                        <Text style={styles.orderBtnText}>
                            {loading ? (language === 'ur' ? 'آرڈر ہو رہا ہے...' : 'Placing Order...') : t('orderWhatsapp')}
                        </Text>
                    </View>
                    <View style={styles.btnShine} />
                </TouchableOpacity>
            </Animated.View>
            <View style={{ height: 120 }} />
        </View>
    );

    return (
        <View style={styles.mainContainer}>
            <SplitScreen ratio={0.33}>
                <SafeAreaView style={styles.container} edges={['top']}>
                    <View style={styles.header}>
                        <BackButton />
                        <Text style={styles.title}>{t('myCart')}</Text>
                        <View style={{ width: 45 }} />
                    </View>

                    <View style={styles.summaryTop}>
                        <Text style={styles.totalLabel}>{t('grandTotal')}</Text>
                        <Text style={styles.totalValue}>{t('rs')} {total}</Text>
                        <View style={styles.timeBadge}>
                            <Text style={styles.timeText}>🕒 {t('estimatedTime')}</Text>
                        </View>
                    </View>

                    <FlatList
                        data={cart}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        ListHeaderComponent={
                            cart.length > 0 && (
                                <View style={styles.listHeader}>
                                    <View style={styles.countBadge}>
                                        <Text style={styles.countText}>{cart.length} {cart.length === 1 ? 'Item' : 'Items'}</Text>
                                    </View>
                                    <TouchableOpacity onPress={clearCart}>
                                        <Text style={styles.clearBtnText}>✕ {t('clearCart')}</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                        ListFooterComponent={renderFooter()}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyIcon}>🥡</Text>
                                <Text style={styles.emptyText}>{t('emptyCart')}</Text>
                            </View>
                        }
                    />
                </SafeAreaView>
            </SplitScreen>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backBtn: {
        width: 45,
        height: 45,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backBtnText: {
        color: COLORS.secondary,
        fontSize: 24,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    summaryTop: {
        alignItems: 'center',
        marginTop: 5,
    },
    totalLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    totalValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: COLORS.accent,
    },
    timeBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 10,
    },
    timeText: {
        color: COLORS.secondary,
        fontSize: 12,
        fontWeight: '600',
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 10,
        paddingHorizontal: 20,
    },
    countBadge: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    countText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#666',
    },
    clearBtnText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '700',
    },
    listContent: {
        paddingTop: 45,
        paddingBottom: 20,
    },
    footerSection: {
        backgroundColor: 'transparent',
        paddingTop: 10,
        paddingHorizontal: 20,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.glass,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        borderRadius: 15,
        padding: 12,
        marginBottom: 10,
        marginHorizontal: 20,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    itemMain: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    qtyBox: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 10,
    },
    qtyText: {
        fontWeight: 'bold',
        color: COLORS.accent,
    },
    itemInfo: { flex: 1 },
    itemName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    itemPrice: {
        fontSize: 13,
        color: COLORS.accent,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qtyBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    qtyBtnText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    removeBtn: { marginLeft: 8 },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    inputWrapper: { marginBottom: 25 },
    paymentMethodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.glass,
        borderRadius: 18,
        padding: 15,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    paymentIcon: {
        fontSize: 24,
        marginRight: 15,
    },
    paymentDetails: { flex: 1 },
    paymentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    paymentSub: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 2,
    },
    checkCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.accent,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    input: {
        backgroundColor: COLORS.glass,
        borderRadius: 12,
        padding: 12,
        minHeight: 60,
        textAlignVertical: 'top',
        fontSize: 14,
        color: COLORS.secondary,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    billBox: {
        backgroundColor: COLORS.glass,
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    billLabel: {
        color: COLORS.textLight,
        fontSize: 14,
    },
    billValue: {
        fontWeight: '600',
        color: COLORS.secondary,
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    totalBillLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    totalBillValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.accent,
    },
    orderBtn: {
        backgroundColor: '#128C7E', // Premium WhatsApp Teal
        height: 60,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#128C7E',
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 12,
        overflow: 'hidden',
    },
    btnDisabled: { opacity: 0.7 },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderBtnEmoji: {
        fontSize: 24,
        marginRight: 10,
    },
    orderBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    btnShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
    },
    emptyIcon: {
        fontSize: 50,
        marginBottom: 10,
    },
    emptyText: {
        color: '#AAA',
        fontSize: 16,
    }
});

export default CheckoutScreen;
