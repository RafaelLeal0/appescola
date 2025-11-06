# 📚 APP ESCOLA: Controle de Turmas e Atividades

[cite_start]Este projeto é um aplicativo mobile desenvolvido em **React Native com Expo** para auxiliar professores a gerenciar suas turmas e registrar atividades, conforme o desafio de fixação[cite: 6]. O sistema utiliza o **Supabase** como backend em tempo real.

## 🎯 Funcionalidades e Requisitos Atendidos

O aplicativo foi desenvolvido para atender aos seguintes requisitos do exercício:

* [cite_start]**Autenticação de Usuários (Login/Cadastro):** Contém campos para e-mail, senha e o botão "Entrar"[cite: 16]. [cite_start]Criação de sessão após autenticação[cite: 18].
* [cite_start]**Controle de Sessão (Logout):** O botão "Sair" efetua o logout do usuário, destrói a sessão e redireciona para a tela de login[cite: 110].
* [cite_start]**CRUD de Turmas:** Permite visualizar as turmas do professor, cadastrar novas turmas e tem a funcionalidade de exclusão[cite: 12, 79, 80].
* [cite_start]**Regra de Exclusão:** Impede a exclusão de turmas que possuam atividades cadastradas, exibindo a mensagem de erro apropriada[cite: 62, 82].
* [cite_start]**Cadastro e Listagem de Atividades:** Possui a tela para cadastrar e listar atividades por turma selecionada[cite: 105, 102].
* **Estrutura de Código:** Desenvolvido com uma arquitetura baseada em pastas para Contextos, Navegação, Telas, Estilos e Serviços (CRUD).

## 💻 Tecnologias Utilizadas

| Categoria | Tecnologia | Função no Projeto |
| :--- | :--- | :--- |
| **Frontend Core** | **Expo / React Native** | [cite_start]Framework para desenvolvimento mobile multiplataforma[cite: 14]. |
| **Backend / DB** | **Supabase** | Backend como Serviço (BaaS), fornecendo PostgreSQL, Autenticação e API. |
| **Navegação** | `React Navigation` (Stack) | [cite_start]Gerenciamento de rotas e fluxo entre as telas (Login, Main, Cadastro)[cite: 18]. |
| **Persistência** | `@react-native-async-storage/async-storage` | Armazenamento seguro da sessão do Supabase no dispositivo. |

## ⚙️ Configuração e Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [https://docs.github.com/pt/repositories/creating-and-managing-repositories/quickstart-for-repositories](https://docs.github.com/pt/repositories/creating-and-managing-repositories/quickstart-for-repositories)
    cd AppEscola
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    # Execute npm install se já tiver um package.json configurado ou use os comandos completos de instalação.
    ```
3.  **Configurar o Supabase:**
    Certifique-se de que o arquivo de configuração do Supabase (ex: `scr/database/Supabase.js`) está com sua **URL do Projeto** e **Public Key** corretas.

4.  **Iniciar o Projeto:**
    ```bash
    npm start -- --reset-cache
    ```

## 🖼️ Capturas de Tela (Screenshots)

Os caminhos das imagens foram confirmados para o local `assets/screenshots/`.

### 1. Tela de Autenticação (Login e Erro)

![Screenshot da Tela de Login](assets/screenshots/login_screen.png)

### 2. Tela Principal do Professor (Listagem de Turmas)

![Screenshot da Tela Principal](assets/screenshots/main_screen.png)

### 3. Tela de Atividades da Turma

![Screenshot da Tela de Atividades](assets/screenshots/activities_screen.png)

---

**Observação:** Se as imagens não aparecerem após o commit para o GitHub, verifique se os nomes dos arquivos (`activities_screen.png`, `login_screen.png`, `main_screen.png`) e o caminho da pasta (`assets/screenshots`) estão em **minúsculas** no seu sistema de arquivos local e no repositório. O GitHub é sensível a maiúsculas e minúsculas.
