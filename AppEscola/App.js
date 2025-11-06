// App.js

import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext.js';
import AppNavigator from './src/navigations/AppNavigator';
import SplashScreen from './src/screens/SplashScreen.js'; // nova splash

export default function App() {
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setShowSplash(false), 3000); // mostra por 2s
        return () => clearTimeout(t);
    }, []);

    if (showSplash) {
        return <SplashScreen />;
    }

    return (
        // Fornece o contexto de autenticação para toda a aplicação
        <AuthProvider>
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
}