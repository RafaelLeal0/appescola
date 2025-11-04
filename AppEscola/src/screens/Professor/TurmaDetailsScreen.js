import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import { GlobalStyles } from '../../styles/GlobalStyles.js';
import { Colors } from '../../styles/Colors.js';
import { updateTurma, updateAtividade, getAtividadesByTurma, deleteTurma, deleteAtividade, createAtividade } from '../../services/dataService.js';

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
    const [excluindoTurma, setExcluindoTurma] = useState(false); // Estado para controlar o loading do botão de exclusão

    useEffect(() => {
        carregarAtividades();
    }, []);

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
            // Envia apenas o campo nome para atualização
            const turmaAtualizada = await updateTurma(turma.id, {
                nome: nome.trim()
            });

            // Atualiza estado local e navegação
            setNome(turmaAtualizada.nome);
            
            // Atualiza o título na navegação
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

            // Atualiza lista de atividades substituindo a editada
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
            setAtividades([...atividades, novaAtividade]); // Atualiza a lista localmente
            Alert.alert('Sucesso', 'Atividade cadastrada com sucesso!');
            setNovaAtividadeDescricao('');
            setModalNovaAtividadeVisible(false); // Fecha o modal
        } catch (error) {
            console.error('Erro ao cadastrar atividade:', error);
            Alert.alert('Erro', 'Não foi possível cadastrar a atividade.');
        } finally {
            setLoading(false);
        }
    };

    const handleExcluirTurma = async () => {
        console.log('=== BOTÃO EXCLUIR CLICADO ===');
        
        if (excluindoTurma) {
            console.log('Exclusão já em andamento, ignorando clique');
            return;
        }

        console.log('Exibindo Alert de confirmação...');
        
        Alert.alert(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir a turma "${nome}"? Esta ação não pode ser desfeita.`,
            [
                { 
                    text: 'Cancelar', 
                    style: 'cancel',
                    onPress: () => console.log('Usuário cancelou a exclusão')
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        console.log('Usuário confirmou exclusão, iniciando processo...');
                        setExcluindoTurma(true);
                        
                        try {
                            console.log('Chamando deleteTurma com ID:', turma.id);
                            await deleteTurma(turma.id);
                            console.log('Turma excluída com sucesso no banco');
                            
                            Alert.alert('Sucesso', 'Turma excluída com sucesso!');
                            console.log('Navegando para tela anterior...');
                            navigation.goBack();
                        } catch (error) {
                            console.error('ERRO NA EXCLUSÃO:', error);
                            Alert.alert('Erro', error.message || 'Não foi possível excluir a turma.');
                        } finally {
                            console.log('Finalizando processo de exclusão');
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
                            carregarAtividades(); // Recarrega a lista de atividades
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
            <TouchableOpacity
                onPress={() => handleEditarAtividade(atividade)}
                style={styles.editAtividadeButton}
            >
                <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => handleExcluirAtividade(atividade.id)}
                style={styles.deleteAtividadeButton}
            >
                <Text style={styles.deleteButtonText}>Excluir</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ScrollView style={GlobalStyles.container}>
            <View style={GlobalStyles.contentPadding}>
                {/* Dados da Turma */}
                <View style={styles.section}>
                    <View style={styles.header}>
                        <Text style={styles.sectionTitle}>Dados da Turma</Text>
                        <TouchableOpacity
                            onPress={() => setIsEditing(!isEditing)}
                            disabled={loading}
                        >
                            <Text style={styles.editButton}>
                                {isEditing ? 'Cancelar' : 'Editar'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                console.log('TouchableOpacity pressionado');
                                handleExcluirTurma();
                            }}
                            disabled={excluindoTurma}
                            style={[
                                styles.deleteButtonContainer,
                                excluindoTurma && styles.disabledButton
                            ]}
                            activeOpacity={0.7}
                        >
                            {excluindoTurma ? (
                                <ActivityIndicator size="small" color={Colors.danger} />
                            ) : (
                                <Text style={styles.deleteButtonText}>Excluir Turma</Text>
                            )}
                        </TouchableOpacity>
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
                                disabled={loading}
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
                            {descricao ? (
                                <>
                                    <Text style={styles.label}>Descrição:</Text>
                                    <Text style={styles.value}>{descricao}</Text>
                                </>
                            ) : null}
                        </View>
                    )}
                </View>

                {/* Lista de Atividades */}
                <View style={styles.section}>
                    <View style={styles.header}>
                        <Text style={styles.sectionTitle}>Atividades</Text>
                        <TouchableOpacity
                            onPress={() => setModalNovaAtividadeVisible(true)} // Abre o modal para adicionar atividade
                            disabled={loading}
                        >
                            <Text style={styles.addButton}>Adicionar Atividade</Text>
                        </TouchableOpacity>
                    </View>
                    {atividades.map(renderAtividadeItem)}
                </View>
            </View>

            {/* Modal de Edição de Atividade */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
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
                            style={GlobalStyles.button}
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
                animationType="slide"
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
                            style={GlobalStyles.button}
                            onPress={handleAdicionarAtividade}
                            disabled={loading}
                        >
                            <Text style={GlobalStyles.buttonText}>
                                {loading ? 'Salvando...' : 'Salvar'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setModalNovaAtividadeVisible(false);
                                setNovaAtividadeDescricao('');
                            }}
                            style={{ marginTop: 10 }}
                            disabled={loading}
                        >
                            <Text style={{ color: Colors.danger, fontWeight: 'bold' }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 20,
        backgroundColor: Colors.cardBackground,
        borderRadius: 8,
        padding: 15,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    editButton: {
        color: Colors.primary,
        fontWeight: '500',
    },
    deleteButtonContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: Colors.danger + '20', // com transparência
    },
    disabledButton: {
        opacity: 0.6,
    },
    deleteButtonText: {
        color: Colors.danger,
        fontWeight: '600',
        fontSize: 14,
    },
    addButton: {
        color: Colors.primary,
        fontWeight: '500',
    },
    info: {
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 5,
    },
    value: {
        fontSize: 16,
        color: Colors.text,
        marginBottom: 15,
    },
    atividadeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.inputBorder,
    },
    atividadeDescricao: {
        flex: 1,
        fontSize: 15,
        color: Colors.text,
    },
    editAtividadeButton: {
        marginLeft: 10,
    },
    deleteAtividadeButton: {
        marginLeft: 10,
    },
    editButtonText: {
        color: Colors.primary,
    },
    deleteButtonText: {
        color: Colors.danger,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 8,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: Colors.text,
    },
    cancelButton: {
        marginTop: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: Colors.danger,
        fontSize: 16,
    },
});
