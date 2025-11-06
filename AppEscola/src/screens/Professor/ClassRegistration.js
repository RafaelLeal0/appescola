import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { GlobalStyles } from '../../styles/GlobalStyles.js';
import { Colors } from '../../styles/Colors.js';
import { useAuth } from '../../context/AuthContext.js';
import { createTurma } from '../../services/dataService.js';

export default function ClassRegistration({ navigation }) {
    const [className, setClassName] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleRegistration = async () => {
        if (!className.trim()) {
            Alert.alert('Erro', 'Por favor, informe o nome da turma.');
            return;
        }

        setLoading(true);

        try {
            await createTurma(className.trim(), user.id);
            Alert.alert('Sucesso', `Turma "${className}" cadastrada com sucesso!`);
            navigation.goBack();
        } catch (error) {
            Alert.alert('Erro', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[GlobalStyles.container, { backgroundColor: Colors.background }]}>
            <View style={styles.card}>
                
                <Text style={styles.title}>Criar Nova Turma</Text>

                <Text style={styles.subtitle}>
                    Informe abaixo o nome da turma que deseja cadastrar.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Ex.: 3° Ano A"
                    placeholderTextColor={Colors.textLight}
                    value={className}
                    onChangeText={setClassName}
                    editable={!loading}
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleRegistration}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Cadastrando...' : 'Cadastrar Turma'}
                    </Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.card,
        padding: 20,
        margin: 20,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },

    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.textDark,
        marginBottom: 10,
    },

    subtitle: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 20,
        lineHeight: 20,
    },

    input: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
        padding: 14,
        fontSize: 16,
        marginBottom: 20,
        color: Colors.textDark,

        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    button: {
        backgroundColor: Colors.primary,
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 2,
    },

    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
