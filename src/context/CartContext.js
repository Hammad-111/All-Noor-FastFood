
import React, { createContext, useState, useContext } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [addresses, setAddresses] = useState([
        { id: '1', title: 'Home', address: 'House #123, Street 5, Block C, Multan', isDefault: true }
    ]);

    const { showToast } = useToast();

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
        setAddresses(prev => {
            const addr = { ...newAddr, id: Date.now().toString() };
            if (addr.isDefault) {
                return [...prev.map(a => ({ ...a, isDefault: false })), addr];
            }
            return [...prev, addr];
        });
        showToast('Address added successfully');
    };

    const updateAddress = (updatedAddr) => {
        setAddresses(prev => {
            return prev.map(a => {
                if (a.id === updatedAddr.id) {
                    return updatedAddr;
                }
                if (updatedAddr.isDefault) {
                    return { ...a, isDefault: false };
                }
                return a;
            });
        });
        showToast('Address updated');
    };

    const deleteAddress = (id) => {
        setAddresses(prev => prev.filter(a => a.id !== id));
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
