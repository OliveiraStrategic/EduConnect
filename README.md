# EduConnect — Plataforma de Gestão Acadêmica Integrada

O **EduConnect** é uma solução completa de gestão escolar desenvolvida para centralizar, automatizar e auditar os processos administrativos e pedagógicos de instituições de ensino. O sistema conecta alunos, professores e administradores em uma plataforma robusta, stateless e escalável.

---

## 🚀 Tecnologias Utilizadas (Stack Tecnológica)

### Backend
* **Runtime:** Node.js (Express)
* **Banco de Dados:** PostgreSQL (Persistência relacional com transações ACID)
* **Cache Distribuído:** Redis (Caching de consultas pesadas e resiliência com auto-fallback)
* **Segurança:** Helmet.js (hardening de cabeçalhos), CORS configurado, Rate Limiting (mitigação contra força bruta)
* **Autenticação:** JWT (Access Tokens de curta duração + Refresh Tokens persistidos com Token Rotation)
* **Suíte de Testes:** Jest + Supertest (Testes de integração automatizados)
* **Documentação:** Swagger UI (OpenAPI 3.0)

### Frontend
* **Framework:** React + Vite (JavaScript)
* **Comunicação HTTP:** Axios (com interceptores de resposta inteligentes para reprocessamento de requisições retidas e auto-refresh de tokens)
* **Controle de Acesso:** Context API (RBAC para rotas protegidas)
* **Visualização Analítica:** Chart.js + react-chartjs-2 (Gráficos interativos de atividades e divisão de usuários)
* **Estilização:** CSS Moderno (Design responsivo e painéis glassmorphic)

---

## 🛠️ Instruções de Instalação e Execução

### Pré-requisitos
* **Node.js** (versão >= 18)
* **PostgreSQL** instalado e ativo
* **Redis** (opcional para cache local, com fallback automático ativo)
* **Docker & Docker Compose** (caso prefira rodar em contêineres)

---

### Execução Local (Modo Desenvolvimento)

#### 1. Configurando o Banco de Dados
Crie um banco de dados vazio chamado `educonnect` no PostgreSQL e execute o script contido em:
`database/schema.sql`

#### 2. Configurando o Backend
Entre na pasta do backend, crie seu arquivo `.env` baseado no `.env.example` e instale as dependências:
```bash
cd backend
cp .env.example .env
npm install
```

Popule o banco de dados com as contas iniciais de teste (seeding):
```bash
npm run seed
```

Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
O backend estará ativo em `http://localhost:5000`.

#### 3. Configurando o Frontend
Entre na pasta do frontend, crie seu arquivo `.env` baseado no `.env.example` e inicie o Vite:
```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```
O frontend estará acessível em `http://localhost:3000`.

---

### Execução via Docker Compose (Recomendado para Produção)

Você pode subir toda a infraestrutura (PostgreSQL + API Backend + Client Frontend servido por Nginx + Volumes Persistentes) com uma única instrução na raiz do projeto:

```bash
docker compose up --build -d
```
* **Frontend:** Acessível em `http://localhost:3000`
* **API Backend:** Acessível em `http://localhost:5000/api`
* **Documentação da API (Swagger):** Disponível em `http://localhost:5000/api-docs`

Para derrubar os contêineres e manter os dados persistidos do PostgreSQL:
```bash
docker compose down
```

---

## 🔐 Credenciais de Teste (Semeador de Dados)

Após executar o script de seeding (`npm run seed` ou ao subir o contêiner do docker pela primeira vez), utilize as seguintes contas padrão para testar o sistema:

| Perfil | E-mail de Acesso | Senha Padrão | CPF Cadastrado |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@educonnect.com.br` | `admin123` | `11111111111` |
| **Professor** | `professor@educonnect.com.br` | `professor123` | `22222222222` |
| **Aluno** | `aluno@educonnect.com.br` | `aluno123` | `33333333333` |

---

## 📊 Informações de API e Auditoria
* **Documentação Swagger:** A documentação completa de endpoints está disponível em `http://localhost:5000/api-docs`.
* **Logs e Auditoria:** Toda ação de CRUD de usuários, logins e logouts são auditados em tempo real na tabela `logs` no PostgreSQL.
* **Notificações Internas:** Ações críticas geram alertas no painel superior do usuário em tempo real.
