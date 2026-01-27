
import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [favorites, setFavorites] = useState([]);

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
    };

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
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

    const clearCart = () => setCart([]);

    const toggleFavorite = (product) => {
        setFavorites(prev => {
            const isFav = prev.find(p => p.id === product.id);
            if (isFav) {
                return prev.filter(p => p.id !== product.id);
            }
            return [...prev, product];
        });
    };

    const isFavorite = (productId) => {
        return favorites.some(p => p.id === productId);
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
            isFavorite
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
