import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Switch, Linking } from 'react-native';
import SplitScreen from '../components/SplitScreen';
import { COLORS, SIZES } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../utils/firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import BackButton from '../components/BackButton';

const SettingDetailScreen = ({ route }) => {
    const navigation = useNavigation();
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const { addresses, addAddress, updateAddress, deleteAddress } = useCart();
    const title = route?.params?.title || "Detail";

    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [completeModal, setCompleteModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // --- FETCH ORDER HISTORY ---
    React.useEffect(() => {
        if (title === t('myOrders') && user) {
            setLoadingOrders(true);
            const q = query(
                collection(db, 'users', user.uid, 'orders'),
                orderBy('createdAt', 'desc')
            );

            const unsub = onSnapshot(q, (snap) => {
                const orderData = snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setOrders(orderData);
                setLoadingOrders(false);
            }, (error) => {
                console.error("Orders Fetch Error:", error);
                setLoadingOrders(false);
            });

            return unsub;
        }
    }, [user, title, t]);

    const handleMarkComplete = async () => {
        if (!selectedOrder || !user) return;
        try {
            await updateDoc(doc(db, 'users', user.uid, 'orders', selectedOrder.id), {
                status: 'Delivered'
            });
            setCompleteModal(false);
            setSelectedOrder(null);
        } catch (e) {
            console.error('Order update error:', e);
        }
    };

    const openCompleteModal = (order) => {
        setSelectedOrder(order);
        setCompleteModal(true);
    };

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [editingAddr, setEditingAddr] = useState(null);
    const [addrTitle, setAddrTitle] = useState('');
    const [addrFull, setAddrFull] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    const openModal = (addr = null) => {
        if (addr) {
            setEditingAddr(addr);
            setAddrTitle(addr.title);
            setAddrFull(addr.address);
            setIsDefault(addr.isDefault);
        } else {
            setEditingAddr(null);
            setAddrTitle('');
            setAddrFull('');
            setIsDefault(addresses.length === 0);
        }
        setModalVisible(true);
    };

    const handleSave = () => {
        if (!addrTitle || !addrFull) return;

        const data = {
            title: addrTitle,
            address: addrFull,
            isDefault: isDefault
        };

        if (editingAddr) {
            updateAddress({ ...data, id: editingAddr.id });
        } else {
            addAddress(data);
        }
        setModalVisible(false);
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <BackButton />
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={{ width: 45 }} />
        </View>
    );

    const renderOrders = () => {
        if (loadingOrders) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{language === 'ur' ? 'آرڈرز لوڈ ہو رہے ہیں...' : 'Loading Orders...'}</Text>
                </View>
            );
        }

        if (orders.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{t('noItemsFound')}</Text>
                    <Text style={styles.subText}>{language === 'ur' ? 'آپ نے ابھی تک کوئی آرڈر نہیں دیا' : 'You haven\'t placed any orders yet'}</Text>
                </View>
            );
        }

        return (
            <ScrollView showsVerticalScrollIndicator={false}>
                {orders.map((order) => (
                    <View key={order.id} style={styles.orderCard}>
                        <View style={styles.orderHeader}>
                            <Text style={styles.orderNo}>{t('orderNo')} #...{order.id.slice(-5).toUpperCase()}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: order.status === 'Processing' ? '#FFF8E1' : '#E8F5E9' }]}>
                                <Text style={[styles.statusText, { color: order.status === 'Processing' ? '#FFB300' : '#4CAF50' }]}>
                                    {order.status === 'Processing' ? t('processing') : t('delivered')}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.orderDivider} />
                        <Text style={styles.orderDate}>
                            {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'Just now'}
                        </Text>
                        <View style={styles.orderFooter}>
                            <Text style={styles.orderItems} numberOfLines={1}>
                                {order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                            </Text>
                            <Text style={styles.orderTotal}>Rs. {order.total}</Text>
                        </View>
                        {order.status === 'Processing' && (
                            <TouchableOpacity
                                style={styles.markCompleteBtn}
                                onPress={() => openCompleteModal(order)}
                            >
                                <Text style={styles.markCompleteText}>
                                    {language === 'ur' ? '✅ آرڈر مکمل کریں' : '✅ Mark as Complete'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
                <View style={{ height: 100 }} />
            </ScrollView>
        );
    };

    const renderPayments = () => (
        <ScrollView>
            <TouchableOpacity style={styles.paymentCard}>
                <View style={styles.paymentIconBox}>
                    <Text style={styles.paymentIcon}>💵</Text>
                </View>
                <View style={styles.paymentInfo}>
                    <Text style={styles.paymentTitle}>{t('cashOnDelivery')}</Text>
                    <Text style={styles.paymentSub}>Default Payment Method</Text>
                </View>
                <View style={styles.checkCircleActive}><View style={styles.checkDot} /></View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.paymentCard, { opacity: 0.6 }]}>
                <View style={[styles.paymentIconBox, { backgroundColor: '#E3F2FD' }]}>
                    <Text style={styles.paymentIcon}>💳</Text>
                </View>
                <View style={styles.paymentInfo}>
                    <Text style={styles.paymentTitle}>Credit / Debit Card</Text>
                    <Text style={styles.paymentSub}>Coming Soon</Text>
                </View>
            </TouchableOpacity>
        </ScrollView>
    );

    const renderAddress = () => (
        <ScrollView>
            {addresses.map((item) => (
                <View key={item.id} style={styles.addressCard}>
                    <View style={styles.addressIconBox}>
                        <Text style={styles.addressIcon}>{item.title === 'Home' || item.title === 'گھر' ? '🏠' : '🏢'}</Text>
                    </View>
                    <View style={styles.addressInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.addressTitle}>{item.title}</Text>
                            {item.isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultText}>DEFAULT</Text></View>}
                        </View>
                        <Text style={styles.addressText}>{item.address}</Text>
                    </View>
                    <View style={styles.addressActions}>
                        <TouchableOpacity onPress={() => openModal(item)}><Text style={styles.editLink}>{t('edit')}</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteAddress(item.id)} style={{ marginTop: 10 }}><Text style={styles.deleteLink}>{t('delete')}</Text></TouchableOpacity>
                    </View>
                </View>
            ))}

            <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
                <Text style={styles.addBtnText}>{t('addNewAddress')}</Text>
            </TouchableOpacity>

            <Modal animationType="slide" transparent visible={modalVisible}>
                <View style={styles.modalBg}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{editingAddr ? t('editAddress') : t('newAddress')}</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder={t('addressTitlePlaceholder')}
                            value={addrTitle}
                            onChangeText={setAddrTitle}
                        />
                        <TextInput
                            style={[styles.modalInput, { minHeight: 100, textAlignVertical: 'top' }]}
                            placeholder={t('addressDetailsPlaceholder')}
                            value={addrFull}
                            onChangeText={setAddrFull}
                            multiline
                        />

                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>{t('setAsDefault')}</Text>
                            <Switch value={isDefault} onValueChange={setIsDefault} trackColor={{ true: COLORS.primary }} />
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                                <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                                <Text style={styles.saveBtnText}>{t('saveAddress')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );

    const renderSupport = () => (
        <ScrollView>
            <TouchableOpacity style={styles.supportCard} onPress={() => Linking.openURL('https://wa.me/923017891391')}>
                <Text style={styles.supportEmoji}>💬</Text>
                <Text style={styles.supportTitle}>{t('chatWhatsapp')}</Text>
                <Text style={styles.supportArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.supportCard} onPress={() => Linking.openURL('tel:+923017891391')}>
                <Text style={styles.supportEmoji}>📞</Text>
                <Text style={styles.supportTitle}>{t('callHotline')}</Text>
                <Text style={styles.supportArrow}>›</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    const renderSettings = () => (
        <ScrollView showsVerticalScrollIndicator={false}>
            {/* About Section */}
            <View style={styles.legalSection}>
                <View style={styles.legalHeader}>
                    <Text style={styles.legalIcon}>🏢</Text>
                    <Text style={styles.legalTitle}>{t('aboutShop')}</Text>
                </View>
                <Text style={styles.legalText}>
                    {language === 'ur' ?
                        "النور فاسٹ فوڈ اپنے آغاز سے ہی بہترین معیار اور ذائقہ پیش کر رہا ہے۔ ہم تازہ، صحت بخش اور لذیذ کھانے فراہم کرنے کے لیے وقف ہیں جن میں برگر اور پیزا سے لے کر روایتی کڑاہی اور ہانڈی کی خصوصیات شامل ہیں۔\n\nہمارا مقصد پریمیم فاسٹ فوڈ کے مستند ذائقے کو براہ راست آپ کے دہلیز تک تیزی اور عمدگی کے ساتھ پہنچانا ہے۔" :
                        "Al Noor Fast Food has been serving the finest quality and taste since our inception. We are dedicated to providing fresh, hygienic, and delicious meals ranging from mouth-watering Burgers and Pizzas to traditional Karahi and Handi specialties.\n\nOur mission is to bring the authentic taste of premium fast food directly to your doorstep with speed and excellence."
                    }
                </Text>
            </View>

            {/* Privacy Section */}
            <View style={styles.legalSection}>
                <View style={styles.legalHeader}>
                    <Text style={styles.legalIcon}>🛡️</Text>
                    <Text style={styles.legalTitle}>{t('privacyPolicy')}</Text>
                </View>
                <Text style={styles.legalText}>
                    {language === 'ur' ?
                        "آپ کی رازداری ہمارے لیے اہم ہے۔ النور فاسٹ فوڈ آپ کے آرڈرز پر کارروائی کرنے اور آپ کے تجربے کو بہتر بنانے کے لیے درکار کم سے کم ڈیٹا اکٹھا کرتا ہے۔\n\n• ہم آپ کا ڈیلیوری پتہ کسی تیسرے فریق کے ساتھ شیئر نہیں کرتے بجز ڈیلیوری کے مقاصد کے۔\n• آپ کی رابطے کی معلومات صرف آرڈر کی تصدیق اور سپورٹ کے لیے استعمال کی جاتی ہیں۔\n• ہم آپ کی ذاتی معلومات کی حفاظت کے لیے محفوظ صنعتی معیارات استعمال کرتے ہیں۔" :
                        "Your privacy is important to us. Al Noor Fast Food collects minimal data necessary to process your orders and improve your experience.\n\n• We do not share your delivery address with third parties except for delivery purposes.\n• Your contact information is used only for order confirmation and support.\n• We use secure industry standards to protect your personal information."
                    }
                </Text>
            </View>

            {/* Terms Section */}
            <View style={styles.legalSection}>
                <View style={styles.legalHeader}>
                    <Text style={styles.legalIcon}>📜</Text>
                    <Text style={styles.legalTitle}>{t('termsConditions')}</Text>
                </View>
                <Text style={styles.legalText}>
                    {language === 'ur' ?
                        "اس ایپ کو استعمال کر کے، آپ درج ذیل سے اتفاق کرتے ہیں:\n\n1. آرڈرز دستیابی اور ڈیلیوری لوکیشن کی حدود کے تابع ہیں۔\n2. ڈیلیوری کے اوقات تخمینہ ہیں اور موسم یا ٹریفک کی بنیاد پر مختلف ہو سکتے ہیں۔\n3. قیمتیں بغیر کسی پیشگی اطلاع کے تبدیل کی جا سکتی ہیں۔\n4. رائیڈر کی آمد پر کیش آن ڈیلیوری کی مکمل ادائیگی کرنی ہوگی۔\n5. کھانے کے ساتھ کسی بھی مسئلے کی اطلاع موصول ہونے کے 30 منٹ کے اندر دینی ہوگی۔" :
                        "By using this app, you agree to the following:\n\n1. Orders are subject to availability and delivery location limits.\n2. Delivery times are estimates and may vary based on weather or traffic.\n3. Prices are subject to change without prior notice.\n4. Cash on delivery must be paid in full upon arrival of the rider.\n5. Any issues with the food must be reported within 30 minutes of receipt."
                    }
                </Text>
            </View>

            <View style={styles.versionBox}>
                <Text style={styles.versionText}>{language === 'ur' ? 'ایپ ورژن 1.0.0 (مستحکم)' : 'App Version 1.0.0 (Stable)'}</Text>
                <Text style={styles.creditText}>{language === 'ur' ? 'النور فاسٹ فوڈ سپیشلسٹ کے لیے تیار کردہ' : 'Designed for Al Noor Fast Food Specialists'}</Text>
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );

    const renderContent = () => {
        if (title === t('myOrders')) return renderOrders();
        if (title === t('paymentMethods')) return renderPayments();
        if (title === t('deliveryAddressMenu')) return renderAddress();
        if (title === t('support')) return renderSupport();
        if (title === t('settings')) return renderSettings();
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Updating Section...</Text>
                <Text style={styles.subText}>This feature is coming in the next update!</Text>
            </View>
        );
    };

    return (
        <View style={styles.main}>
            <SplitScreen ratio={0.20}>
                <SafeAreaView style={styles.container} edges={['top']}>
                    {renderHeader()}
                    <View style={styles.content}>{renderContent()}</View>
                </SafeAreaView>
            </SplitScreen>

            {/* Complete Order Confirmation Modal */}
            <Modal animationType="fade" transparent visible={completeModal}>
                <View style={styles.modalBg}>
                    <View style={styles.completeModalContent}>
                        <Text style={styles.completeModalTitle}>
                            {language === 'ur' ? 'آرڈر مکمل کریں؟' : 'Complete Order?'}
                        </Text>
                        <Text style={styles.completeModalDesc}>
                            {language === 'ur'
                                ? 'کیا آپ کو اپنا آرڈر موصول ہو گیا ہے؟ اگر کوئی مسئلہ ہے تو ہم سے رابطہ کریں۔'
                                : 'Have you received your order? If there is any issue, please contact us.'}
                        </Text>

                        <View style={styles.contactSection}>
                            <Text style={styles.contactTitle}>{language === 'ur' ? 'رابطہ کی تفصیلات' : 'Contact Details'}</Text>
                            <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('https://wa.me/923017891391')}>
                                <Text style={{ fontSize: 18 }}>💬</Text>
                                <Text style={styles.contactText}>WhatsApp: +92 301 7891391</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('tel:+923017891391')}>
                                <Text style={{ fontSize: 18 }}>📞</Text>
                                <Text style={styles.contactText}>Hotline: +92 301 7891391</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.completeModalButtons}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => {
                                    setCompleteModal(false);
                                    setSelectedOrder(null);
                                }}
                            >
                                <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.completeBtn} onPress={handleMarkComplete}>
                                <Text style={styles.completeBtnText}>
                                    {language === 'ur' ? 'جی ہاں، مکمل ہے' : 'Yes, Completed'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    main: { flex: 1 },
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
    backBtn: { width: 45, height: 45, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    backText: { color: COLORS.secondary, fontSize: 24, fontWeight: 'bold' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.secondary },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 45 },
    orderCard: { backgroundColor: COLORS.glass, borderRadius: 18, padding: 15, marginBottom: 15, elevation: 3, borderWidth: 1, borderColor: COLORS.glassBorder, shadowColor: COLORS.primary, shadowOpacity: 0.1, shadowRadius: 10 },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderNo: { fontWeight: 'bold', fontSize: 16, color: COLORS.secondary },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    orderDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 12 },
    orderDate: { fontSize: 12, color: COLORS.textLight, marginBottom: 8 },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderItems: { fontSize: 13, color: COLORS.textLight, flex: 1 },
    orderTotal: { fontWeight: 'bold', color: COLORS.accent, fontSize: 15 },
    markCompleteBtn: {
        marginTop: 15,
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    markCompleteText: {
        color: '#4CAF50',
        fontWeight: 'bold',
        fontSize: 14,
    },
    paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.glass, padding: 15, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: COLORS.glassBorder },
    paymentIconBox: { width: 45, height: 45, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    paymentIcon: { fontSize: 22 },
    paymentInfo: { flex: 1 },
    paymentTitle: { fontWeight: 'bold', color: COLORS.secondary, fontSize: 15 },
    paymentSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
    checkCircleActive: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.accent, justifyContent: 'center', alignItems: 'center' },
    checkDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent },
    addressCard: { backgroundColor: COLORS.glass, padding: 15, borderRadius: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 15, elevation: 2, borderWidth: 1, borderColor: COLORS.glassBorder },
    addressIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    addressIcon: { fontSize: 18 },
    addressInfo: { flex: 1 },
    addressTitle: { fontWeight: 'bold', color: COLORS.secondary, fontSize: 15 },
    addressText: { fontSize: 13, color: COLORS.textLight, marginTop: 4 },
    addressActions: { alignItems: 'flex-end' },
    defaultBadge: { backgroundColor: COLORS.accent + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
    defaultText: { fontSize: 9, color: COLORS.accent, fontWeight: 'bold' },
    editLink: { color: COLORS.accent, fontWeight: 'bold', fontSize: 13 },
    deleteLink: { color: '#FF5252', fontWeight: 'bold', fontSize: 12 },
    addBtn: { borderWidth: 2, borderColor: COLORS.accent, borderStyle: 'dashed', padding: 15, borderRadius: 18, alignItems: 'center', marginTop: 10, marginBottom: 50 },
    addBtnText: { color: COLORS.accent, fontWeight: 'bold' },
    supportCard: { backgroundColor: COLORS.glass, flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, marginBottom: 12, elevation: 2, borderWidth: 1, borderColor: COLORS.glassBorder },
    supportEmoji: { fontSize: 24, marginRight: 15 },
    supportTitle: { flex: 1, fontWeight: 'bold', color: COLORS.secondary, fontSize: 16 },
    supportArrow: { fontSize: 24, color: 'rgba(255,255,255,0.2)' },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary },
    subText: { color: COLORS.textLight, marginTop: 10, textAlign: 'center' },
    // Modal Styles
    // Modal Styles
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: '#0F172A', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 20 },
    modalInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, padding: 15, marginBottom: 15, fontSize: 14, color: COLORS.secondary, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, marginBottom: 20 },
    switchLabel: { fontSize: 15, fontWeight: '600', color: COLORS.secondary },
    modalFooter: { flexDirection: 'row', gap: 10 },
    cancelBtn: { flex: 1, padding: 15, borderRadius: 15, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    cancelBtnText: { fontWeight: 'bold', color: COLORS.textLight },
    saveBtn: { flex: 2, padding: 15, borderRadius: 15, alignItems: 'center', backgroundColor: COLORS.primary },
    saveBtnText: { fontWeight: 'bold', color: '#FFF' },
    // Legal & Settings
    legalSection: {
        backgroundColor: COLORS.glass,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        elevation: 2,
    },
    legalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    legalIcon: { fontSize: 20, marginRight: 10 },
    legalTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.secondary },
    legalText: { fontSize: 13, color: COLORS.textLight, lineHeight: 20 },
    versionBox: { alignItems: 'center', marginTop: 10, paddingBottom: 20 },
    versionText: { fontSize: 12, color: COLORS.textLight, fontWeight: '600' },
    creditText: { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 },
    // Complete Modal
    completeModalContent: {
        backgroundColor: '#1E293B',
        width: '85%',
        alignSelf: 'center',
        borderRadius: 25,
        padding: 25,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 'auto',
        marginTop: 'auto',
    },
    completeModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.secondary,
        textAlign: 'center',
        marginBottom: 10,
    },
    completeModalDesc: {
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    contactSection: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
    },
    contactTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.accent,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    contactText: {
        fontSize: 14,
        color: COLORS.secondary,
        marginLeft: 10,
    },
    completeModalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    completeBtn: {
        flex: 1,
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
    },
    completeBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});

export default SettingDetailScreen;
