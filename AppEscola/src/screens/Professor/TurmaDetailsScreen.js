import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Modal, StyleSheet, ActivityIndicator } from 'react-native';
// Assumindo que GlobalStyles e Colors existem e contêm estilos base
import { GlobalStyles } from '../../styles/GlobalStyles.js'; 
import { Colors } from '../../styles/Colors.js';
import { updateTurma, updateAtividade, getAtividadesByTurma, deleteTurma, deleteAtividade, createAtividade } from '../../services/dataService.js';

// ... (Restante do código, que não precisa ser repetido se não foi alterado na lógica)
// A lógica do componente permanece a mesma, apenas a estilização foi aprimorada.

export default function TurmaDetailsScreen({ route, navigation }) {
    const { turma } = route.params;
    const [isEditing, setIsEditing] = useState(false);
    const [nome, setNome] = useState(turma.nome);
    const [descricao, setDescricao] = useState(turma.descricao || '');
    const [loading, setLoading] = useState(false);
    const [atividades, setAtividades] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [atividadeEmEdicao, setAtividadeEmEdicao] = useState(null);
    const [novaAtividadeDescricao, setNovaAtividadeDescricao] = useState('');
    const [modalNovaAtividadeVisible, setModalNovaAtividadeVisible] = useState(false);
    const [excluindoTurma, setExcluindoTurma] = useState(false);

    useEffect(() => {
        carregarAtividades();
    }, []);

    // ... (funções carregarAtividades, handleSalvarTurma, handleEditarAtividade, handleSalvarAtividade, handleAdicionarAtividade, handleExcluirTurma, handleExcluirAtividade - Manter a mesma lógica)

    const carregarAtividades = async () => {
        try {
            const data = await getAtividadesByTurma(turma.id);
            setAtividades(data);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar as atividades.');
        }
    };

    const handleSalvarTurma = async () => {
        if (!nome.trim()) {
            Alert.alert('Erro', 'O nome da turma é obrigatório.');
            return;
        }

        setLoading(true);
        try {
            const turmaAtualizada = await updateTurma(turma.id, {
                nome: nome.trim()
            });

            setNome(turmaAtualizada.nome);
            navigation.setParams({ 
                turma: { ...turma, ...turmaAtualizada }
            });

            Alert.alert('Sucesso', 'Turma atualizada com sucesso!');
            setIsEditing(false);
        } catch (error) {
            console.error('Erro ao salvar turma:', error);
            Alert.alert('Erro', error.message || 'Não foi possível atualizar a turma.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditarAtividade = (atividade) => {
        setAtividadeEmEdicao(atividade);
        setModalVisible(true);
    };

    const handleSalvarAtividade = async () => {
        if (!atividadeEmEdicao?.descricao?.trim()) {
            Alert.alert('Erro', 'A descrição da atividade é obrigatória.');
            return;
        }

        setLoading(true);
        try {
            const atividadeAtualizada = await updateAtividade(atividadeEmEdicao.id, {
                descricao: atividadeEmEdicao.descricao.trim()
            });

            setAtividades(prev => 
                prev.map(a => a.id === atividadeAtualizada.id ? atividadeAtualizada : a)
            );

            setModalVisible(false);
            setAtividadeEmEdicao(null);
            Alert.alert('Sucesso', 'Atividade atualizada com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar atividade:', error);
            Alert.alert('Erro', error.message || 'Não foi possível atualizar a atividade.');
        } finally {
            setLoading(false);
        }
    };

    const handleAdicionarAtividade = async () => {
        if (!novaAtividadeDescricao.trim()) {
            Alert.alert('Erro', 'A descrição da atividade não pode estar vazia.');
            return;
        }

        setLoading(true);
        try {
            const novaAtividade = await createAtividade(novaAtividadeDescricao.trim(), turma.id);
            setAtividades([...atividades, novaAtividade]);
            Alert.alert('Sucesso', 'Atividade cadastrada com sucesso!');
            setNovaAtividadeDescricao('');
            setModalNovaAtividadeVisible(false);
        } catch (error) {
            console.error('Erro ao cadastrar atividade:', error);
            Alert.alert('Erro', 'Não foi possível cadastrar a atividade.');
        } finally {
            setLoading(false);
        }
    };

    const handleExcluirTurma = async () => {
        
        if (excluindoTurma) {
            return;
        }
        
        Alert.alert(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir a turma "${nome}"? Esta ação não pode ser desfeita.`,
            [
                { 
                    text: 'Cancelar', 
                    style: 'cancel',
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        setExcluindoTurma(true);
                        
                        try {
                            await deleteTurma(turma.id);
                            
                            Alert.alert('Sucesso', 'Turma excluída com sucesso!');
                            navigation.goBack();
                        } catch (error) {
                            console.error('ERRO NA EXCLUSÃO:', error);
                            Alert.alert('Erro', error.message || 'Não foi possível excluir a turma.');
                        } finally {
                            setExcluindoTurma(false);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleExcluirAtividade = async (atividadeId) => {
        Alert.alert(
            'Confirmação',
            'Tem certeza que deseja excluir esta atividade?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await deleteAtividade(atividadeId);
                            Alert.alert('Sucesso', 'Atividade excluída com sucesso!');
                            carregarAtividades();
                        } catch (error) {
                            console.error('Erro ao excluir atividade:', error);
                            Alert.alert('Erro', 'Não foi possível excluir a atividade.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const renderAtividadeItem = (atividade) => (
        <View key={atividade.id} style={styles.atividadeItem}>
            <Text style={styles.atividadeDescricao}>{atividade.descricao}</Text>
            <View style={styles.atividadeActions}>
                <TouchableOpacity
                    onPress={() => handleEditarAtividade(atividade)}
                    style={styles.actionButton}
                >
                    <Text style={styles.actionButtonTextPrimary}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleExcluirAtividade(atividade.id)}
                    style={styles.actionButton}
                >
                    <Text style={styles.actionButtonTextDanger}>Excluir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScrollView style={GlobalStyles.container}>
            <View style={GlobalStyles.contentPadding}>

                {/* Dados da Turma */}
                <View style={styles.section}>
                    <View style={styles.header}>
                        <Text style={styles.sectionTitle}>Dados da Turma</Text>
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                onPress={() => setIsEditing(!isEditing)}
                                disabled={loading}
                                style={styles.editButtonContainer}
                            >
                                <Text style={styles.editButtonText}>
                                    {isEditing ? 'Cancelar' : 'Editar'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleExcluirTurma}
                                disabled={excluindoTurma}
                                style={[
                                    styles.deleteButtonContainer,
                                    excluindoTurma && styles.disabledButton
                                ]}
                            >
                                {excluindoTurma ? (
                                    <ActivityIndicator size="small" color={Colors.danger} />
                                ) : (
                                    <Text style={styles.deleteButtonText}>Excluir Turma</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {isEditing ? (
                        <>
                            <TextInput
                                style={GlobalStyles.input}
                                value={nome}
                                onChangeText={setNome}
                                placeholder="Nome da turma"
                                editable={!loading}
                            />
                            <TextInput
                                style={[GlobalStyles.input, { height: 100 }]}
                                value={descricao}
                                onChangeText={setDescricao}
                                placeholder="Descrição (opcional)"
                                multiline
                                editable={!loading}
                            />
                            <TouchableOpacity
                                style={GlobalStyles.button}
                                onPress={handleSalvarTurma}
                                disabled={loading || nome.trim() === turma.nome.trim()}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={GlobalStyles.buttonText}>Salvar Alterações</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.info}>
                            <Text style={styles.label}>Nome:</Text>
                            <Text style={styles.value}>{nome}</Text>
                            <Text style={styles.label}>Descrição:</Text>
                            <Text style={styles.value}>{descricao || 'Nenhuma descrição informada.'}</Text>
                        </View>
                    )}
                </View>

                {/* Lista de Atividades */}
                <View style={styles.section}>
                    <View style={styles.header}>
                        <Text style={styles.sectionTitle}>Atividades ({atividades.length})</Text>
                        <TouchableOpacity
                            onPress={() => setModalNovaAtividadeVisible(true)}
                            disabled={loading}
                            style={styles.addButtonContainer}
                        >
                            <Text style={styles.addButtonText}>+ Adicionar</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.atividadesList}>
                        {atividades.length > 0 ? (
                            atividades.map(renderAtividadeItem)
                        ) : (
                            <Text style={styles.noActivitiesText}>Nenhuma atividade cadastrada. Adicione uma nova!</Text>
                        )}
                    </View>
                </View>
            </View>

            {/* Modal de Edição de Atividade */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Editar Atividade</Text>
                        
                        <TextInput
                            style={GlobalStyles.input}
                            value={atividadeEmEdicao?.descricao}
                            onChangeText={(text) => setAtividadeEmEdicao({
                                ...atividadeEmEdicao,
                                descricao: text
                            })}
                            placeholder="Descrição da atividade"
                            multiline
                            editable={!loading}
                        />

                        <TouchableOpacity
                            style={[GlobalStyles.button, { marginTop: 15 }]}
                            onPress={handleSalvarAtividade}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={GlobalStyles.buttonText}>Salvar</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.cancelButton}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal para Nova Atividade */}
            <Modal
                visible={modalNovaAtividadeVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalNovaAtividadeVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Nova Atividade</Text>
                        <TextInput
                            style={GlobalStyles.input}
                            placeholder="Descrição da atividade"
                            value={novaAtividadeDescricao}
                            onChangeText={setNovaAtividadeDescricao}
                            editable={!loading}
                        />
                        <TouchableOpacity
                            style={[GlobalStyles.button, { marginTop: 15 }]}
                            onPress={handleAdicionarAtividade}
                            disabled={loading}
                        >
                            <Text style={GlobalStyles.buttonText}>
                                {loading ? 'Salvando...' : 'Adicionar'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setModalNovaAtividadeVisible(false);
                                setNovaAtividadeDescricao('');
                            }}
                            style={styles.cancelButton}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    // --- SEÇÃO DE CARDS E CONTEÚDO ---
    section: {
        marginBottom: 15,
        marginHorizontal: 15, // Adiciona espaço nas laterais
        backgroundColor: Colors.cardBackground || '#fff', // Fundo do Card
        borderRadius: 12,
        padding: 20,
        // Sombra para dar profundidade (melhor visual card-like)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, 
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.inputBorder || '#eee', // Linha sutil para separar o cabeçalho
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700', // Mais forte
        color: Colors.text,
    },

    // --- AÇÕES DO HEADER (TURMA) ---
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButtonContainer: {
        paddingHorizontal: 10,
    },
    editButtonText: {
        color: Colors.primary,
        fontWeight: '600',
    },
    deleteButtonContainer: {
        marginLeft: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: Colors.danger + '15', // Fundo sutil de perigo
    },
    disabledButton: {
        opacity: 0.5,
    },
    deleteButtonText: {
        color: Colors.danger,
        fontWeight: '600',
        fontSize: 14,
    },
    
    // --- INFORMAÇÕES DA TURMA ---
    info: {
        paddingVertical: 10,
    },
    label: {
        fontSize: 13,
        color: Colors.textLight || '#666',
        fontWeight: '500',
        marginBottom: 2,
        marginTop: 5,
    },
    value: {
        fontSize: 16,
        color: Colors.text,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.inputBorder || '#eee',
        paddingBottom: 8,
    },

    // --- LISTA DE ATIVIDADES ---
    addButtonContainer: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: Colors.primary + '10',
    },
    addButtonText: {
        color: Colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    atividadesList: {
        marginTop: 5,
    },
    atividadeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginVertical: 4,
        backgroundColor: Colors.background || '#f9f9f9', // Fundo para destacar o item da lista
        borderRadius: 8,
    },
    atividadeDescricao: {
        flex: 1,
        fontSize: 15,
        color: Colors.text,
        marginRight: 15,
    },
    atividadeActions: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: 10,
        padding: 5,
    },
    actionButtonTextPrimary: {
        color: Colors.primary,
        fontWeight: '500',
    },
    actionButtonTextDanger: {
        color: Colors.danger,
        fontWeight: '500',
    },
    noActivitiesText: {
        textAlign: 'center',
        color: Colors.textLight,
        fontStyle: 'italic',
        marginTop: 10,
    },

    // --- MODAIS ---
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)', // Fundo mais escuro
    },
    modalContent: {
        width: '90%', // Ocupa a maior parte da largura
        backgroundColor: Colors.cardBackground || '#fff',
        borderRadius: 12,
        padding: 25,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        color: Colors.text,
        textAlign: 'center',
    },
    cancelButton: {
        marginTop: 15,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: Colors.textLight || '#666',
        fontSize: 16,
        fontWeight: '600',
    },
});