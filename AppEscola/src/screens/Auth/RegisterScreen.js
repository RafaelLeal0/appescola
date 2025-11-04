import React, { useState } from 'react';
import { SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { GlobalStyles } from '../../styles/GlobalStyles.js';
import { Colors } from '../../styles/Colors.js';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../database/Supabase.js';

export default function RegisterScreen() {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const validateEmail = (value) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(value);
    };

    const handleRegister = async () => {
        setErrorMessage('');

        // Validações básicas
        if (!name.trim() || !email.trim() || !password) {
            setErrorMessage('Por favor, preencha todos os campos.');
            return;
        }
        if (!validateEmail(email.trim())) {
            setErrorMessage('E-mail inválido.');
            return;
        }
        if (password.length < 6) {
            setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            console.log('Iniciando signUp para:', email.trim());

            // signUp com opções; emailRedirectTo null para não depender de redirect
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
                { email: email.trim(), password },
                { emailRedirectTo: null, options: { data: { name: name.trim() } } }
            );

            if (signUpError) {
                console.error('Erro signUp:', signUpError.message || signUpError);
                if (/already/i.test(signUpError.message || '')) {
                    setErrorMessage('Este e‑mail já está cadastrado.');
                    Alert.alert('Erro', 'Este e‑mail já está cadastrado.');
                } else {
                    setErrorMessage(signUpError.message || 'Erro ao cadastrar.');
                    Alert.alert('Erro', signUpError.message || 'Erro ao cadastrar.');
                }
                setLoading(false);
                return;
            }

            console.log('signUp concluído:', signUpData);

            // Tentar autenticar imediatamente após o signUp
            console.log('Tentando autenticar automaticamente...');
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (signInError) {
                // Se o Supabase ainda exigir confirmação, ainda assim informamos e não bloqueamos o usuário de tentar login.
                console.warn('Erro ao autenticar após signUp:', signInError.message || signInError);
                // mostra mensagem, mas não impede que usuário tente login manualmente
                Alert.alert('Aviso', signInError.message || 'Cadastro efetuado. Confirme seu e‑mail se necessário.');
                setLoading(false);
                // Navegar para Login para que o usuário faça sign in manualmente, caso não tenha sido autenticado
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                return;
            }

            // Se chegou aqui, signIn automatico foi bem‑sucedido
            const createdUser = signInData?.user || signUpData?.user || null;
            console.log('Usuário autenticado automaticamente:', createdUser?.id);

            // Inserir perfil na tabela 'professores' se tivermos id
            if (createdUser && createdUser.id) {
                const { data: profileData, error: profileError } = await supabase
                    .from('professores')
                    .insert([{ id: createdUser.id, nome: name.trim(), email: email.trim() }]);

                if (profileError) {
                    console.error('Erro ao criar perfil:', profileError.message || profileError);
                    Alert.alert('Aviso', 'Cadastro efetuado, mas não foi possível salvar o perfil.');
                } else {
                    console.log('Perfil criado:', profileData);
                }
            }

            // Sucesso: informar e navegar para Main
            console.log('Cadastro e login automáticos realizados para:', email.trim());
            Alert.alert('Sucesso', 'Cadastro realizado com sucesso! Você foi autenticado.');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
        } catch (e) {
            console.error('Erro desconhecido no handleRegister:', e);
            setErrorMessage('Erro desconhecido ao cadastrar.');
            Alert.alert('Erro', 'Erro desconhecido ao cadastrar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={GlobalStyles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.formWrap}>
                        <Text style={GlobalStyles.title}>Cadastrar</Text>

                        {errorMessage ? (
                            <View style={GlobalStyles.errorBox}>
                                <Text style={GlobalStyles.errorText}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        <TextInput
                            style={GlobalStyles.input}
                            placeholder="Nome"
                            value={name}
                            onChangeText={setName}
                            editable={!loading}
                        />

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
                            value={password}
                            onChangeText={setPassword}
                            editable={!loading}
                        />

                        <TouchableOpacity
                            onPress={handleRegister}
                            disabled={loading}
                            style={[styles.button, loading && styles.buttonDisabled]}
                            accessibilityRole="button"
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Cadastrar</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Login')}
                            disabled={loading}
                            style={{ marginTop: 12, alignSelf: 'center' }}
                        >
                            <Text style={{ color: Colors.primary }}>Já tem conta? Fazer login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'flex-start',
    },
    formWrap: {
        marginTop: 40,
        alignSelf: 'stretch',
    },
    button: {
        backgroundColor: Colors.primary || '#007bff',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        alignSelf: 'stretch',
        zIndex: 10,
        elevation: 2,
    },
    buttonDisabled: {
        opacity: 0.8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
