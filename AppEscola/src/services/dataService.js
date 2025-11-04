// src/services/dataService.js

import { supabase } from '../database/Supabase';

// ============== TURMAS (CLASSES) ==============

/**
 * Cadastra uma nova turma no banco de dados.
 * @param {string} nome - Nome da turma.
 * @param {string} professorId - UUID do professor autenticado.
 */
export const createTurma = async (nome, professorId) => {
    const { data, error } = await supabase
        .from('turmas')
        .insert([{ nome: nome, professor_id: professorId }])
        .select();

    if (error) throw new Error(`Erro ao cadastrar turma: ${error.message}`);
    return data[0]; // Retorna a turma criada
};

/**
 * Busca e lista todas as turmas pertencentes ao professor.
 * Inclui uma contagem de atividades para cada turma.
 * @param {string} professorId - UUID do professor.
 */
export const getTurmasByProfessor = async (professorId) => {
    console.log('getTurmasByProfessor - Buscando turmas para:', professorId);
    
    // 1. Busca todas as turmas do professor
    const { data: turmas, error } = await supabase
        .from('turmas')
        .select('id, nome')
        .eq('professor_id', professorId)
        .order('id', { ascending: true });

    if (error) {
        console.error('getTurmasByProfessor - Erro:', error);
        throw new Error(`Erro ao listar turmas: ${error.message}`);
    }

    console.log('getTurmasByProfessor - Turmas encontradas:', turmas?.length || 0);

    // 2. Para cada turma, busca a contagem de atividades
    const turmasWithCount = await Promise.all(
        turmas.map(async (turma) => {
            const { count, error: countError } = await supabase
                .from('atividades')
                .select('*', { count: 'exact', head: true })
                .eq('turma_id', turma.id);

            if (countError) {
                console.error("getTurmasByProfessor - Erro ao contar atividades:", countError);
            }
            
            return {
                ...turma,
                activities_count: count || 0,
            };
        })
    );

    return turmasWithCount;
};

/**
 * Atualiza os dados de uma turma existente.
 * @param {number} turmaId - ID da turma
 * @param {object} dados - Dados a serem atualizados (nome)
 */
export const updateTurma = async (turmaId, dados) => {
    // 1. Validar campos permitidos
    const camposPermitidos = ['nome'];
    const camposInvalidos = Object.keys(dados).filter(campo => !camposPermitidos.includes(campo));
    
    if (camposInvalidos.length > 0) {
        console.error('Campos inválidos detectados:', camposInvalidos);
        throw new Error(`Campos inválidos: ${camposInvalidos.join(', ')}`);
    }

    // 2. Garantir que nome não seja vazio
    if (!dados.nome?.trim()) {
        throw new Error('Nome da turma é obrigatório');
    }

    // 3. Fazer update apenas com campos válidos
    const dadosParaAtualizar = {
        nome: dados.nome.trim()
    };

    console.log('Atualizando turma:', turmaId, 'com dados:', dadosParaAtualizar);
    
    const { data, error } = await supabase
        .from('turmas')
        .update(dadosParaAtualizar)
        .eq('id', turmaId)
        .select('id, nome') // Seleciona apenas campos existentes
        .single();

    if (error) {
        console.error('Erro ao atualizar turma:', error);
        throw new Error(`Erro ao atualizar turma: ${error.message}`);
    }

    console.log('Turma atualizada com sucesso:', data);
    return data;
};

/**
 * Exclui uma turma do banco de dados.
 * @param {number} turmaId - ID da turma a ser excluída.
 */
export const deleteTurma = async (turmaId) => {
    const { error } = await supabase
        .from('turmas')
        .delete()
        .eq('id', turmaId);

    if (error) {
        console.error('Erro ao excluir turma:', error);
        throw new Error(`Erro ao excluir turma: ${error.message}`);
    }
};

// ============== ATIVIDADES (ACTIVITIES) ==============

/**
 * Cadastra uma nova atividade para uma turma específica.
 * @param {string} descricao - Descrição da atividade.
 * @param {number} turmaId - ID da turma selecionada.
 */
export const createAtividade = async (descricao, turmaId) => {
    const { data, error } = await supabase
        .from('atividades')
        .insert([{ descricao: descricao, turma_id: turmaId }])
        .select();

    if (error) throw new Error(`Erro ao cadastrar atividade: ${error.message}`);
    return data[0]; // Retorna a atividade criada
};

/**
 * Lista todas as atividades de uma turma.
 * @param {number} turmaId - ID da turma.
 */
export const getAtividadesByTurma = async (turmaId) => {
    const { data, error } = await supabase
        .from('atividades')
        .select('id, descricao')
        .eq('turma_id', turmaId)
        .order('id', { ascending: true });

    if (error) throw new Error(`Erro ao listar atividades: ${error.message}`);
    return data;
};

/**
 * Atualiza os dados de uma atividade.
 * @param {number} atividadeId - ID da atividade
 * @param {object} dados - Dados a serem atualizados
 */
export const updateAtividade = async (atividadeId, dados) => {
    console.log('Atualizando atividade:', atividadeId, 'com dados:', dados);

    const { data, error } = await supabase
        .from('atividades')
        .update(dados)
        .eq('id', atividadeId)
        .select('*') // Retorna registro atualizado
        .single();

    if (error) {
        console.error('Erro ao atualizar atividade:', error);
        throw new Error(`Erro ao atualizar atividade: ${error.message}`);
    }

    console.log('Atividade atualizada:', data);
    return data;
};

/**
 * Exclui uma atividade específica do banco de dados.
 * @param {number} atividadeId - ID da atividade a ser excluída.
 */
export const deleteAtividade = async (atividadeId) => {
    const { error } = await supabase
        .from('atividades')
        .delete()
        .eq('id', atividadeId);

    if (error) {
        console.error('Erro ao excluir atividade:', error);
        throw new Error(`Erro ao excluir atividade: ${error.message}`);
    }
};
