import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { db } from '../utils/firebaseConfig';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [addresses, setAddresses] = useState([]);

    const { showToast } = useToast();

    // --- FIRESTORE SYNC: ADDRESSES ---
    useEffect(() => {
        if (!user) {
            setAddresses([]);
            return;
        }

        const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.addresses) {
                    setAddresses(data.addresses);
                }
            }
        });

        return unsub;
    }, [user]);

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

    const addToCart = (product) => {
        setCart((prevCart) => {
            const existing = prevCart.find((item) => item.id === product.id);
            if (existing) {
                return prevCart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
        showToast(`${product.name} added to cart!`);
    };

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
        showToast(`Item removed from cart`, 'info');
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
        showToast('Cart cleared', 'info');
    };

    const toggleFavorite = (product) => {
        setFavorites(prev => {
            const isFav = prev.find(p => p.id === product.id);
            if (isFav) {
                showToast(`Removed from favorites`, 'info');
                return prev.filter(p => p.id !== product.id);
            }
            showToast(`Added to favorites!`);
            return [...prev, product];
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
