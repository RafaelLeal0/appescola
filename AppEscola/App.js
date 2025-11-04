// App.js

import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext.js';
import AppNavigator from './src/navigations/AppNavigator';

export default function App() {
    return (
        // Fornece o contexto de autenticação para toda a aplicação
        <AuthProvider>
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
}