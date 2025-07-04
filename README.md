# Edutech - Sistema de Gestão Educacional

Sistema completo para gestão de turmas, exercícios, mapas e relatórios educacionais.

## 🚀 Tecnologias

### Frontend
- **Next.js 15** - Framework React
- **CSS Modules** - Estilização
- **Font Awesome** - Ícones

### Backend
- **Node.js** - Runtime
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Criptografia de senhas

## 📁 Estrutura do Projeto

```
Edutech/
├── frontend/           # Aplicação Next.js
│   ├── src/
│   │   └── app/
│   │       ├── components/     # Componentes reutilizáveis
│   │       ├── contexts/       # Context API
│   │       └── services/       # Serviços de API
│   └── public/             # Arquivos estáticos
│
├── backend/            # API Express.js
│   ├── controllers/    # Controladores
│   ├── middlewares/    # Middlewares
│   ├── routes/         # Rotas da API
│   ├── services/       # Lógica de negócio
│   └── sql/           # Scripts SQL
│
└── README.md
```

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js 18+
- PostgreSQL 12+
- npm

### Backend
```bash
cd backend
npm install
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Funcionalidades

### Gestão de Usuários
- Sistema de autenticação com JWT
- Três tipos de usuário: Admin, Professor, Aluno
- Gerenciamento de perfis

### Gestão de Turmas
- Criação e administração de turmas
- Associação de professores e alunos
- Visualização de membros da turma

### Mapas Educacionais
- Upload e gerenciamento de mapas
- Associação de exercícios com mapas
- Visualização interativa

### Sistema de Exercícios
- Criação de exercícios com múltiplas alternativas
- Organização em listas temáticas
- Interface de resolução para alunos
- Suporte a múltipla escolha

### Relatórios
- Estatísticas de desempenho
- Relatórios por turma
- Análise de exercícios

## Segurança

- Autenticação JWT
- Middleware de autorização por tipo de usuário
- Validação de dados de entrada
- Proteção contra SQL injection

## Interface

- Design responsivo
- Sidebar de navegação
- Sistema de modais universal
- Componentes reutilizáveis

## Deploy

### Produção
1. Configure as variáveis de ambiente
2. Execute build do frontend: `npm run build`
3. Configure o banco PostgreSQL
4. Execute as migrações SQL
5. Inicie o servidor backend

## Licença

Este projeto está sob a licença MIT.
