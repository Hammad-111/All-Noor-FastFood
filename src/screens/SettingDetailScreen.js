import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Switch, Linking, Platform } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import SplitScreen from '../components/SplitScreen';
import { SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../utils/firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import BackButton from '../components/BackButton';

const SettingDetailScreen = ({ route }) => {
    const { colors, themeId, themes, setTheme } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
    const navigation = useNavigation();
    const { t, language, setLanguage } = useLanguage();
    const { user } = useAuth();
    const { addresses, addAddress, updateAddress, deleteAddress } = useCart();
    const section = route?.params?.section;
    const sectionTitleKeys = {
        orders: 'myOrders',
        payments: 'paymentMethods',
        address: 'deliveryAddressMenu',
        settings: 'settings',
        support: 'support',
    };
    const title = sectionTitleKeys[section] ? t(sectionTitleKeys[section]) : (route?.params?.title || 'Detail');

    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [completeModal, setCompleteModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [expandedSettingSection, setExpandedSettingSection] = useState(null);

    // --- FETCH ORDER HISTORY ---
    React.useEffect(() => {
        if ((section === 'orders' || title === t('myOrders')) && user) {
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
    }, [user, section, title, t]);

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
                            <Switch value={isDefault} onValueChange={setIsDefault} trackColor={{ true: colors.primary }} />
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.supportContent}>
            <View style={styles.supportHero}>
                <View style={styles.supportHeroIcon}>
                    <Icon name="headset-outline" size={28} color={colors.accent} />
                </View>
                <Text style={styles.supportHeroTitle}>
                    {language === 'ur' ? 'ہم آپ کی مدد کے لیے حاضر ہیں' : 'How can we help?'}
                </Text>
                <Text style={styles.supportHeroText}>
                    {language === 'ur'
                        ? 'آرڈر، ڈیلیوری یا ادائیگی سے متعلق مدد کے لیے ہماری ٹیم سے رابطہ کریں۔'
                        : 'Contact our team for help with orders, delivery, or payments.'}
                </Text>
                <View style={styles.availabilityBadge}>
                    <View style={styles.availabilityDot} />
                    <Text style={styles.availabilityText}>
                        {language === 'ur' ? 'دکان کے اوقات میں دستیاب' : 'Available during store hours'}
                    </Text>
                </View>
            </View>

            <Text style={styles.supportSectionLabel}>
                {language === 'ur' ? 'فوری مدد' : 'QUICK SUPPORT'}
            </Text>

            <TouchableOpacity
                style={styles.supportCard}
                onPress={() => Linking.openURL('https://wa.me/923048880990')}
                activeOpacity={0.75}
                accessibilityRole="button"
            >
                <View style={[styles.supportActionIcon, styles.whatsappIcon]}>
                    <Icon name="logo-whatsapp" size={22} color="#25D366" />
                </View>
                <View style={styles.supportActionText}>
                    <Text style={styles.supportTitle}>{t('chatWhatsapp')}</Text>
                    <Text style={styles.supportSubtitle}>0304-8880990</Text>
                </View>
                <Icon name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.supportCard}
                onPress={() => Linking.openURL('tel:0652664787')}
                activeOpacity={0.75}
                accessibilityRole="button"
            >
                <View style={styles.supportActionIcon}>
                    <Icon name="call-outline" size={22} color={colors.accent} />
                </View>
                <View style={styles.supportActionText}>
                    <Text style={styles.supportTitle}>{t('callHotline')}</Text>
                    <Text style={styles.supportSubtitle}>065-2664787</Text>
                </View>
                <Icon name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>

            <Text style={styles.supportSectionLabel}>
                {language === 'ur' ? 'دیگر رابطہ نمبرز' : 'OTHER CONTACTS'}
            </Text>
            <View style={styles.secondaryContacts}>
                {[
                    { display: '0336-8880990', phone: '+923368880990' },
                    { display: '0312-8880990', phone: '+923128880990' },
                    { display: '0321-7515371', phone: '+923217515371' },
                ].map((contact, index, contacts) => (
                    <TouchableOpacity
                        key={contact.phone}
                        style={[
                            styles.secondaryContactRow,
                            index < contacts.length - 1 && styles.secondaryContactBorder
                        ]}
                        onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.secondaryContactNumber}>{contact.display}</Text>
                        <Icon name="call-outline" size={16} color={colors.accent} />
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.supportSectionLabel}>
                {language === 'ur' ? 'شکایات اور اعلیٰ رابطہ' : 'COMPLAINTS & ESCALATIONS'}
            </Text>
            <TouchableOpacity
                style={styles.complaintCard}
                onPress={() => Linking.openURL('tel:+923048880970')}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Call Chief Executive for complaints"
            >
                <View style={styles.complaintIconBox}>
                    <Icon name="shield-checkmark-outline" size={22} color={colors.accent} />
                </View>
                <View style={styles.supportActionText}>
                    <Text style={styles.complaintLabel}>
                        {language === 'ur' ? 'چیف ایگزیکٹو' : 'CHIEF EXECUTIVE'}
                    </Text>
                    <Text style={styles.supportTitle}>Ch. Ishfaq Ahmad</Text>
                    <Text style={styles.supportSubtitle}>+92 304 8880970</Text>
                </View>
                <View style={styles.directoryCallButton}>
                    <Icon name="call" size={15} color={colors.accent} />
                </View>
            </TouchableOpacity>

            <View style={styles.supportTip}>
                <Icon name="information-circle-outline" size={19} color={colors.accent} />
                <Text style={styles.supportTipText}>
                    {language === 'ur'
                        ? 'تیز مدد کے لیے رابطہ کرتے وقت اپنا آرڈر نمبر ساتھ رکھیں۔'
                        : 'Keep your order number ready when contacting support for faster assistance.'}
                </Text>
            </View>
        </ScrollView>
    );


    const renderSettingsAccordion = (id, icon, title, content) => {
        const expanded = expandedSettingSection === id;

        return (
            <View style={[styles.settingsAccordion, expanded && styles.settingsAccordionExpanded]}>
                <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() => setExpandedSettingSection(expanded ? null : id)}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityState={{ expanded }}
                >
                    <View style={styles.accordionHeaderLeft}>
                        <View style={styles.accordionIconBox}>
                            <Icon name={icon} size={18} color={colors.accent} />
                        </View>
                        <Text style={styles.accordionTitle}>{title}</Text>
                    </View>
                    <Icon
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={colors.textLight}
                    />
                </TouchableOpacity>
                {expanded && <View style={styles.accordionContent}>{content}</View>}
            </View>
        );
    };

    const renderSettings = () => (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.legalSection}>
                <View style={styles.legalHeader}>
                    <Text style={styles.legalIcon}>◐</Text>
                    <Text style={styles.legalTitle}>{language === 'ur' ? 'ظاہری شکل' : 'Appearance'}</Text>
                </View>
                <Text style={styles.preferenceHint}>
                    {language === 'ur' ? 'اپنی پسند کی ایپ تھیم منتخب کریں' : 'Choose the look that suits you'}
                </Text>
                <View style={styles.themeGrid}>
                    {themes.map((theme) => {
                        const selected = theme.id === themeId;
                        return (
                            <TouchableOpacity
                                key={theme.id}
                                style={[styles.themeCard, selected && styles.themeCardSelected]}
                                onPress={() => setTheme(theme.id)}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: selected }}
                                accessibilityLabel={theme.name}
                            >
                                <View style={styles.swatchRow}>
                                    {theme.swatches.map((swatch) => (
                                        <View key={swatch} style={[styles.swatch, { backgroundColor: swatch }]} />
                                    ))}
                                </View>
                                <View style={styles.themeLabelRow}>
                                    <Text style={styles.themeName} numberOfLines={1}>{theme.name}</Text>
                                    <View style={[styles.selectionRing, selected && styles.selectionRingActive]}>
                                        {selected && <View style={styles.selectionDot} />}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View style={styles.legalSection}>
                <View style={styles.legalHeader}>
                    <Text style={styles.legalIcon}>🌐</Text>
                    <Text style={styles.legalTitle}>{language === 'ur' ? 'زبان' : 'Language'}</Text>
                </View>
                <View style={styles.languageRow}>
                    {[
                        { id: 'en', label: 'English', subLabel: 'EN' },
                        { id: 'ur', label: 'اردو', subLabel: 'UR' },
                    ].map((option) => {
                        const selected = language === option.id;
                        return (
                            <TouchableOpacity
                                key={option.id}
                                style={[styles.languageOption, selected && styles.languageOptionSelected]}
                                onPress={() => setLanguage(option.id)}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: selected }}
                            >
                                <Text style={[styles.languageCode, selected && styles.languageCodeSelected]}>{option.subLabel}</Text>
                                <Text style={styles.languageLabel}>{option.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {renderSettingsAccordion(
                'store',
                'storefront-outline',
                language === 'ur' ? 'دکان کی معلومات' : 'Store Information',
                <>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>📍</Text>
                        <Text style={styles.infoText}>{t('storeAddress')}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>⏰</Text>
                        <Text style={styles.infoText}>{t('storeTimings')}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>🚚</Text>
                        <View>
                            <Text style={styles.infoText}>{t('minOrder')}</Text>
                            <Text style={[styles.infoText, { marginTop: 2, fontSize: 12, opacity: 0.7 }]}>{t('freeDelivery')}</Text>
                        </View>
                    </View>
                </>
            )}

            {renderSettingsAccordion(
                'about',
                'business-outline',
                t('aboutShop'),
                <Text style={styles.legalText}>
                    {language === 'ur' ?
                        "النور فاسٹ فوڈ اپنے آغاز سے ہی بہترین معیار اور ذائقہ پیش کر رہا ہے۔ ہم تازہ، صحت بخش اور لذیذ کھانے فراہم کرنے کے لیے وقف ہیں جن میں برگر اور پیزا سے لے کر روایتی کڑاہی اور ہانڈی کی خصوصیات شامل ہیں۔\n\nہمارا مقصد پریمیم فاسٹ فوڈ کے مستند ذائقے کو براہ راست آپ کے دہلیز تک تیزی اور عمدگی کے ساتھ پہنچانا ہے۔" :
                        "Al Noor Fast Food has been serving the finest quality and taste since our inception. We are dedicated to providing fresh, hygienic, and delicious meals ranging from mouth-watering Burgers and Pizzas to traditional Karahi and Handi specialties.\n\nOur mission is to bring the authentic taste of premium fast food directly to your doorstep with speed and excellence."
                    }
                </Text>
            )}

            {renderSettingsAccordion(
                'privacy',
                'shield-checkmark-outline',
                t('privacyPolicy'),
                <Text style={styles.legalText}>
                    {language === 'ur' ?
                        "آپ کی رازداری ہمارے لیے اہم ہے۔ النور فاسٹ فوڈ آپ کے آرڈرز پر کارروائی کرنے اور آپ کے تجربے کو بہتر بنانے کے لیے درکار کم سے کم ڈیٹا اکٹھا کرتا ہے۔\n\n• ہم آپ کا ڈیلیوری پتہ کسی تیسرے فریق کے ساتھ شیئر نہیں کرتے بجز ڈیلیوری کے مقاصد کے۔\n• آپ کی رابطے کی معلومات صرف آرڈر کی تصدیق اور سپورٹ کے لیے استعمال کی جاتی ہیں۔\n• ہم آپ کی ذاتی معلومات کی حفاظت کے لیے محفوظ صنعتی معیارات استعمال کرتے ہیں۔" :
                        "Your privacy is important to us. Al Noor Fast Food collects minimal data necessary to process your orders and improve your experience.\n\n• We do not share your delivery address with third parties except for delivery purposes.\n• Your contact information is used only for order confirmation and support.\n• We use secure industry standards to protect your personal information."
                    }
                </Text>
            )}

            {renderSettingsAccordion(
                'terms',
                'document-text-outline',
                t('termsConditions'),
                <Text style={styles.legalText}>
                    {language === 'ur' ?
                        "اس ایپ کو استعمال کر کے، آپ درج ذیل سے اتفاق کرتے ہیں:\n\n1. آرڈرز دستیابی اور ڈیلیوری لوکیشن کی حدود کے تابع ہیں۔\n2. ڈیلیوری کے اوقات تخمینہ ہیں اور موسم یا ٹریفک کی بنیاد پر مختلف ہو سکتے ہیں۔\n3. قیمتیں بغیر کسی پیشگی اطلاع کے تبدیل کی جا سکتی ہیں۔\n4. رائیڈر کی آمد پر کیش آن ڈیلیوری کی مکمل ادائیگی کرنی ہوگی۔\n5. کھانے کے ساتھ کسی بھی مسئلے کی اطلاع موصول ہونے کے 30 منٹ کے اندر دینی ہوگی۔" :
                        "By using this app, you agree to the following:\n\n1. Orders are subject to availability and delivery location limits.\n2. Delivery times are estimates and may vary based on weather or traffic.\n3. Prices are subject to change without prior notice.\n4. Cash on delivery must be paid in full upon arrival of the rider.\n5. Any issues with the food must be reported within 30 minutes of receipt."
                    }
                </Text>
            )}

            <View style={styles.versionBox}>
                <Text style={styles.versionText}>{language === 'ur' ? 'ایپ ورژن 1.0.0 (مستحکم)' : 'App Version 1.0.0 (Stable)'}</Text>
                <Text style={styles.creditText}>{language === 'ur' ? 'النور فاسٹ فوڈ سپیشلسٹ کے لیے تیار کردہ' : 'Designed for Al Noor Fast Food Specialists'}</Text>
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );

    const renderContent = () => {
        if (section === 'orders' || title === t('myOrders')) return renderOrders();
        if (section === 'payments' || title === t('paymentMethods')) return renderPayments();
        if (section === 'address' || title === t('deliveryAddressMenu')) return renderAddress();
        if (section === 'support' || title === t('support')) return renderSupport();
        if (section === 'settings' || title === t('settings')) return renderSettings();
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
                            <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('https://wa.me/923048880990')}>
                                <Text style={{ fontSize: 18 }}>💬</Text>
                                <Text style={styles.contactText}>WhatsApp: 0304-8880990</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('tel:0652664787')}>
                                <Text style={{ fontSize: 18 }}>📞</Text>
                                <Text style={styles.contactText}>Hotline: 065-2664787</Text>
                            </TouchableOpacity>
                            <Text style={[styles.contactText, { fontSize: 12, opacity: 0.6, marginTop: 5 }]}>
                                {language === 'ur' ? 'دیگر نمبرز:' : 'Other Contacts:'} 0336-8880990, 0312-8880990, 0321-7515371
                            </Text>
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

const createStyles = (colors) => StyleSheet.create({
    main: { flex: 1 },
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
    backBtn: { width: 45, height: 45, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    backText: { color: colors.secondary, fontSize: 24, fontWeight: 'bold' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.secondary },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 45 },
    orderCard: {
        backgroundColor: colors.glass,
        borderRadius: 18,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: `0px 0px 10px ${colors.primary}1A` // 1A is 10% opacity
            }
        })
    },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderNo: { fontWeight: 'bold', fontSize: 16, color: colors.secondary },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    orderDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 12 },
    orderDate: { fontSize: 12, color: colors.textLight, marginBottom: 8 },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderItems: { fontSize: 13, color: colors.textLight, flex: 1 },
    orderTotal: { fontWeight: 'bold', color: colors.accent, fontSize: 15 },
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
    paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.glass, padding: 15, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: colors.glassBorder },
    paymentIconBox: { width: 45, height: 45, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    paymentIcon: { fontSize: 22 },
    paymentInfo: { flex: 1 },
    paymentTitle: { fontWeight: 'bold', color: colors.secondary, fontSize: 15 },
    paymentSub: { fontSize: 12, color: colors.textLight, marginTop: 2 },
    checkCircleActive: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
    checkDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
    addressCard: { backgroundColor: colors.glass, padding: 15, borderRadius: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 15, elevation: 2, borderWidth: 1, borderColor: colors.glassBorder },
    addressIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    addressIcon: { fontSize: 18 },
    addressInfo: { flex: 1 },
    addressTitle: { fontWeight: 'bold', color: colors.secondary, fontSize: 15 },
    addressText: { fontSize: 13, color: colors.textLight, marginTop: 4 },
    addressActions: { alignItems: 'flex-end' },
    defaultBadge: { backgroundColor: colors.accent + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
    defaultText: { fontSize: 9, color: colors.accent, fontWeight: 'bold' },
    editLink: { color: colors.accent, fontWeight: 'bold', fontSize: 13 },
    deleteLink: { color: '#FF5252', fontWeight: 'bold', fontSize: 12 },
    addBtn: { borderWidth: 2, borderColor: colors.accent, borderStyle: 'dashed', padding: 15, borderRadius: 18, alignItems: 'center', marginTop: 10, marginBottom: 50 },
    addBtnText: { color: colors.accent, fontWeight: 'bold' },
    supportContent: { paddingBottom: 110 },
    supportHero: {
        alignItems: 'center',
        paddingHorizontal: 22,
        paddingVertical: 24,
        marginBottom: 24,
        borderRadius: 22,
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    supportHeroIcon: {
        width: 54,
        height: 54,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
        backgroundColor: `${colors.accent}12`,
        borderWidth: 1,
        borderColor: `${colors.accent}30`,
    },
    supportHeroTitle: {
        color: colors.secondary,
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
    },
    supportHeroText: {
        color: colors.textLight,
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'center',
        marginTop: 7,
    },
    availabilityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: `${colors.success}14`,
    },
    availabilityDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        marginRight: 7,
        backgroundColor: colors.success,
    },
    availabilityText: { color: colors.success, fontSize: 10, fontWeight: '700' },
    supportSectionLabel: {
        color: colors.textLight,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.3,
        marginLeft: 4,
        marginBottom: 9,
        marginTop: 2,
    },
    supportCard: {
        backgroundColor: colors.glass,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 18,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    supportActionIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 13,
        backgroundColor: `${colors.accent}10`,
        borderWidth: 1,
        borderColor: `${colors.accent}22`,
    },
    whatsappIcon: {
        backgroundColor: 'rgba(37,211,102,0.09)',
        borderColor: 'rgba(37,211,102,0.2)',
    },
    supportActionText: { flex: 1 },
    supportTitle: { color: colors.secondary, fontSize: 15, fontWeight: '700' },
    supportSubtitle: { color: colors.textLight, fontSize: 11, marginTop: 3 },
    secondaryContacts: {
        marginBottom: 14,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    secondaryContactRow: {
        minHeight: 48,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    secondaryContactBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.subtle,
    },
    secondaryContactNumber: {
        color: colors.secondary,
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.25,
    },
    directoryCallButton: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${colors.accent}10`,
    },
    complaintCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginBottom: 14,
        borderRadius: 18,
        backgroundColor: `${colors.accent}08`,
        borderWidth: 1,
        borderColor: `${colors.accent}28`,
    },
    complaintIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 13,
        backgroundColor: `${colors.accent}12`,
        borderWidth: 1,
        borderColor: `${colors.accent}25`,
    },
    complaintLabel: {
        color: colors.accent,
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 1.1,
        marginBottom: 3,
    },
    supportTip: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 14,
        borderRadius: 15,
        backgroundColor: `${colors.accent}09`,
        borderWidth: 1,
        borderColor: `${colors.accent}18`,
    },
    supportTipText: {
        flex: 1,
        color: colors.textLight,
        fontSize: 11,
        lineHeight: 17,
        marginLeft: 9,
    },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: colors.secondary },
    subText: { color: colors.textLight, marginTop: 10, textAlign: 'center' },
    // Modal Styles
    // Modal Styles
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.secondary, marginBottom: 20 },
    modalInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, padding: 15, marginBottom: 15, fontSize: 14, color: colors.secondary, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, marginBottom: 20 },
    switchLabel: { fontSize: 15, fontWeight: '600', color: colors.secondary },
    modalFooter: { flexDirection: 'row', gap: 10 },
    cancelBtn: { flex: 1, padding: 15, borderRadius: 15, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    cancelBtnText: { fontWeight: 'bold', color: colors.textLight },
    saveBtn: { flex: 2, padding: 15, borderRadius: 15, alignItems: 'center', backgroundColor: colors.primary },
    saveBtnText: { fontWeight: 'bold', color: '#FFF' },
    // Legal & Settings
    legalSection: {
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        elevation: 2,
    },
    legalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    legalIcon: { fontSize: 20, marginRight: 10 },
    legalTitle: { fontSize: 16, fontWeight: 'bold', color: colors.secondary },
    legalText: { fontSize: 13, color: colors.textLight, lineHeight: 20 },
    settingsAccordion: {
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        borderRadius: 18,
        marginBottom: 12,
        overflow: 'hidden',
    },
    settingsAccordionExpanded: {
        borderColor: `${colors.accent}55`,
    },
    accordionHeader: {
        minHeight: 62,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    accordionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    accordionIconBox: {
        width: 36,
        height: 36,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        backgroundColor: `${colors.accent}12`,
        borderWidth: 1,
        borderColor: `${colors.accent}25`,
    },
    accordionTitle: {
        flex: 1,
        color: colors.secondary,
        fontSize: 14,
        fontWeight: '700',
    },
    accordionContent: {
        paddingHorizontal: 16,
        paddingTop: 15,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: colors.subtle,
    },
    versionBox: { alignItems: 'center', marginTop: 10, paddingBottom: 20 },
    versionText: { fontSize: 12, color: colors.textLight, fontWeight: '600' },
    creditText: { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 },
    preferenceHint: { color: colors.textLight, fontSize: 11, marginBottom: 10 },
    themeGrid: { flexDirection: 'row', gap: 8 },
    themeCard: {
        flex: 1,
        minWidth: 0,
        backgroundColor: colors.subtle,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        borderRadius: 12,
        padding: 8,
    },
    themeCardSelected: {
        borderColor: colors.accent,
        backgroundColor: `${colors.accent}12`,
    },
    swatchRow: { flexDirection: 'row', height: 18, borderRadius: 6, overflow: 'hidden', marginBottom: 7 },
    swatch: { flex: 1 },
    themeLabelRow: { minHeight: 18, justifyContent: 'center' },
    themeName: { color: colors.textDark, fontSize: 9, fontWeight: '700', paddingRight: 15 },
    selectionRing: {
        position: 'absolute',
        right: 0,
        width: 13,
        height: 13,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: colors.textLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectionRingActive: { borderColor: colors.accent },
    selectionDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent },
    languageRow: { flexDirection: 'row', gap: 10 },
    languageOption: {
        flex: 1,
        minHeight: 66,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.subtle,
        alignItems: 'center',
        justifyContent: 'center',
    },
    languageOptionSelected: { borderColor: colors.accent, backgroundColor: `${colors.accent}12` },
    languageCode: { color: colors.textLight, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    languageCodeSelected: { color: colors.accent },
    languageLabel: { color: colors.textDark, fontSize: 14, fontWeight: '700', marginTop: 3 },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingLeft: 5,
    },
    infoIcon: {
        fontSize: 16,
        marginRight: 12,
        width: 20,
        textAlign: 'center',
    },
    infoText: {
        fontSize: 14,
        color: colors.secondary,
        fontWeight: '500',
    },

    // Complete Modal
    completeModalContent: {
        backgroundColor: colors.surfaceElevated,
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
        color: colors.secondary,
        textAlign: 'center',
        marginBottom: 10,
    },
    completeModalDesc: {
        fontSize: 14,
        color: colors.textLight,
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
        color: colors.accent,
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
        color: colors.secondary,
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
