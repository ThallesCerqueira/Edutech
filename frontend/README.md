# EduTech - Sistema Educacional

Sistema web moderno para gestão de mapas educacionais, exercícios e listas, desenvolvido com Next.js e Node.js.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)

## Como rodar o projeto

### 1. Preparação inicial
```bash
# Clone o repositório (se ainda não fez)
git clone https://github.com/ThallesCerqueira/Edutech.git
cd Edutech

# Mude para a branch frontend
git checkout frontend
```

### 2. Configurar o Backend
```bash
# Navegue para a pasta do backend
cd backend

# Instale as dependências
npm install

# Inicie o servidor backend (porta 3001)
npm start
```
**Mantenha este terminal aberto - o backend precisa estar rodando!**

### 3. Configurar o Frontend (em outro terminal)
```bash
# Navegue para a pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento (porta 3000)
npm run dev
```

### 4. Acessar o sistema
- Abra seu navegador em: **http://localhost:3000**
- Para fazer login use:
  - **Email:** `admin@edutech.com`
  - **Senha:** `123456`

---

## Guia 

### Estrutura dos arquivos de estilo

O projeto usa **CSS Modules** - cada componente tem seu próprio arquivo `.module.css`. Isso significa que os estilos ficam organizados e não interferem entre si.

```
frontend/src/app/
├── globals.css                    # Estilos globais (cores, fontes)
├── components/
│   ├── Sidebar/
│   │   └── index.module.css      # Estilo da barra lateral
│   ├── Cards/
│   │   ├── UniversalCard/
│   │   │   └── index.module.css  # Estilo dos cartões
│   │   └── UniversalList/
│   │       └── index.module.css  # Estilo das listas
│   ├── Pages/
│   │   ├── MapasPage/
│   │   │   └── index.module.css  # Página de mapas
│   │   ├── ExerciciosPage/
│   │   │   └── index.module.css  # Página de exercícios
│   │   └── ListasPage/
│   │       └── index.module.css  # Página de listas
│   └── Modal/
│       └── index.module.css      # Janelas popup
└── (public)/login/
    └── page.module.css           # Página de login
```


### Mudando cores principais
**Arquivo:** `frontend/src/app/globals.css`

```css
/* Encontre essas variáveis e modifique as cores */
:root {
  --cor-primaria: #2c3e50;     /* Azul escuro */
  --cor-secundaria: #3498db;   /* Azul claro */
  --cor-sucesso: #27ae60;      /* Verde */
  --cor-erro: #e74c3c;         /* Vermelho */
  --cor-fundo: #f8f9fa;        /* Cinza claro */
}
```

## Scripts disponíveis

```bash
npm run dev         # Servidor de desenvolvimento
npm run build       # Gerar versão de produção
npm run start       # Executar versão de produção
npm run lint        # Verificar código
```

## Tecnologias utilizadas

- **Frontend:** Next.js 15, React, CSS Modules
- **Backend:** Node.js, Express, SQLite
- **Autenticação:** JWT + bcrypt
- **Ícones:** Font Awesome
