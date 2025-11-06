import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext.js';
import AppNavigator from './src/navigations/AppNavigator';
import SplashScreen from './src/screens/SplashScreen.js';

export default function App() {
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setShowSplash(false), 3000);
        return () => clearTimeout(t);
    }, []);

    if (showSplash) {
        return <SplashScreen />;
    }

    return (
        <AuthProvider>
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
}