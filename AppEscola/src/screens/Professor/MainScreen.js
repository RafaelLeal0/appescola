// src/screens/Professor/MainScreen.js (CORRIGIDO)

import React, { useLayoutEffect, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';

// Ajuste de caminhos: a partir de src/screens/Professor -> src/styles, src/context e src/services é ../../
import { GlobalStyles } from '../../styles/GlobalStyles.js'; 
import { Colors } from '../../styles/Colors.js';
import { useAuth } from '../../context/AuthContext.js';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { getTurmasByProfessor } from '../../services/dataService.js'; 

export default function MainScreen() {
    const { user, logout } = useAuth();
    const navigation = useNavigation();
    const [turmas, setTurmas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Debug: verifica se temos dados do usuário
    useLayoutEffect(() => {
        console.log('MainScreen - Usuário logado:', user);
        navigation.setOptions({
            headerTitle: user?.nome || 'Professor',
            headerRight: () => (
                <TouchableOpacity onPress={logout} style={styles.headerButton}>
                    <Text style={styles.headerButtonText}>Sair</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation, user]);

    const loadTurmas = useCallback(async () => {
        if (!user?.id) {
            console.error('MainScreen - ID do professor não disponível');
            setError('Dados do professor não disponíveis');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log('MainScreen - Buscando turmas para professor_id:', user.id);
            const data = await getTurmasByProfessor(user.id);
            console.log('MainScreen - Turmas retornadas:', data);
            setTurmas(data || []);
        } catch (err) {
            console.error('MainScreen - Erro ao carregar turmas:', err);
            setError(err.message);
            Alert.alert('Erro', 'Não foi possível carregar as turmas.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Carrega turmas quando a tela recebe foco
    useFocusEffect(
        useCallback(() => {
            loadTurmas();
        }, [loadTurmas])
    );

    // Recarrega turmas ao voltar da tela de detalhes
    useFocusEffect(
        useCallback(() => {
            console.log('MainScreen focada - recarregando turmas...');
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
                    <Text style={styles.buttonText}>Visualizar</Text>
                </TouchableOpacity>

                {/*
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteTurma(item.id, item.nome)}
                >
                    <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>
                */}
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
                {/* Debug: mostra erro se houver */}
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Erro: {error}</Text>
                    </View>
                )}

                <TouchableOpacity
                    style={GlobalStyles.button}
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
    },
    headerButtonText: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    turmaCard: {
        backgroundColor: Colors.card,
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        ...GlobalStyles.shadow,
    },
    turmaInfo: {
        marginBottom: 10,
    },
    turmaNome: {
        fontSize: 18,
        fontWeight: '500',
        color: Colors.textDark,
    },
    turmaAtividades: {
        fontSize: 14,
        color: Colors.textLight,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 5,
        borderRadius: 5,
        paddingVertical: 10,
        alignItems: 'center',
    },
    viewButton: {
        backgroundColor: Colors.primary,
    },
    deleteButton: {
        backgroundColor: Colors.danger,
    },
    buttonText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        padding: 10,
        backgroundColor: '#ffebee',
        borderRadius: 5,
        marginBottom: 10,
    },
    errorText: {
        color: Colors.danger,
        textAlign: 'center',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: Colors.textLight,
        fontSize: 16,
        lineHeight: 24,
    },
});