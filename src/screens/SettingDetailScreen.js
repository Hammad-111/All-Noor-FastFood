
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import SplitScreen from '../components/SplitScreen';
import { COLORS, FONTS } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingDetailScreen = ({ route }) => {
    const navigation = useNavigation();
    const title = route?.params?.title || "Detail";

    return (
        <View style={styles.main}>
            <SplitScreen>
                <SafeAreaView style={styles.container} edges={['top']}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Text style={styles.backText}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{title}</Text>
                        <View style={{ width: 45 }} />
                    </View>

                    <View style={styles.content}>
                        <View style={styles.card}>
                            <Text style={styles.emptyText}>No {title.toLowerCase()} found yet.</Text>
                            <Text style={styles.subText}>Start exploring our fresh menu!</Text>

                            <TouchableOpacity
                                style={styles.btn}
                                onPress={() => navigation.navigate('HomeTab')}
                            >
                                <Text style={styles.btnText}>Go to Menu</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </SplitScreen>
        </View>
    );
};

const styles = StyleSheet.create({
    main: { flex: 1 },
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backBtn: {
        width: 45,
        height: 45,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backText: { color: COLORS.secondary, fontSize: 24, fontWeight: 'bold' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.secondary },
    content: {
        flex: 1,
        paddingHorizontal: 25,
        paddingTop: 40, // Reduced space for wave
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark },
    subText: { color: '#888', marginTop: 10, textAlign: 'center' },
    btn: {
        marginTop: 25,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 15,
    },
    btnText: { color: COLORS.secondary, fontWeight: 'bold' }
});

export default SettingDetailScreen;
