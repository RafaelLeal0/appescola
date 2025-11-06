import React, { useLayoutEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { GlobalStyles } from '../../styles/GlobalStyles.js';
import { Colors } from '../../styles/Colors.js';
import { useAuth } from '../../context/AuthContext.js';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getAtividadesByTurma, createAtividade } from '../../services/dataService.js';

export default function ActivitiesScreen({ route }) {
    const { turmaId, turmaNome } = route.params; 
    const { user, logout } = useAuth();
    const navigation = useNavigation();
    
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [activityDescription, setActivityDescription] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const data = await getAtividadesByTurma(turmaId);
            setActivities(data);
        } catch (error) {
            Alert.alert('Erro', error.message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchActivities();
        }, [turmaId])
    );

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: user ? user.nome : 'Professor',
            headerRight: () => (
                <TouchableOpacity onPress={logout} style={styles.headerButton}>
                    <Text style={styles.headerButtonText}>Sair</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation, user, logout]);

    const handleAddActivity = async () => {
        if (!activityDescription.trim()) {
            Alert.alert('Erro', 'A descrição da atividade não pode estar vazia.');
            return;
        }

        setModalLoading(true);
        try {
            const newActivity = await createAtividade(activityDescription.trim(), turmaId);
            setActivities([...activities, newActivity]);
            Alert.alert('Sucesso', 'Atividade cadastrada com sucesso!');
            setActivityDescription('');
            setModalVisible(false);
        } catch (error) {
            console.error('Erro ao cadastrar atividade:', error);
            Alert.alert('Erro', 'Não foi possível cadastrar a atividade.');
        } finally {
            setModalLoading(false);
        }
    };

    const renderItem = ({ item, index }) => (
        <View style={styles.activityItem}>
            <Text style={styles.activityText}>
                {index + 1}. {item.descricao}
            </Text>
        </View>
    );

    return (
        <View style={GlobalStyles.container}>
            <View style={GlobalStyles.contentPadding}>
                <TouchableOpacity
                    style={GlobalStyles.button}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={GlobalStyles.buttonText}>Cadastrar atividade</Text>
                </TouchableOpacity>

                <Text style={styles.classTitle}>Turma: {turmaNome}</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={Colors.primary} />
                ) : (
                    <FlatList
                        data={activities}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderItem}
                        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Nenhuma atividade cadastrada para esta turma.</Text>}
                    />
                )}
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Nova Atividade</Text>
                        <TextInput
                            style={GlobalStyles.input}
                            placeholder="Descrição da atividade"
                            value={activityDescription}
                            onChangeText={setActivityDescription}
                            editable={!modalLoading}
                        />
                        <TouchableOpacity
                            style={GlobalStyles.button}
                            onPress={handleAddActivity}
                            disabled={modalLoading}
                        >
                            <Text style={GlobalStyles.buttonText}>
                                {modalLoading ? 'Salvando...' : 'Salvar'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setModalVisible(false);
                                setActivityDescription('');
                            }}
                            style={{ marginTop: 10 }}
                            disabled={modalLoading}
                        >
                            <Text style={{ color: Colors.danger, fontWeight: 'bold' }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    headerButton: {
        marginRight: 15,
    },
    headerButtonText: {
        color: Colors.headerText,
        fontSize: 16,
        fontWeight: 'bold',
    },
    classTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 15,
        color: Colors.text,
    },
    activityItem: {
        backgroundColor: Colors.cardBackground,
        padding: 15,
        borderRadius: 5,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
    },
    activityText: {
        fontSize: 14,
        color: Colors.text,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: Colors.cardBackground,
        borderRadius: 10,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: Colors.text,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        color: Colors.textLight,
    },
});