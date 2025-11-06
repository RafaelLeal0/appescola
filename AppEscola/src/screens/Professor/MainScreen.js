// src/screens/Professor/MainScreen.js (ATUALIZADO COM ICON E AJUSTE DE COR)

import React, { useLayoutEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';

import { GlobalStyles } from '../../styles/GlobalStyles.js'; 
import { Colors } from '../../styles/Colors.js';
import { useAuth } from '../../context/AuthContext.js';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getTurmasByProfessor } from '../../services/dataService.js';

// ✅ ÍCONE DE SAIR
import { Ionicons } from '@expo/vector-icons';

export default function MainScreen() {
    const { user, logout } = useAuth();
    const navigation = useNavigation();
    const [turmas, setTurmas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: user?.nome || 'Professor',
            headerRight: () => (
                <TouchableOpacity onPress={logout} style={styles.headerButton}>
                    {/* ✅ Ícone substituindo o texto "Sair" */}
                    <Ionicons name="log-out-outline" size={24} color="#fff" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, user]);

    const loadTurmas = useCallback(async () => {
        if (!user?.id) {
            setError('Dados do professor não disponíveis');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await getTurmasByProfessor(user.id);
            setTurmas(data || []);
        } catch (err) {
            setError(err.message);
            Alert.alert('Erro', 'Não foi possível carregar as turmas.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            loadTurmas();
        }, [loadTurmas])
    );

    const renderItem = ({ item }) => (
        <View style={styles.turmaCard}>
            <TouchableOpacity 
                style={styles.turmaInfo}
                onPress={() => navigation.navigate('TurmaDetails', { turma: item })}
            >
                <Text style={styles.turmaNome}>{item.nome}</Text>
                <Text style={styles.turmaAtividades}>
                    {item.activities_count || 0} atividade(s)
                </Text>
            </TouchableOpacity>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() => navigation.navigate('TurmaDetails', { turma: item })}
                >
                    {/* ✅ cor branca garantida */}
                    <Text style={styles.buttonText}>Visualizar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={[GlobalStyles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={GlobalStyles.container}>
            <View style={GlobalStyles.contentPadding}>
                
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Erro: {error}</Text>
                    </View>
                )}

                <TouchableOpacity
                    style={[GlobalStyles.button, styles.addButton]}
                    onPress={() => navigation.navigate('ClassRegistration')}
                >
                    <Text style={GlobalStyles.buttonText}>Cadastrar nova turma</Text>
                </TouchableOpacity>

                <FlatList
                    data={turmas}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                Nenhuma turma encontrada.{'\n'}
                                Toque em "Cadastrar nova turma" para começar!
                            </Text>
                        </View>
                    }
                    contentContainerStyle={styles.listContainer}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: Colors.primary,
        marginRight: 10,
    },

    turmaCard: {
        backgroundColor: Colors.card,
        borderRadius: 14,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 3,
    },

    turmaInfo: {
        marginBottom: 16,
    },

    turmaNome: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.textDark,
        marginBottom: 4,
    },

    turmaAtividades: {
        fontSize: 14,
        color: Colors.textLight,
    },

    buttonContainer: {
        flexDirection: 'row',
    },

    actionButton: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },

    viewButton: {
        backgroundColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },

    // ✅ Texto agora sempre branco
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },

    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    errorContainer: {
        padding: 12,
        backgroundColor: '#ffeaea',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ffc7c7',
        marginBottom: 14,
    },
    errorText: {
        color: Colors.danger,
        textAlign: 'center',
        fontWeight: '600',
    },

    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: Colors.textLight,
        fontSize: 16,
        lineHeight: 24,
    },

    listContainer: {
        paddingTop: 20,
        paddingBottom: 50,
    },

    addButton: {
        shadowColor: Colors.primary,
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 5,
        borderRadius: 10,
    },
});
