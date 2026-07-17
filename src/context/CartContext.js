import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { db } from '../utils/firebaseConfig';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [addresses, setAddresses] = useState([]);

    const { showToast } = useToast();
    const { language, t } = useLanguage();

    // --- FIRESTORE SYNC: ADDRESSES & FAVORITES ---
    useEffect(() => {
        if (!user) {
            setAddresses([]);
            setFavorites([]);
            return;
        }

        const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.addresses) setAddresses(data.addresses);
                if (data.favorites) setFavorites(data.favorites);
            }
        });

        return unsub;
    }, [user]);

    const syncFavoritesToFirestore = async (newFavs) => {
        if (user) {
            try {
                await setDoc(doc(db, 'users', user.uid), { favorites: newFavs }, { merge: true });
            } catch (error) {
                console.error("Favorites Sync Error:", error);
            }
        }
    };

    const syncAddressesToFirestore = async (newAddresses) => {
        if (user) {
            try {
                await setDoc(doc(db, 'users', user.uid), { addresses: newAddresses }, { merge: true });
            } catch (error) {
                console.error("Firestore Sync Error:", error);
                showToast("Failed to sync with cloud", "error");
            }
        }
    };

    const addToCart = (product, selectedSize = null) => {
        setCart((prevCart) => {
            const cartItemId = selectedSize ? `${product.id}_${selectedSize.name}` : product.id;
            const existing = prevCart.find((item) => (item.cartItemId || item.id) === cartItemId);

            if (existing) {
                return prevCart.map((item) =>
                    (item.cartItemId || item.id) === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
                );
            }

            const itemToAdd = {
                ...product,
                cartItemId,
                quantity: 1,
                selectedSize: selectedSize ? selectedSize.name : null,
                price: selectedSize ? selectedSize.price : product.price
            };

            return [...prevCart, itemToAdd];
        });

        const productName = selectedSize ? `${product.name} (${selectedSize.name})` : product.name;
        showToast(`${productName} ${t('addedToCart')}`);
    };


    const removeFromCart = (cartItemId) => {
        setCart((prevCart) => prevCart.filter((item) => (item.cartItemId || item.id) !== cartItemId));
        showToast(t('removedFromCart'), 'info');
    };

    const updateQuantity = (cartItemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(cartItemId);
            return;
        }
        setCart((prevCart) =>
            prevCart.map((item) =>
                (item.cartItemId || item.id) === cartItemId ? { ...item, quantity } : item
            )
        );
    };


    const clearCart = () => {
        setCart([]);
        showToast(t('cartCleared'), 'info');
    };

    const toggleFavorite = (product) => {
        setFavorites(prev => {
            let updated;
            const isFav = prev.find(p => p.id === product.id);
            if (isFav) {
                showToast(t('removedFromFavorites'), 'info');
                updated = prev.filter(p => p.id !== product.id);
            } else {
                showToast(t('addedToFavorites'));
                updated = [...prev, product];
            }
            syncFavoritesToFirestore(updated);
            return updated;
        });
    };

    const isFavorite = (productId) => {
        return favorites.some(p => p.id === productId);
    };

    const addAddress = (newAddr) => {
        const addrId = Date.now().toString();
        const addr = { ...newAddr, id: addrId };

        let updated;
        if (addr.isDefault) {
            updated = [...addresses.map(a => ({ ...a, isDefault: false })), addr];
        } else {
            updated = [...addresses, addr];
        }

        setAddresses(updated);
        syncAddressesToFirestore(updated);
        showToast('Address added successfully');
    };

    const updateAddress = (updatedAddr) => {
        const updated = addresses.map(a => {
            if (a.id === updatedAddr.id) {
                return updatedAddr;
            }
            if (updatedAddr.isDefault) {
                return { ...a, isDefault: false };
            }
            return a;
        });

        setAddresses(updated);
        syncAddressesToFirestore(updated);
        showToast('Address updated');
    };

    const deleteAddress = (id) => {
        const updated = addresses.filter(a => a.id !== id);
        setAddresses(updated);
        syncAddressesToFirestore(updated);
        showToast('Address deleted', 'info');
    };

    const getDefaultAddress = () => {
        return addresses.find(a => a.isDefault) || addresses[0];
    };

    return (
        <CartContext.Provider value={{
            cart,
            favorites,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            toggleFavorite,
            isFavorite,
            addresses,
            addAddress,
            updateAddress,
            deleteAddress,
            getDefaultAddress
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
