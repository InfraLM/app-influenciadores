# App Influenciadores - Liberdade Médica

Sistema de gestão de influenciadores para a Liberdade Médica Educação.

## 🚀 URL de Produção

**Frontend**: https://lmedu.com.br/influenciadores/
**Backend API**: https://lmedu.com.br/influenciadores/api/

## 📋 Sobre o Projeto

Sistema completo para gerenciamento de influenciadores, incluindo:

- ✅ Gestão de influenciadores e conteúdos
- ✅ Avaliação de performance
- ✅ Sistema de ranking
- ✅ Prospecção de novos influenciadores (Kanban)
- ✅ Análise de métricas
- ✅ Gestão de documentos
- ✅ Controle de usuários e permissões (Admin/Influencer)

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React** 18.3+ com TypeScript
- **Vite** - Build tool e dev server
- **React Router** - Navegação SPA
- **TanStack Query** - Gerenciamento de estado e cache
- **shadcn/ui** - Componentes UI (Radix UI + Tailwind)
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos e visualizações
- **Hello Pangea DND** - Drag and drop para Kanban
- **React Hook Form + Zod** - Formulários e validação

### Backend
- **Node.js** 18+ com TypeScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **pg** - Driver PostgreSQL

## 📁 Estrutura do Projeto

```
app-influenciadores/
├── src/                          # Frontend React
│   ├── components/              # Componentes reutilizáveis
│   ├── pages/                   # Páginas da aplicação
│   ├── contexts/                # React Contexts (Auth)
│   ├── lib/                     # Utilitários e configurações
│   └── integrations/            # Integrações (API client)
├── backend/                     # Backend Node.js/Express
│   ├── src/
│   │   ├── config/             # Configurações (DB, Auth)
│   │   ├── controllers/        # Controllers da API
│   │   ├── middleware/         # Middlewares (auth, etc)
│   │   ├── routes/             # Rotas da API
│   │   └── server.ts           # Servidor Express
│   ├── .env.production         # Variáveis de ambiente (produção)
│   └── package.json
├── htaccess-examples/          # Exemplos de .htaccess
├── DEPLOY.md                   # Guia completo de deploy
└── README.md                   # Este arquivo
```

## 🏃 Desenvolvimento Local

### Pré-requisitos

- Node.js 18+ ([instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm ou bun
- Acesso ao banco PostgreSQL

### Configuração

1. **Clone o repositório**
```bash
git clone <repo-url>
cd app-influenciadores
```

2. **Instale as dependências**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

3. **Configure as variáveis de ambiente**

Frontend (`.env`):
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_ENV=development
```

Backend (`backend/.env`):
```env
NODE_ENV=development
PORT=3000

DB_HOST=35.199.101.38
DB_PORT=5432
DB_NAME=liberdade-medica
DB_USER=lovable
DB_PASSWORD=<senha>

JWT_SECRET=dev-secret-key-change-this-in-production
CORS_ORIGIN=http://localhost:8080
```

4. **Inicie o desenvolvimento**

```bash
# Terminal 1 - Frontend (porta 8080)
npm run dev

# Terminal 2 - Backend (porta 3000)
cd backend
npm run dev
```

5. **Acesse a aplicação**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000/api

### Credenciais Padrão

- **Email**: admin@lmedu.com.br
- **Senha**: admin123

⚠️ **IMPORTANTE**: Altere essas credenciais em produção!

## 🗄️ Banco de Dados

### Configuração PostgreSQL

- **Host**: 35.199.101.38
- **Database**: liberdade-medica
- **Schema**: lovable
- **Prefixo de tabelas**: `inf_`

### Tabelas Principais

- `inf_users` - Usuários do sistema
- `inf_profiles` - Perfis dos usuários
- `inf_user_roles` - Roles (admin/influencer)
- `inf_influencers` - Dados dos influenciadores
- `inf_contents` - Conteúdos postados
- `inf_performance_evaluations` - Avaliações de performance
- `inf_prospect_cards` - Cards do Kanban de prospecção
- `inf_monthly_goals` - Metas mensais
- `inf_documents` - Documentos compartilhados
- `inf_invites` - Convites de cadastro

### Scripts SQL

- `backend/schema.sql` - Schema completo do banco
- `backend/create-admin.sql` - Criar usuário admin
- `backend/grant-permissions.sql` - Conceder permissões ao usuário

## 🚀 Deploy em Produção

Consulte o guia completo em **[DEPLOY.md](./DEPLOY.md)** para instruções detalhadas de deploy no cPanel.

### Resumo Rápido

1. **Build do frontend**:
```bash
npm run build
# Upload da pasta dist/ para public_html/influenciadores/
```

2. **Deploy do backend**:
```bash
cd backend
npm install --production
# Upload para servidor
# Iniciar com PM2: pm2 start src/server.ts --name influenciadores-api
```

3. **Configurar .htaccess** (exemplos em `htaccess-examples/`)

## 📝 Scripts Disponíveis

### Frontend

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run build:dev    # Build em modo desenvolvimento
npm run preview      # Preview do build
npm run lint         # Lint do código
npm test             # Executar testes
```

### Backend

```bash
npm run dev          # Servidor de desenvolvimento com hot reload
npm start            # Iniciar servidor (produção)
```

## 🔐 Segurança

- ✅ Autenticação JWT
- ✅ Senhas com hash bcrypt
- ✅ CORS configurado
- ✅ Validação de inputs
- ✅ Proteção de rotas por role (admin/influencer)

**Em produção, certifique-se de**:
- Usar HTTPS
- Alterar JWT_SECRET para um valor forte
- Alterar credenciais padrão do admin
- Configurar firewall do PostgreSQL

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs do PM2: `pm2 logs influenciadores-api`
2. Verifique o console do navegador (F12)
3. Consulte o [DEPLOY.md](./DEPLOY.md) para troubleshooting

## 📄 Licença

Propriedade da Liberdade Médica Educação.