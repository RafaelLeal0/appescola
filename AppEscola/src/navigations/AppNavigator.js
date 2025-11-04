// src/navigations/AppNavigator.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../styles/Colors';
import { ActivityIndicator, View } from 'react-native';

// Telas de Autenticação
import LoginScreen from '../screens/Auth/LoginScreen.js';
import RegisterScreen from '../screens/Auth/RegisterScreen.js'; // Nova tela de cadastro

// Telas do Professor — corrigir caminho e extensão para os arquivos existentes em src/screens/Professor
import MainScreen from '../screens/Professor/MainScreen.js';
import ClassRegistration from '../screens/Professor/ClassRegistration.js';
import ActivitiesScreen from '../screens/Professor/ActivitiesScreen.js';
import TurmaDetailsScreen from '../screens/Professor/TurmaDetailsScreen.js';

const Stack = createStackNavigator();

// Configuração do Header
const screenOptions = {
    headerStyle: {
        backgroundColor: Colors.primary, // Fundo azul
    },
    headerTintColor: Colors.headerText, // Cor do texto e ícones do Header
    headerTitleStyle: {
        fontWeight: 'bold',
    },
};

export default function AppNavigator() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        // Exibe um loading enquanto a sessão está sendo carregada
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    // Stack.Navigator mostra rotas diferentes baseado em user:
    // Se user existe (login bem sucedido) → mostra Main e outras rotas autenticadas
    // Se user não existe (não logado) → mostra Login/Register
    return (
        <Stack.Navigator screenOptions={screenOptions}>
            {user ? (
                // Rotas autenticadas: primeira rota é "Main"
                <>
                    <Stack.Screen 
                        name="Main"           // Nome exato usado na navegação
                        component={MainScreen} // Componente da tela principal
                        options={{ title: 'Minhas Turmas' }}
                    />
                    <Stack.Screen name="ClassRegistration" component={ClassRegistration} options={{ title: 'Cadastrar Turma' }} />
                    <Stack.Screen name="TurmaDetails" component={TurmaDetailsScreen} options={({ route }) => ({ title: route.params.turma.nome })} />
                    <Stack.Screen name="Activities" component={ActivitiesScreen} options={({ route }) => ({ title: `Atividades (${route.params.turmaNome})` })} />
                </>
            ) : (
                // Rotas públicas (auth)
                <>
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Cadastrar' }} />
                </>
            )}
        </Stack.Navigator>
    );
}