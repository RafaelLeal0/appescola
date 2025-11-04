// src/screens/Professor/ClassRegistration.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { GlobalStyles } from '../../styles/GlobalStyles.js';
import { useAuth } from '../../context/AuthContext.js';
import { createTurma } from '../../services/dataService.js'; // Importa a função de cadastro

export default function ClassRegistration({ navigation }) {
    const [className, setClassName] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth(); // Obtém os dados do professor autenticado

    const handleRegistration = async () => {
        if (!className.trim()) {
            Alert.alert('Erro', 'Por favor, informe o nome da turma.');
            return;
        }
        
        setLoading(true);

        try {
            // Cadastra a nova turma no Supabase
            await createTurma(className.trim(), user.id); 
            
            Alert.alert('Sucesso', `Turma "${className}" cadastrada com sucesso!`);
            navigation.goBack(); // Volta para a tela principal
        } catch (error) {
            Alert.alert('Erro', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={GlobalStyles.container}>
            <View style={GlobalStyles.contentPadding}>
                <Text style={GlobalStyles.title}>Nova Turma</Text>
                <Text style={{ marginBottom: 10, color: GlobalStyles.subtitle.color }}>
                    Informe o nome da turma e confirme para cadastrar.
                </Text>

                <TextInput
                    style={GlobalStyles.input}
                    placeholder="Nome da turma"
                    value={className}
                    onChangeText={setClassName}
                    editable={!loading}
                />

                <TouchableOpacity
                    style={GlobalStyles.button}
                    onPress={handleRegistration}
                    disabled={loading}
                >
                    <Text style={GlobalStyles.buttonText}>
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}