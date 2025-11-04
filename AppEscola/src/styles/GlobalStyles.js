// src/styles/GlobalStyles.js

import { StyleSheet } from 'react-native';
import { Colors } from './Colors';

export const GlobalStyles = StyleSheet.create({
    // Estrutura
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    contentPadding: {
        padding: 20,
    },
    // Títulos
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: Colors.text,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: Colors.text,
    },
    // Formulários e Inputs
    input: {
        width: '100%',
        padding: 15,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: Colors.cardBackground,
        color: Colors.text,
    },
    // Botões Padrão
    button: {
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: Colors.cardBackground,
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Alertas e Erros
    errorBox: {
        width: '100%',
        backgroundColor: '#F8D7DA', 
        padding: 15,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.danger,
        marginBottom: 20,
    },
    errorText: {
        color: Colors.danger,
        textAlign: 'center',
        fontWeight: 'bold',
    },
});