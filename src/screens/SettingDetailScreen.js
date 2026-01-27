import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Switch, Linking } from 'react-native';
import SplitScreen from '../components/SplitScreen';
import { COLORS, SIZES } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

const SettingDetailScreen = ({ route }) => {
    const navigation = useNavigation();
    const { t } = useLanguage();
    const { addresses, addAddress, updateAddress, deleteAddress } = useCart();
    const title = route?.params?.title || "Detail";

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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={{ width: 45 }} />
        </View>
    );

    const renderOrders = () => (
        <ScrollView showsVerticalScrollIndicator={false}>
            {[1, 2].map((id) => (
                <View key={id} style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                        <Text style={styles.orderNo}>Order #ALN-{1234 + id}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: id === 1 ? '#FFF8E1' : '#E8F5E9' }]}>
                            <Text style={[styles.statusText, { color: id === 1 ? '#FFB300' : '#4CAF50' }]}>
                                {id === 1 ? 'Processing' : 'Delivered'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.orderDivider} />
                    <Text style={styles.orderDate}>27 Jan 2026 • 12:45 PM</Text>
                    <View style={styles.orderFooter}>
                        <Text style={styles.orderItems}>2x Zinger Burger, 1x Fries</Text>
                        <Text style={styles.orderTotal}>Rs. 850</Text>
                    </View>
                </View>
            ))}
        </ScrollView>
    );

    const renderPayments = () => (
        <ScrollView>
            <TouchableOpacity style={styles.paymentCard}>
                <View style={styles.paymentIconBox}>
                    <Text style={styles.paymentIcon}>💵</Text>
                </View>
                <View style={styles.paymentInfo}>
                    <Text style={styles.paymentTitle}>Cash on Delivery</Text>
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
                        <Text style={styles.addressIcon}>{item.title === 'Home' ? '🏠' : '🏢'}</Text>
                    </View>
                    <View style={styles.addressInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.addressTitle}>{item.title}</Text>
                            {item.isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultText}>DEFAULT</Text></View>}
                        </View>
                        <Text style={styles.addressText}>{item.address}</Text>
                    </View>
                    <View style={styles.addressActions}>
                        <TouchableOpacity onPress={() => openModal(item)}><Text style={styles.editLink}>Edit</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteAddress(item.id)} style={{ marginTop: 10 }}><Text style={styles.deleteLink}>Delete</Text></TouchableOpacity>
                    </View>
                </View>
            ))}

            <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
                <Text style={styles.addBtnText}>+ Add New Address</Text>
            </TouchableOpacity>

            <Modal animationType="slide" transparent visible={modalVisible}>
                <View style={styles.modalBg}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{editingAddr ? 'Edit Address' : 'New Address'}</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Title (e.g. Home, Office)"
                            value={addrTitle}
                            onChangeText={setAddrTitle}
                        />
                        <TextInput
                            style={[styles.modalInput, { minHeight: 100, textAlignVertical: 'top' }]}
                            placeholder="Full Address Details..."
                            value={addrFull}
                            onChangeText={setAddrFull}
                            multiline
                        />

                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Set as Default</Text>
                            <Switch value={isDefault} onValueChange={setIsDefault} trackColor={{ true: COLORS.primary }} />
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                                <Text style={styles.saveBtnText}>Save Address</Text>
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
                <Text style={styles.supportTitle}>Chat on WhatsApp</Text>
                <Text style={styles.supportArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.supportCard} onPress={() => Linking.openURL('tel:+923017891391')}>
                <Text style={styles.supportEmoji}>📞</Text>
                <Text style={styles.supportTitle}>Call Hotline</Text>
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
                    <Text style={styles.legalTitle}>About Al Noor Fast Food</Text>
                </View>
                <Text style={styles.legalText}>
                    Al Noor Fast Food has been serving the finest quality and taste since our inception.
                    We are dedicated to providing fresh, hygienic, and delicious meals ranging from
                    mouth-watering Burgers and Pizzas to traditional Karahi and Handi specialties.
                    {"\n\n"}
                    Our mission is to bring the authentic taste of premium fast food directly to your doorstep
                    with speed and excellence.
                </Text>
            </View>

            {/* Privacy Section */}
            <View style={styles.legalSection}>
                <View style={styles.legalHeader}>
                    <Text style={styles.legalIcon}>🛡️</Text>
                    <Text style={styles.legalTitle}>Privacy Policy</Text>
                </View>
                <Text style={styles.legalText}>
                    Your privacy is important to us. Al Noor Fast Food collects minimal data necessary to
                    process your orders and improve your experience.
                    {"\n\n"}
                    • We do not share your delivery address with third parties except for delivery purposes.
                    {"\n"}• Your contact information is used only for order confirmation and support.
                    {"\n"}• We use secure industry standards to protect your personal information.
                </Text>
            </View>

            {/* Terms Section */}
            <View style={styles.legalSection}>
                <View style={styles.legalHeader}>
                    <Text style={styles.legalIcon}>📜</Text>
                    <Text style={styles.legalTitle}>Terms & Conditions</Text>
                </View>
                <Text style={styles.legalText}>
                    By using this app, you agree to the following:
                    {"\n\n"}
                    1. Orders are subject to availability and delivery location limits.
                    {"\n"}2. Delivery times are estimates and may vary based on weather or traffic.
                    {"\n"}3. Prices are subject to change without prior notice.
                    {"\n"}4. Cash on delivery must be paid in full upon arrival of the rider.
                    {"\n"}5. Any issues with the food must be reported within 30 minutes of receipt.
                </Text>
            </View>

            <View style={styles.versionBox}>
                <Text style={styles.versionText}>App Version 1.0.0 (Stable)</Text>
                <Text style={styles.creditText}>Designed for Al Noor Fast Food Specialists</Text>
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
    orderCard: { backgroundColor: '#FFF', borderRadius: 18, padding: 15, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderNo: { fontWeight: 'bold', fontSize: 16, color: COLORS.textDark },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    orderDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
    orderDate: { fontSize: 12, color: '#AAA', marginBottom: 8 },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderItems: { fontSize: 13, color: '#666', flex: 1 },
    orderTotal: { fontWeight: 'bold', color: COLORS.primary, fontSize: 15 },
    paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0' },
    paymentIconBox: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    paymentIcon: { fontSize: 22 },
    paymentInfo: { flex: 1 },
    paymentTitle: { fontWeight: 'bold', color: COLORS.textDark, fontSize: 15 },
    paymentSub: { fontSize: 12, color: '#888', marginTop: 2 },
    checkCircleActive: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
    checkDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
    addressCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 15, elevation: 2 },
    addressIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    addressIcon: { fontSize: 18 },
    addressInfo: { flex: 1 },
    addressTitle: { fontWeight: 'bold', color: COLORS.textDark, fontSize: 15 },
    addressText: { fontSize: 13, color: '#888', marginTop: 4 },
    addressActions: { alignItems: 'flex-end' },
    defaultBadge: { backgroundColor: COLORS.primary + '10', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
    defaultText: { fontSize: 9, color: COLORS.primary, fontWeight: 'bold' },
    editLink: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
    deleteLink: { color: '#FF5252', fontWeight: 'bold', fontSize: 12 },
    addBtn: { borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed', padding: 15, borderRadius: 18, alignItems: 'center', marginTop: 10, marginBottom: 50 },
    addBtnText: { color: COLORS.primary, fontWeight: 'bold' },
    supportCard: { backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, marginBottom: 12, elevation: 2 },
    supportEmoji: { fontSize: 24, marginRight: 15 },
    supportTitle: { flex: 1, fontWeight: 'bold', color: COLORS.textDark, fontSize: 16 },
    supportArrow: { fontSize: 24, color: '#CCC' },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark },
    subText: { color: '#888', marginTop: 10, textAlign: 'center' },
    // Modal Styles
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 20 },
    modalInput: { backgroundColor: '#F5F5F5', borderRadius: 15, padding: 15, marginBottom: 15, fontSize: 14, color: COLORS.textDark },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, marginBottom: 20 },
    switchLabel: { fontSize: 15, fontWeight: '600', color: COLORS.textDark },
    modalFooter: { flexDirection: 'row', gap: 10 },
    cancelBtn: { flex: 1, padding: 15, borderRadius: 15, alignItems: 'center', backgroundColor: '#F5F5F5' },
    cancelBtnText: { fontWeight: 'bold', color: '#666' },
    saveBtn: { flex: 2, padding: 15, borderRadius: 15, alignItems: 'center', backgroundColor: COLORS.primary },
    saveBtnText: { fontWeight: 'bold', color: '#FFF' },
    // Legal & Settings
    legalSection: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        elevation: 2,
    },
    legalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    legalIcon: { fontSize: 20, marginRight: 10 },
    legalTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark },
    legalText: { fontSize: 13, color: '#666', lineHeight: 20 },
    versionBox: { alignItems: 'center', marginTop: 10, paddingBottom: 20 },
    versionText: { fontSize: 12, color: '#AAA', fontWeight: '600' },
    creditText: { fontSize: 10, color: '#CCC', marginTop: 4 }
});

export default SettingDetailScreen;
