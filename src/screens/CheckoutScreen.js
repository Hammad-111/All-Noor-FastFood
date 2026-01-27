
import React, { useState } from 'react';

import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Linking, Image, Animated } from 'react-native';
import SplitScreen from '../components/SplitScreen';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const CheckoutScreen = ({ navigation }) => {
    const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
    const { t } = useLanguage();
    const [address, setAddress] = useState('');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 50;
    const total = subtotal + (subtotal > 0 ? deliveryFee : 0);

    const handlePlaceOrder = () => {
        if (cart.length === 0) {
            Alert.alert("Empty Cart", "Please add items to your cart first.");
            return;
        }
        if (!address) {
            Alert.alert("Missing Address", "Please enter your delivery address.");
            return;
        }

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

        const phoneNumber = "923017891391"; // Change to owner's number
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

        Linking.openURL(url).then(() => {
            clearCart();
            navigation.navigate('HomeTab');
        }).catch(() => {
            Alert.alert("Error", "Could not open WhatsApp.");
        });
    };

    const renderItem = ({ item, index }) => (
        <View
            style={styles.cartItem}
        >
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

    return (
        <View style={styles.mainContainer}>
            <SplitScreen>
                <SafeAreaView style={styles.container} edges={['top']}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Text style={styles.backBtnText}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>{t('myCart')}</Text>
                        <View style={{ width: 45 }} />
                    </View>

                    <View style={styles.summaryTop}>
                        <Text style={styles.totalLabel}>{t('grandTotal')}</Text>
                        <Text style={styles.totalValue}>{t('rs')} {total}</Text>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.listSection}>
                            <FlatList
                                data={cart}
                                renderItem={renderItem}
                                keyExtractor={item => item.id}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyIcon}>🥡</Text>
                                        <Text style={styles.emptyText}>{t('emptyCart')}</Text>
                                    </View>
                                }
                            />
                        </View>

                        <View
                            style={styles.bottomSection}
                        >
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>{t('deliveryAddress')}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('addressPlaceholder')}
                                    placeholderTextColor="#999"
                                    value={address}
                                    onChangeText={setAddress}
                                    multiline
                                />
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

                            <TouchableOpacity style={styles.orderBtn} onPress={handlePlaceOrder}>
                                <Text style={styles.orderBtnEmoji}>💬</Text>
                                <Text style={styles.orderBtnText}>{t('orderWhatsapp')}</Text>
                            </TouchableOpacity>
                            {/* Extra spacer for Floating Tab Bar */}
                            <View style={{ height: 120 }} />
                        </View>
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
    content: {
        flex: 1,
        marginTop: 20, // push for wave
        paddingHorizontal: 20,
    },
    listSection: {
        flex: 0.45,
    },
    listContent: {
        paddingBottom: 20,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    itemMain: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    qtyBox: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 10,
    },
    qtyText: {
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    itemPrice: {
        fontSize: 13,
        color: COLORS.primary,
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
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    qtyBtnText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    removeBtn: {
        marginLeft: 8,
    },
    bottomSection: {
        flex: 0.55,
        backgroundColor: '#FFF',
        paddingTop: 10,
    },
    inputWrapper: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        padding: 12,
        minHeight: 60,
        textAlignVertical: 'top',
        fontSize: 14,
        color: COLORS.textDark,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    billBox: {
        backgroundColor: '#F9F9F9',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    billLabel: {
        color: '#888',
        fontSize: 14,
    },
    billValue: {
        fontWeight: '600',
        color: COLORS.textDark,
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    totalBillLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    totalBillValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    orderBtn: {
        backgroundColor: '#25D366',
        flexDirection: 'row',
        height: 60,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#25D366',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 10,
        marginBottom: 10,
    },
    orderBtnEmoji: {
        fontSize: 24,
        marginRight: 10,
    },
    orderBtnText: {
        color: COLORS.secondary,
        fontSize: 18,
        fontWeight: 'bold',
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
