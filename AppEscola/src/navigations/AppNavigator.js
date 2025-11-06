import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../styles/Colors';
import { ActivityIndicator, View } from 'react-native';
import LoginScreen from '../screens/Auth/LoginScreen.js';
import RegisterScreen from '../screens/Auth/RegisterScreen.js';
import MainScreen from '../screens/Professor/MainScreen.js';
import ClassRegistration from '../screens/Professor/ClassRegistration.js';
import ActivitiesScreen from '../screens/Professor/ActivitiesScreen.js';
import TurmaDetailsScreen from '../screens/Professor/TurmaDetailsScreen.js';

const Stack = createStackNavigator();

const screenOptions = {
    headerStyle: {
        backgroundColor: Colors.primary,
    },
    headerTintColor: Colors.headerText,
    headerTitleStyle: {
        fontWeight: 'bold',
    },
};

export default function AppNavigator() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={screenOptions}>
            {user ? (
                <>
                    <Stack.Screen 
                        name="Main"
                        component={MainScreen}
                        options={{ title: 'Minhas Turmas' }}
                    />
                    <Stack.Screen name="ClassRegistration" component={ClassRegistration} options={{ title: 'Cadastrar Turma' }} />
                    <Stack.Screen name="TurmaDetails" component={TurmaDetailsScreen} options={({ route }) => ({ title: route.params.turma.nome })} />
                    <Stack.Screen name="Activities" component={ActivitiesScreen} options={({ route }) => ({ title: `Atividades (${route.params.turmaNome})` })} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Cadastrar' }} />
                </>
            )}
        </Stack.Navigator>
    );
}