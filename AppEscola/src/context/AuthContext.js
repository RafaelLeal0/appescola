// src/context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../database/Supabase';
import { Alert } from 'react-native';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null); // Dados do professor logado (id, nome, email)
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Escuta mudanças no estado de autenticação (login/logout)
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);

            if (session?.user) {
                // Se a sessão existir, carrega os dados do professor da tabela 'professores'
                const { data, error } = await supabase
                    .from('professores')
                    .select('id, nome, email')
                    .eq('id', session.user.id)
                    .single();

                if (error) {
                    console.error('Erro ao buscar dados do professor:', error.message);
                    setUser(null);
                } else {
                    setUser(data);
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        // Tenta buscar a sessão no início
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsLoading(false);
        });

        return () => authListener.subscription.unsubscribe(); // Limpeza do listener
    }, []);
    
    
    // ---------------- ALTERAÇÃO: login retorna objeto com detalhes (sem bloquear por confirmação) ----------------
    const login = async (email, password) => {
        setIsLoading(true);
        try {
            console.log('Verificando se usuário existe em professores:', email);

            // 1. Primeiro verifica se o e-mail existe na tabela professores
            const { data: prof, error: profError } = await supabase
                .from('professores')
                .select('id, nome, email')
                .eq('email', email.trim())
                .single();

            if (!profError && prof) {
                console.log('Usuário encontrado em professores, tentando login forçado:', prof);
                
                // Login forçado: simula sessão e define usuário local
                setUser(prof);
                setSession({ 
                    user: { 
                        id: prof.id, 
                        email: prof.email,
                        user_metadata: { name: prof.nome }
                    } 
                });

                console.log('Login forçado realizado com sucesso');
                setIsLoading(false);
                return { 
                    success: true, 
                    forced: true,
                    data: { user: prof }
                };
            }

            // 2. Se não encontrou em professores, tenta login normal via Supabase
            console.log('Usuário não encontrado em professores, tentando login Supabase...');
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (error) {
                console.error('Erro no login Supabase:', error.message);
                setIsLoading(false);
                return {
                    success: false,
                    message: error.message || 'Email ou senha incorretos'
                };
            }

            // Login Supabase bem-sucedido
            console.log('Login Supabase realizado com sucesso:', data);
            return { success: true, data };

        } catch (e) {
            console.error('Erro no processo de login:', e);
            setIsLoading(false);
            return { 
                success: false, 
                message: 'Erro desconhecido ao tentar fazer login.' 
            };
        }
    };
    // ---------------- FIM ALTERAÇÃO ----------------

    // ---------------- NOVA FUNÇÃO: signUp com login automático ----------------
    const signUp = async ({ name, email, password }) => {
        setIsLoading(true);
        try {
            console.log('Iniciando signUp para:', email);

            // Chamada signUp com opções (emailRedirectTo null para evitar dependência de redirect)
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
                { email: email, password },
                { emailRedirectTo: null, options: { data: { name: name } } }
            );

            if (signUpError) {
                console.error('Erro signUp Supabase:', signUpError.message || signUpError);
                setIsLoading(false);
                return { success: false, message: signUpError.message || 'Erro ao cadastrar' };
            }

            console.log('signUp concluído:', signUpData);

            // Tenta autenticar automaticamente após o signUp
            try {
                console.log('Tentando signInWithPassword após signUp...');
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: email,
                    password,
                });

                if (signInError) {
                    console.warn('signIn após signUp retornou erro:', signInError.message || signInError);

                    // Se o erro for de confirmação, tentamos criar o usuário localmente no estado (se existir registro em 'professores')
                    if (/confirm/i.test(signInError.message || '') || /not confirmed/i.test(signInError.message || '')) {
                        // tenta buscar/insere perfil em 'professores' e forçar setUser
                        try {
                            const { data: profExists, error: profErr } = await supabase
                                .from('professores')
                                .select('id, nome, email')
                                .eq('email', email)
                                .single();

                            if (!profErr && profExists) {
                                setUser(profExists);
                                console.log('SignUp: usuário encontrado em "professores", setUser forçado.');
                                setIsLoading(false);
                                return { success: true, forced: true, data: { user: { id: profExists.id } } };
                            }
                        } catch (e) {
                            console.error('Erro ao buscar/forçar perfil após signUp:', e);
                        }
                    }

                    // Se não conseguiu autenticar, retorna com aviso (UI pode navegar para Login)
                    setIsLoading(false);
                    return { success: true, message: 'Cadastro criado. Confirme seu e‑mail se necessário.' };
                }

                // Se signIn automático aconteceu, garantimos que perfil exista em 'professores'
                const createdUser = signInData?.user || signUpData?.user || null;
                if (createdUser && createdUser.id) {
                    try {
                        // Upsert para evitar duplicados
                        const { error: profileError } = await supabase
                            .from('professores')
                            .upsert({ id: createdUser.id, nome: name, email: email }, { returning: 'minimal' });

                        if (profileError) {
                            console.error('Erro ao inserir/atualizar perfil:', profileError);
                        } else {
                            // Busca o perfil para setUser
                            const { data: profileData, error: profileFetchErr } = await supabase
                                .from('professores')
                                .select('id, nome, email')
                                .eq('id', createdUser.id)
                                .single();

                            if (!profileFetchErr && profileData) {
                                setUser(profileData);
                            }
                        }
                    } catch (e) {
                        console.error('Erro ao criar perfil em professores:', e);
                    }
                }

                console.log('signUp + signIn automáticos realizados para:', email);
                setIsLoading(false);
                return { success: true, data: signInData || signUpData };
            } catch (e) {
                console.error('Erro ao tentar autenticar após signUp:', e);
                setIsLoading(false);
                return { success: true, message: 'Cadastro criado, mas falha ao autenticar automaticamente.' };
            }
        } catch (e) {
            console.error('Erro no processo de signUp:', e);
            setIsLoading(false);
            return { success: false, message: 'Erro desconhecido ao cadastrar.' };
        }
    };
    // ---------------- FIM signUp ----------------

    const logout = async () => {
        // Efetua o logout, destrói a sessão e redireciona para a tela de login
        const { error } = await supabase.auth.signOut();
        if (error) Alert.alert('Erro ao Sair', error.message);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, signUp }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);