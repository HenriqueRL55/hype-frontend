# HypeSocial - Gerenciador de Posts

Aplicação web desenvolvida em Vue 3 para o teste técnico de Frontend Developer. O sistema é uma versão simplificada de criação de posts para redes sociais, permitindo o gerenciamento e agendamento de publicações com suporte a upload de múltiplas mídias (imagens e vídeos).

🔗 **Repositório:** [https://github.com/HenriqueRL55/hype-frontend](https://github.com/HenriqueRL55/hype-frontend)

## 🚀 Tecnologias Utilizadas

* **Frontend:** Vue 3 (Composition API), TypeScript, Vite
* **Estilização:** SASS (.scss)
* **BaaS (Backend as a Service):** Firebase (Authentication, Firestore, Storage e Hosting)
* **Emulação:** Firebase Local Emulator Suite (para testes locais isolados)
* **Manipulação de Datas:** `date-fns`

## ✨ Funcionalidades Entregues

* **Autenticação (Firebase Auth):** Login e Cadastro de usuários via e-mail e senha, com validação de campos.
* **Dashboard de Posts:** Exibição dos posts cadastrados em formato **Grid** ou **Calendário (Mensal/Semanal)**.
* **CRUD de Posts:** Criação, listagem e exclusão de posts vinculados exclusivamente ao usuário logado.
* **Upload Avançado de Mídias (Firebase Storage):**
  * Suporte a upload de imagens e vídeos (limite de 6 mídias por post).
  * Reordenação visual das mídias via drag-and-drop ou botões direcionais.
  * Preview automático de vídeos em miniatura ao passar o mouse (`hover`).
  * Barra de progresso visual demonstrando o status do upload em tempo real.
* **Filtros:** Busca em tempo real por texto (título/descrição) e filtro específico por data de publicação.

## ⚙️ Como executar o projeto localmente

O projeto está configurado para utilizar o **Firebase Emulator Suite** durante o desenvolvimento local (`dev`), garantindo que os testes não afetem o ambiente de produção.

### 1. Pré-requisitos
* **Node.js** (versão 18 ou superior)
* **Firebase CLI** instalado globalmente (`npm install -g firebase-tools`)
* **Java** (necessário para rodar o Firebase Emulator Suite localmente)

### 2. Instalação
Clone o repositório e instale as dependências:
\`\`\`bash
git clone https://github.com/HenriqueRL55/hype-frontend.git
cd hype-frontend
npm install
\`\`\`

### 3. Configuração do Firebase e Variáveis de Ambiente
O projeto utiliza variáveis de ambiente para a conexão com o Firebase. Crie um arquivo `.env` na raiz do projeto e adicione as seguintes chaves utilizadas para este teste:

\`\`\`env
VITE_FIREBASE_API_KEY="AIzaSyBsU6HFf7PAJjEicsQsh1DbFMe9_D1yLF0"
VITE_FIREBASE_AUTH_DOMAIN="hype-frontend.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="hype-frontend"
VITE_FIREBASE_STORAGE_BUCKET="hype-frontend.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="406750384138"
VITE_FIREBASE_APP_ID="1:406750384138:web:737c20294f351ec32c4ff3"
\`\`\`

> **Nota sobre o Emulador:** O arquivo `src/firebase.ts` intercepta o modo de desenvolvimento (`import.meta.env.DEV`) e redireciona automaticamente o Auth (porta 9099), o Firestore (porta 8080) e o Storage (porta 9199) para os emuladores locais.

### 4. Executando o Emulador do Firebase
Para inicializar os serviços do Firebase localmente, abra um terminal na raiz do projeto e execute:
\`\`\`bash
firebase emulators:start
\`\`\`

### 5. Executando a Aplicação Vue
Em um **novo terminal** (mantendo o emulador rodando no anterior), inicie o servidor de desenvolvimento:
\`\`\`bash
npm run dev
\`\`\`
A aplicação estará disponível em: `http://localhost:5173`

## ☁️ Link em Produção (Firebase Hosting)

O deploy oficial desta aplicação já foi realizado e pode ser acessado no link abaixo:

👉 **[INSERIR_O_LINK_DO_FIREBASE_AQUI]**

*(Nota para os avaliadores: Caso desejem realizar o deploy em um projeto Firebase próprio para testes, basta gerar o build da aplicação executando `npm run build` e, em seguida, rodar `firebase deploy --only hosting` apontando para o seu próprio `projectId`.)*

---
Desenvolvido por [Henrique Lengruber](https://github.com/HenriqueRL55).