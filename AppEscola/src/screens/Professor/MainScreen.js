// src/screens/Professor/MainScreen.js

import React, { useLayoutEffect, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';

// Ajuste de caminhos: a partir de src/screens/Professor -> src/styles, src/context e src/services é ../../
import { GlobalStyles } from '../../styles/GlobalStyles.js'; 
import { Colors } from '../../styles/Colors.js';
import { useAuth } from '../../context/AuthContext.js';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// IMPORTAÇÃO CORRIGIDA: Adiciona deleteTurma
import { getTurmasByProfessor, deleteTurma } from '../../services/dataService.js'; 

export default function MainScreen() {
    const { user, logout } = useAuth();
    const navigation = useNavigation();
    const [turmas, setTurmas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Configuração do Header (Nome do Professor e Botão Sair)
    useLayoutEffect(() => {
        // O botão Sair já chama a função logout do contexto, o que destrói a sessão
        navigation.setOptions({
            headerTitle: user?.nome || 'Professor',
            headerRight: () => (
                <TouchableOpacity onPress={logout} style={styles.headerButton}>
                    <Text style={styles.headerButtonText}>Sair</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation, user, logout]);

    // 2. Função de Carregamento de Turmas (LISTAR)
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
            // Busca turmas pertencentes ao professor
            const data = await getTurmasByProfessor(user.id);
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

    // 3. Função de Exclusão de Turmas (EXCLUIR)
    const handleDeleteTurma = (turmaId, turmaNome) => {
        // Apresenta a tela de confirmação antes de excluir
        Alert.alert(
            'Confirmar Exclusão',
            `Você realmente deseja excluir a turma "${turmaNome}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Excluir', 
                    style: 'destructive', 
                    onPress: async () => {
                        try {
                            // Chama a função que verifica atividades e exclui
                            await deleteTurma(turmaId); 
                            Alert.alert('Sucesso', 'Turma excluída com sucesso.');
                            loadTurmas(); // Recarrega a lista
                        } catch (error) {
                            // Exibe a mensagem de erro, incluindo a regra: "Você não pode excluir uma turma com atividades cadastradas"
                            Alert.alert('Erro', error.message);
                        }
                    }
                },
            ]
        );
    };

    // 4. Renderização de Cada Item da Lista
    const renderItem = ({ item }) => (
        <View style={styles.turmaCard}>
            <TouchableOpacity 
                style={styles.turmaInfo}
                // Navega para a tela de atividades, passando o ID e Nome da turma
                onPress={() => navigation.navigate('Activities', { turmaId: item.id, turmaNome: item.nome })}
            >
                <Text style={styles.turmaNome}>{item.nome}</Text>
                <Text style={styles.turmaAtividades}>
                    {item.activities_count || 0} atividade(s)
                </Text>
            </TouchableOpacity>
            
            <View style={styles.buttonContainer}>
                {/* Botão para Visualizar (Acessar a tela de atividades) */}
                <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() => navigation.navigate('Activities', { turmaId: item.id, turmaNome: item.nome })}
                >
                    <Text style={styles.buttonText}>Visualizar</Text>
                </TouchableOpacity>

                {/* Botão para Excluir (Funcionalidade Requerida) */}
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteTurma(item.id, item.nome)}
                >
                    <Text style={styles.buttonText}>Excluir</Text>
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
                {/* Debug: mostra erro se houver */}
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Erro: {error}</Text>
                    </View>
                )}

                {/* Botão para acesso ao "cadastro de turma" */}
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
        backgroundColor: Colors.cardBackground, 
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        // ... Estilos de sombra
    },
    turmaInfo: {
        marginBottom: 10,
    },
    turmaNome: {
        fontSize: 18,
        fontWeight: '500',
        color: Colors.text, 
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
        backgroundColor: Colors.secondary, 
    },
    deleteButton: {
        backgroundColor: Colors.danger, 
    },
    buttonText: {
        color: 'white', 
        fontWeight: 'bold',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        padding: 10,
        backgroundColor: '#F8D7DA', 
        borderRadius: 5,
        marginBottom: 10,
        borderColor: Colors.danger,
        borderWidth: 1,
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