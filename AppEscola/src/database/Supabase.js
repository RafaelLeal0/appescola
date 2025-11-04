// src/database/Supabase.js

// Tenta carregar o polyfill de URL. Se não estiver instalado, exibe aviso para o desenvolvedor.
// Nota: se o pacote não estiver instalado o bundler continuará reclamando — instale-o com:
// npm install react-native-url-polyfill
try {
    require('react-native-url-polyfill/auto');
} catch (e) {
    console.warn("Aviso: 'react-native-url-polyfill' não encontrado. Rode: npm install react-native-url-polyfill");
}

import { createClient } from '@supabase/supabase-js';

// Tenta carregar AsyncStorage para persistência de sessão no React Native/Expo.
// Se não estiver presente, mantemos storage como null (comportamento atual) e avisamos.
let AsyncStorage = null;
try {
    // pacote recomendado: @react-native-async-storage/async-storage
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
    console.warn("Aviso: '@react-native-async-storage/async-storage' não encontrado. Para persistir sessões rode: npx expo install @react-native-async-storage/async-storage");
}

// ** ATENÇÃO: SUBSTITUA COM SUAS PRÓPRIAS CHAVES DO SUPABASE **
const supabaseUrl = 'https://vbjgmqkbtbuodualarly.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiamdtcWtidGJ1b2R1YWxhcmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNDI3NzgsImV4cCI6MjA3NzgxODc3OH0.-bFnXZT9W09uZGiM3uwUtCu1TWQmvuABbvVesMhSZ4U'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage || null, // se AsyncStorage estiver disponível, use-o; senão null
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Nota: caso veja erro "Unable to resolve 'react-native-url-polyfill/auto'" ou similar,
// instale o pacote com: npm install react-native-url-polyfill
// Se faltar o cliente do Supabase, instale: npm install @supabase/supabase-js
// Para AsyncStorage (recomendado): npx expo install @react-native-async-storage/async-storage