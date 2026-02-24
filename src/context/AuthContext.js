import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../utils/firebaseConfig';
import { onAuthStateChanged, signOut, deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let unsubscribeSnapshot = null;

        const safetyTimer = setTimeout(() => {
            if (loading) setLoading(false);
        }, 8000);

        const unsubscribeAuth = onAuthStateChanged(auth, async (currUser) => {
            if (unsubscribeSnapshot) unsubscribeSnapshot();

            if (currUser) {
                setUser(currUser);
                setIsAdmin(currUser.email === 'admin@alnoor.com');
                const userDocRef = doc(db, 'users', currUser.uid);

                unsubscribeSnapshot = onSnapshot(userDocRef, (snapshot) => {
                    if (snapshot.exists()) {
                        setUserData(snapshot.data());
                    } else {
                        setUserData({
                            email: currUser.email || '',
                            phoneNumber: currUser.phoneNumber || '',
                            createdAt: new Date().toISOString(),
                        });
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Snapshot Error:", error);
                    setLoading(false);
                });
            } else {
                setUser(null);
                setUserData(null);
                setIsAdmin(false);
                setLoading(false);
            }
            clearTimeout(safetyTimer);
        });

        return () => {
            if (unsubscribeAuth) unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
            clearTimeout(safetyTimer);
        };
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    const refreshUserData = async () => {
        if (!user) return;
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                setUserData(userSnap.data());
            }
        } catch (error) {
            console.error("Refresh User Data Error:", error);
        }
    };

    const deleteAccount = async () => {
        if (!auth.currentUser) return;
        try {
            // 1. Delete Firestore data first
            await deleteDoc(doc(db, 'users', auth.currentUser.uid));
            // 2. Delete Auth user
            await deleteUser(auth.currentUser);
        } catch (error) {
            console.error("Delete Account Error:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            userData,
            isAdmin,
            loading,
            logout,
            refreshUserData,
            deleteAccount
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
