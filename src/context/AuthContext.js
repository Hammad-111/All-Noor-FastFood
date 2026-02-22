import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../utils/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let unsubscribeSnapshot = null;

        // Safety switch: Force loading to end
        const safetyTimer = setTimeout(() => {
            if (loading) setLoading(false);
        }, 8000);

        const unsubscribeAuth = onAuthStateChanged(auth, async (currUser) => {
            // Clean up previous snapshot listener if exists
            if (unsubscribeSnapshot) unsubscribeSnapshot();

            if (currUser) {
                setUser(currUser);
                setIsAdmin(currUser.email === 'admin@alnoor.com');
                const userDocRef = doc(db, 'users', currUser.uid);

                // Real-time listener for user data
                unsubscribeSnapshot = onSnapshot(userDocRef, (snapshot) => {
                    if (snapshot.exists()) {
                        setUserData(snapshot.data());
                    } else {
                        // Document doesn't exist yet, handle it
                        // But don't overwrite here to avoid race conditions with LoginScreen's setDoc
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

    return (
        <AuthContext.Provider value={{
            user,
            userData,
            isAdmin,
            loading,
            logout,
            refreshUserData
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
