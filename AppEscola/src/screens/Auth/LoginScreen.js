// src/screens/Auth/LoginScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { GlobalStyles } from '../../styles/GlobalStyles.js';
import { Colors } from '../../styles/Colors.js';
import { useAuth } from '../../context/AuthContext.js';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loginError, setLoginError] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        setLoginError(false);

        if (!email || !senha) {
            setLoginError(true);
            Alert.alert('Erro', 'Preencha e‑mail e senha.');
            return;
        }

        setLoading(true);
        try {
            const result = await login(email.trim(), senha);

            if (!result.success) {
                setLoginError(true);
                if (result.unconfirmed) {
                    Alert.alert('Confirmação necessária', result.message);
                } else {
                    Alert.alert('Erro', result.message || 'Email ou senha incorretos');
                }
                return;
            }

            setEmail('');
            setSenha('');
            setLoginError(false);
        } catch (e) {
            console.error('Erro no handleLogin:', e);
            Alert.alert('Erro', 'Ocorreu um erro ao tentar acessar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const styles = StyleSheet.create({
        titleLift: {
            marginTop: -40,
            alignSelf: 'center',
        },
    });

    return (
        <View style={GlobalStyles.container}>
            <View style={{ ...GlobalStyles.contentPadding, flex: 1, justifyContent: 'center' }}>
                <Image
                    source={require('../../../assets/logo.png')}
                    style={{ width: 250, height: 250, alignSelf: 'center', marginBottom: 0 }}
                    resizeMode="contain"
                />
                <Text style={[GlobalStyles.title, styles.titleLift]}>Bem Vindo</Text>

                {loginError && (
                    <View style={GlobalStyles.errorBox}>
                        <Text style={GlobalStyles.errorText}>
                            Erro: Falha no login, Verifique suas credenciais
                        </Text>
                    </View>
                )}

                <TextInput
                    style={GlobalStyles.input}
                    placeholder="E-mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    editable={!loading}
                />

                <TextInput
                    style={GlobalStyles.input}
                    placeholder="Senha"
                    secureTextEntry
                    value={senha}
                    onChangeText={setSenha}
                    editable={!loading}
                />

                <TouchableOpacity
                    style={GlobalStyles.button}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={GlobalStyles.buttonText}>Entrar</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Register')}
                    style={{ marginTop: 12, alignSelf: 'center' }}
                    disabled={loading}
                >
                    <Text style={{ color: Colors.primary }}>Ainda não tem conta? Cadastrar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}