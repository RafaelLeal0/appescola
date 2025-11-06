import { supabase } from '../database/Supabase';

export const createTurma = async (nome, professorId) => {
    const { data, error } = await supabase
        .from('turmas')
        .insert([{ nome: nome, professor_id: professorId }])
        .select()
        .single();

    if (error) throw new Error(`Erro ao cadastrar turma: ${error.message}`);
    return data;
};

export const getTurmasByProfessor = async (professorId) => {
    const { data: turmas, error } = await supabase
        .from('turmas')
        .select('id, nome')
        .eq('professor_id', professorId)
        .order('id', { ascending: true });

    if (error) {
        throw new Error(`Erro ao listar turmas: ${error.message}`);
    }

    const turmasWithCount = await Promise.all(
        turmas.map(async (turma) => {
            const { count, error: countError } = await supabase
                .from('atividades')
                .select('*', { count: 'exact', head: true })
                .eq('turma_id', turma.id);

            return {
                ...turma,
                activities_count: count || 0,
            };
        })
    );

    return turmasWithCount;
};

export const updateTurma = async (turmaId, dados) => {
    if (!dados.nome?.trim()) {
        throw new Error('O nome da turma é obrigatório.');
    }

    const { data, error } = await supabase
        .from('turmas')
        .update({ nome: dados.nome.trim() })
        .eq('id', turmaId)
        .select('id, nome')
        .single();

    if (error) throw new Error(`Erro ao atualizar turma: ${error.message}`);
    return data;
};

export const deleteTurma = async (turmaId) => {
    const { count, error: countError } = await supabase
        .from('atividades')
        .select('*', { count: 'exact', head: true })
        .eq('turma_id', turmaId);

    if (countError) {
        throw new Error(`Erro ao verificar atividades antes da exclusão: ${countError.message}`);
    }

    if (count > 0) {
        throw new Error('Você não pode excluir uma turma que possui atividades cadastradas.');
    }

    const { error } = await supabase
        .from('turmas')
        .delete()
        .eq('id', turmaId);

    if (error) {
        throw new Error(`Erro ao excluir turma: ${error.message}`);
    }

    return true;
};

export const createAtividade = async (descricao, turmaId) => {
    const { data, error } = await supabase
        .from('atividades')
        .insert([{ descricao, turma_id: turmaId }])
        .select()
        .single();

    if (error) throw new Error(`Erro ao cadastrar atividade: ${error.message}`);
    return data;
};

export const getAtividadesByTurma = async (turmaId) => {
    const { data, error } = await supabase
        .from('atividades')
        .select('id, descricao')
        .eq('turma_id', turmaId)
        .order('id', { ascending: true });

    if (error) throw new Error(`Erro ao listar atividades: ${error.message}`);
    return data;
};

export const updateAtividade = async (atividadeId, dados) => {
    const { data, error } = await supabase
        .from('atividades')
        .update(dados)
        .eq('id', atividadeId)
        .select('*')
        .single();

    if (error) {
        throw new Error(`Erro ao atualizar atividade: ${error.message}`);
    }

    return data;
};

export const deleteAtividade = async (atividadeId) => {
    const { error } = await supabase
        .from('atividades')
        .delete()
        .eq('id', atividadeId);

    if (error) {
        throw new Error(`Erro ao excluir atividade: ${error.message}`);
    }

    return true;
};
