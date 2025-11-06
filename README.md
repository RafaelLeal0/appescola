# 📚 APP ESCOLA: Controle de Turmas e Atividades

Este projeto é um aplicativo mobile desenvolvido em **React Native com Expo** para auxiliar professores a gerenciar suas turmas e registrar atividades, conforme o desafio proposto no exercício de fixação. O sistema utiliza o **Supabase** como backend em tempo real.

## 🎯 Funcionalidades Implementadas

O aplicativo atende a todos os requisitos do projeto:

* **Autenticação de Usuários (Login/Cadastro):** Permite o login e o registro de novos professores.
* **Controle de Sessão:** Gerencia a sessão do usuário, exibindo a tela principal após o login e permitindo o logout.
* **CRUD de Turmas:** O professor pode visualizar, cadastrar e excluir suas turmas.
    * **Regra de Negócio:** Impede a exclusão de turmas que contenham atividades cadastradas.
* **CRUD de Atividades:** Permite a visualização, cadastro e exclusão (estrutura pronta) de atividades vinculadas a uma turma específica.

## 💻 Tecnologias Utilizadas

O projeto foi desenvolvido utilizando uma arquitetura moderna para aplicações móveis, com foco em um backend como serviço (BaaS):

| Categoria | Tecnologia | Versão | Função no Projeto |
| :--- | :--- | :--- | :--- |
| **Frontend Core** | **Expo / React Native** | (Mais Recente) | Framework para desenvolvimento mobile multiplataforma. |
| **Backend / DB** | **Supabase** | (Mais Recente) | Backend como Serviço (BaaS), fornecendo banco de dados PostgreSQL, Autenticação e API REST em tempo real. |
| **Persistência** | `@react-native-async-storage/async-storage` | - | Armazenamento local da sessão (Auth) do Supabase. |
| **Navegação** | `React Navigation` | (v6+) | Gerenciamento de rotas e fluxo entre as telas do aplicativo. |

## ⚙️ Configuração e Instalação

### Pré-requisitos

1.  Node.js e npm instalados.
2.  CLI do Expo instalado (`npm install -g expo-cli` ou use `npx expo`).
3.  Um projeto configurado no Supabase com as tabelas `professores`, `turmas` e `atividades`.

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone [https://docs.github.com/pt/repositories/creating-and-managing-repositories/quickstart-for-repositories](https://docs.github.com/pt/repositories/creating-and-managing-repositories/quickstart-for-repositories)
    cd AppEscola
    ```

2.  **Instale as dependências:**
    ```bash
    # Dependências JS e Core
    npm install @supabase/supabase-js @react-navigation/native @react-navigation/stack react-native-url-polyfill

    # Dependências Nativas/Expo
    npx expo install @react-native-async-storage/async-storage react-native-screens react-native-safe-area-context react-native-gesture-handler
    ```

3.  **Configurar o Supabase:**
    Abra o arquivo `scr/database/Supabase.js` e substitua os placeholders (`SUA_URL_DO_PROJETO` e `SUA_CHAVE_PUBLICA_COPIADA_AQUI`) com as credenciais obtidas no painel do Supabase.

4.  **Iniciar o Projeto:**
    ```bash
    npm start -- --reset-cache
    ```
    Em seguida, pressione `a` para abrir no Android Emulator/Device ou `i` para iOS.

## 🖼️ Capturas de Tela (Screenshots)

### 1. Tela de Autenticação (Login/Cadastro)

![Screenshot da Tela de Login](Appescola/assets/screenshots/login_screen.png)

### 2. Tela Principal do Professor (Listagem de Turmas)

![Screenshot da Tela Principal](Appescola/assets/screenshots/main_screen.png)

### 3. Tela de Atividades da Turma

![Screenshot da Tela de Atividades](Appescola/assets/screenshots/activities_screen.png)
